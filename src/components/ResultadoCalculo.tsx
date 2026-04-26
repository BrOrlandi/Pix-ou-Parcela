import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/utils/calculos';
import {
  Save,
  CreditCard,
  Share2,
  Clipboard,
  Plus,
  Minus,
  PiggyBank,
  Wallet,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export interface CenarioAutoFinanciadoUI {
  saldoFinal: number;
  rendimentoTotal: number;
  totalPagoParcelas: number;
  parcelaMaiorQueRendimento: boolean;
}

export interface CenarioDinheiroNovoUI {
  saldoFinalAplicacao: number;
  rendimentoTotal: number;
  totalPagoParcelas: number;
  ganhoLiquido: number;
}

export interface Resultado {
  valorVista: number;
  totalPrazo: number;
  valorPresente: number;
  diferencaNominal: number;
  diferencaPercentual: number;
  compensaParcela: boolean;
  cenarioAutoFinanciado: CenarioAutoFinanciadoUI;
  cenarioDinheiroNovo: CenarioDinheiroNovoUI;
}

interface ResultadoCalculoProps {
  resultado: Resultado;
  onSalvar: () => void;
  mostrarBotaoSalvar?: boolean;
  nomeOrcamento?: string;
  numeroParcelas?: number;
}

export function ResultadoCalculo({
  resultado,
  onSalvar,
  mostrarBotaoSalvar = true,
  nomeOrcamento,
  numeroParcelas,
}: ResultadoCalculoProps) {
  const {
    valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
    cenarioAutoFinanciado,
    cenarioDinheiroNovo,
  } = resultado;

  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Calcular diferença entre valor presente e valor à vista
  const diferencaValorPresente = valorPresente - valorVista;
  const valorPresenteMaisCaro = valorPresente > valorVista;

  const gerarMensagem = () => {
    const opcaoMelhor = compensaParcela ? 'PARCELADO' : 'PIX';
    let mensagem = `🔍 *Pix ou Parcela?*\n\n`;

    if (nomeOrcamento) {
      mensagem += `📋 *${nomeOrcamento}*\n\n`;
    }

    mensagem +=
      `💰 Valor no Pix: ${formatarMoeda(valorVista)}\n` +
      `💳 Total parcelado: ${formatarMoeda(totalPrazo)}${
        numeroParcelas ? ` (${numeroParcelas}x)` : ''
      }\n` +
      `📊 Valor presente: ${formatarMoeda(valorPresente)}\n\n` +
      `✅ *Compensa pagar ${opcaoMelhor}*\n` +
      `💵 Economia de ${formatarMoeda(
        diferencaNominal
      )} (${diferencaPercentual.toFixed(1)}%)\n\n` +
      `Calculado em: https://pix-ou-parcela.vercel.app/`;

    return mensagem;
  };

  const compartilharOuCopiar = async () => {
    const mensagem = gerarMensagem();

    // Se for mobile e tiver suporte a navigator.share, usar o compartilhamento nativo
    if (isMobile) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: nomeOrcamento || 'Pix ou Parcela?',
            text: mensagem.replace(/\*/g, ''), // Remove formatação markdown para compartilhamento nativo
          });
          return;
        } catch (error) {
          // Usuário cancelou ou erro no compartilhamento
          // Fallback para WhatsApp
        }
      }
      // Se não tiver navigator.share ou se falhar, usar WhatsApp
      const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    } else {
      // Desktop: copiar para clipboard
      try {
        await navigator.clipboard.writeText(mensagem.replace(/\*/g, ''));
        toast({
          title: 'Resultado copiado!',
          description: 'O resultado foi copiado para a área de transferência.',
        });
      } catch (error) {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar o resultado.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground mb-2">
          Resultado da análise
        </h2>
        {nomeOrcamento && (
          <p className="text-base font-medium text-primary">
            📋 {nomeOrcamento}
          </p>
        )}
      </div>

      {/* Valores */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-sm text-muted-foreground">Valor no Pix</span>
          <span className="font-semibold">{formatarMoeda(valorVista)}</span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-sm text-muted-foreground">Total parcelado</span>
          <div className="flex flex-col items-end">
            <span className="font-semibold">{formatarMoeda(totalPrazo)}</span>
            {numeroParcelas && (
              <span className="text-xs text-muted-foreground mt-0.5">
                {numeroParcelas}x
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-start pb-3 border-b border-border">
          <span className="text-sm text-muted-foreground">
            Valor presente das parcelas
          </span>
          <div className="flex flex-col items-end">
            <span
              className={`font-semibold ${
                valorPresenteMaisCaro
                  ? 'text-destructive'
                  : compensaParcela
                  ? 'text-success'
                  : 'text-primary'
              }`}
            >
              {formatarMoeda(valorPresente)}
            </span>
            <span
              className={`text-xs mt-0.5 flex items-center gap-1 ${
                valorPresenteMaisCaro
                  ? 'text-destructive'
                  : compensaParcela
                  ? 'text-success'
                  : 'text-primary'
              }`}
            >
              {valorPresenteMaisCaro ? (
                <>
                  <Plus className="h-3 w-3" />
                  {formatarMoeda(Math.abs(diferencaValorPresente))}
                </>
              ) : (
                <>
                  <Minus className="h-3 w-3" />
                  {formatarMoeda(Math.abs(diferencaValorPresente))}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Recomendação */}
      <div
        className={`p-5 rounded-xl ${
          compensaParcela
            ? 'bg-gradient-to-br from-success/20 to-success/5 border-2 border-success shadow-lg'
            : 'bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary shadow-lg'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-full ${
              compensaParcela ? 'bg-success/20' : 'bg-primary/20'
            }`}
          >
            {compensaParcela ? (
              <CreditCard className="h-7 w-7 text-success flex-shrink-0" />
            ) : (
              <svg
                className="h-7 w-7 text-primary flex-shrink-0"
                viewBox="0 0 48 48"
                fill="currentColor"
              >
                <path d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76	l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z" />
                <path d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76	l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z" />
                <path d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0	l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17	l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26	C46.65,21.88,46.65,26.12,44.04,28.74z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="font-bold text-2xl mb-3 leading-tight">
              {compensaParcela ? (
                <>
                  Compensa pagar <span className="text-success">PARCELADO</span>
                </>
              ) : (
                <>
                  Compensa pagar no <span className="text-primary">PIX</span>
                </>
              )}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              {compensaParcela ? (
                <>
                  Pagar parcelado é{' '}
                  <span className="font-bold text-success">
                    {formatarMoeda(diferencaNominal)}
                  </span>{' '}
                  mais barato (
                  <span className="font-bold text-success">
                    {diferencaPercentual.toFixed(1)}%
                  </span>
                  ) em valor presente do que pagar no Pix.
                </>
              ) : (
                <>
                  Pagar no Pix é{' '}
                  <span className="font-bold text-primary">
                    {formatarMoeda(diferencaNominal)}
                  </span>{' '}
                  mais barato (
                  <span className="font-bold text-primary">
                    {diferencaPercentual.toFixed(1)}%
                  </span>
                  ) em valor presente do que parcelar.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Simulação detalhada */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">
            Simulação detalhada
          </h3>
          <p className="text-xs text-muted-foreground">
            Como ficaria seu dinheiro ao final das {numeroParcelas ?? ''}{' '}
            {numeroParcelas === 1 ? 'parcela' : 'parcelas'}, considerando o
            rendimento da aplicação.
          </p>
        </div>

        {/* Cenário A — Auto-financiado */}
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                A) Aplico o valor à vista e pago as parcelas com saques
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reservo {formatarMoeda(valorVista)} numa aplicação. A cada mês
                ela rende e eu saco a parcela.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rendimento bruto</span>
              <span className="font-medium text-success">
                +{formatarMoeda(cenarioAutoFinanciado.rendimentoTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Total pago em parcelas
              </span>
              <span className="font-medium">
                {formatarMoeda(cenarioAutoFinanciado.totalPagoParcelas)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold">Saldo ao final</span>
              <span
                className={`font-bold ${
                  cenarioAutoFinanciado.saldoFinal >= 0
                    ? 'text-success'
                    : 'text-destructive'
                }`}
              >
                {cenarioAutoFinanciado.saldoFinal >= 0 ? '+' : ''}
                {formatarMoeda(cenarioAutoFinanciado.saldoFinal)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {cenarioAutoFinanciado.saldoFinal >= 0 ? (
                <>
                  Sobra{' '}
                  <span className="font-semibold text-success">
                    {formatarMoeda(cenarioAutoFinanciado.saldoFinal)}
                  </span>{' '}
                  na aplicação após pagar todas as parcelas — parcelar foi mais
                  vantajoso que pagar no Pix.
                </>
              ) : (
                <>
                  A aplicação acabaria antes do fim das parcelas. Faltariam{' '}
                  <span className="font-semibold text-destructive">
                    {formatarMoeda(Math.abs(cenarioAutoFinanciado.saldoFinal))}
                  </span>{' '}
                  — pagar no Pix sai mais barato.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Cenário B — Dinheiro novo */}
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">
                B) Mantenho tudo aplicado e pago as parcelas com salário novo
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatarMoeda(valorVista)} ficam 100% aplicados pelos{' '}
                {numeroParcelas ?? ''} meses, sem saques. As parcelas saem do
                salário do mês.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Saldo da aplicação ao final
              </span>
              <span className="font-medium">
                {formatarMoeda(cenarioDinheiroNovo.saldoFinalAplicacao)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rendimento bruto</span>
              <span className="font-medium text-success">
                +{formatarMoeda(cenarioDinheiroNovo.rendimentoTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Total pago em parcelas (salário)
              </span>
              <span className="font-medium">
                −{formatarMoeda(cenarioDinheiroNovo.totalPagoParcelas)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold">Ganho líquido</span>
              <span
                className={`font-bold ${
                  cenarioDinheiroNovo.ganhoLiquido >= 0
                    ? 'text-success'
                    : 'text-destructive'
                }`}
              >
                {cenarioDinheiroNovo.ganhoLiquido >= 0 ? '+' : ''}
                {formatarMoeda(cenarioDinheiroNovo.ganhoLiquido)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Comparado a pagar tudo no Pix hoje (e ficar sem aplicação), no
              fim dos {numeroParcelas ?? ''} meses você fica com{' '}
              <span
                className={`font-semibold ${
                  cenarioDinheiroNovo.ganhoLiquido >= 0
                    ? 'text-success'
                    : 'text-destructive'
                }`}
              >
                {cenarioDinheiroNovo.ganhoLiquido >= 0 ? '+' : ''}
                {formatarMoeda(cenarioDinheiroNovo.ganhoLiquido)}
              </span>{' '}
              em relação ao Pix.
            </p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground/80 px-1">
          ⚠️ Os cenários A e B são premissas diferentes: em A o próprio dinheiro
          quita as parcelas (mais conservador); em B o salário banca as parcelas
          e o capital fica intocado. Use o que for mais próximo da sua
          realidade.
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <Button
          onClick={compartilharOuCopiar}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          {isMobile ? (
            <>
              <Share2 className="mr-2 h-5 w-5" />
              Compartilhar
            </>
          ) : (
            <>
              <Clipboard className="mr-2 h-5 w-5" />
              Copiar resultado
            </>
          )}
        </Button>
        {mostrarBotaoSalvar && (
          <Button
            onClick={onSalvar}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            Salvar
          </Button>
        )}
      </div>
    </Card>
  );
}
