export interface DadosCompra {
  valorVista: number;
  numeroParcelas: number;
  valorParcela: number;
}

export interface ResultadoCalculo {
  valorVista: number;
  totalPrazo: number;
  valorPresente: number;
  diferencaNominal: number;
  diferencaPercentual: number;
  compensaParcela: boolean;
}

/**
 * Converte taxa diária (em decimal) para taxa mensal
 * Assume 252 dias úteis por ano
 */
export function taxaDiariaParaMensal(taxaDiariaDecimal: number): number {
  return Math.pow(1 + taxaDiariaDecimal, 252 / 12) - 1;
}

/**
 * Converte taxa anual (em decimal) para taxa mensal
 */
export function taxaAnualParaMensal(taxaAnualDecimal: number): number {
  return Math.pow(1 + taxaAnualDecimal, 1 / 12) - 1;
}

/**
 * Calcula o valor presente de uma série de parcelas
 */
export function calcularValorPresente(
  valorParcela: number,
  numeroParcelas: number,
  taxaMensal: number
): number {
  let valorPresente = 0;
  
  for (let i = 1; i <= numeroParcelas; i++) {
    valorPresente += valorParcela / Math.pow(1 + taxaMensal, i);
  }
  
  return valorPresente;
}

/**
 * Realiza o cálculo completo de comparação entre vista e parcelado
 */
export function calcularComparacao(
  dados: DadosCompra,
  taxaMensal: number
): ResultadoCalculo {
  const totalPrazo = dados.numeroParcelas * dados.valorParcela;
  const valorPresente = calcularValorPresente(
    dados.valorParcela,
    dados.numeroParcelas,
    taxaMensal
  );
  
  const compensaParcela = valorPresente < dados.valorVista;
  const diferencaNominal = Math.abs(dados.valorVista - valorPresente);
  const baseCalculo = Math.min(dados.valorVista, valorPresente);
  const diferencaPercentual = (diferencaNominal / baseCalculo) * 100;
  
  return {
    valorVista: dados.valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
  };
}

/**
 * Formata valor em moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
