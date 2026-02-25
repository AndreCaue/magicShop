from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(String(2000), nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False,)
    reserved_stock = Column(Integer)

    shipping_preset_id = Column(
        Integer, ForeignKey("shipping_presets.id")
    )
    weight_grams = Column(Integer, nullable=False, )
    height_cm = Column(Integer, nullable=False, )
    width_cm = Column(Integer, nullable=False, )
    length_cm = Column(Integer, nullable=False,)

    discount = Column(Float, nullable=True, default=None)

    image_urls = Column(JSON, nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=False)
    category = relationship("Category", back_populates="products")
    shipping_preset = relationship("ShippingPreset")
