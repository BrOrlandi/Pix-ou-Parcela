import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export interface DadosFormulario {
  nomeOrcamento: string;
  valorVista: number;
  numeroParcelas: number;
  valorParcela: number;
}

interface FormularioCompraProps {
  onCalcular: (dados: DadosFormulario) => void;
  valoresIniciais?: Partial<DadosFormulario>;
  desabilitado?: boolean;
}

export function FormularioCompra({
  onCalcular,
  valoresIniciais,
  desabilitado,
}: FormularioCompraProps) {
  const [nome, setNome] = useState(valoresIniciais?.nomeOrcamento || '');
  const [valorVista, setValorVista] = useState(
    valoresIniciais?.valorVista?.toString() || ''
  );
  const [numeroParcelas, setNumeroParcelas] = useState(
    valoresIniciais?.numeroParcelas?.toString() || '12' // 12 parcelas por padrão
  );
  const [valorParcela, setValorParcela] = useState(
    valoresIniciais?.valorParcela?.toString() || ''
  );

  const podeCalcular =
    valorVista &&
    numeroParcelas &&
    valorParcela &&
    !isNaN(parseFloat(valorVista)) &&
    !isNaN(parseInt(numeroParcelas)) &&
    !isNaN(parseFloat(valorParcela)) &&
    !desabilitado;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!podeCalcular) return;

    onCalcular({
      nomeOrcamento: nome,
      valorVista: parseFloat(valorVista),
      numeroParcelas: parseInt(numeroParcelas),
      valorParcela: parseFloat(valorParcela),
    });
  }

  function formatarMoedaInput(valor: string): string {
    // Remove tudo que não é número ou vírgula/ponto
    const apenasNumeros = valor.replace(/[^\d,\.]/g, '');
    return apenasNumeros;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Dados da compra
          </h2>
          <p className="text-sm text-muted-foreground">
            Preencha os valores para comparar as formas de pagamento
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do orçamento (opcional)</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Ex: Notebook Dell"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="valorVista">
              Valor à vista (Pix) <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="valorVista"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={valorVista}
                onChange={(e) =>
                  setValorVista(formatarMoedaInput(e.target.value))
                }
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroParcelas">
                Nº de parcelas <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numeroParcelas"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="12"
                value={numeroParcelas}
                onChange={(e) => setNumeroParcelas(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="valorParcela">
                Valor da parcela <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valorParcela"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorParcela}
                  onChange={(e) =>
                    setValorParcela(formatarMoedaInput(e.target.value))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!podeCalcular}
        >
          <Calculator className="mr-2 h-5 w-5" />
          Calcular melhor opção
        </Button>
      </form>
    </Card>
  );
}
