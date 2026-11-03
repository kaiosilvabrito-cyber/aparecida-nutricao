# Aparecida Nutrição

Aplicação demonstrativa em HTML, CSS e JavaScript para acompanhar pacientes de nutrição. Não precisa instalar dependências.

## Abrir no VS Code

1. Extraia o ZIP e abra a pasta do projeto em **File → Open Folder** (ou execute `code .` no terminal).
2. Se o VS Code recomendar a extensão Prettier, instale-a para formatar os arquivos ao salvar.
3. Pressione **F5** e escolha **Aparecida Nutrição**. A configuração executa os testes, inicia o servidor e abre `http://localhost:3000` no navegador.

Também é possível iniciar a aplicação pelo terminal integrado:

```bash
npm start
```

Depois abra `http://localhost:3000`. Para rodar os testes:

```bash
npm test
```

As tarefas **Iniciar aplicação** e **Executar testes** também ficam disponíveis no menu **Terminal → Run Task**. O projeto requer Node.js 18 ou superior.

## Funcionalidades

- Lista de pacientes com peso, altura, percentual de gordura e IMC calculado.
- Cadastro com validação de nome e limites de peso, altura e gordura corporal. Vírgula e ponto são aceitos como separador decimal.
- Filtro por nome que ignora maiúsculas e acentos.
- Remoção por botão com confirmação.
- Salvamento no armazenamento local do navegador.
- Busca externa opcional. Tenta consultar a API original do exercício; como esse serviço pode estar indisponível, a aplicação usa `data/pacientes-exemplo.json` como alternativa e informa quando os dados fictícios locais foram usados.

Os cadastros ficam no `localStorage` do navegador usado e não são enviados a um banco de dados. Esta é uma aplicação demonstrativa sem autenticação nem criptografia de dados locais; não use informações pessoais ou clínicas reais.
