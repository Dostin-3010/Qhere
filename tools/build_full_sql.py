from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "database" / "full_supabase_script.sql"

FILES = [
    "database/schema.sql",
    "database/migrations/2026-03-24_add_admin_excuses_select_policy.sql",
    "database/migrations/2026-03-24_add_real_qr_and_teacher_lateness.sql",
    "database/migrations/2026-03-24_align_excuses_to_english.sql",
    "database/migrations/2026-04-07_add_future_feature_tables.sql",
    "database/migrations/2026-04-07_add_registration_approval_flow.sql",
    "database/migrations/2026-04-07_complete_core_school_schema.sql",
    "database/migrations/2026-04-22_complete_remaining_school_requirements.sql",
    "database/migrations/2026-04-30_add_profiles_approval_columns_if_missing.sql",
    "database/migrations/2026-04-30_add_profiles_school_id_if_missing.sql",
    "database/migrations/2026-05-01_add_school_calendar_rls_policies.sql",
    "database/future_tables.sql",
    "database/rpc_functions.sql",
    "database/realtime_setup.sql",
]


def main():
    parts = [
        "-- QHere - Full Supabase Script\n",
        "-- Incluye tablas, indices, vistas, triggers, storage, migraciones, RPC y realtime.\n",
        "-- Generado para entrega academica.\n\n",
    ]

    for rel_path in FILES:
        path = ROOT / rel_path
        parts.append(
            "\n-- ============================================================\n"
            f"-- Source: {rel_path}\n"
            "-- ============================================================\n"
        )
        if path.exists():
            parts.append(path.read_text(encoding="utf-8", errors="replace"))
            parts.append("\n")

    OUT.write_text("".join(parts), encoding="utf-8")
    print(f"{OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
