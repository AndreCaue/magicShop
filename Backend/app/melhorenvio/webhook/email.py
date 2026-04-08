
import os
import smtplib
import resend
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings



STATUS_INFO = {
    "posted": {
        "titulo": "Seu pedido foi postado! 📦",
        "mensagem": "Seu pedido foi entregue à transportadora e já está a caminho.",
        "cor": "#4A90D9",
        "icone": "📦",
    },
    "shipped": {
        "titulo": "Seu pedido está em trânsito! 🚚",
        "mensagem": "Seu pedido está viajando até você. Acompanhe pelo código de rastreio abaixo.",
        "cor": "#F5A623",
        "icone": "🚚",
    },
    "delivered": {
        "titulo": "Pedido entregue! 🎉",
        "mensagem": "Seu pedido foi entregue com sucesso. Esperamos que você adore!",
        "cor": "#7ED321",
        "icone": "🎉",
    },
    "returned": {
        "titulo": "Pedido devolvido 🔄",
        "mensagem": "Seu pedido foi devolvido ao remetente. Nossa equipe entrará em contato em breve.",
        "cor": "#D0021B",
        "icone": "🔄",
    },
}

DEFAULT_STATUS_INFO = {
    "titulo": "Atualização do seu pedido",
    "mensagem": "Houve uma atualização no envio do seu pedido.",
    "cor": "#d4af37",
    "icone": "📬",
}


def _build_shipping_email_html(
    recipient_name: str,
    order_uuid: str,
    status: str,
    status_label: str | None,
    tracking_code: str | None,
    tracking_url: str | None,
) -> str:
    info = STATUS_INFO.get(status, DEFAULT_STATUS_INFO)
    titulo = info["titulo"]
    mensagem = info["mensagem"]
    cor = info["cor"]
    icone = info["icone"]

    tracking_block = ""
    if tracking_code:
        url = tracking_url or f"https://www.melhorrastreio.com.br/rastreio/{tracking_code}"
        tracking_block = f"""
        <div style="margin: 24px 0; padding: 16px; background: #f9f6ee;
                    border-left: 4px solid {cor}; border-radius: 4px;">
            <p style="margin: 0 0 8px; font-size: 0.85em; color: #666;">
                Código de rastreio
            </p>
            <p style="margin: 0 0 12px; font-size: 1.3em; font-weight: bold;
                      letter-spacing: 3px; color: #333;">
                {tracking_code}
            </p>
            <a href="{url}"
               style="display: inline-block; padding: 10px 20px;
                      background: {cor}; color: #fff; text-decoration: none;
                      border-radius: 4px; font-size: 0.9em; font-weight: bold;">
                Rastrear pedido →
            </a>
        </div>
        """

    status_label_block = ""
    if status_label:
        status_label_block = f"""
        <p style="font-size: 0.9em; color: #888; margin-top: 4px;">
            Status: <strong>{status_label}</strong>
        </p>
        """

    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;
                 max-width: 560px; margin: 0 auto; padding: 24px;">

        <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 3em;">{icone}</span>
            <h2 style="color: {cor}; margin: 8px 0 4px;">{titulo}</h2>
            {status_label_block}
        </div>

        <p>Olá, <strong>{recipient_name}</strong>!</p>
        <p>{mensagem}</p>

        <p style="font-size: 0.85em; color: #999;">
            Pedido: <strong>#{order_uuid[:8].upper()}</strong>
        </p>

        {tracking_block}

        <hr style="border: 0; border-top: 1px solid #eee; margin: 28px 0;">
        <p style="font-size: 0.85em; color: #999; text-align: center;">
            Qualquer dúvida, entre em contato conosco.<br>
            <strong style="color: #d4af37;">Loja de Mágica Doce Ilusão</strong>
        </p>
    </body>
    </html>
    """


def send_shipping_status_email(
    to_email: str,
    recipient_name: str,
    order_uuid: str,
    status: str,
    status_label: str | None = None,
    tracking_code: str | None = None,
    tracking_url: str | None = None,
) -> None:
    """
    Envia e-mail de atualização de envio para o cliente.
    Segue o mesmo padrão do send_verification_email existente:
    - Produção → Resend
    - Dev      → SMTP
    """
    resend.api_key = os.getenv("RESEND_API_KEY")

    if not resend.api_key and settings.ENVIRONMENT == "production":
        raise Exception("RESEND_API_KEY NÃO DEFINIDA EM PRODUÇÃO")

    info = STATUS_INFO.get(status, DEFAULT_STATUS_INFO)
    subject = f"{info['titulo']} — Doce Ilusão"

    if settings.ENVIRONMENT == "production":
        from_email = "Doce Ilusão <lojamagica@doceilusao.store>"
    else:
        from_email = (
            os.getenv("FROM_EMAIL_DEV")
            or os.getenv("FROM_EMAIL")
            or "Doce Ilusão <mcd.magica.cartas@doceilusao.store>"
        )

    html_body = _build_shipping_email_html(
        recipient_name=recipient_name,
        order_uuid=order_uuid,
        status=status,
        status_label=status_label,
        tracking_code=tracking_code,
        tracking_url=tracking_url,
    )
    text_body = f"{info['titulo']}\n\nOlá, {recipient_name}!\n{info['mensagem']}"
    if tracking_code:
        text_body += f"\n\nCódigo de rastreio: {tracking_code}"

    if settings.ENVIRONMENT == "production":
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }
        try:
            resend.Emails.send(params)
        except Exception as e:
            print(f"❌ Erro ao enviar email de envio: {e}")
            raise
    else:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        if not smtp_user or not smtp_pass:
            raise ValueError(
                "SMTP_USER e SMTP_PASS são obrigatórios em development")

        msg = MIMEMultipart("alternative")
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
        except Exception as e:
            print(f"❌ Erro ao enviar email de envio via SMTP: {e}")
            raise
