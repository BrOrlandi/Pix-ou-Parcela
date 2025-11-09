export interface SelicResult {
  taxaAnual: number;
  data: string;
}

/**
 * Consulta a taxa Selic anual na API do Banco Central
 */
export async function consultarSelicDiaria(
  data: Date
): Promise<SelicResult | null> {
  try {
    // Calcula data inicial (pelo menos 10 dias antes)
    const dataInicial = new Date(data);
    dataInicial.setDate(dataInicial.getDate() - 10);

    const dataInicialFormatada = formatarDataBrasileira(dataInicial);
    const dataFinalFormatada = formatarDataBrasileira(data);

    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=${dataInicialFormatada}&dataFinal=${dataFinalFormatada}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na API do BCB: ${response.status}`);
    }

    const dados = await response.json();

    if (!Array.isArray(dados) || dados.length === 0) {
      return null;
    }

    // Pega o último elemento do array (data mais recente disponível)
    const ultimoDado = dados[dados.length - 1];
    const valorString = ultimoDado.valor;
    const valorPercent = parseFloat(valorString);

    if (isNaN(valorPercent)) {
      throw new Error('Valor inválido retornado pela API');
    }

    // Retorna a taxa anual em decimal (ex: 15.00% = 0.15) e a data
    return {
      taxaAnual: valorPercent / 100,
      data: ultimoDado.data,
    };
  } catch (error) {
    console.error('Erro ao consultar taxa Selic:', error);
    return null;
  }
}

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy)
 */
function formatarDataBrasileira(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}
