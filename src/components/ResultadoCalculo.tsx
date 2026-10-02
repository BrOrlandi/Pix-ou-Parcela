import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  formatarMoeda,
  ResultadoCalculo as ResultadoCalculoDados,
} from '@/utils/calculos';
import {
  Save,
  CreditCard,
  Share2,
  Clipboard,
  Plus,
  Minus,
  Wallet,
} from 'lucide-react';
import { dataValida, formatarData } from '@/utils/datas';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export type Resultado = ResultadoCalculoDados;

interface ResultadoCalculoProps {
  resultado: Resultado;
  onSalvar: () => void;
  mostrarBotaoSalvar?: boolean;
  nomeOrcamento?: string;
  numeroParcelas?: number;
  dataPrimeiraParcela?: string;
}

export function ResultadoCalculo({
  resultado,
  onSalvar,
  mostrarBotaoSalvar = true,
  nomeOrcamento,
  numeroParcelas,
  dataPrimeiraParcela,
}: ResultadoCalculoProps) {
  const primeiraParcela = dataValida(dataPrimeiraParcela)
    ? formatarData(dataPrimeiraParcela)
    : null;
  const {
    valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
    patrimonio,
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
      }${primeiraParcela ? `, 1ª em ${primeiraParcela}` : ''}\n` +
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
                {primeiraParcela && `, 1ª em ${primeiraParcela}`}
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
            Seu patrimônio no fim das {numeroParcelas ?? ''}{' '}
            {numeroParcelas === 1 ? 'parcela' : 'parcelas'}
          </h3>
          <p className="text-xs text-muted-foreground">
            As parcelas saem do salário e nada sai dos seus investimentos.
            Parcelando, os {formatarMoeda(valorVista)} continuam aplicados. No
            Pix, eles saem hoje, e o salário que pagaria cada parcela vai para a
            aplicação.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <p className="flex-1 text-xs text-muted-foreground">
              Comparação só do que muda entre as duas opções. O resto do seu
              patrimônio é igual nos dois casos.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Parcelado: {formatarMoeda(valorVista)} aplicados
              </span>
              <span className="font-medium">
                {formatarMoeda(patrimonio.parceladoBruto)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Pix: o valor das parcelas aplicado todo mês
              </span>
              <span className="font-medium">
                {formatarMoeda(patrimonio.pixBruto)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-border">
              <span className="font-semibold">
                {patrimonio.isentoIR
                  ? 'Diferença'
                  : 'Diferença sem resgatar'}
              </span>
              <SinalMoeda valor={patrimonio.diferencaBruta} />
            </div>

            {!patrimonio.isentoIR && (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    IR do parcelado, se resgatar no fim
                  </span>
                  <span className="font-medium">
                    −{formatarMoeda(patrimonio.parceladoIR)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    IR do Pix, se resgatar no fim
                  </span>
                  <span className="font-medium">
                    −{formatarMoeda(patrimonio.pixIR)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">
                    Diferença resgatando no fim
                  </span>
                  <SinalMoeda valor={patrimonio.diferencaLiquida} />
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              Valor positivo: parcelar deixa você com mais patrimônio. Negativo:
              o Pix deixa.
              {!patrimonio.isentoIR && (
                <>
                  {' '}
                  O IR só é cobrado no resgate. A recomendação usa o caso
                  resgatando no fim, que é o mais conservador; se o dinheiro
                  continuar aplicado, a diferença segue rendendo e o imposto
                  fica para depois.
                </>
              )}
            </p>
          </div>
        </div>
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

function SinalMoeda({ valor }: { valor: number }) {
  return (
    <span
      className={`font-bold ${valor >= 0 ? 'text-success' : 'text-destructive'}`}
    >
      {valor >= 0 ? '+' : '−'}
      {formatarMoeda(Math.abs(valor))}
    </span>
  );
}
