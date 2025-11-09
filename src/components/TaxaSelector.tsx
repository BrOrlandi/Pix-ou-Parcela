import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { consultarSelicDiaria } from "@/utils/bcb-api";
import { taxaDiariaParaMensal, taxaAnualParaMensal } from "@/utils/calculos";
import { Loader2 } from "lucide-react";

export interface TaxaInfo {
  tipo: "selic" | "personalizada";
  taxaMensal: number;
  taxaAnual?: number;
}

interface TaxaSelectorProps {
  onTaxaChange: (taxa: TaxaInfo) => void;
  valorInicial?: {
    tipo: "selic" | "personalizada";
    taxaPersonalizada?: number;
  };
}

export function TaxaSelector({ onTaxaChange, valorInicial }: TaxaSelectorProps) {
  const [tipoTaxa, setTipoTaxa] = useState<"selic" | "personalizada">(
    valorInicial?.tipo || "selic"
  );
  const [taxaPersonalizada, setTaxaPersonalizada] = useState<string>(
    valorInicial?.taxaPersonalizada?.toString() || ""
  );
  const [taxaSelicMensal, setTaxaSelicMensal] = useState<number | null>(null);
  const [carregandoSelic, setCarregandoSelic] = useState(false);
  const [erroSelic, setErroSelic] = useState<string | null>(null);

  useEffect(() => {
    if (tipoTaxa === "selic") {
      buscarTaxaSelic();
    }
  }, [tipoTaxa]);

  useEffect(() => {
    atualizarTaxa();
  }, [tipoTaxa, taxaPersonalizada, taxaSelicMensal]);

  async function buscarTaxaSelic() {
    setCarregandoSelic(true);
    setErroSelic(null);

    const taxaDiaria = await consultarSelicDiaria(new Date());

    if (taxaDiaria !== null) {
      const taxaMensal = taxaDiariaParaMensal(taxaDiaria);
      setTaxaSelicMensal(taxaMensal);
    } else {
      setErroSelic(
        "Não foi possível consultar a taxa Selic. Você pode usar sua taxa personalizada."
      );
    }

    setCarregandoSelic(false);
  }

  function atualizarTaxa() {
    if (tipoTaxa === "selic" && taxaSelicMensal !== null) {
      onTaxaChange({
        tipo: "selic",
        taxaMensal: taxaSelicMensal,
      });
    } else if (tipoTaxa === "personalizada" && taxaPersonalizada) {
      const taxaAnual = parseFloat(taxaPersonalizada);
      if (!isNaN(taxaAnual) && taxaAnual > 0) {
        const taxaMensal = taxaAnualParaMensal(taxaAnual / 100);
        onTaxaChange({
          tipo: "personalizada",
          taxaMensal,
          taxaAnual,
        });
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Taxa de juros
          </h2>
          <p className="text-sm text-muted-foreground">
            Escolha a taxa para calcular o valor presente das parcelas
          </p>
        </div>

        <RadioGroup
          value={tipoTaxa}
          onValueChange={(value) => setTipoTaxa(value as "selic" | "personalizada")}
        >
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="selic" id="selic" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="selic"
                className="text-base font-medium cursor-pointer"
              >
                Taxa Selic atual (BCB)
              </Label>
              {tipoTaxa === "selic" && (
                <div className="mt-2 pl-4 border-l-2 border-primary">
                  {carregandoSelic && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando Banco Central...
                    </div>
                  )}
                  {!carregandoSelic && taxaSelicMensal !== null && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Taxa mensal: </span>
                      <span className="font-semibold text-primary">
                        {(taxaSelicMensal * 100).toFixed(4)}% ao mês
                      </span>
                    </div>
                  )}
                  {!carregandoSelic && erroSelic && (
                    <div className="text-sm text-destructive">{erroSelic}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="personalizada" id="personalizada" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="personalizada"
                className="text-base font-medium cursor-pointer"
              >
                Minha taxa média de rendimento
              </Label>
              {tipoTaxa === "personalizada" && (
                <div className="mt-2 space-y-2">
                  <div>
                    <Label htmlFor="taxa-input" className="text-sm">
                      Taxa anual (% ao ano)
                    </Label>
                    <Input
                      id="taxa-input"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 12.84"
                      value={taxaPersonalizada}
                      onChange={(e) => setTaxaPersonalizada(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {taxaPersonalizada && !isNaN(parseFloat(taxaPersonalizada)) && (
                    <div className="text-sm pl-4 border-l-2 border-primary">
                      <span className="text-muted-foreground">Taxa mensal: </span>
                      <span className="font-semibold text-primary">
                        {(
                          taxaAnualParaMensal(parseFloat(taxaPersonalizada) / 100) * 100
                        ).toFixed(4)}
                        % ao mês
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
}
