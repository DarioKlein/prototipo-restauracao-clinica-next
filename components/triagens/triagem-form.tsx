"use client"

import { useState, type FormEvent } from "react"
import { Info } from "lucide-react"
import {
  MODALIDADES,
  ORIGENS,
  RESPONSAVEIS,
  formatCPF,
  formatPhone,
  type Triagem,
} from "@/lib/triagens"

export type TriagemFormValues = Omit<Triagem, "id">

interface TriagemFormProps {
  initialValues?: Partial<TriagemFormValues>
  submitLabel: string
  onSubmit: (values: TriagemFormValues) => void
  onCancel: () => void
  showDocumentacao?: boolean
}

const labelClass = "text-sm font-medium text-foreground"
const fieldClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

export function TriagemForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  showDocumentacao = false,
}: TriagemFormProps) {
  const [values, setValues] = useState<TriagemFormValues>({
    nome: initialValues?.nome ?? "",
    cpf: initialValues?.cpf ?? "",
    telefone: initialValues?.telefone ?? "",
    data: initialValues?.data ?? "",
    horario: initialValues?.horario ?? "",
    responsavel: initialValues?.responsavel ?? "",
    origem: initialValues?.origem ?? "",
    observacoes: initialValues?.observacoes ?? "",
    documentacao: initialValues?.documentacao ?? "",
    status: initialValues?.status ?? "pendente",
    modalidade: initialValues?.modalidade ?? "",
  })
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof TriagemFormValues>(key: K, value: TriagemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!values.nome.trim() || !values.responsavel) {
      setError("Preencha ao menos o nome do candidato e o responsável.")
      return
    }
    if (values.data && !values.horario) {
      setError("Informe também o horário para a data selecionada.")
      return
    }
    setError(null)
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="nome" className={labelClass}>
          Nome do candidato <span className="text-destructive">*</span>
        </label>
        <input
          id="nome"
          value={values.nome}
          onChange={(e) => set("nome", e.target.value)}
          placeholder="Ex.: João da Silva"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="cpf" className={labelClass}>
            CPF
          </label>
          <input
            id="cpf"
            value={values.cpf}
            onChange={(e) => set("cpf", formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="telefone" className={labelClass}>
            Telefone
          </label>
          <input
            id="telefone"
            value={values.telefone}
            onChange={(e) => set("telefone", formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="tel"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="data" className={labelClass}>
            Data <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="data"
            type="date"
            value={values.data}
            onChange={(e) => set("data", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="horario" className={labelClass}>
            Horário <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <input
            id="horario"
            type="time"
            value={values.horario}
            onChange={(e) => set("horario", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="responsavel" className={labelClass}>
            Responsável pelo atendimento <span className="text-destructive">*</span>
          </label>
          <select
            id="responsavel"
            value={values.responsavel}
            onChange={(e) => set("responsavel", e.target.value)}
            className={fieldClass}
          >
            <option value="">Selecione</option>
            {RESPONSAVEIS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="modalidade" className={labelClass}>
            Modalidade
          </label>
          <select
            id="modalidade"
            value={values.modalidade}
            onChange={(e) => set("modalidade", e.target.value)}
            className={fieldClass}
          >
            <option value="">Selecione</option>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="origem" className={labelClass}>
          Origem do encaminhamento
        </label>
        <select
          id="origem"
          value={values.origem}
          onChange={(e) => set("origem", e.target.value)}
          className={fieldClass}
        >
          <option value="">Selecione</option>
          {ORIGENS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="observacoes" className={labelClass}>
          Observações
        </label>
        <textarea
          id="observacoes"
          value={values.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
          placeholder="Histórico breve, queixa principal, comorbidades..."
          rows={3}
          className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {showDocumentacao && (
        <div className="space-y-1.5">
          <label htmlFor="documentacao" className={labelClass}>
            Documentação da entrevista
          </label>
          <textarea
            id="documentacao"
            value={values.documentacao}
            onChange={(e) => set("documentacao", e.target.value)}
            placeholder="Registro da entrevista, avaliação clínica e encaminhamentos..."
            rows={4}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          {values.data
            ? "Com data definida, a triagem entra como Agendada e o candidato é notificado por SMS."
            : "Sem data definida, a triagem fica como Pendente até você marcar uma data."}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
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
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
