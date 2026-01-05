from .client import EfiClient
from .schemas import PixRequest, CardOneStepRequest

class EfiService:
    def __init__(self, sandbox: bool = True):
        self.client = EfiClient(sandbox=sandbox).efi

    def create_pix_charge(self, data: PixRequest) -> dict:
     valor_formatado = data.valor_original 

     body = {
         "calendario": {"expiracao": data.expiracao},
         "valor": {"original": valor_formatado},
         "chave": data.chave,
     }

     if data.solicitacao_pagador:
        body["solicitacaoPagador"] = data.solicitacao_pagador

     devedor = {}
     if data.devedor_cpf:
         devedor["cpf"] = data.devedor_cpf
     if data.devedor_nome:
         devedor["nome"] = data.devedor_nome

     if not devedor.get("cpf") or not devedor.get("nome"):
         devedor = {"cpf": "12345678909", "nome": "Teste Homologacao"}

     body["devedor"] = devedor

     return self.client.pix_create_immediate_charge(body=body)

    def create_card_one_step(self, data: CardOneStepRequest) -> dict:
   
        raise NotImplementedError("Pagamento one-step com cartão ainda não implementado com SDK Efí")
    
    def configure_webhook(self, chave_pix: str, webhook_url: str) -> dict:
        body = {"webhookUrl": webhook_url}
        return self.client.pix_config_webhook(chave=chave_pix, body=body)