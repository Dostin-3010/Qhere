from pathlib import Path
from textwrap import wrap

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"


def clean_line(line: str) -> str:
    return (
        line.replace("```mermaid", "[Diagrama Mermaid]")
        .replace("```text", "")
        .replace("```bash", "")
        .replace("```env", "")
        .replace("```", "")
    )


def md_to_pdf(md_path: Path, pdf_path: Path):
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter
    margin = 0.65 * inch
    y = height - margin
    c.setTitle(md_path.stem)

    def new_page():
        nonlocal y
        c.showPage()
        y = height - margin

    c.setFont("Helvetica-Bold", 15)
    c.drawString(margin, y, md_path.stem.replace("_", " ").title())
    y -= 0.35 * inch

    for raw in md_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = clean_line(raw).strip()
        if not line:
            y -= 8
            continue

        if line.startswith("# "):
            c.setFont("Helvetica-Bold", 16)
            text = line[2:]
            gap = 22
        elif line.startswith("## "):
            c.setFont("Helvetica-Bold", 13)
            text = line[3:]
            gap = 18
        elif line.startswith("### "):
            c.setFont("Helvetica-Bold", 11)
            text = line[4:]
            gap = 15
        else:
            c.setFont("Helvetica", 9)
            text = line
            gap = 12

        for part in wrap(text, width=100):
            if y < margin:
                new_page()
            c.drawString(margin, y, part)
            y -= gap

    c.save()


def images_to_pdf(image_dir: Path, pdf_path: Path):
    images = sorted([p for p in image_dir.glob("*.png") if p.is_file()])
    c = canvas.Canvas(str(pdf_path), pagesize=landscape(letter))
    width, height = landscape(letter)
    c.setTitle("Capturas Aplicacion QHere")

    if not images:
        c.setFont("Helvetica-Bold", 20)
        c.drawString(0.75 * inch, height - inch, "Capturas de pantalla pendientes")
        c.setFont("Helvetica", 12)
        c.drawString(0.75 * inch, height - 1.35 * inch, "Coloca los PNG reales en la carpeta 04_CAPTURAS/PNG y vuelve a generar este PDF.")
        c.save()
        return

    for image_path in images:
        img = Image.open(image_path)
        img_w, img_h = img.size
        max_w = width - 1.0 * inch
        max_h = height - 1.25 * inch
        scale = min(max_w / img_w, max_h / img_h)
        draw_w = img_w * scale
        draw_h = img_h * scale
        x = (width - draw_w) / 2
        y = (height - draw_h) / 2 - 0.1 * inch

        c.setFillColor(colors.HexColor("#111111"))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(0.5 * inch, height - 0.45 * inch, image_path.stem.replace("_", " ").title())
        c.drawImage(str(image_path), x, y, draw_w, draw_h, preserveAspectRatio=True, anchor="c")
        c.showPage()

    c.save()


def main():
    pdf_dir = DOCS / "pdf"
    pdf_dir.mkdir(exist_ok=True)

    for md_name in [
        "ACTA_PROYECTO.md",
        "ANALISIS_Y_DISENO.md",
        "CRONOGRAMA_ACTIVIDADES.md",
        "MANUAL_TECNICO.md",
        "MANUAL_USUARIO.md",
        "TRAZABILIDAD_RF.md",
        "DIAGRAMA_BASE_DATOS.md",
        "PRESENTACION_PROPUESTA.md",
        "GUIA_ENTREGA_USB.md",
        "CREDENCIALES_RELEVANTES.md",
        "CAPTURAS_REQUERIDAS.md",
    ]:
        md_path = DOCS / md_name
        if md_path.exists():
            md_to_pdf(md_path, pdf_dir / f"{md_path.stem}.pdf")

    images_to_pdf(ROOT / "entrega_assets" / "capturas_png", pdf_dir / "CAPTURAS_APLICACION.pdf")
    print(f"PDFs generados en {pdf_dir}")


if __name__ == "__main__":
    main()
