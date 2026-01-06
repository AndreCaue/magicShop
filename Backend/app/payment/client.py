from efipay import EfiPay
from pathlib import Path
import os

class EfiClient:
    def __init__(self, sandbox: bool = True):
        client_id = os.getenv("EFI_CLIENT_ID")
        client_secret = os.getenv("EFI_CLIENT_SECRET")
        cert_path = os.getenv("EFI_CERTIFICATE_PATH")

        if not all([client_id, client_secret, cert_path]):
            raise ValueError("Credenciais ou certificado EFI não configurados")

        credentials = {
            "client_id": client_id,
            "client_secret": client_secret,
            "certificate": str(Path(cert_path).resolve()),
            "sandbox": sandbox,
        }

        self.efi = EfiPay(credentials)
