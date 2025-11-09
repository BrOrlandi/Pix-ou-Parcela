import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { consultarSelicDiaria } from '@/utils/bcb-api';
import { taxaAnualParaMensal } from '@/utils/calculos';
import { Loader2 } from 'lucide-react';

export interface TaxaInfo {
  tipo: 'selic' | 'personalizada';
  taxaMensal: number;
  taxaAnual?: number;
}

interface TaxaSelectorProps {
  onTaxaChange: (taxa: TaxaInfo) => void;
  valorInicial?: {
    tipo: 'selic' | 'personalizada';
    taxaPersonalizada?: number;
  };
}

export function TaxaSelector({
  onTaxaChange,
  valorInicial,
}: TaxaSelectorProps) {
  const [tipoTaxa, setTipoTaxa] = useState<'selic' | 'personalizada'>(
    valorInicial?.tipo || 'selic'
  );
  const [taxaPersonalizada, setTaxaPersonalizada] = useState<string>(
    valorInicial?.taxaPersonalizada?.toString() || ''
  );
  const [taxaSelicMensal, setTaxaSelicMensal] = useState<number | null>(null);
  const [taxaSelicAnual, setTaxaSelicAnual] = useState<number | null>(null);
  const [dataSelic, setDataSelic] = useState<string | null>(null);
  const [carregandoSelic, setCarregandoSelic] = useState(false);
  const [erroSelic, setErroSelic] = useState<string | null>(null);

  useEffect(() => {
    if (tipoTaxa === 'selic') {
      buscarTaxaSelic();
    }
  }, [tipoTaxa]);

  const atualizarTaxa = useCallback(() => {
    if (tipoTaxa === 'selic' && taxaSelicMensal !== null) {
      onTaxaChange({
        tipo: 'selic',
        taxaMensal: taxaSelicMensal,
      });
    } else if (tipoTaxa === 'personalizada' && taxaPersonalizada) {
      const taxaAnual = parseFloat(taxaPersonalizada);
      if (!isNaN(taxaAnual) && taxaAnual > 0) {
        const taxaMensal = taxaAnualParaMensal(taxaAnual / 100);
        onTaxaChange({
          tipo: 'personalizada',
          taxaMensal,
          taxaAnual,
        });
      }
    }
  }, [tipoTaxa, taxaPersonalizada, taxaSelicMensal, onTaxaChange]);

  useEffect(() => {
    atualizarTaxa();
  }, [atualizarTaxa]);

  async function buscarTaxaSelic() {
    setCarregandoSelic(true);
    setErroSelic(null);

    const resultado = await consultarSelicDiaria(new Date());

    if (resultado !== null) {
      // API retorna taxa anual diretamente, calcula taxa mensal a partir dela
      const taxaMensal = taxaAnualParaMensal(resultado.taxaAnual);
      setTaxaSelicMensal(taxaMensal);
      setTaxaSelicAnual(resultado.taxaAnual);
      setDataSelic(resultado.data);
    } else {
      // Fallback: usa 15% ao ano quando não consegue carregar da API
      const taxaAnualFallback = 0.15; // 15% ao ano
      const taxaMensalFallback = taxaAnualParaMensal(taxaAnualFallback);
      setTaxaSelicMensal(taxaMensalFallback);
      setTaxaSelicAnual(null);
      setDataSelic(null); // Não exibe data quando usa fallback
    }

    setCarregandoSelic(false);
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
          onValueChange={(value) =>
            setTipoTaxa(value as 'selic' | 'personalizada')
          }
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
              {tipoTaxa === 'selic' && (
                <div className="mt-2 pl-4 border-l-2 border-primary">
                  {carregandoSelic && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando Banco Central...
                    </div>
                  )}
                  {!carregandoSelic && taxaSelicMensal !== null && (
                    <div className="text-sm space-y-1">
                      {dataSelic && (
                        <div className="text-xs text-muted-foreground mb-1">
                          Atualizado em {dataSelic}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">
                          Taxa mensal:{' '}
                        </span>
                        <span className="font-semibold text-primary">
                          {(taxaSelicMensal * 100).toFixed(2)}% ao mês
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Taxa anual:{' '}
                        </span>
                        <span className="font-semibold text-primary">
                          {(() => {
                            const taxaAnualPercentual =
                              taxaSelicAnual !== null
                                ? taxaSelicAnual * 100
                                : (Math.pow(1 + taxaSelicMensal, 12) - 1) * 100;
                            // Mostra casas decimais apenas se diferente de zero
                            const taxaArredondada = Number(
                              taxaAnualPercentual.toFixed(2)
                            );
                            if (taxaArredondada % 1 === 0) {
                              return taxaArredondada.toString();
                            }
                            // Remove zeros à direita
                            return taxaArredondada
                              .toString()
                              .replace(/\.?0+$/, '');
                          })()}
                          % ao ano
                        </span>
                      </div>
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
            <RadioGroupItem
              value="personalizada"
              id="personalizada"
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="personalizada"
                className="text-base font-medium cursor-pointer"
              >
                Minha taxa média de rendimento
              </Label>
              {tipoTaxa === 'personalizada' && (
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
                  {taxaPersonalizada &&
                    !isNaN(parseFloat(taxaPersonalizada)) && (
                      <div className="text-sm pl-4 border-l-2 border-primary">
                        <span className="text-muted-foreground">
                          Taxa mensal:{' '}
                        </span>
                        <span className="font-semibold text-primary">
                          {(
                            taxaAnualParaMensal(
                              parseFloat(taxaPersonalizada) / 100
                            ) * 100
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
