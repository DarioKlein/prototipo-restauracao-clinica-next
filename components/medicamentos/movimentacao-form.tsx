"use client"

import { useState, type FormEvent } from "react"
import { ArrowDownToLine, ArrowUpFromLine, Check } from "lucide-react"
import { Field, TextArea, TextInput } from "@/components/ui/form-controls"
import type { Medicamento, MovimentacaoTipo } from "@/lib/medicamentos"

interface MovimentacaoFormProps {
  medicamento: Medicamento
  tipo: MovimentacaoTipo
  onSubmit: (quantidade: number, motivo: string) => string | null
  onCancel: () => void
}

export function MovimentacaoForm({ medicamento, tipo, onSubmit, onCancel }: MovimentacaoFormProps) {
  const [quantidade, setQuantidade] = useState(1)
  const [motivo, setMotivo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const entrada = tipo === "entrada"

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = onSubmit(quantidade, motivo)
    if (result) {
      setError(result)
      return
    }
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className={`flex items-center gap-3 rounded-lg border p-3 ${entrada ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${entrada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {entrada ? <ArrowDownToLine className="h-5 w-5" aria-hidden="true" /> : <ArrowUpFromLine className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{medicamento.nome}</p>
          <p className="text-xs text-muted-foreground">
            Saldo atual: <strong className="text-foreground">{medicamento.estoqueAtual} {medicamento.unidade.toLowerCase()}</strong>
          </p>
        </div>
      </div>

      <Field label="Quantidade" htmlFor="movimentacao-quantidade" required>
        <TextInput
          id="movimentacao-quantidade"
          type="number"
          min="1"
          step="1"
          value={quantidade}
          onChange={(event) => setQuantidade(Number(event.target.value))}
          autoFocus
          inputMode="numeric"
        />
      </Field>

      <Field label="Motivo" htmlFor="movimentacao-motivo" hint="Opcional. Esse texto ficará no histórico do estoque.">
        <TextArea
          id="movimentacao-motivo"
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          placeholder={entrada ? "Ex.: compra, doação ou reposição..." : "Ex.: dispensação para acolhido..."}
          className="min-h-20"
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 ${
            entrada ? "bg-emerald-600" : "bg-amber-600"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Registrar {entrada ? "entrada" : "saída"}
        </button>
      </div>
    </form>
  )
}