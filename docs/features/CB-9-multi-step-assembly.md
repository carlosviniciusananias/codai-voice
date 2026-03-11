# 🧩 Composição de Componentes (Multi-Step Assembly) - CB-9

A funcionalidade de **Composição de Componentes** permite que você crie interfaces complexas de forma incremental, através de múltiplos comandos de voz ou texto. Em vez de descrever toda a interface de uma só vez, você pode construí-la passo a passo, adicionando, editando ou removendo elementos enquanto mantém o contexto do que já foi criado.

## 🚀 Como Funciona

O sistema utiliza uma **Memória de Contexto** que armazena o estado atual do seu layout. Quando você ativa o modo **"Adicionar"**, o comando enviado é processado levando em conta o código JSX já existente, permitindo modificações cirúrgicas e adições naturais.

### 🎮 Modos de Operação

1.  **Novo (Padrão):** Gera um componente do zero, descartando qualquer contexto anterior. Ideal para começar um novo projeto ou seção.
2.  **Adicionar:** Ativa a composição incremental. O próximo comando será aplicado sobre o layout atual.

## 🎙️ Exemplos de Comandos

O poder da composição incremental brilha quando você refina sua interface em etapas:

### Exemplo 1: Construindo um Card de Produto
- **Passo 1 (Modo Novo):** "Crie um card simples com uma imagem de placeholder no topo."
- **Passo 2 (Modo Adicionar):** "Adicione um título 'Smartphone Pro' e um preço de '$999' abaixo da imagem."
- **Passo 3 (Modo Adicionar):** "Inclua um botão azul escrito 'Comprar Agora' no rodapé do card."
- **Passo 4 (Modo Adicionar):** "Coloque um ícone de estrela e a nota '4.8' ao lado do preço."

### Exemplo 2: Refinando um Formulário
- **Passo 1 (Modo Novo):** "Gere um formulário de contato com campos de nome e e-mail."
- **Passo 2 (Modo Adicionar):** "Adicione um campo de texto (textarea) para a mensagem."
- **Passo 3 (Modo Adicionar):** "Mude a cor do botão de envio para verde e adicione um ícone de avião de papel."

## 📜 Histórico de Composição

Ao utilizar o modo incremental, um painel de **"Passos da Composição"** aparecerá ao lado do código.
- Cada comando gera um novo "Passo" (Passo 1, Passo 2, etc.).
- Você pode **clicar em qualquer passo anterior** para visualizar e restaurar o código naquele ponto específico.
- Isso permite "desfazer" alterações ou explorar diferentes caminhos de design sem perder o progresso.

## 🛠️ Detalhes Técnicos para Desenvolvedores

- **Persistência:** O estado atual (`currentLayout`) e o histórico são persistidos no Redis (via Upstash) vinculados à sessão do usuário (`codai_session_id`).
- **Context-Aware Prompting:** O backend envia o código atual como contexto para o LLM (Llama 3.3 via Groq), instruindo-o a realizar o "merge" das alterações.
- **Endpoint:** `POST /api/generate` com a flag `isIncremental: true`.

---
*Documentação gerada por Harry (Developer Advocate) para a tarefa CB-9.*
