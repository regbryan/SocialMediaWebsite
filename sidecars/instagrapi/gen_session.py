"""Generate IG_SESSION_JSON locally so burner credentials never leave your machine.

Usage:
  pip install instagrapi
  python gen_session.py <username> <password> [proxy_url]

Prints the session JSON to stdout. Paste into Fly as:
  fly secrets set IG_SESSION_JSON="$(python gen_session.py user pass)"
"""

from __future__ import annotations

import json
import sys

from instagrapi import Client


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__, file=sys.stderr)
        return 2

    username, password = sys.argv[1], sys.argv[2]
    proxy = sys.argv[3] if len(sys.argv) > 3 else None

    client = Client()
    if proxy:
        client.set_proxy(proxy)
    client.login(username, password)
    client.get_timeline_feed()  # sanity check — forces session save

    print(json.dumps(client.get_settings()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
