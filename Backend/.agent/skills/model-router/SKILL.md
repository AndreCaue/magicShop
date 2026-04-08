# Model Router Econômico

## Descrição
Decide automaticamente qual modelo usar para economizar quota.

## Regras
- Tarefas simples (resumo, extração de texto, formatação, código básico, explicações curtas) → Use sempre o modelo mais leve disponível (Gemini Flash ou equivalente).
- Tarefas complexas (planejamento detalhado, arquitetura de sistema, debug difícil, raciocínio multi-passo) → Use modelo forte apenas se realmente necessário.
- Por padrão, prefira o modelo leve.
- Informe brevemente qual modelo está usando e por quê.

Sempre avalie a complexidade antes de escolher o modelo.