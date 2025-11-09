export interface Orcamento {
  id: string;
  nome: string;
  valorVista: number;
  numeroParcelas: number;
  valorParcela: number;
  origemTaxa: "selic" | "personalizada";
  taxaAnual?: number;
  taxaMensal: number;
  valorPresenteParcelado: number;
  totalPrazo: number;
  diferencaNominal: number;
  diferencaPercentual: number;
  compensaParcela: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracaoApp {
  ultimaTaxaSelecionada: "selic" | "personalizada";
  ultimaTaxaPersonalizada?: number;
  ultimaSelic?: {
    taxaDiaria: number;
    dataConsulta: string;
  };
}

export interface UltimosInputs {
  nomeOrcamento?: string;
  valorVista?: number;
  numeroParcelas?: number;
  valorParcela?: number;
}

const STORAGE_KEYS = {
  orcamentos: "pixOuParcela_orcamentos",
  configuracao: "pixOuParcela_configuracao",
  ultimosInputs: "pixOuParcela_ultimosInputs",
};

// Gerenciamento de orçamentos
export function salvarOrcamento(orcamento: Orcamento): void {
  const orcamentos = listarOrcamentos();
  const index = orcamentos.findIndex((o) => o.id === orcamento.id);
  
  if (index >= 0) {
    orcamentos[index] = {
      ...orcamento,
      updatedAt: new Date().toISOString(),
    };
  } else {
    orcamentos.push({
      ...orcamento,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.orcamentos, JSON.stringify(orcamentos));
}

export function listarOrcamentos(): Orcamento[] {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.orcamentos);
    if (!dados) return [];
    
    const orcamentos = JSON.parse(dados);
    // Ordenar por data de atualização (mais recente primeiro)
    return orcamentos.sort(
      (a: Orcamento, b: Orcamento) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error("Erro ao listar orçamentos:", error);
    return [];
  }
}

export function excluirOrcamento(id: string): void {
  const orcamentos = listarOrcamentos().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_KEYS.orcamentos, JSON.stringify(orcamentos));
}

// Gerenciamento de configurações
export function salvarConfiguracao(config: ConfiguracaoApp): void {
  localStorage.setItem(STORAGE_KEYS.configuracao, JSON.stringify(config));
}

export function carregarConfiguracao(): ConfiguracaoApp {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.configuracao);
    if (!dados) {
      return {
        ultimaTaxaSelecionada: "selic",
      };
    }
    return JSON.parse(dados);
  } catch (error) {
    console.error("Erro ao carregar configuração:", error);
    return {
      ultimaTaxaSelecionada: "selic",
    };
  }
}

// Gerenciamento de últimos inputs
export function salvarUltimosInputs(inputs: UltimosInputs): void {
  localStorage.setItem(STORAGE_KEYS.ultimosInputs, JSON.stringify(inputs));
}

export function carregarUltimosInputs(): UltimosInputs {
  try {
    const dados = localStorage.getItem(STORAGE_KEYS.ultimosInputs);
    if (!dados) return {};
    return JSON.parse(dados);
  } catch (error) {
    console.error("Erro ao carregar últimos inputs:", error);
    return {};
  }
}
