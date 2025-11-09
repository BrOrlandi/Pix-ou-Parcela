import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Orcamento } from "@/utils/storage";
import { formatarMoeda } from "@/utils/calculos";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListaOrcamentosProps {
  orcamentos: Orcamento[];
  onSelecionar: (orcamento: Orcamento) => void;
  onExcluir: (id: string) => void;
}

export function ListaOrcamentos({
  orcamentos,
  onSelecionar,
  onExcluir,
}: ListaOrcamentosProps) {
  if (orcamentos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">
          Nenhum orçamento salvo ainda.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Faça um cálculo e salve para consultar depois.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Orçamentos salvos
        </h2>
        <p className="text-sm text-muted-foreground">
          Seus cálculos anteriores ({orcamentos.length})
        </p>
      </div>

      <div className="space-y-3">
        {orcamentos.map((orcamento) => (
          <Card
            key={orcamento.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelecionar(orcamento)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold truncate">
                    {orcamento.nome || "Sem nome"}
                  </h3>
                  <Badge
                    variant={orcamento.compensaParcela ? "default" : "secondary"}
                    className={
                      orcamento.compensaParcela
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                  >
                    {orcamento.compensaParcela ? "Parcela" : "À vista"}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">À vista:</span>
                    <span className="font-medium">
                      {formatarMoeda(orcamento.valorVista)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total parcelado:</span>
                    <span className="font-medium">
                      {formatarMoeda(orcamento.totalPrazo)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  Atualizado em{" "}
                  {format(new Date(orcamento.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onExcluir(orcamento.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
