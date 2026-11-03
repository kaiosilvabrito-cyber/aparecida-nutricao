# Aparecida Nutrição

Aplicação simples em HTML, CSS e JavaScript para acompanhar pacientes de nutrição. Não precisa instalar dependências.

## Executar

Requer Node.js 18 ou superior. Na pasta do projeto, rode:

```bash
npm start
```

Abra `http://localhost:3000` no navegador. Para verificar a lógica automatizada:

```bash
npm test
```

## Funcionalidades

- Lista de pacientes com peso, altura, percentual de gordura e IMC calculado.
- Cadastro com validação de nome e limites de peso, altura e gordura corporal. Vírgula e ponto são aceitos como separador decimal.
- Filtro por nome que ignora maiúsculas e acentos.
- Remoção por botão com confirmação.
- Salvamento no armazenamento local do navegador.
- Busca externa opcional. Tenta consultar a API original do exercício; como esse serviço pode estar indisponível, a aplicação usa `data/pacientes-exemplo.json` como alternativa e informa quando os dados fictícios locais foram usados.

Os cadastros ficam no `localStorage` do navegador usado e não são enviados a um banco de dados. Esta é uma aplicação demonstrativa sem autenticação nem criptografia de dados locais; não use informações pessoais ou clínicas reais.
