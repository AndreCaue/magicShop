# Cost-Efficient Memory Manager

## Descrição
Gerencia memória de forma econômica: resume o histórico periodicamente, mantém apenas o contexto relevante e evita inchar o prompt.

## Regras obrigatórias
- A cada 6-8 interações, faça um resumo conciso do que foi discutido até agora.
- Mantenha no prompt apenas: 
  - As últimas 4-6 mensagens importantes
  - O resumo da conversa anterior
  - Informações críticas do projeto
- Use recuperação semântica (RAG) apenas quando necessário para informações antigas.
- Nunca inclua o histórico completo no contexto.
- Priorize economia de tokens: evite repetições desnecessárias.
- Ao resumir, use no máximo 300-400 tokens.

## Como ativar
Sempre que eu mencionar @cost-memory-manager ou quando perceber que o contexto está crescendo, aplique essas regras automaticamente.