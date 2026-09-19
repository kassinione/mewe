import hashlib
import hmac
import json
import time
from typing import NotRequired, TypedDict
from urllib.parse import parse_qsl

from ..exceptions import UnauthorizedError


class TelegramUserData(TypedDict):
    id: int
    first_name: str
    last_name: NotRequired[str]
    username: NotRequired[str]


MAX_AGE_SECONDS = 86400  # 24 hours in seconds


def validate_init_data(init_data: str, bot_token: str) -> TelegramUserData:
    data = dict(parse_qsl(init_data, keep_blank_values=True))

    received_hash = data.pop("hash", "")
    if not received_hash:
        raise UnauthorizedError("invalid initData")

    data_check_string = "\n".join(f"{key}={data[key]}" for key in sorted(data))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise UnauthorizedError("invalid initData")

    try:
        auth_date = int(data.get("auth_date", "0"))
    except ValueError as error:
        raise UnauthorizedError("invalid initData") from error

    current_time = time.time()

    if (
        auth_date > current_time
        or current_time - auth_date > MAX_AGE_SECONDS
    ):
        raise UnauthorizedError("invalid initData")

    user_json = data.get("user")
    if not user_json:
        raise UnauthorizedError("invalid initData")

    try:
        user_data = json.loads(user_json)
    except json.JSONDecodeError as error:
        raise UnauthorizedError("invalid Telegram user data") from error

    if not isinstance(user_data, dict):
        raise UnauthorizedError("invalid Telegram user data")

    user_id = user_data.get("id")
    first_name = user_data.get("first_name")

    if (
        not isinstance(user_id, int)
        or isinstance(user_id, bool)
        or not isinstance(first_name, str)
    ):
        raise UnauthorizedError("invalid Telegram user data")

    result: TelegramUserData = {
        "id": user_id,
        "first_name": first_name,
    }

    last_name = user_data.get("last_name")
    if isinstance(last_name, str):
        result["last_name"] = last_name

    username = user_data.get("username")
    if isinstance(username, str):
        result["username"] = username

    return result
