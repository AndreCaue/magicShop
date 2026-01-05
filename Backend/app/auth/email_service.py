import smtplib
from smtplib import SMTPAuthenticationError, SMTPConnectError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError

load_dotenv()

def send_verification_email(to_email: str, code: str, subject: str = None):
    SMTP_HOST = os.getenv("SMTP_HOST")
    try:
        SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        raise ValueError("SMTP_PORT deve ser um número válido.")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")
    FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
    SMTP_DEBUG = os.getenv("SMTP_DEBUG", "false").lower() == "true"

    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL]):
        raise ValueError("Configuração SMTP incompleta nas variáveis de ambiente.")


    try:
        validate_email(to_email, check_deliverability=False)
    except EmailNotValidError as e:
        raise ValueError(f"Endereço de e-mail inválido: {str(e)}")

    msg = MIMEMultipart("alternative")
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject or os.getenv("EMAIL_SUBJECT", "Código de Verificação - Minha Loja")

    body_plain = f"Seu código de verificação é: {code}\nEle irá expirar em 15 minutos."
    body_html = f"""
    <html>
        <body>
            <h2>Olá,</h2>
            <p>Seu código de verificação é: <strong>{code}</strong></p>
            <p>Ele irá expirar em 15 minutos.</p>
            <p>Se você não realizou esse cadastro, por favor, ignore este e-mail.</p>
        </body>
    </html>
    """
    msg.attach(MIMEText(body_plain, "plain"))
    msg.attach(MIMEText(body_html, "html"))

    try:
        timeout = int(os.getenv("SMTP_TIMEOUT", 10))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=timeout) as server:
            server.starttls()

            if SMTP_DEBUG:
                server.set_debuglevel(1)

            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())


    except SMTPAuthenticationError:
        raise Exception("Falha na autenticação SMTP. Verifique usuário e senha.")
    except SMTPConnectError:
        raise Exception("Não foi possível conectar ao servidor SMTP.")
    except Exception as e:
        raise Exception(f"Erro ao enviar o e-mail: {str(e)}")
    


if __name__ == "__main__":
    destino = input("Digite o e-mail de destino: ")
    codigo = "123456"
    try:
        send_verification_email(destino, codigo)
        print("E-mail de teste enviado com sucesso ✅")
    except Exception as e:
        print("Erro:", e)
