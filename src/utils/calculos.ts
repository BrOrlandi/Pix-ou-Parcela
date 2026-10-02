export interface DadosCompra {
  valorVista: number;
  numeroParcelas: number;
  valorParcela: number;
  /** Meses (fracionados) entre hoje e a 1ª parcela. Padrão: 1. */
  mesesAtePrimeiraParcela?: number;
}

export interface ResultadoCalculo {
  valorVista: number;
  totalPrazo: number;
  valorPresente: number;
  diferencaNominal: number;
  diferencaPercentual: number;
  compensaParcela: boolean;
  patrimonio: CenarioPatrimonio;
}

/**
 * O que muda no patrimônio ao fim das parcelas, supondo que as parcelas
 * saem do salário e nada é sacado dos investimentos.
 * Parcelado: o valor à vista continua aplicado.
 * Pix: o valor à vista sai hoje, e o salário que pagaria cada parcela
 * fica livre e é aplicado no mês.
 */
export interface CenarioPatrimonio {
  isentoIR: boolean;
  parceladoBruto: number;
  parceladoIR: number;
  pixBruto: number;
  pixIR: number;
  diferencaBruta: number;
  diferencaLiquida: number;
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
 * Rendimento anual de uma aplicação que paga um percentual do CDI.
 * O percentual incide sobre a taxa diária (base 252), como nos CDBs.
 */
export function taxaAnualPercentualCDI(
  cdiAnualDecimal: number,
  percentual: number
): number {
  const cdiDiario = Math.pow(1 + cdiAnualDecimal, 1 / 252) - 1;
  return Math.pow(1 + cdiDiario * (percentual / 100), 252) - 1;
}

/**
 * Converte taxa anual (em decimal) para taxa mensal
 */
export function taxaAnualParaMensal(taxaAnualDecimal: number): number {
  return Math.pow(1 + taxaAnualDecimal, 1 / 12) - 1;
}

/**
 * Alíquota de IR da tabela regressiva (CDB, Tesouro Direto), cobrada
 * sobre o rendimento no resgate, pelo tempo aplicado.
 */
export function aliquotaIR(dias: number): number {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.2;
  if (dias <= 720) return 0.175;
  return 0.15;
}

export const DIAS_POR_MES = 365.25 / 12;

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
 * Compara o patrimônio ao fim das parcelas pagando no Pix ou parcelado.
 * A primeira parcela vence em `mesesAtePrimeira` meses e as demais a cada
 * mês. O IR, quando há, é o que seria cobrado se tudo fosse resgatado no
 * dia da última parcela.
 */
export function simularPatrimonio(
  valorVista: number,
  valorParcela: number,
  numeroParcelas: number,
  taxaMensal: number,
  isentoIR: boolean,
  mesesAtePrimeira = 1
): CenarioPatrimonio {
  const aliquota = (meses: number) =>
    isentoIR ? 0 : aliquotaIR(meses * DIAS_POR_MES);

  // O valor à vista fica aplicado de hoje até a última parcela
  const prazoTotal = mesesAtePrimeira + numeroParcelas - 1;
  const parceladoBruto = valorVista * Math.pow(1 + taxaMensal, prazoTotal);
  const parceladoIR = aliquota(prazoTotal) * (parceladoBruto - valorVista);

  // No Pix, o salário da parcela k fica aplicado até a última: (n - k) meses
  let pixBruto = 0;
  let pixIR = 0;
  for (let k = 1; k <= numeroParcelas; k++) {
    const meses = numeroParcelas - k;
    const montante = valorParcela * Math.pow(1 + taxaMensal, meses);
    pixBruto += montante;
    pixIR += aliquota(meses) * (montante - valorParcela);
  }

  const diferencaBruta = parceladoBruto - pixBruto;
  const diferencaLiquida = parceladoBruto - parceladoIR - (pixBruto - pixIR);

  return {
    isentoIR,
    parceladoBruto,
    parceladoIR,
    pixBruto,
    pixIR,
    diferencaBruta,
    diferencaLiquida,
  };
}

/**
 * Realiza o cálculo completo de comparação entre vista e parcelado.
 * A decisão vem da diferença de patrimônio líquida de IR. O valor presente
 * traz essa diferença para hoje, então sem IR é o valor presente clássico
 * das parcelas e as duas visões sempre concordam.
 */
export function calcularComparacao(
  dados: DadosCompra,
  taxaMensal: number,
  isentoIR: boolean
): ResultadoCalculo {
  const totalPrazo = dados.numeroParcelas * dados.valorParcela;
  const mesesAtePrimeira = Math.max(0, dados.mesesAtePrimeiraParcela ?? 1);

  const patrimonio = simularPatrimonio(
    dados.valorVista,
    dados.valorParcela,
    dados.numeroParcelas,
    taxaMensal,
    isentoIR,
    mesesAtePrimeira
  );

  // Rendimento líquido de IR de quem deixa o dinheiro aplicado o prazo todo
  const prazoTotal = mesesAtePrimeira + dados.numeroParcelas - 1;
  const fatorBruto = Math.pow(1 + taxaMensal, prazoTotal);
  const fatorLiquido = isentoIR
    ? fatorBruto
    : 1 + (fatorBruto - 1) * (1 - aliquotaIR(prazoTotal * DIAS_POR_MES));

  const valorPresente =
    dados.valorVista - patrimonio.diferencaLiquida / fatorLiquido;

  const compensaParcela = patrimonio.diferencaLiquida > 0;
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
    patrimonio,
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
