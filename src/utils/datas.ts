import { DIAS_POR_MES } from '@/utils/calculos';

/** Datas no formato AAAA-MM-DD, sempre no fuso local. */

function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function paraISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function dataValida(iso: string | undefined): iso is string {
  return !!iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !isNaN(paraData(iso).getTime());
}

/** Dia do mês na data, limitado ao último dia do mês (ex.: 31 em fevereiro). */
function dataNoDia(ano: number, mes: number, dia: number): Date {
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  return new Date(ano, mes, Math.min(dia, ultimoDia));
}

/**
 * Vencimento da fatura em que cai uma compra feita hoje. Compra até o dia
 * do fechamento entra na fatura que fecha neste mês; depois disso, na do
 * mês seguinte. A fatura vence no primeiro dia de vencimento após fechar.
 */
export function vencimentoDaCompra(
  diaFechamento: number,
  diaVencimento: number
): string {
  const hoje = paraData(paraISO(new Date()));

  let fechamento = dataNoDia(hoje.getFullYear(), hoje.getMonth(), diaFechamento);
  if (hoje > fechamento) {
    fechamento = dataNoDia(hoje.getFullYear(), hoje.getMonth() + 1, diaFechamento);
  }

  let vencimento = dataNoDia(
    fechamento.getFullYear(),
    fechamento.getMonth(),
    diaVencimento
  );
  if (vencimento <= fechamento) {
    vencimento = dataNoDia(
      fechamento.getFullYear(),
      fechamento.getMonth() + 1,
      diaVencimento
    );
  }
  return paraISO(vencimento);
}

/** Data daqui a um mês, usada quando não há dia de vencimento salvo. */
export function daquiUmMes(): string {
  const hoje = new Date();
  return paraISO(dataNoDia(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate()));
}

/** Meses (fracionados) de hoje até a data. */
export function mesesAte(iso: string): number {
  const hoje = paraData(paraISO(new Date()));
  const dias = Math.round((paraData(iso).getTime() - hoje.getTime()) / 86400000);
  return dias / DIAS_POR_MES;
}

export function formatarData(iso: string): string {
  return paraData(iso).toLocaleDateString('pt-BR');
}
