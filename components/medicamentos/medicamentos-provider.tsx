"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  createMovimentacao,
  createSeedMedicamentos,
  type Medicamento,
  type MedicamentoFormValues,
  type MovimentacaoTipo,
} from "@/lib/medicamentos"

interface MedicamentosContextValue {
  medicamentos: Medicamento[]
  getById: (id: string) => Medicamento | undefined
  addMedicamento: (data: MedicamentoFormValues) => Medicamento
  updateMedicamento: (id: string, data: Partial<Omit<MedicamentoFormValues, "estoqueInicial">>) => void
  movimentarEstoque: (id: string, tipo: MovimentacaoTipo, quantidade: number, motivo?: string) => string | null
  removeMedicamento: (id: string) => void
}

const MedicamentosContext = createContext<MedicamentosContextValue | null>(null)

export function MedicamentosProvider({ children }: { children: ReactNode }) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() => createSeedMedicamentos())

  const getById = useCallback((id: string) => medicamentos.find((medicamento) => medicamento.id === id), [medicamentos])

  const addMedicamento = useCallback((data: MedicamentoFormValues) => {
    const estoqueInicial = Math.max(0, data.estoqueInicial)
    const novo: Medicamento = {
      nome: data.nome,
      preco: data.preco,
      modalidadeId: data.modalidadeId,
      unidade: data.unidade,
      estoqueMinimo: data.estoqueMinimo,
      estoqueAtual: estoqueInicial,
      movimentacoes: estoqueInicial
        ? [createMovimentacao("entrada", estoqueInicial, "Estoque inicial")]
        : [],
      id: `med-${Date.now()}`,
    }
    setMedicamentos((prev) => [novo, ...prev])
    return novo
  }, [])

  const updateMedicamento = useCallback((id: string, data: Partial<Omit<MedicamentoFormValues, "estoqueInicial">>) => {
    setMedicamentos((prev) => prev.map((medicamento) => (medicamento.id === id ? { ...medicamento, ...data } : medicamento)))
  }, [])

  const movimentarEstoque = useCallback((id: string, tipo: MovimentacaoTipo, quantidade: number, motivo?: string) => {
    if (!Number.isFinite(quantidade) || quantidade <= 0) return "Informe uma quantidade maior que zero."

    const atual = medicamentos.find((medicamento) => medicamento.id === id)
    if (!atual) return "Medicamento não encontrado."
    if (tipo === "saida" && quantidade > atual.estoqueAtual) {
      return `A saída não pode ser maior que o saldo atual de ${atual.estoqueAtual} ${atual.unidade.toLowerCase()}.`
    }

    const movimentacao = createMovimentacao(tipo, quantidade, motivo)
    setMedicamentos((prev) =>
      prev.map((medicamento) => {
        if (medicamento.id !== id) return medicamento
        return {
          ...medicamento,
          estoqueAtual: tipo === "entrada" ? medicamento.estoqueAtual + quantidade : medicamento.estoqueAtual - quantidade,
          movimentacoes: [movimentacao, ...medicamento.movimentacoes],
        }
      }),
    )
    return null
  }, [medicamentos])

  const removeMedicamento = useCallback((id: string) => {
    setMedicamentos((prev) => prev.filter((medicamento) => medicamento.id !== id))
  }, [])

  const value = useMemo(
    () => ({ medicamentos, getById, addMedicamento, updateMedicamento, movimentarEstoque, removeMedicamento }),
    [medicamentos, getById, addMedicamento, updateMedicamento, movimentarEstoque, removeMedicamento],
  )

  return <MedicamentosContext.Provider value={value}>{children}</MedicamentosContext.Provider>
}

export function useMedicamentos() {
  const ctx = useContext(MedicamentosContext)
  if (!ctx) throw new Error("useMedicamentos deve ser usado dentro de MedicamentosProvider")
  return ctx
}