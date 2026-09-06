import json
import hmac
import hashlib
import time
from urllib.parse import parse_qsl
from functools import wraps

from flask import session, abort

MAX_AGE_SECONDS = 86400  # 24 часа


def validate_init_data(init_data: str, bot_token: str) -> dict | None:
    data = dict(parse_qsl(init_data, keep_blank_values=True))

    got_hash = data.pop("hash", "")
    if not got_hash:
        return None

    data_check_string = "\n".join(f"{k}={data[k]}" for k in sorted(data.keys()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calc_hash, got_hash):
        return None

    auth_date = int(data.get("auth_date", 0))
    if time.time() - auth_date > MAX_AGE_SECONDS:
        return None

    return json.loads(data["user"]) if "user" in data else None


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            abort(401, description="authentication required")
        return f(*args, **kwargs)
    return decorated