from __future__ import annotations

from datetime import datetime
from pathlib import Path
import shutil
import zipfile


ROOT = Path(__file__).resolve().parents[1]
DELIVERY_ROOT = ROOT.parent


IGNORE_DIRS = {
    "node_modules",
    "dist",
    ".vite",
    ".git",
    "__pycache__",
    ".pytest_cache",
    ".venv",
    "venv",
}

IGNORE_FILES = {".env"}


def ignore_names(_, names):
    ignored = set()
    for name in names:
        if name in IGNORE_DIRS or name in IGNORE_FILES:
            ignored.add(name)
        if name.startswith("ENTREGA_QHERE_FINAL_"):
            ignored.add(name)
    return ignored


def copy_dir(src: Path, dst: Path):
    if src.exists():
        shutil.copytree(src, dst, ignore=ignore_names, dirs_exist_ok=True)


def copy_file(src: Path, dst: Path):
    if src.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)


def write_verification(delivery: Path):
    content = f"""QHERE - VERIFICACION FINAL DE ENTREGA
Fecha de generacion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Incluido:
[OK] Proyecto completo frontend/backend sin node_modules ni entornos virtuales.
[OK] Base de datos: schema, migraciones, script completo, RPC, Realtime, Edge Function y backup README.
[OK] Diagrama de base de datos en Markdown y PDF.
[OK] README general.
[OK] Acta de proyecto.
[OK] Manual tecnico.
[OK] Manual de usuario.
[OK] Cronograma de actividades en Markdown y Excel.
[OK] Analisis y diseno del sistema.
[OK] Trazabilidad RF-01 a RF-25.
[OK] Presentacion tipo propuesta en Markdown y PDF.
[OK] Capturas publicas generadas automaticamente: home, login, registro director.

Pendiente recomendado antes de entregar:
[ ] Agregar capturas autenticadas reales: super admin, panel director, centro, estudiantes, docentes, padres, excusas, QR y reportes.
[ ] Completar docs/CREDENCIALES_RELEVANTES.md con usuarios demo y contrasenas de entrega.
[ ] Confirmar que Supabase tenga ejecutado database/full_supabase_script.sql.
[ ] Probar login con centro educativo desde la maquina de demo.

Nota de alcance:
El proyecto final usa Python Flask + React + Supabase. FastAPI y Odoo aparecen en el enunciado general, pero no forman parte del codigo productivo de QHere.
"""
    (delivery / "VERIFICACION_FINAL.txt").write_text(content, encoding="utf-8")


def zip_dir(source: Path, zip_path: Path):
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for path in source.rglob("*"):
            if path.is_file():
                zf.write(path, path.relative_to(source.parent))


def main():
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    delivery = DELIVERY_ROOT / f"ENTREGA_QHERE_FINAL_{stamp}"

    project = delivery / "01_PROYECTO_COMPLETO"
    db = delivery / "02_BASE_DE_DATOS"
    docs = delivery / "03_DOCUMENTACION"
    captures = delivery / "04_CAPTURAS"
    presentation = delivery / "05_PRESENTACION"

    for folder in [project, db, docs, captures / "PNG", presentation]:
        folder.mkdir(parents=True, exist_ok=True)

    copy_dir(ROOT / "backend", project / "backend")
    copy_dir(ROOT / "frontend", project / "frontend")
    copy_dir(ROOT / "database", project / "database")
    copy_dir(ROOT / "docs", project / "docs")
    copy_file(ROOT / "README.md", project / "README.md")
    copy_file(ROOT / "ReadmeTohelp", project / "ReadmeTohelp")

    copy_dir(ROOT / "database", db)
    copy_file(ROOT / "docs" / "DIAGRAMA_BASE_DATOS.md", db / "DIAGRAMA_BASE_DATOS.md")
    copy_file(ROOT / "docs" / "pdf" / "DIAGRAMA_BASE_DATOS.pdf", db / "DIAGRAMA_BASE_DATOS.pdf")

    copy_file(ROOT / "README.md", docs / "README.md")
    for md in (ROOT / "docs").glob("*.md"):
        copy_file(md, docs / md.name)
    for xlsx in (ROOT / "docs").glob("*.xlsx"):
        copy_file(xlsx, docs / xlsx.name)
    copy_dir(ROOT / "docs" / "pdf", docs / "PDF")

    copy_dir(ROOT / "entrega_assets" / "capturas_png", captures / "PNG")
    copy_file(ROOT / "docs" / "pdf" / "CAPTURAS_APLICACION.pdf", captures / "CAPTURAS_APLICACION.pdf")
    copy_file(ROOT / "docs" / "CAPTURAS_REQUERIDAS.md", captures / "CAPTURAS_REQUERIDAS.md")

    copy_file(ROOT / "docs" / "PRESENTACION_PROPUESTA.md", presentation / "PRESENTACION_PROPUESTA.md")
    copy_file(ROOT / "docs" / "pdf" / "PRESENTACION_PROPUESTA.pdf", presentation / "PRESENTACION_PROPUESTA.pdf")

    write_verification(delivery)

    zip_path = DELIVERY_ROOT / f"{delivery.name}.zip"
    zip_dir(delivery, zip_path)

    print(f"DELIVERY={delivery}")
    print(f"ZIP={zip_path}")


if __name__ == "__main__":
    main()
