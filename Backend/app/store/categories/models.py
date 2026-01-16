from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    
    category_name = Column(String, nullable=True)
    
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)


    products = relationship("Product", back_populates="category")
 