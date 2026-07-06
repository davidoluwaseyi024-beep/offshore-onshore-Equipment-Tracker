import io

from django.template.loader import render_to_string


def render_pdf(template_name: str, context: dict) -> bytes:
    # Imported lazily so xhtml2pdf's reportlab dependency is only pulled in
    # at actual PDF-generation time, not at Django startup.
    from xhtml2pdf import pisa

    html_string = render_to_string(template_name, context)
    buffer = io.BytesIO()
    result = pisa.CreatePDF(src=html_string, dest=buffer)
    if result.err:
        raise RuntimeError(f"PDF generation failed with {result.err} error(s).")
    return buffer.getvalue()
