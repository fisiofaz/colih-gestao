# 🏥 COLIH Gestão

Sistema de gerenciamento de informações para a Comissão de Ligação com Hospitais (Centro Oeste Gaúcha).
O objetivo é facilitar o cadastro, busca e atualização de dados de médicos cooperadores e membros da equipe.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js 14/15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Banco de Dados:** PostgreSQL (via Neon.tech)
- **ORM:** Prisma (v5.14.0)

## 🛠️ Pré-requisitos

- Node.js (versão 18 ou superior)
- Conta no Neon.tech (ou banco Postgres local)

## 📦 Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://https://github.com/fisiofaz/colih-gestao.git](https://https://github.com/fisiofaz/colih-gestao.git)
   cd colih-gestao
   ```
2. **Instale as dependências:**
    ```bash
    npm install
    ```
3. **Configure as Variáveis de Ambiente:** Crie um arquivo .env na raiz do projeto e adicione a URL do   seu banco de dados:
    ```bash
    DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
    ```
4. **Prepare o Banco de Dados:**
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```
5. **Inicie o Servidor de Desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse <code>http://localhost:3000</code> no seu navegador.

## 🗂️ Estrutura do Banco de Dados

- O projeto possui duas entidades principais:

    - User: Membros da comissão com acesso ao sistema.

    - Doctor: Médicos, seus contatos e especialidades.

<hr>
<p>Desenvolvido como projeto de treinamento e implementação real.</P>