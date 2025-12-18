# from passlib.context import CryptContext
# from datetime import datetime, timedelta, timezone
# from jose import JWTError, jwt
# import os
# from dotenv import load_dotenv
# import uuid

# load_dotenv()

# # Configurações
# SECRET_KEY = os.getenv("JWT_SECRET", "meusegredo123")  # MUDE EM PRODUÇÃO!
# ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # ======================
# # Senhas
# # ======================
# def hash_password(password: str) -> str:
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)


# # ======================
# # Criação de token (CORRIGIDA)
# # ======================
# def create_access_token(
#     data: dict,
#     expires_delta: timedelta | None = None,
#     token_type: str = "access",  # "access" ou "refresh"
#     include_jti: bool = False
# ) -> str:
#     to_encode = data.copy()

#     expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

#     to_encode.update({
#         "exp": expire,
#         "iat": datetime.now(timezone.utc),
#         "type": token_type
#     })

#     if include_jti:
#         to_encode["jti"] = str(uuid.uuid4())

#     return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# # ======================
# # Decodificação segura
# # ======================
# def decode_token(token: str):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         raise ValueError("Token inválido ou expirado")



# # from passlib.context import CryptContext
# # from datetime import datetime, timedelta, timezone
# # from jose import jwt
# # from app.models import User
# # from app.database import SessionLocal
# # import os
# # from dotenv import load_dotenv
# # import time

# # load_dotenv()

# # SECRET_KEY = os.getenv("JWT_SECRET", "meusegredo123")
# # ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
# # ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# # pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # def hash_password(password: str):
# #     return pwd_context.hash(password)

# # def verify_password(plain_password, hashed_password):
# #     return pwd_context.verify(plain_password, hashed_password)

# # def create_access_token(data: dict, expires_delta: timedelta = None):
    
# #     to_encode = data.copy()
# #     is_master = data.get("is_master", False)
    
# #     if "sub" in data and not is_master:
# #         db = SessionLocal()
# #         try:
# #             user = db.query(User).filter(User.email == data["sub"]).first()
# #             if user:
# #                 is_master = user.role == "master" and str(user.role).strip() == "master" # and -> or
# #         finally:
# #             db.close()
    
# #     to_encode["is_master"] = is_master
# #     current_time = datetime.now(timezone.utc)
# #     expire = current_time + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
# #     # Calcular timestamp explicitamente
# #     expire_timestamp = int(time.mktime(expire.timetuple()))
    
# #     to_encode.update({"exp": expire_timestamp})
# #     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# #     return encoded_jwt