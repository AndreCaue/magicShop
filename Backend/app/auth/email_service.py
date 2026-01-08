import os
import smtplib
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings


def send_verification_email(to_email: str, code: str, subject: str = None):
    print("=== send_verification_email INICIADO ===")

    print("ENVIRONMENT:", settings.ENVIRONMENT)

    # 🔐 Garante que a API KEY sempre esteja definida
    resend.api_key = os.getenv("RESEND_API_KEY")
    print("RESEND_API_KEY definida?", bool(resend.api_key))

    if not resend.api_key and settings.ENVIRONMENT == "production":
        raise Exception("RESEND_API_KEY NÃO DEFINIDA EM PRODUÇÃO")

    # 📧 FROM EMAIL (separado por ambiente)
    if settings.ENVIRONMENT == "production":
        from_email = (
            os.getenv("FROM_EMAIL")
            or "Doce Ilusão <lojamagica@doceilusao.store>"
        )
    else:
        from_email = (
            os.getenv("FROM_EMAIL_DEV")
            or os.getenv("FROM_EMAIL")
            or "Doce Ilusão <lojamagica@doceilusao.store>"
        )

    print("FROM_EMAIL:", from_email)
    print("TO_EMAIL:", to_email)

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

    # 🚀 PRODUÇÃO — RESEND
    if settings.ENVIRONMENT == "production":
        print("Modo PRODUÇÃO — enviando via Resend")

        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }

        print("Parâmetros enviados ao Resend:")
        print(params)

        try:
            response = resend.Emails.send(params)
            print("Resposta do Resend:")
            print(response)

            if not response or not isinstance(response, dict) or "id" not in response:
                print("⚠️ ALERTA: Resend não retornou ID de envio")

        except Exception as e:
            print("❌ EXCEÇÃO AO ENVIAR EMAIL VIA RESEND")
            print(str(e))
            raise

    # 🧪 DEVELOPMENT — SMTP
    else:
        print("Modo DEVELOPMENT — enviando via SMTP")

        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")

        print("SMTP_HOST:", smtp_host)
        print("SMTP_PORT:", smtp_port)
        print("SMTP_USER definido?", bool(smtp_user))

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

            print("✅ E-mail enviado com sucesso via SMTP")

        except Exception as e:
            print("❌ EXCEÇÃO AO ENVIAR EMAIL VIA SMTP")
            print(str(e))
            raise

    print("=== send_verification_email FINALIZADO ===")
