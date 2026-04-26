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
  cenarioAutoFinanciado: CenarioAutoFinanciado;
  cenarioDinheiroNovo: CenarioDinheiroNovo;
}

export interface CenarioAutoFinanciado {
  saldoFinal: number;
  rendimentoTotal: number;
  totalPagoParcelas: number;
  parcelaMaiorQueRendimento: boolean;
}

export interface CenarioDinheiroNovo {
  saldoFinalAplicacao: number;
  rendimentoTotal: number;
  totalPagoParcelas: number;
  ganhoLiquido: number;
}

/**
 * Converte taxa diária (em decimal) para taxa mensal
 * Assume 252 dias úteis por ano
 */
export function taxaDiariaParaMensal(taxaDiariaDecimal: number): number {
  return Math.pow(1 + taxaDiariaDecimal, 252 / 12) - 1;
}

/**
 * Converte taxa diária (em decimal) para taxa anual
 * Assume 252 dias úteis por ano
 */
export function taxaDiariaParaAnual(taxaDiariaDecimal: number): number {
  return Math.pow(1 + taxaDiariaDecimal, 252) - 1;
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
 * Cenário A — "Auto-financiado":
 * Aplica o valor à vista e usa a própria aplicação (saques mensais)
 * para pagar cada parcela. Considera a primeira parcela paga ao final
 * do 1º mês (compatível com a fatura do cartão).
 */
export function simularAutoFinanciado(
  valorVista: number,
  valorParcela: number,
  numeroParcelas: number,
  taxaMensal: number
): CenarioAutoFinanciado {
  let saldo = valorVista;
  for (let m = 1; m <= numeroParcelas; m++) {
    saldo = saldo * (1 + taxaMensal) - valorParcela;
  }

  const totalPagoParcelas = numeroParcelas * valorParcela;
  const rendimentoTotal = saldo + totalPagoParcelas - valorVista;

  return {
    saldoFinal: saldo,
    rendimentoTotal,
    totalPagoParcelas,
    parcelaMaiorQueRendimento: saldo < 0,
  };
}

/**
 * Cenário B — "Dinheiro novo":
 * O valor à vista permanece 100% aplicado durante todos os meses,
 * sem saques. As parcelas são pagas com renda nova (salário).
 */
export function simularDinheiroNovo(
  valorVista: number,
  valorParcela: number,
  numeroParcelas: number,
  taxaMensal: number
): CenarioDinheiroNovo {
  const saldoFinalAplicacao =
    valorVista * Math.pow(1 + taxaMensal, numeroParcelas);
  const rendimentoTotal = saldoFinalAplicacao - valorVista;
  const totalPagoParcelas = numeroParcelas * valorParcela;
  const ganhoLiquido = rendimentoTotal - (totalPagoParcelas - valorVista);

  return {
    saldoFinalAplicacao,
    rendimentoTotal,
    totalPagoParcelas,
    ganhoLiquido,
  };
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

  const cenarioAutoFinanciado = simularAutoFinanciado(
    dados.valorVista,
    dados.valorParcela,
    dados.numeroParcelas,
    taxaMensal
  );

  const cenarioDinheiroNovo = simularDinheiroNovo(
    dados.valorVista,
    dados.valorParcela,
    dados.numeroParcelas,
    taxaMensal
  );

  return {
    valorVista: dados.valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
    cenarioAutoFinanciado,
    cenarioDinheiroNovo,
  };
}

/**
 * Formata valor em moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}
