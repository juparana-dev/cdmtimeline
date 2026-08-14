# CDM Presentation Design

## Objetivo

Adicionar ao `cdmtimeline` uma experiência de apresentação visual, separada da timeline existente, para introduzir o CDM a público não técnico antes da demonstração real do sistema.

## Mensagem dominante

O CDM simplifica o uso do SAP para as áreas de negócio. A área informa o que conhece. O CDM organiza, valida e prepara o que o SAP precisa.

## Público e tom

A apresentação atende representantes das áreas consumidoras e alta gestão. O início é executivo e conceitual. O meio mostra a jornada de forma operacional. O final se torna concreto e conduz diretamente à demonstração do CDM.

A tela deve sustentar a fala do apresentador, não competir com ela. O conteúdo textual deve ser curto e visualmente dominante.

## Estrutura narrativa

1. O CDM conecta a necessidade do negócio ao SAP.
2. A área conhece a necessidade. O CDM conhece o processo.
3. Jornada governada: Solicitar, Validar, Aprovar, Cadastrar.
4. O usuário trabalha em linguagem de negócio. O CDM aplica regras, padrões e validações antes do SAP.
5. Cada perfil participa no momento certo: solicitante, aprovador e gestão.
6. O processo continua depois do SAP com retorno, acompanhamento e consulta dos materiais.
7. Encerramento como transição: Agora vamos acompanhar essa jornada no CDM.

## Direção visual

Preservar a linguagem visual do `cdmtimeline`: fundo claro, verde CDM `#45813C`, amarelo `#EEB41E`, tipografia Archivo, grandes áreas de respiro, cartões com bordas suaves, animações com propósito e forte sensação de profundidade.

A apresentação usa seções de aproximadamente uma viewport com scroll snap, progressão visual e elementos que ganham foco conforme entram em cena. O CDM deve permanecer como centro conceitual da narrativa.

## Identidade V3 e motion

Usar os assets V3 fornecidos em `cdm-logo-motion.zip` e reutilizar o Motion Lab aprovado do mesmo pacote. Devem ser incorporados o símbolo, a assinatura horizontal e as animações oficiais compatíveis, incluindo `core-identity`, `layered-title` e `governed-circuit` quando fizerem sentido na narrativa.

Respeitar `prefers-reduced-motion` e manter fallback estático funcional.

## Integração com a timeline

A timeline atual permanece funcional e sem reescrita. Um botão minimalista `Apresentação` deve aparecer no topo da página existente e abrir `apresentacao/` no mesmo site GitHub Pages.

Como `index.html` usa `support.js` como runtime gerado, a integração não deve reformatar nem reescrever a timeline inteira. O blob atual de `support.js` será preservado como `support-runtime.js`. Um wrapper pequeno em `support.js` carregará o runtime original e adicionará o botão depois da inicialização do DOM.

## Compatibilidade GitHub Pages

A entrega deve permanecer estática, sem build, backend ou dependência externa obrigatória além da fonte já utilizada. Todos os links e assets novos devem usar caminhos relativos compatíveis com a publicação em subpath de GitHub Pages.

## Fora de escopo

Não alterar conteúdo histórico da timeline, marcos, mídias existentes, runtime original, SAP, CDM produtivo, autenticação ou qualquer Cloud. Não afirmar benefícios quantitativos não medidos. Não expor nomes técnicos de campos SAP na apresentação.
