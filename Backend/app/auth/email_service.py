import os
import smtplib
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings


def send_verification_email(to_email: str, code: str, subject: str = None):
    resend.api_key = os.getenv("RESEND_API_KEY")

    if not resend.api_key and settings.ENVIRONMENT == "production":
        raise Exception("RESEND_API_KEY NÃO DEFINIDA EM PRODUÇÃO")

    if settings.ENVIRONMENT == "production":
         from_email = "Doce Ilusão <lojamagica@doceilusao.store>"
    else:
        from_email = (
            os.getenv("FROM_EMAIL_DEV")
            or os.getenv("FROM_EMAIL")
            or "Doce Ilusão <mcd.magica.cartas@doceilusao.store>"
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

    text_body = (
        f"Seu código de verificação é: {code}\n"
        f"Ele expira em 15 minutos.\n"
        f"Se não solicitou este código, ignore este e-mail."
    )

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
            print(f"❌ Erro ao enviar email: {e}")
            raise

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

        try:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)


        except Exception as e:
            print("❌ EXCEÇÃO AO ENVIAR EMAIL VIA SMTP")
            print(str(e))
            raise



async def send_reset_password_email(to_email: str, username: str, reset_link: str):
    if settings.ENVIRONMENT == "production":
        from_email = "Doce Ilusão <lojamagica@doceilusao.store>"
    else:
        from_email = (
            os.getenv("FROM_EMAIL_DEV")
            or os.getenv("FROM_EMAIL")
            or "Doce Ilusão <mcd.magica.cartas@doceilusao.store>"
        )

    subject = "Redefinição de Senha - Loja de Mágica Doce Ilusão"

    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Olá, {username.split('@')[0] if '@' in username else username}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #d4af37; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Redefinir Senha
                </a>
            </p>
            <p>Este link expira em <strong>30 minutos</strong>.</p>
            <p>Se você não solicitou isso, ignore este e-mail — sua senha permanecerá segura.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
            <p style="font-size: 0.9em; color: #666;">Loja de Mágica Doce Ilusão</p>
        </body>
    </html>
    """

    text_body = f"""
    Olá!

    Recebemos uma solicitação para redefinir sua senha.
    Acesse este link para criar uma nova senha: {reset_link}

    O link expira em 30 minutos.

    Se não solicitou, ignore este e-mail.
    """

    if settings.ENVIRONMENT == "production":
        resend.api_key = os.getenv("RESEND_API_KEY")
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }
        resend.Emails.send(params)
    else:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        msg = MIMEMultipart("alternative")
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)

