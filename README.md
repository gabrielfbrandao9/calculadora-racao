# Calculadora de Ração

Site (e app para celular) que calcula a mistura de ração para suínos em cada fase, com as
porcentagens do **Programa Nutricional Suinocultura – Progress (Rebanho)** ou com as suas.

**Endereço:** https://gabrielfbrandao9.github.io/calculadora-racao/

É só HTML, CSS e JavaScript: não precisa de servidor nem de instalação.

## Como usar

1. Escolha a **fase** (Pré-Inicial 1, Pré-Inicial 2, Inicial, Crescimento, Terminação, Gestação ou Lactação).
2. Escolha como calcular:
   - **Total da mistura**: digite quantos kg de ração quer fazer (ou toque em 50, 100, 200, 500, 1000).
   - **Um ingrediente**: diga quanto tem de um ingrediente (ex.: 45 kg de milho) e o site calcula o resto.
3. Veja os kg de cada ingrediente. **Compartilhar mistura** envia a lista pelo WhatsApp (ou copia).

### Editar as porcentagens

- Toque em **Editar %**. Aparecem todos os ingredientes com um campo de porcentagem, inclusive os
  que não entram na fase (para incluir, por exemplo, farelo de trigo).
- A soma das porcentagens aparece no total. Se não fechar 100%, o site avisa e calcula
  proporcionalmente, sem mudar o total da mistura.
- As porcentagens editadas ficam salvas **no aparelho** (cada fase separada). A fase editada
  aparece marcada com "• editada".
- **Restaurar padrão** volta às porcentagens originais da fase.

### Cópia de segurança

No fim da página, **Baixar cópia** salva um arquivo `.json` com as porcentagens editadas (e o tema).
**Restaurar cópia** lê esse arquivo, por exemplo para passar as fórmulas para outro celular.

## Instalar no celular

Abra o endereço no Chrome (Android) e toque no botão **Instalar** no topo (ou no menu ⋮ → **Instalar app**).
No iPhone, use **Compartilhar → Adicionar à Tela de Início**. Depois de aberto uma vez, funciona
sem internet.

## Fórmulas padrão (kg por 100 kg de ração)

| Fase | Milho | F. soja | F. trigo | Açúcar | Núcleo |
|---|---|---|---|---|---|
| Pré-Inicial 1 (7 a 35 dias) | 40 | 15 | – | 5 | Progress 3: 40 |
| Pré-Inicial 2 (35 a 49 dias) | 50 | 25 | – | 5 | Progress 4: 20 |
| Inicial (50 a 70 dias) | 60 | 31 | – | 4 | Power Inicial: 5 |
| Crescimento (71 a 110 dias) | 72 | 25 | – | – | Progress Crescimento: 3 |
| Terminação (111 dias – abate) | 77 | 20 | – | – | Progress Terminação: 3 |
| Gestação | 57 | 16 | 24 | – | Progress Reprodução: 3 |
| Lactação | 62 | 30 | – | 5 | Progress Reprodução: 3 |

Siga a orientação técnica da Rebanho; as fórmulas sugeridas podem não se aplicar a todo sistema
de criação.

## Arquivos

- `index.html`: a página.
- `css/style.css`: visual (claro e escuro, seguindo o tema do aparelho).
- `js/dados.js`: ingredientes e fórmulas padrão. Para mudar uma fórmula para todo mundo, altere aqui.
- `js/app.js`: cálculo, edição das porcentagens e compartilhamento.
- `sw.js` e `manifest.webmanifest`: app instalável e uso sem internet. Ao mudar a lista de
  arquivos, aumente `VERSAO` no `sw.js`.
- `icons/`: ícone do app.

## Publicar alterações

O GitHub Pages publica a branch `main` automaticamente:

```bash
git add -A
git commit -m "Descrição da mudança"
git push
```
