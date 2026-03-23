/**
 * Script n8n: Processamento e Agrupamento de Chamados do GLPI
 * Este script recebe os dados brutos da API do GLPI, filtra os chamados 
 * que não estão fechados, traduz os IDs dos técnicos para os usernames 
 * do Rocket.Chat, e cria um relatório individual agrupado.
 */

const chamadosPorTecnico = {};

// Dicionário de Status do GLPI
const statusMap = {
  1: "Novo",
  2: "Em Atendimento",
  3: "Planejado",
  4: "Pendente"
};

// Dicionário de Urgência (Padrão GLPI)
const urgenciaMap = {
  1: "⚪ Muito Baixa",
  2: "🟢 Baixa",
  3: "🟡 Média",
  4: "🟠 Alta",
  5: "🔴 Muito Alta"
};

// Tradutor: ID do Técnico no GLPI -> Username no Rocket.Chat
const mapaTecnicos = {
  '101': 'tecnico.um',
  '102': 'tecnico.dois',
  '103': 'tecnico.tres'
};

const chamados = $input.first().json.data || [];
const hoje = new Date();

for (const chamado of chamados) {
  const id = chamado["2"];
  const titulo = chamado["1"];
  const empresa = chamado["80"] || "Empresa não informada";
  
  const status = chamado["12"];
  // Ignora os chamados já Solucionados (5) ou Fechados (6)
  if (status == 5 || status == 6) {
    continue; 
  }
  
  // Calcula o tempo de abertura do chamado em dias
  const dataCriacao = chamado["15"];
  let diasAberto = 0;
  
  if (dataCriacao) {
    const dataChamado = new Date(dataCriacao);
    const diferencaTempo = Math.abs(hoje - dataChamado);
    diasAberto = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
  }
  
  // Captura e traduz a urgência
  const idUrgencia = chamado["10"]; 
  const urgenciaTraduzida = urgenciaMap[idUrgencia] || "Não informada";

  // Identifica o técnico (suportando arrays caso existam múltiplos técnicos)
  let tecnicosDoChamado = chamado["5"];
  if (!tecnicosDoChamado) {
    tecnicosDoChamado = [];
  } else if (!Array.isArray(tecnicosDoChamado)) {
    tecnicosDoChamado = [tecnicosDoChamado];
  }
  
  const statusTraduzido = statusMap[status] || status;
  
  // Popula o objeto separando os chamados para cada técnico responsável
  for (const idTec of tecnicosDoChamado) {
    const idLimpo = String(idTec).trim();
    const tecnicoRocketChat = mapaTecnicos[idLimpo];
    
    if (tecnicoRocketChat) {
      if (!chamadosPorTecnico[tecnicoRocketChat]) {
        chamadosPorTecnico[tecnicoRocketChat] = [];
      }
      
      chamadosPorTecnico[tecnicoRocketChat].push({
        id: id,
        titulo: titulo,
        empresa: empresa,
        status: statusTraduzido,
        urgencia: urgenciaTraduzida,
        diasAberto: diasAberto       
      });
    }
  }
}

// Formata o resultado final para o n8n gerar os itens em loop
const resultados = [];
for (const [tecnico, lista] of Object.entries(chamadosPorTecnico)) {
  if (lista.length > 0) {
      resultados.push({
        json: {
          tecnico: tecnico, 
          quantidade: lista.length,
          lista_chamados: lista
        }
      });
  }
}

return resultados;