# Alerta Automático: GLPI + Rocket.Chat via n8n

Uma automação open-source desenvolvida no **n8n** para integrar o sistema de chamados **GLPI** com o **Rocket.Chat**. O objetivo é notificar os técnicos de suporte diariamente com um resumo de seus chamados pendentes via Mensagem Direta (DM).

## O Problema
Em operações de TI com alto volume de chamados, é comum que tickets antigos ou com múltiplas atribuições se percam na fila. Entrar no painel do GLPI todos os dias para verificar prioridades consome tempo e prejudica o SLA (Service Level Agreement/Acordo de Nível de Serviço).

## A Solução
Este fluxo do n8n resolve isso de forma proativa:
1. Conecta na **API REST do GLPI** e busca os últimos 3.000 chamados.
2. Utiliza um script customizado em **JavaScript (Node.js)** para:
   - Remover chamados já solucionados.
   - Traduzir IDs do GLPI para os usuários reais do Rocket.Chat.
   - Lidar com chamados atribuídos a múltiplos técnicos simultaneamente (Arrays).
   - Calcular há quantos dias o chamado está aberto.
3. Cria um *Loop* seguro (respeitando os limites de requisição da API) para enviar um relatório individualizado para o **Rocket.Chat** de cada técnico.
4. A partir do Loop é utilizado um nó de *Wait* para evitar sobrecarregar o sistema com diversas requisições ao mesmo tempo.
5. Envia a mensagem pelo Rocket.
6. Encerra a sessão no GLPI adequadamente para evitar acúmulo de processos no servidor.

## Tecnologias Utilizadas
* **n8n** (Plataforma de Automação baseada em Node)
* **API REST** (GLPI e Rocket.Chat)
* **JavaScript** (Lógica de filtragem e mapeamento de dados)

## Como importar no seu n8n
1. Faça o download do arquivo `Alerta de Chamados GLPI para Rocket.Chat.json` deste repositório.
2. No seu n8n, vá até a aba *Workflows*, clique em *Import from File* e selecione o arquivo.
3. Substitua os valores genéricos (como `SEU_IP_DO_GLPI`, `SEU_USER_TOKEN_AQUI` e `SEU_APP_TOKEN_AQUI`) nos nós HTTP Request.
4. Abra o nó "3. Agrupar por Técnico" e atualize o objeto `mapaTecnicos` com os IDs reais do seu ambiente.
5. Adicione suas credenciais do Rocket.Chat e ative o agendamento!

---
*Projeto desenvolvido para otimizar processos operacionais e SLA de equipes de suporte de TI.*
