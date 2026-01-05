## Scripts

### Criar usuário master

```bash
# 1. Configure no .env:
MASTER_EMAIL=seu@email.com
MASTER_PASSWORD=sua_senha_forte

# 2. Execute:
python -m app.scripts.create_master_user
```

## 🔒 Garanta no `.gitignore`:

```
.env
.env.local
.env.*.local
```

## 🎯 Estrutura recomendada:

```
project/
├── app/
│   └── scripts/
│       ├── __init__.py
│       ├── create_master_user.py
│       └── README.md          ← Documenta cada script
├── .env                        ← NÃO VAI PRO GIT
├── .env.example                ← VAI PRO GIT (template)
└── .gitignore
```

## 📄 Crie `.env.example` (vai pro GitHub):

```env
# .env.example
MASTER_EMAIL=admin@example.com
MASTER_PASSWORD=change_me_in_production
```

## Resumo:

✅ **Pode enviar o script**  
✅ **Use variáveis de ambiente**  
✅ **Documente o uso**  
❌ **Nunca commite o `.env` real**  
✅ **Commite o `.env.example` como template**

Dessa forma o script é útil para a equipe e seguro! 🔐
