"""instagrapi-rest sidecar.

Minimal FastAPI service that exposes a public IG profile + top posts via
instagrapi. Designed to be called only by the Next.js onboarding backend.

Env:
  IG_USERNAME, IG_PASSWORD      Burner credentials. Required unless IG_SESSION_JSON set.
  IG_SESSION_JSON               Pre-logged session JSON (preferred). Overrides user/pass if set.
  IG_PROXY_URL                  Optional residential proxy.
  SIDECAR_TOKEN                 Optional shared secret; required on /profile/* if set.
"""

from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from instagrapi import Client
from instagrapi.exceptions import ClientError, UserNotFound
from pydantic import BaseModel


_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is not None:
        return _client

    client = Client()
    proxy = os.environ.get("IG_PROXY_URL")
    if proxy:
        client.set_proxy(proxy)

    session_json = os.environ.get("IG_SESSION_JSON")
    if session_json:
        client.set_settings(json.loads(session_json))
        try:
            client.get_timeline_feed()  # cheap session validation
        except Exception:
            _fallback_login(client)
    else:
        _fallback_login(client)

    _client = client
    return client


def _fallback_login(client: Client) -> None:
    username = os.environ.get("IG_USERNAME")
    password = os.environ.get("IG_PASSWORD")
    if not username or not password:
        raise RuntimeError("No IG_SESSION_JSON and no IG_USERNAME/IG_PASSWORD set")
    client.login(username, password)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Warm the session at boot so the first request isn't a login roundtrip.
    try:
        get_client()
    except Exception as exc:
        print(f"[warmup] IG session failed: {exc}")
    yield


app = FastAPI(title="instagrapi-rest", lifespan=lifespan)


async def require_token(authorization: Optional[str] = Header(None)) -> None:
    expected = os.environ.get("SIDECAR_TOKEN")
    if not expected:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    if authorization.split(" ", 1)[1] != expected:
        raise HTTPException(403, "Bad token")


class IgPost(BaseModel):
    code: str
    url: str
    caption: Optional[str]
    like_count: Optional[int]
    comment_count: Optional[int]
    media_type: str
    thumbnail_url: Optional[str]
    taken_at: Optional[str]


class IgProfile(BaseModel):
    full_name: Optional[str]
    biography: Optional[str]
    external_url: Optional[str]
    follower_count: Optional[int]
    following_count: Optional[int]
    post_count: Optional[int]
    is_business: Optional[bool]
    is_verified: Optional[bool]
    profile_pic_url: Optional[str]
    top_posts: list[IgPost]


MEDIA_TYPE_MAP = {1: "photo", 2: "video", 8: "carousel"}


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/related/{handle}", dependencies=[Depends(require_token)])
def related(handle: str, limit: int = 8) -> dict:
    """IG's 'related profiles' surface — accounts IG suggests as similar to {handle}.

    Returns just handles so the Next.js side can hydrate profiles on demand via /profile.
    """
    client = get_client()
    try:
        user_id = client.user_id_from_username(handle)
        # Undocumented but stable v1 endpoint; returns accounts in the "Suggested for you" chiclet.
        resp = client.private_request(f"fbsearch/accounts_recs/?target_id={user_id}")
    except UserNotFound:
        raise HTTPException(404, f"Handle @{handle} not found")
    except ClientError as exc:
        raise HTTPException(502, f"IG error: {exc}")

    users = resp.get("users") if isinstance(resp, dict) else None
    handles: list[str] = []
    if isinstance(users, list):
        for u in users:
            name = u.get("username") if isinstance(u, dict) else None
            if name and name != handle:
                handles.append(name)
    return {"source": handle, "handles": handles[: max(1, min(limit, 16))]}


@app.get("/profile/{handle}", response_model=IgProfile, dependencies=[Depends(require_token)])
def profile(handle: str, top_posts: int = 6) -> IgProfile:
    client = get_client()
    try:
        user_id = client.user_id_from_username(handle)
        info = client.user_info(user_id)
        medias = client.user_medias(user_id, amount=max(0, min(top_posts, 12)))
    except UserNotFound:
        raise HTTPException(404, f"Handle @{handle} not found")
    except ClientError as exc:
        raise HTTPException(502, f"IG error: {exc}")

    ranked = sorted(
        medias,
        key=lambda m: (m.like_count or 0) + (m.comment_count or 0) * 3,
        reverse=True,
    )[:top_posts]

    return IgProfile(
        full_name=info.full_name,
        biography=info.biography,
        external_url=str(info.external_url) if info.external_url else None,
        follower_count=info.follower_count,
        following_count=info.following_count,
        post_count=info.media_count,
        is_business=info.is_business,
        is_verified=info.is_verified,
        profile_pic_url=str(info.profile_pic_url_hd or info.profile_pic_url) if info.profile_pic_url else None,
        top_posts=[
            IgPost(
                code=m.code,
                url=f"https://www.instagram.com/p/{m.code}/",
                caption=m.caption_text,
                like_count=m.like_count,
                comment_count=m.comment_count,
                media_type=MEDIA_TYPE_MAP.get(m.media_type, "other"),
                thumbnail_url=str(m.thumbnail_url) if m.thumbnail_url else None,
                taken_at=m.taken_at.isoformat() if m.taken_at else None,
            )
            for m in ranked
        ],
    )
