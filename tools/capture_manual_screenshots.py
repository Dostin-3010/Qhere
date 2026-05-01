from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "entrega_assets" / "manual_capturas"
PROFILE_DIR = ROOT / ".manual-chrome-profile"

CHROME_CANDIDATES = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]

PUBLIC_ROUTES = [
    ("01_home.png", "/"),
    ("02_login.png", "/login"),
    ("03_solicitud_director.png", "/director/register"),
]

PRIVATE_ROUTES = [
    ("04_super_admin_dashboard.png", "/super-admin/dashboard"),
    ("05_admin_dashboard.png", "/admin/dashboard"),
    ("06_admin_center.png", "/admin/center"),
    ("07_admin_students.png", "/admin/students"),
    ("08_admin_teachers.png", "/admin/teachers"),
    ("09_admin_parents.png", "/admin/parents"),
    ("10_admin_excuses.png", "/admin/excuses"),
    ("11_teacher_dashboard.png", "/teacher/dashboard"),
    ("12_teacher_inbox.png", "/teacher/inbox"),
    ("13_teacher_absences.png", "/teacher/absences"),
    ("14_parent_dashboard.png", "/parent/dashboard"),
    ("15_parent_send_excuse.png", "/parent/send-excuse"),
    ("16_parent_history.png", "/parent/history"),
    ("17_student_dashboard.png", "/student/dashboard"),
    ("18_student_excuses.png", "/student/my-excuses"),
]


def find_chrome() -> Path:
    for candidate in CHROME_CANDIDATES:
        if candidate.exists():
            return candidate

    resolved = shutil.which("chrome") or shutil.which("msedge")
    if resolved:
        return Path(resolved)

    raise FileNotFoundError("No se encontro Chrome ni Edge instalado.")


def capture(chrome: Path, base_url: str, filename: str, route: str, timeout: int, use_profile: bool):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    url = base_url.rstrip("/") + route
    target = OUT_DIR / filename
    command = [
        str(chrome),
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1365,900",
        "--force-device-scale-factor=1",
        f"--screenshot={target}",
        f"--virtual-time-budget={timeout}",
        url,
    ]
    if use_profile:
        command.insert(1, f"--user-data-dir={PROFILE_DIR}")
    subprocess.run(command, check=True)
    print(f"[OK] {filename} <- {url}")


def main():
    parser = argparse.ArgumentParser(description="Captura pantallas para el manual de usuario de QHere.")
    parser.add_argument("--base-url", default="http://127.0.0.1:5177", help="URL base del frontend Vite.")
    parser.add_argument("--all", action="store_true", help="Captura tambien rutas protegidas. Requiere sesion valida en el perfil usado.")
    parser.add_argument("--profile", action="store_true", help="Usa el perfil persistente .manual-chrome-profile.")
    parser.add_argument("--open-login", action="store_true", help="Abre Chrome con el perfil persistente para iniciar sesion manualmente.")
    parser.add_argument("--timeout", type=int, default=3500, help="Tiempo virtual para renderizar cada pagina en milisegundos.")
    args = parser.parse_args()

    try:
        chrome = find_chrome()
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if args.open_login:
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        subprocess.Popen(
            [
                str(chrome),
                f"--user-data-dir={PROFILE_DIR}",
                args.base_url.rstrip("/") + "/login",
            ]
        )
        print("Se abrio Chrome con el perfil de capturas.")
        print("Inicia sesion, entra al panel que quieras capturar, cierra esa ventana y luego ejecuta:")
        print("python tools/capture_manual_screenshots.py --base-url http://127.0.0.1:5177 --all --profile")
        return 0

    routes = PUBLIC_ROUTES + (PRIVATE_ROUTES if args.all else [])

    for filename, route in routes:
        capture(chrome, args.base_url, filename, route, args.timeout, args.profile)

    print(f"Capturas guardadas en: {OUT_DIR}")
    if not args.all:
        print("Nota: para capturas protegidas, primero ejecuta --open-login, inicia sesion y luego usa --all --profile.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
