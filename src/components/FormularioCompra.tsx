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
  // Converte valor formatado (ex: "1.000,50") para número
  function parsearValorFormatado(valor: string): number {
    if (!valor) return 0;
    // Remove pontos de milhares e substitui vírgula por ponto
    const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
    return parseFloat(valorLimpo) || 0;
  }

  // Formata valor com máscara de milhares e decimais
  function formatarMoedaInput(valor: string): string {
    if (!valor) return '';

    // Remove tudo que não é número, vírgula ou ponto
    let valorLimpo = valor.replace(/[^\d,.]/g, '');

    // Se não tem vírgula mas tem ponto, converte o último ponto para vírgula
    // (usuário pode ter digitado ponto no teclado numérico)
    if (!valorLimpo.includes(',') && valorLimpo.includes('.')) {
      const ultimoPontoIndex = valorLimpo.lastIndexOf('.');
      valorLimpo =
        valorLimpo.substring(0, ultimoPontoIndex) +
        ',' +
        valorLimpo.substring(ultimoPontoIndex + 1);
    }

    // Remove todos os pontos restantes (são pontos de milhares da formatação anterior)
    valorLimpo = valorLimpo.replace(/\./g, '');

    // Se houver múltiplas vírgulas, mantém apenas a primeira
    const partes = valorLimpo.split(',');
    if (partes.length > 2) {
      valorLimpo = partes[0] + ',' + partes.slice(1).join('');
    }

    // Limita a 2 casas decimais após a vírgula
    if (partes.length === 2 && partes[1].length > 2) {
      valorLimpo = partes[0] + ',' + partes[1].substring(0, 2);
    }

    // Separa parte inteira e decimal
    const [parteInteira, parteDecimal] = valorLimpo.split(',');

    // Se não há parte inteira, retorna vazio
    if (!parteInteira) return '';

    // Formata parte inteira com pontos de milhares
    const parteInteiraFormatada = parteInteira.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      '.'
    );

    // Retorna valor formatado
    if (parteDecimal !== undefined) {
      return parteInteiraFormatada + ',' + parteDecimal;
    }

    return parteInteiraFormatada;
  }

  const [nome, setNome] = useState(valoresIniciais?.nomeOrcamento || '');
  const [valorVista, setValorVista] = useState(
    valoresIniciais?.valorVista
      ? formatarMoedaInput(
          valoresIniciais.valorVista.toString().replace('.', ',')
        )
      : ''
  );
  const [numeroParcelas, setNumeroParcelas] = useState(
    valoresIniciais?.numeroParcelas?.toString() || '12' // 12 parcelas por padrão
  );
  const [valorParcela, setValorParcela] = useState(
    valoresIniciais?.valorParcela
      ? formatarMoedaInput(
          valoresIniciais.valorParcela.toString().replace('.', ',')
        )
      : ''
  );
  const [valorTotalPrazo, setValorTotalPrazo] = useState(
    valoresIniciais?.valorParcela && valoresIniciais?.numeroParcelas
      ? formatarMoedaInput(
          (valoresIniciais.valorParcela * valoresIniciais.numeroParcelas)
            .toString()
            .replace('.', ',')
        )
      : ''
  );

  // Atualizar campos quando valoresIniciais mudar
  useEffect(() => {
    if (valoresIniciais) {
      if (valoresIniciais.nomeOrcamento !== undefined) {
        setNome(valoresIniciais.nomeOrcamento);
      }
      if (valoresIniciais.valorVista !== undefined) {
        setValorVista(
          formatarMoedaInput(
            valoresIniciais.valorVista.toString().replace('.', ',')
          )
        );
      }
      if (valoresIniciais.numeroParcelas !== undefined) {
        setNumeroParcelas(valoresIniciais.numeroParcelas.toString());
      }
      if (valoresIniciais.valorParcela !== undefined) {
        const valorParcelaFormatado = formatarMoedaInput(
          valoresIniciais.valorParcela.toString().replace('.', ',')
        );
        setValorParcela(valorParcelaFormatado);
        // Atualizar valor total a prazo também
        if (valoresIniciais.numeroParcelas) {
          const totalPrazo =
            valoresIniciais.valorParcela * valoresIniciais.numeroParcelas;
          setValorTotalPrazo(
            formatarMoedaInput(totalPrazo.toString().replace('.', ','))
          );
        }
      }
    }
  }, [valoresIniciais]);

  // Handler para quando valor da parcela mudar
  function handleValorParcelaChange(valor: string) {
    const valorFormatado = formatarMoedaInput(valor);
    setValorParcela(valorFormatado);

    // Atualizar valor total a prazo
    const numParcelas = parseInt(numeroParcelas) || 0;
    if (numParcelas > 0 && valorFormatado) {
      const valorNumerico = parsearValorFormatado(valorFormatado);
      if (valorNumerico > 0) {
        const totalPrazo = valorNumerico * numParcelas;
        setValorTotalPrazo(
          formatarMoedaInput(totalPrazo.toString().replace('.', ','))
        );
      } else {
        setValorTotalPrazo('');
      }
    } else if (!valorFormatado) {
      // Se o campo foi limpo, limpar o outro também
      setValorTotalPrazo('');
    }
  }

  // Handler para quando valor total a prazo mudar
  function handleValorTotalPrazoChange(valor: string) {
    const valorFormatado = formatarMoedaInput(valor);
    setValorTotalPrazo(valorFormatado);

    // Atualizar valor da parcela
    const numParcelas = parseInt(numeroParcelas) || 0;
    if (numParcelas > 0 && valorFormatado) {
      const valorNumerico = parsearValorFormatado(valorFormatado);
      if (valorNumerico > 0) {
        const valorParcelaCalculado = valorNumerico / numParcelas;
        setValorParcela(
          formatarMoedaInput(valorParcelaCalculado.toString().replace('.', ','))
        );
      } else {
        setValorParcela('');
      }
    } else if (!valorFormatado) {
      // Se o campo foi limpo, limpar o outro também
      setValorParcela('');
    }
  }

  // Atualizar valores quando número de parcelas mudar
  useEffect(() => {
    const numParcelas = parseInt(numeroParcelas) || 0;
    if (numParcelas > 0) {
      const valorParcelaNum = parsearValorFormatado(valorParcela);
      const valorTotalPrazoNum = parsearValorFormatado(valorTotalPrazo);

      // Se valor da parcela está preenchido, atualizar valor total
      if (valorParcelaNum > 0) {
        const totalPrazo = valorParcelaNum * numParcelas;
        const totalPrazoFormatado = formatarMoedaInput(
          totalPrazo.toString().replace('.', ',')
        );
        // Só atualiza se o valor for diferente para evitar loops
        if (totalPrazoFormatado !== valorTotalPrazo) {
          setValorTotalPrazo(totalPrazoFormatado);
        }
      }
      // Se apenas valor total está preenchido, atualizar valor da parcela
      else if (valorTotalPrazoNum > 0 && valorParcelaNum === 0) {
        const valorParcelaCalculado = valorTotalPrazoNum / numParcelas;
        const valorParcelaFormatado = formatarMoedaInput(
          valorParcelaCalculado.toString().replace('.', ',')
        );
        // Só atualiza se o valor for diferente para evitar loops
        if (valorParcelaFormatado !== valorParcela) {
          setValorParcela(valorParcelaFormatado);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroParcelas]);

  const valorParcelaNumerico = parsearValorFormatado(valorParcela);
  const valorTotalPrazoNumerico = parsearValorFormatado(valorTotalPrazo);
  const numParcelasNumerico = parseInt(numeroParcelas) || 0;

  const podeCalcular =
    valorVista &&
    numeroParcelas &&
    (valorParcela || valorTotalPrazo) &&
    !isNaN(parsearValorFormatado(valorVista)) &&
    parsearValorFormatado(valorVista) > 0 &&
    !isNaN(numParcelasNumerico) &&
    numParcelasNumerico > 0 &&
    (valorParcelaNumerico > 0 ||
      (valorTotalPrazoNumerico > 0 && numParcelasNumerico > 0)) &&
    !desabilitado;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!podeCalcular) return;

    // Garantir que temos o valor da parcela calculado
    let valorParcelaFinal = valorParcelaNumerico;
    if (
      valorParcelaFinal === 0 &&
      valorTotalPrazoNumerico > 0 &&
      numParcelasNumerico > 0
    ) {
      valorParcelaFinal = valorTotalPrazoNumerico / numParcelasNumerico;
    }

    onCalcular({
      nomeOrcamento: nome,
      valorVista: parsearValorFormatado(valorVista),
      numeroParcelas: numParcelasNumerico,
      valorParcela: valorParcelaFinal,
    });
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

          <div className="grid grid-cols-2 gap-4">
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
                  onChange={(e) => handleValorParcelaChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="valorTotalPrazo">
                Valor total a prazo <span className="text-destructive">*</span>
              </Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valorTotalPrazo"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorTotalPrazo}
                  onChange={(e) => handleValorTotalPrazoChange(e.target.value)}
                  className="pl-10"
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
