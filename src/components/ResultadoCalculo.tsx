import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatarMoeda } from "@/utils/calculos";
import { Save, TrendingDown, TrendingUp } from "lucide-react";

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
          <span className="text-sm text-muted-foreground">Valor à vista (Pix)</span>
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
        className={`p-4 rounded-lg ${
          compensaParcela
            ? "bg-success/10 border-2 border-success"
            : "bg-primary/10 border-2 border-primary"
        }`}
      >
        <div className="flex items-start gap-3">
          {compensaParcela ? (
            <TrendingDown className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-lg mb-2">
              {compensaParcela ? "Compensa pagar PARCELADO" : "Compensa pagar À VISTA"}
            </p>
            <p className="text-sm leading-relaxed">
              {compensaParcela ? (
                <>
                  Pagar parcelado é{" "}
                  <span className="font-bold">{formatarMoeda(diferencaNominal)}</span> mais
                  barato (
                  <span className="font-bold">
                    {diferencaPercentual.toFixed(1)}%
                  </span>
                  ) em valor presente do que pagar à vista.
                </>
              ) : (
                <>
                  Pagar à vista é{" "}
                  <span className="font-bold">{formatarMoeda(diferencaNominal)}</span> mais
                  barato (
                  <span className="font-bold">
                    {diferencaPercentual.toFixed(1)}%
                  </span>
                  ) em valor presente do que parcelar.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Botão salvar */}
      {mostrarBotaoSalvar && (
        <Button onClick={onSalvar} variant="outline" className="w-full" size="lg">
          <Save className="mr-2 h-5 w-5" />
          Salvar orçamento
        </Button>
      )}
    </Card>
  );
}
