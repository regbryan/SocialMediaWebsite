# Deploy the IG sidecar to Fly.io

Step-by-step — run these from this directory (`sidecars/instagrapi/`).

## 0. Prereqs

**Instagram burner account** — create a fresh IG account used only for scraping. Never use a personal one.

**(Recommended) Residential proxy** — Bright Data, IPRoyal, or Smartproxy. Required if IG starts issuing challenges. Grab the URL in `http://user:pass@host:port` form.

**flyctl** — install once:
```powershell
# Windows PowerShell
iwr https://fly.io/install.ps1 -useb | iex
```

Then authenticate:
```bash
fly auth signup        # first time
# or
fly auth login
```

## 1. Generate a pre-logged session JSON locally

Logging in from Fly's IPs gets flagged fast. Log in from your home IP once, export the session, and ship that to Fly:

```bash
pip install instagrapi
python gen_session.py <burner_username> <burner_password> > session.json
```

If you have a proxy:
```bash
python gen_session.py <user> <pass> "http://proxy_user:proxy_pass@host:port" > session.json
```

`session.json` is already gitignored — do not commit it.

## 2. Launch the app (first deploy only)

`fly.toml` already names the app `socialpulse-ig-sidecar`. If that name is taken, edit `app = ...` before running:

```bash
fly launch --no-deploy --copy-config
```

Say **no** to creating Postgres/Redis/Upstash.

## 3. Set secrets

Pick a strong random token for `SIDECAR_TOKEN` — this is what Next.js will send as `Authorization: Bearer`.

```bash
# macOS/Linux
fly secrets set \
  IG_SESSION_JSON="$(cat session.json)" \
  SIDECAR_TOKEN="$(openssl rand -hex 32)" \
  IG_PROXY_URL="http://user:pass@host:port"   # optional but recommended
```

```powershell
# Windows PowerShell
$session = Get-Content session.json -Raw
$token = -join ((1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) }))
fly secrets set IG_SESSION_JSON="$session" SIDECAR_TOKEN="$token"
# Save $token — you'll need it for Next.js in step 5.
```

Save the `SIDECAR_TOKEN` value — you'll need it in step 5.

## 4. Deploy

```bash
fly deploy
```

Then verify:
```bash
curl https://socialpulse-ig-sidecar.fly.dev/health
# {"ok":true}

curl -H "Authorization: Bearer $SIDECAR_TOKEN" \
  https://socialpulse-ig-sidecar.fly.dev/profile/nike?top_posts=3
```

If you see a 502 with "login_required", the session expired — regenerate with `gen_session.py` and re-run step 3.

## 5. Wire it to Next.js

Add to `Social Media Website/.env.local`:

```
IG_SIDECAR_URL=https://socialpulse-ig-sidecar.fly.dev
IG_SIDECAR_TOKEN=<the SIDECAR_TOKEN from step 3>
```

Restart `next dev`. Re-submit any brand kit from onboarding to populate competitor discovery.

## Operational notes

- **Cost**: `shared-cpu-1x` + `auto_stop_machines` = sleeps when idle, ~$0/mo at low traffic.
- **Cache**: Next.js caches IG responses for 24h in the `ig_profile_cache` Supabase table. First request wakes the machine (~2s cold); subsequent requests are instant until the cache expires.
- **Session rotation**: if IG returns repeated challenges, rotate the proxy IP before rotating the account. Regenerate `session.json` and redeploy secrets.
- **Logs**: `fly logs`
- **Shell in**: `fly ssh console`
