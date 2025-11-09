/**
 * Consulta a taxa Selic diária na API do Banco Central
 */
export async function consultarSelicDiaria(data: Date): Promise<number | null> {
  try {
    const dataFormatada = formatarDataBrasileira(data);
    
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=${dataFormatada}&dataFinal=${dataFormatada}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro na API do BCB: ${response.status}`);
    }
    
    const dados = await response.json();
    
    if (!Array.isArray(dados) || dados.length === 0) {
      // Tenta dia anterior se não houver dados (fim de semana/feriado)
      const diaAnterior = new Date(data);
      diaAnterior.setDate(diaAnterior.getDate() - 1);
      
      if (diaAnterior.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
        return consultarSelicDiaria(diaAnterior);
      }
      
      return null;
    }
    
    const valorString = dados[0].valor;
    const valorPercent = parseFloat(valorString);
    
    if (isNaN(valorPercent)) {
      throw new Error("Valor inválido retornado pela API");
    }
    
    // Retorna a taxa diária em decimal (ex: 0.055131% = 0.00055131)
    return valorPercent / 100;
  } catch (error) {
    console.error("Erro ao consultar taxa Selic:", error);
    return null;
  }
}

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy)
 */
function formatarDataBrasileira(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
}
