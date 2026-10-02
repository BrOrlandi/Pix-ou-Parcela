import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { consultarCDI } from '@/utils/bcb-api';
import { taxaAnualParaMensal, taxaAnualPercentualCDI } from '@/utils/calculos';
import { carregarConfiguracao, salvarConfiguracao } from '@/utils/storage';
import { Loader2 } from 'lucide-react';

export interface TaxaInfo {
  tipo: 'cdi' | 'selic' | 'personalizada';
  taxaMensal: number;
  /** Taxa anual personalizada, em % */
  taxaAnual?: number;
  percentualCDI?: number;
  isentoIR: boolean;
}

interface TaxaSelectorProps {
  onTaxaChange: (taxa: TaxaInfo) => void;
}

function formatarPercentual(valorDecimal: number, casas = 2): string {
  return (valorDecimal * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function TaxaSelector({ onTaxaChange }: TaxaSelectorProps) {
  const [config] = useState(carregarConfiguracao);

  const [tipoTaxa, setTipoTaxa] = useState<'cdi' | 'personalizada'>(
    config.ultimaTaxaSelecionada === 'personalizada' ? 'personalizada' : 'cdi'
  );
  const [percentualCDI, setPercentualCDI] = useState<string>(
    (config.percentualCDI ?? 100).toString()
  );
  const [taxaPersonalizada, setTaxaPersonalizada] = useState<string>(
    config.ultimaTaxaPersonalizada?.toString() || ''
  );
  const [isentoIR, setIsentoIR] = useState<boolean>(config.isentoIR ?? false);

  const [cdiAnual, setCdiAnual] = useState<number | null>(null);
  const [dataCdi, setDataCdi] = useState<string | null>(null);
  const [carregandoCdi, setCarregandoCdi] = useState(false);
  const [erroCdi, setErroCdi] = useState<string | null>(null);

  useEffect(() => {
    if (tipoTaxa === 'cdi' && cdiAnual === null && !carregandoCdi) {
      buscarCDI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoTaxa]);

  const percentualCDINumerico = parseFloat(percentualCDI.replace(',', '.'));
  const taxaPersonalizadaNumerica = parseFloat(
    taxaPersonalizada.replace(',', '.')
  );

  const rendimentoCDIAnual =
    cdiAnual !== null && percentualCDINumerico > 0
      ? taxaAnualPercentualCDI(cdiAnual, percentualCDINumerico)
      : null;

  useEffect(() => {
    if (tipoTaxa === 'cdi' && rendimentoCDIAnual !== null) {
      onTaxaChange({
        tipo: 'cdi',
        taxaMensal: taxaAnualParaMensal(rendimentoCDIAnual),
        percentualCDI: percentualCDINumerico,
        isentoIR,
      });
      salvarConfiguracao({
        ultimaTaxaSelecionada: 'cdi',
        percentualCDI: percentualCDINumerico,
        isentoIR,
      });
    } else if (tipoTaxa === 'personalizada' && taxaPersonalizadaNumerica > 0) {
      onTaxaChange({
        tipo: 'personalizada',
        taxaMensal: taxaAnualParaMensal(taxaPersonalizadaNumerica / 100),
        taxaAnual: taxaPersonalizadaNumerica,
        isentoIR,
      });
      salvarConfiguracao({
        ultimaTaxaSelecionada: 'personalizada',
        ultimaTaxaPersonalizada: taxaPersonalizadaNumerica,
        isentoIR,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tipoTaxa,
    rendimentoCDIAnual,
    percentualCDINumerico,
    taxaPersonalizadaNumerica,
    isentoIR,
  ]);

  async function buscarCDI() {
    setCarregandoCdi(true);
    setErroCdi(null);

    const resultado = await consultarCDI();

    if (resultado !== null) {
      setCdiAnual(resultado.taxaAnual);
      setDataCdi(resultado.data);
    } else {
      setErroCdi(
        'Não foi possível consultar o CDI. Use a taxa personalizada abaixo.'
      );
    }

    setCarregandoCdi(false);
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Rendimento do seu dinheiro
          </h2>
          <p className="text-sm text-muted-foreground">
            Quanto rende o dinheiro que você deixaria aplicado se parcelar
          </p>
        </div>

        <RadioGroup
          value={tipoTaxa}
          onValueChange={(value) =>
            setTipoTaxa(value as 'cdi' | 'personalizada')
          }
        >
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="cdi" id="cdi" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="cdi"
                className="text-base font-medium cursor-pointer"
              >
                Percentual do CDI
              </Label>
              {tipoTaxa === 'cdi' && (
                <div className="mt-2 space-y-2">
                  {carregandoCdi && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Consultando Banco Central...
                    </div>
                  )}
                  {!carregandoCdi && cdiAnual !== null && (
                    <p className="text-xs text-muted-foreground">
                      CDI hoje: {formatarPercentual(cdiAnual)}% ao ano
                      {dataCdi && ` (Banco Central, ${dataCdi})`}. Ele
                      acompanha a Selic, uns 0,10 ponto abaixo.
                    </p>
                  )}
                  {!carregandoCdi && erroCdi && (
                    <p className="text-sm text-destructive">{erroCdi}</p>
                  )}
                  <div>
                    <Label htmlFor="percentual-cdi" className="text-sm">
                      Sua aplicação rende (% do CDI)
                    </Label>
                    <Input
                      id="percentual-cdi"
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min="0"
                      max="300"
                      placeholder="100"
                      value={percentualCDI}
                      onChange={(e) => setPercentualCDI(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {rendimentoCDIAnual !== null && (
                    <div className="text-sm pl-4 border-l-2 border-primary space-y-1">
                      <div>
                        <span className="text-muted-foreground">
                          Rendimento:{' '}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatarPercentual(rendimentoCDIAnual)}% ao ano
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Por mês:{' '}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatarPercentual(
                            taxaAnualParaMensal(rendimentoCDIAnual),
                            3
                          )}
                          % ao mês
                        </span>
                      </div>
                    </div>
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
                Taxa anual personalizada
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
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 12.84"
                      value={taxaPersonalizada}
                      onChange={(e) => setTaxaPersonalizada(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {taxaPersonalizadaNumerica > 0 && (
                    <div className="text-sm pl-4 border-l-2 border-primary">
                      <span className="text-muted-foreground">
                        Por mês:{' '}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatarPercentual(
                          taxaAnualParaMensal(taxaPersonalizadaNumerica / 100),
                          3
                        )}
                        % ao mês
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        <div className="pt-4 border-t border-border space-y-3">
          <div>
            <h3 className="text-base font-semibold text-card-foreground">
              Imposto de renda
            </h3>
            <p className="text-sm text-muted-foreground">
              Onde fica o dinheiro que você deixaria aplicado
            </p>
          </div>
          <RadioGroup
            value={isentoIR ? 'isento' : 'tributado'}
            onValueChange={(value) => setIsentoIR(value === 'isento')}
          >
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem
                value="tributado"
                id="ir-tributado"
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="ir-tributado"
                  className="text-base font-medium cursor-pointer"
                >
                  Com IR no resgate (CDB, Tesouro)
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tabela regressiva: 22,5% até 6 meses, 20% até 1 ano, 17,5%
                  até 2 anos e 15% depois, sobre o rendimento.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="isento" id="ir-isento" className="mt-1" />
              <div className="flex-1">
                <Label
                  htmlFor="ir-isento"
                  className="text-base font-medium cursor-pointer"
                >
                  Isento (LCI, LCA, poupança)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}
