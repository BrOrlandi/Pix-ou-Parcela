export interface CDIResult {
  taxaAnual: number;
  data: string;
}

async function ultimoValor(serie: number): Promise<CDIResult | null> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro na API do BCB: ${response.status}`);
  }

  const dados = await response.json();
  if (!Array.isArray(dados) || dados.length === 0) return null;

  const ultimoDado = dados[dados.length - 1];
  const valorPercent = parseFloat(ultimoDado.valor);
  if (isNaN(valorPercent)) {
    throw new Error('Valor inválido retornado pela API');
  }

  return { taxaAnual: valorPercent / 100, data: ultimoDado.data };
}

/**
 * Consulta o CDI anualizado (base 252, série 4389) na API do Banco Central.
 * Se falhar, estima pela meta da Selic (série 432) menos 0,10 ponto, que é
 * a distância usual entre as duas.
 */
export async function consultarCDI(): Promise<CDIResult | null> {
  try {
    const cdi = await ultimoValor(4389);
    if (cdi) return cdi;
  } catch (error) {
    console.error('Erro ao consultar o CDI:', error);
  }

  try {
    const selic = await ultimoValor(432);
    if (selic) return { taxaAnual: selic.taxaAnual - 0.001, data: selic.data };
  } catch (error) {
    console.error('Erro ao consultar a Selic:', error);
  }

  return null;
}
