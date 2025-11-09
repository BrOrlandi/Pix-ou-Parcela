import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/utils/calculos";
import { Save, CreditCard, Share2 } from "lucide-react";

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
}

export function ResultadoCalculo({
  resultado,
  onSalvar,
  mostrarBotaoSalvar = true,
}: ResultadoCalculoProps) {
  const {
    valorVista,
    totalPrazo,
    valorPresente,
    diferencaNominal,
    diferencaPercentual,
    compensaParcela,
  } = resultado;

  const compartilharWhatsApp = () => {
    const opcaoMelhor = compensaParcela ? "PARCELADO" : "PIX";
    const mensagem = `🔍 *Pix ou Parcela?*\n\n` +
      `💰 Valor no Pix: ${formatarMoeda(valorVista)}\n` +
      `💳 Total parcelado: ${formatarMoeda(totalPrazo)}\n` +
      `📊 Valor presente: ${formatarMoeda(valorPresente)}\n\n` +
      `✅ *Compensa pagar ${opcaoMelhor}*\n` +
      `💵 Economia de ${formatarMoeda(diferencaNominal)} (${diferencaPercentual.toFixed(1)}%)\n\n` +
      `Calculado em: https://pixouparcela.app`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-card-foreground mb-2">
          Resultado da análise
        </h2>
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

        <div className="flex justify-between items-center pb-3 border-b border-border">
          <span className="text-sm text-muted-foreground">
            Valor presente das parcelas
          </span>
          <span className="font-semibold text-primary">
            {formatarMoeda(valorPresente)}
          </span>
        </div>
      </div>

      {/* Recomendação */}
      <div
        className={`p-5 rounded-xl ${
          compensaParcela
            ? "bg-gradient-to-br from-success/20 to-success/5 border-2 border-success shadow-lg"
            : "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary shadow-lg"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${compensaParcela ? "bg-success/20" : "bg-primary/20"}`}>
            {compensaParcela ? (
              <CreditCard className="h-7 w-7 text-success flex-shrink-0" />
            ) : (
              <svg className="h-7 w-7 text-primary flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
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
                  Pagar parcelado é{" "}
                  <span className="font-bold text-success">{formatarMoeda(diferencaNominal)}</span> mais
                  barato (
                  <span className="font-bold text-success">
                    {diferencaPercentual.toFixed(1)}%
                  </span>
                  ) em valor presente do que pagar no Pix.
                </>
              ) : (
                <>
                  Pagar no Pix é{" "}
                  <span className="font-bold text-primary">{formatarMoeda(diferencaNominal)}</span> mais
                  barato (
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
        <Button onClick={compartilharWhatsApp} variant="outline" className="flex-1" size="lg">
          <Share2 className="mr-2 h-5 w-5" />
          Compartilhar
        </Button>
        {mostrarBotaoSalvar && (
          <Button onClick={onSalvar} variant="outline" className="flex-1" size="lg">
            <Save className="mr-2 h-5 w-5" />
            Salvar
          </Button>
        )}
      </div>
    </Card>
  );
}
