from functools import lru_cache

from supabase import create_client

from .config import Config


def _build_invalid_key_message(key_name: str, key_value: str) -> str:
    if key_value.startswith("sb_publishable_"):
        return (
            f"{key_name} tiene una clave publishable con prefijo 'sb_publishable_'. "
            "Ese backend necesita una clave con permisos de servidor, normalmente "
            "la legacy 'service_role' en formato JWT o la nueva 'sb_secret_'."
        )

    return (
        f"{key_name} no tiene el formato esperado por supabase-py. "
        "Usa la clave 'service_role' (empieza con 'eyJ') o la nueva clave 'sb_secret_'."
    )


def get_supabase_settings() -> tuple[str, str]:
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_SERVICE_KEY

    if not url:
        raise RuntimeError("Falta configurar SUPABASE_URL en el backend.")

    if not key:
        raise RuntimeError("Falta configurar SUPABASE_SERVICE_KEY en el backend.")

    is_jwt = key.count(".") >= 2
    is_new_secret = key.startswith("sb_secret_")

    if not is_jwt and not is_new_secret:
        raise RuntimeError(_build_invalid_key_message("SUPABASE_SERVICE_KEY", key))

    return url, key


@lru_cache(maxsize=1)
def get_supabase_client():
    url, key = get_supabase_settings()
    return create_client(url, key)