# test_simulate_payment.py
from ..service import EfiClient

client = EfiClient(sandbox=True).efi

txid = "2b3c4629ebac482e80975a25b12a9dae"  # ← seu txid

# Simulação de pagamento no sandbox
result = client.pix_send(
    params={"txid": txid}
)

print(result)
