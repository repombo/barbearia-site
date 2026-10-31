# Site da Barbearia (React + Vite + Tailwind + Supabase)

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Abra o arquivo `.env` e preencha com os dados do seu projeto Supabase
   (Project Settings > API):
   ```env
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLISHABLE_AQUI
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Para gerar a versão de produção: `npm run build` (saída em `dist/`).

## Personalização

- Nome, endereço, WhatsApp e horários: `src/config.js`
- Textos da seção "Sobre": `src/components/Sobre.jsx`
- Fotos da galeria: `src/components/Galeria.jsx`
- Cores (dourado/vermelho): `src/index.css` (bloco `@theme`)

## Importante

- Execute antes o script SQL no Supabase (tabelas `servicos` e `agendamentos` + RLS).
- No deploy (Vercel/Netlify), cadastre as variáveis `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` nas configurações do serviço.
- Use sempre a chave `anon` no front-end. Nunca a `service_role`.
