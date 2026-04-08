from app.payment.efi_client import get_efi_client

efi = get_efi_client().efi

body = {
    "calendario": {"expiracao": 3600},  # 1 hora
    "devedor": {"cpf": "12345678909", "nome": "Teste Sandbox"},
    # valor baixo para simular confirmação automática
    "valor": {"original": "5.00"},
    "chave": "sua-chave-pix@exemplo.com",  # sua chave Pix cadastrada na Efí
    "solicitacaoPagador": "Teste de cobrança para reembolso"
}

response = efi.pix_create_immediate_charge(body=body)
print(response)  # veja txid, copia_e_cola, qrcode, etc.
