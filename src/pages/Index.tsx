import { useState, useEffect } from "react";
import { TaxaSelector, TaxaInfo } from "@/components/TaxaSelector";
import { FormularioCompra, DadosFormulario } from "@/components/FormularioCompra";
import { ResultadoCalculo, Resultado } from "@/components/ResultadoCalculo";
import { ListaOrcamentos } from "@/components/ListaOrcamentos";
import { calcularComparacao } from "@/utils/calculos";
import {
  salvarOrcamento,
  listarOrcamentos,
  excluirOrcamento,
  salvarConfiguracao,
  carregarConfiguracao,
  salvarUltimosInputs,
  carregarUltimosInputs,
  Orcamento,
} from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DollarSign } from "lucide-react";

export default function Index() {
  const { toast } = useToast();
  const [taxaInfo, setTaxaInfo] = useState<TaxaInfo | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [dadosAtuais, setDadosAtuais] = useState<DadosFormulario | null>(null);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [orcamentoSelecionadoId, setOrcamentoSelecionadoId] = useState<string | null>(
    null
  );

  // Carregar configurações iniciais
  useEffect(() => {
    const config = carregarConfiguracao();
    const ultimosInputs = carregarUltimosInputs();
    setOrcamentos(listarOrcamentos());
  }, []);

  function handleTaxaChange(taxa: TaxaInfo) {
    setTaxaInfo(taxa);

    // Salvar configuração
    salvarConfiguracao({
      ultimaTaxaSelecionada: taxa.tipo,
      ultimaTaxaPersonalizada: taxa.taxaAnual,
    });

    // Recalcular se já houver dados
    if (dadosAtuais) {
      calcular(dadosAtuais, taxa);
    }
  }

  function handleCalcular(dados: DadosFormulario) {
    if (!taxaInfo) {
      toast({
        title: "Taxa não configurada",
        description: "Por favor, configure uma taxa de juros primeiro.",
        variant: "destructive",
      });
      return;
    }

    setDadosAtuais(dados);
    setOrcamentoSelecionadoId(null);

    // Salvar últimos inputs
    salvarUltimosInputs({
      nomeOrcamento: dados.nomeOrcamento,
      valorVista: dados.valorVista,
      numeroParcelas: dados.numeroParcelas,
      valorParcela: dados.valorParcela,
    });

    calcular(dados, taxaInfo);
  }

  function calcular(dados: DadosFormulario, taxa: TaxaInfo) {
    const resultado = calcularComparacao(
      {
        valorVista: dados.valorVista,
        numeroParcelas: dados.numeroParcelas,
        valorParcela: dados.valorParcela,
      },
      taxa.taxaMensal
    );

    setResultado(resultado);
  }

  function handleSalvarOrcamento() {
    if (!dadosAtuais || !resultado || !taxaInfo) return;

    const orcamento: Orcamento = {
      id: orcamentoSelecionadoId || crypto.randomUUID(),
      nome: dadosAtuais.nomeOrcamento || "Sem nome",
      valorVista: dadosAtuais.valorVista,
      numeroParcelas: dadosAtuais.numeroParcelas,
      valorParcela: dadosAtuais.valorParcela,
      origemTaxa: taxaInfo.tipo,
      taxaAnual: taxaInfo.taxaAnual,
      taxaMensal: taxaInfo.taxaMensal,
      valorPresenteParcelado: resultado.valorPresente,
      totalPrazo: resultado.totalPrazo,
      diferencaNominal: resultado.diferencaNominal,
      diferencaPercentual: resultado.diferencaPercentual,
      compensaParcela: resultado.compensaParcela,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    salvarOrcamento(orcamento);
    setOrcamentos(listarOrcamentos());
    setOrcamentoSelecionadoId(orcamento.id);

    toast({
      title: "Orçamento salvo!",
      description: "Você pode consultá-lo a qualquer momento.",
    });
  }

  function handleSelecionarOrcamento(orcamento: Orcamento) {
    setOrcamentoSelecionadoId(orcamento.id);

    // Restaurar dados do formulário
    const dados: DadosFormulario = {
      nomeOrcamento: orcamento.nome,
      valorVista: orcamento.valorVista,
      numeroParcelas: orcamento.numeroParcelas,
      valorParcela: orcamento.valorParcela,
    };
    setDadosAtuais(dados);

    // Restaurar taxa
    const taxa: TaxaInfo = {
      tipo: orcamento.origemTaxa,
      taxaMensal: orcamento.taxaMensal,
      taxaAnual: orcamento.taxaAnual,
    };
    setTaxaInfo(taxa);

    // Restaurar resultado
    setResultado({
      valorVista: orcamento.valorVista,
      totalPrazo: orcamento.totalPrazo,
      valorPresente: orcamento.valorPresenteParcelado,
      diferencaNominal: orcamento.diferencaNominal,
      diferencaPercentual: orcamento.diferencaPercentual,
      compensaParcela: orcamento.compensaParcela,
    });

    toast({
      title: "Orçamento carregado",
      description: "Você pode editar e recalcular se quiser.",
    });
  }

  function handleExcluirOrcamento(id: string) {
    excluirOrcamento(id);
    setOrcamentos(listarOrcamentos());

    if (orcamentoSelecionadoId === id) {
      setOrcamentoSelecionadoId(null);
    }

    toast({
      title: "Orçamento excluído",
      description: "O orçamento foi removido com sucesso.",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Pix ou Parcela</h1>
                <p className="text-xs text-muted-foreground">
                  Descubra a melhor forma de pagamento
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Taxa Selector */}
        <TaxaSelector
          onTaxaChange={handleTaxaChange}
          valorInicial={
            taxaInfo
              ? {
                  tipo: taxaInfo.tipo,
                  taxaPersonalizada: taxaInfo.taxaAnual,
                }
              : undefined
          }
        />

        {/* Formulário */}
        <FormularioCompra
          onCalcular={handleCalcular}
          valoresIniciais={dadosAtuais || undefined}
          desabilitado={!taxaInfo}
        />

        {/* Resultado */}
        {resultado && (
          <ResultadoCalculo
            resultado={resultado}
            onSalvar={handleSalvarOrcamento}
            mostrarBotaoSalvar={!!dadosAtuais?.nomeOrcamento}
            nomeOrcamento={dadosAtuais?.nomeOrcamento}
          />
        )}

        {/* Lista de orçamentos */}
        <ListaOrcamentos
          orcamentos={orcamentos}
          onSelecionar={handleSelecionarOrcamento}
          onExcluir={handleExcluirOrcamento}
        />
      </main>
    </div>
  );
}
