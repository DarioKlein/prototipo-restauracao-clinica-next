import { todayISO } from "@/lib/triagens"

export type MovimentacaoTipo = "entrada" | "saida"

export interface MovimentacaoEstoque {
  id: string
  tipo: MovimentacaoTipo
  quantidade: number
  data: string
  motivo: string
}

export interface Medicamento {
  id: string
  nome: string
  preco: number
  modalidadeId: string
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
  movimentacoes: MovimentacaoEstoque[]
}

export interface MedicamentoFormValues {
  nome: string
  preco: number
  modalidadeId: string
  unidade: string
  estoqueMinimo: number
  estoqueInicial: number
}

export function createSeedMedicamentos(): Medicamento[] {
  return [
    {
      id: "med-1",
      nome: "Paracetamol 500mg",
      preco: 12.9,
      modalidadeId: "mod-particular",
      unidade: "Comprimidos",
      estoqueAtual: 120,
      estoqueMinimo: 30,
      movimentacoes: [],
    },
    {
      id: "med-2",
      nome: "Amoxicilina 500mg",
      preco: 28.5,
      modalidadeId: "mod-prefeitura",
      unidade: "Cápsulas",
      estoqueAtual: 18,
      estoqueMinimo: 24,
      movimentacoes: [],
    },
    {
      id: "med-3",
      nome: "Ibuprofeno 600mg",
      preco: 18.75,
      modalidadeId: "mod-social",
      unidade: "Comprimidos",
      estoqueAtual: 64,
      estoqueMinimo: 20,
      movimentacoes: [],
    },
    {
      id: "med-4",
      nome: "Omeprazol 20mg",
      preco: 16.4,
      modalidadeId: "mod-particular",
      unidade: "Cápsulas",
      estoqueAtual: 7,
      estoqueMinimo: 12,
      movimentacoes: [],
    },
    {
      id: "med-5",
      nome: "Dipirona 500mg",
      preco: 9.8,
      modalidadeId: "mod-prefeitura",
      unidade: "Comprimidos",
      estoqueAtual: 86,
      estoqueMinimo: 25,
      movimentacoes: [],
    },
    {
      id: "med-6",
      nome: "Soro fisiológico 0,9%",
      preco: 8.5,
      modalidadeId: "mod-social",
      unidade: "Frascos",
      estoqueAtual: 3,
      estoqueMinimo: 8,
      movimentacoes: [],
    },
  ]
}

export function createMovimentacao(
  tipo: MovimentacaoTipo,
  quantidade: number,
  motivo = "",
): MovimentacaoEstoque {
  return {
    id: `mov-${Date.now()}`,
    tipo,
    quantidade,
    data: todayISO(),
    motivo: motivo.trim() || (tipo === "entrada" ? "Reposição de estoque" : "Dispensação"),
  }
}