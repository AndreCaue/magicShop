import os
import logging
import smtplib
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings

if settings.ENVIRONMENT == "production":
    resend.api_key = os.getenv("RESEND_API_KEY")

def send_verification_email(to_email: str, code: str, subject: str = None):
    from_email = (
        os.getenv("FROM_EMAIL_DEV")
        or os.getenv("FROM_EMAIL")
        or "Doce Ilusão <lojamagica@doceilusao.store>"
    )

    subject = subject or "Código de Verificação - Loja de mágica Doce Ilusão"

    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Olá!</h2>
            <p>Seu código de verificação é:</p>
            <p style="font-size: 1.8em; font-weight: bold; color: #d4af37; letter-spacing: 5px;">
                {code}
            </p>
            <p>Ele expira em <strong>15 minutos</strong>.</p>
            <p>Se você não solicitou este código, ignore este e-mail.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.9em; color: #666;">Loja de Mágica Doce Ilusão</p>
        </body>
    </html>
    """

    text_body = f"Seu código de verificação é: {code}\nEle expira em 15 minutos.\nSe não solicitou, ignore este e-mail."

    if settings.ENVIRONMENT == "production":
        try:
            resend.Emails.send({
                "from": from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
                "text": text_body,
            })
            logging.info(f"E-mail enviado via Resend para {to_email}")
        except Exception as e:
            raise Exception(f"Falha ao enviar e-mail: {str(e)}")

    else:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        if not smtp_user or not smtp_pass:
            raise ValueError("SMTP_USER e SMTP_PASS são obrigatórios em development")

        msg = MIMEMultipart("alternative")
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        debug_level = os.getenv("SMTP_DEBUG", "false").lower() == "true"

        try:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.set_debuglevel(debug_level)
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
         
        except Exception as e:
            raise Exception(f"Falha ao enviar e-mail via SMTP: {str(e)}")