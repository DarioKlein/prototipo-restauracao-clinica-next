"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { Field, TextInput } from "@/components/ui/form-controls"
import type { MedicamentoFormValues } from "@/lib/medicamentos"

interface MedicamentoFormProps {
  initialValues?: Partial<MedicamentoFormValues>
  submitLabel: string
  onSubmit: (values: MedicamentoFormValues) => void
  onCancel: () => void
}

export function MedicamentoForm({ initialValues, submitLabel, onSubmit, onCancel }: MedicamentoFormProps) {
  const [values, setValues] = useState<MedicamentoFormValues>({
    nome: initialValues?.nome ?? "",
    preco: initialValues?.preco ?? 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues({
      nome: initialValues?.nome ?? "",
      preco: initialValues?.preco ?? 0,
    })
    setError(null)
  }, [initialValues])

  function set<K extends keyof MedicamentoFormValues>(key: K, value: MedicamentoFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!values.nome.trim()) {
      setError("O nome não pode ser nulo ou vazio.")
      return
    }
    if (values.nome.trim().length < 3) {
      setError("O nome não pode ser menor que 3 caracteres.")
      return
    }
    if (values.preco < 0) {
      setError("O preço não pode ser negativo.")
      return
    }

    setError(null)
    onSubmit({ nome: values.nome.trim(), preco: values.preco })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nome do medicamento" htmlFor="medicamento-nome" required>
        <TextInput
          id="medicamento-nome"
          value={values.nome}
          onChange={(event) => set("nome", event.target.value)}
          placeholder="Ex.: Paracetamol 500mg"
          autoFocus
        />
      </Field>

      <Field label="Preço" htmlFor="medicamento-preco" required hint="Informe o preço unitário em reais.">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
          <TextInput
            id="medicamento-preco"
            type="number"
            min="0"
            step="0.01"
            value={values.preco}
            onChange={(event) => set("preco", Number(event.target.value))}
            className="pl-10"
            inputMode="decimal"
          />
        </div>
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
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {submitLabel}
        </button>
      </div>
    </form>
  )
}