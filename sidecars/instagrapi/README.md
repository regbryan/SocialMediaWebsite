# instagrapi-rest sidecar

Thin FastAPI service wrapping [`instagrapi`](https://github.com/subzeroid/instagrapi) to give the Next.js app a simple REST surface for public IG profile data.

## Contract

`GET /profile/{handle}?top_posts=6`

Response:

```json
{
  "full_name": "string | null",
  "biography": "string | null",
  "external_url": "string | null",
  "follower_count": 1234,
  "following_count": 567,
  "post_count": 89,
  "is_business": true,
  "is_verified": false,
  "profile_pic_url": "https://…",
  "top_posts": [
    {
      "code": "CxYz",
      "url": "https://instagram.com/p/CxYz",
      "caption": "…",
      "like_count": 123,
      "comment_count": 4,
      "media_type": "photo|video|carousel|other",
      "thumbnail_url": "https://…",
      "taken_at": "2026-04-18T12:34:56Z"
    }
  ]
}
```

Auth: optional `Authorization: Bearer <IG_SIDECAR_TOKEN>`.

## Deploy

This runs Python + a burner IG session — it cannot run on Vercel. Recommended hosts:

- **Fly.io** — `fly launch` with the included `Dockerfile`; one small machine is enough.
- **Railway** — connect the `sidecars/instagrapi` directory; Nixpacks picks up `requirements.txt`.

### Env vars

| Name | Purpose |
|---|---|
| `IG_USERNAME` | Burner account login |
| `IG_PASSWORD` | Burner account password |
| `IG_SESSION_JSON` | (optional) pre-logged session blob — preferred over user/pass |
| `IG_PROXY_URL` | (recommended) residential proxy, e.g. `http://user:pass@host:port` |
| `SIDECAR_TOKEN` | shared secret; Next.js sends as `Authorization: Bearer` |

### Wire to Next.js

In `Social Media Website/.env.local`:

```
IG_SIDECAR_URL=https://your-sidecar.fly.dev
IG_SIDECAR_TOKEN=<matches SIDECAR_TOKEN above>
```

## Operational notes

- Cache TTL is **24h** on the Next.js side (`ig_profile_cache` table) — that's the knob to reduce real IG calls.
- Start with throwaway IG accounts; never use a personal one.
- If IG starts returning challenges, rotate proxy before rotating account.
- Keep the sidecar behind a private URL + token; it has no rate-limiting of its own.
