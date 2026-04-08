
from pydantic import BaseModel
from typing import Optional, Any


class MelhorEnvioShipmentStatus(BaseModel):
    """Status atual do envio enviado pelo webhook."""
    id: Optional[str] = None
    status: Optional[str] = None
    label: Optional[str] = None            
    comment: Optional[str] = None         
    location: Optional[str] = None       
    updated_at: Optional[str] = None


class MelhorEnvioShipment(BaseModel):
    """Dados do envio no payload do webhook."""
    id: Optional[str] = None               
    protocol: Optional[str] = None
    status: Optional[MelhorEnvioShipmentStatus] = None
    tracking: Optional[str] = None         
    tracking_url: Optional[str] = None


class MelhorEnvioWebhookPayload(BaseModel):
    """
    Payload completo enviado pelo Melhor Envio no webhook.

    Documentação: https://docs.melhorenvio.com.br/docs/webhooks
    O Melhor Envio envia um POST com este formato quando o status muda.
    """
    shipment: Optional[MelhorEnvioShipment] = None

    id: Optional[str] = None              
    status: Optional[str] = None          
    tracking: Optional[str] = None       

    class Config:
        extra = "allow"   

    def get_shipment_id(self) -> Optional[str]:
        """Retorna o melhorenvio_order_id de onde estiver no payload."""
        if self.shipment and self.shipment.id:
            return self.shipment.id
        return self.id

    def get_status(self) -> Optional[str]:
        """Retorna o status normalizado (lowercase) de onde estiver."""
        raw = None
        if self.shipment and self.shipment.status:
            raw = self.shipment.status.status
        elif self.status:
            raw = self.status
        return raw.lower().strip() if raw else None

    def get_status_label(self) -> Optional[str]:
        if self.shipment and self.shipment.status:
            return self.shipment.status.label
        return None

    def get_tracking(self) -> Optional[str]:
        if self.shipment and self.shipment.tracking:
            return self.shipment.tracking
        return self.tracking

    def get_tracking_url(self) -> Optional[str]:
        if self.shipment and self.shipment.tracking_url:
            return self.shipment.tracking_url
        return None

    def get_location(self) -> Optional[str]:
        if self.shipment and self.shipment.status:
            return self.shipment.status.location
        return None

    def get_message(self) -> Optional[str]:
        if self.shipment and self.shipment.status:
            return self.shipment.status.comment
        return None
