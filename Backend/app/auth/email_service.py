import resend
import os

resend.api_key = os.getenv("RESEND_API_KEY")

def send_verification_email(to_email: str, code: str, subject: str = None):
    from_email = os.getenv("FROM_EMAIL", "Doce Ilusão <lojamagica@doceilusao.store>")
    subject = subject or "Código de Verificação - Loja de mágica Doce Ilusão"

    html_body = f"""
    <html>
        <body>
            <h2>Olá,</h2>
            <p>Seu código de verificação é: <strong>{code}</strong></p>
            <p>Ele irá expirar em 15 minutos.</p>
            <p>Se você não realizou esse cadastro, por favor ignore este e-mail.</p>
        </body>
    </html>
    """

    params = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
        "text": f"Seu código de verificação é: {code}\nEle irá expirar em 15 minutos."
    }

    try:
        resend.Emails.send(params)
    except Exception as e:
        raise Exception(f"Erro ao enviar o e-mail: {str(e)}")