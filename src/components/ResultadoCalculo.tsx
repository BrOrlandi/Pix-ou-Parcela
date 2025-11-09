import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/utils/calculos';
import { Save, CreditCard, Share2, Clipboard, Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

export interface Resultado {
  valorVista: number;
  totalPrazo: number;
  valorPresente: number;
  diferencaNominal: number;
  diferencaPercentual: number;
  compensaParcela: boolean;
}

interface ResultadoCalculoProps {
  resultado: Resultado;
  onSalvar: () => void;
  mostrarBotaoSalvar?: boolean;
  nomeOrcamento?: string;
}

export function ResultadoCalculo({
  resultado,
  onSalvar,
  mostrarBotaoSalvar = true,
  nomeOrcamento,
}: ResultadoCalculoProps) {
  const {
    valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
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
      `💳 Total parcelado: ${formatarMoeda(totalPrazo)}\n` +
      `📊 Valor presente: ${formatarMoeda(valorPresente)}\n\n` +
      `✅ *Compensa pagar ${opcaoMelhor}*\n` +
      `💵 Economia de ${formatarMoeda(
        diferencaNominal
      )} (${diferencaPercentual.toFixed(1)}%)\n\n` +
      `Calculado em: https://pixouparcela.app`;

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
          <span className="font-semibold">{formatarMoeda(totalPrazo)}</span>
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
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
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
