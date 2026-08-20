"use client"

import { useState, useMemo, type FormEvent } from "react"
import {
  Plus,
  X,
  ChevronDown,
  Stethoscope,
  ClipboardList,
  FileText,
  Pill,
  Trash2,
  CalendarDays,
  UserRound,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Field, TextInput, TextArea, SelectInput } from "@/components/ui/form-controls"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { ConfirmDialog } from "@/components/triagens/confirm-dialog"
import {
  type Acolhido,
  type Relatorio,
  type CategoriaRelatorio,
  CATEGORIA_INFO,
  CATEGORIA_TINT,
  formatLongDate,
  todayISO,
} from "@/lib/acolhidos"

interface RelatoriosSectionProps {
  acolhido: Acolhido
  categoria: CategoriaRelatorio
}

const AUTOR_PADRAO: Record<CategoriaRelatorio, string> = {
  medico: "Dr. Carlos Mendes",
  social: "Assist. Social Marina Dias",
  psicologico: "Psic. Fernanda Torres",
  nutricao: "Nutric. Patrícia Gomes",
}

export function RelatoriosSection({ acolhido, categoria }: RelatoriosSectionProps) {
  const { addRelatorio, removeRelatorio } = useAcolhidos()
  const info = CATEGORIA_INFO[categoria]
  const isMedico = categoria === "medico"
  const isPsi = categoria === "psicologico"

  const todosRelatorios = acolhido.relatorios
    .filter((r) => r.categoria === categoria)
    .sort((a, b) => b.data.localeCompare(a.data))

  const [creating, setCreating] = useState(false)

  // Filtros
  const [busca, setBusca] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const relatorios = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return todosRelatorios.filter((r) => {
      if (dataInicio && r.data < dataInicio) return false
      if (dataFim && r.data > dataFim) return false
      if (termo) {
        const matchAutor = r.autor.toLowerCase().includes(termo)
        const matchTipo = r.tipo.toLowerCase().includes(termo)
        const matchCid = r.cid?.toLowerCase().includes(termo) ?? false
        if (!matchAutor && !matchTipo && !matchCid) return false
      }
      return true
    })
  }, [todosRelatorios, busca, dataInicio, dataFim])

  const filtrosAtivos = busca.trim() !== "" || dataInicio !== "" || dataFim !== ""

  function limparFiltros() {
    setBusca("")
    setDataInicio("")
    setDataFim("")
  }
  const [toDelete, setToDelete] = useState<Relatorio | null>(null)

  // Campos do formulário
  const [data, setData] = useState(todayISO())
  const [autor, setAutor] = useState(AUTOR_PADRAO[categoria])
  const [tipo, setTipo] = useState(info.tipos[0])
  const [cid, setCid] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [prescricoes, setPrescricoes] = useState("")
  const [medicamentos, setMedicamentos] = useState("")
  const [evolucao, setEvolucao] = useState("")
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setData(todayISO())
    setAutor(AUTOR_PADRAO[categoria])
    setTipo(info.tipos[0])
    setCid("")
    setObservacoes("")
    setPrescricoes("")
    setMedicamentos("")
    setEvolucao("")
    setError(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isMedico ? !observacoes.trim() : !evolucao.trim()) {
      setError("Descreva a evolução / observações do relatório.")
      return
    }
    const novo: Omit<Relatorio, "id"> = {
      categoria,
      data,
      autor: autor.trim() || AUTOR_PADRAO[categoria],
      tipo,
      ...(cid.trim() ? { cid: cid.trim() } : {}),
      ...(isMedico
        ? { observacoes: observacoes.trim(), prescricoes: prescricoes.trim(), medicamentos: medicamentos.trim() }
        : { evolucao: evolucao.trim() }),
    }
    addRelatorio(acolhido.id, novo)
    resetForm()
    setCreating(false)
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho da seção */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{info.plural}</h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-semibold text-muted-foreground">
              {filtrosAtivos ? `${relatorios.length}/${todosRelatorios.length}` : todosRelatorios.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{info.descricao}</p>
        </div>
        <button
          type="button"
          onClick={() => (creating ? (setCreating(false), resetForm()) : setCreating(true))}
          className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            creating
              ? "border border-input bg-card text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {creating ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {creating ? "Fechar" : "Novo relatório"}
        </button>
      </div>

      {/* Barra de busca e filtros */}
      {todosRelatorios.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por tipo, responsável ou CID..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              title="Data inicial"
              aria-label="Data inicial"
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-muted-foreground">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              title="Data final"
              aria-label="Data final"
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {filtrosAtivos && (
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulário de novo relatório */}
      {creating && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="-mx-5 -mt-5 space-y-0.5 rounded-t-xl border-b border-primary/10 bg-primary/5 px-5 py-4">
            <h4 className="text-sm font-semibold text-foreground">Novo {info.label.toLowerCase()}</h4>
            <p className="text-xs text-muted-foreground">Registre a evolução do acolhido.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Data" htmlFor="rel-data" required>
              <TextInput id="rel-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </Field>
            <Field label={isPsi ? "Tipo de sessão" : "Tipo"} htmlFor="rel-tipo">
              <SelectInput id="rel-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {info.tipos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </SelectInput>
            </Field>
            {isMedico || isPsi ? (
              <Field label="CID (opcional)" htmlFor="rel-cid">
                <TextInput id="rel-cid" value={cid} onChange={(e) => setCid(e.target.value)} placeholder="Ex.: F19.2" />
              </Field>
            ) : (
              <Field label="Responsável" htmlFor="rel-autor">
                <TextInput id="rel-autor" value={autor} onChange={(e) => setAutor(e.target.value)} />
              </Field>
            )}
          </div>

          {(isMedico || isPsi) && (
            <Field label="Responsável" htmlFor="rel-autor-2">
              <TextInput id="rel-autor-2" value={autor} onChange={(e) => setAutor(e.target.value)} />
            </Field>
          )}

          {isMedico ? (
            <>
              <Field label="Observações clínicas" htmlFor="rel-obs" required>
                <TextArea id="rel-obs" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Estado geral, sinais vitais, queixas..." />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prescrições" htmlFor="rel-presc">
                  <TextArea id="rel-presc" value={prescricoes} onChange={(e) => setPrescricoes(e.target.value)} placeholder="Condutas e orientações..." />
                </Field>
                <Field label="Medicamentos" htmlFor="rel-med">
                  <TextArea id="rel-med" value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} placeholder="Medicações e posologia..." />
                </Field>
              </div>
            </>
          ) : (
            <Field label="Evolução" htmlFor="rel-evo" required>
              <TextArea id="rel-evo" value={evolucao} onChange={(e) => setEvolucao(e.target.value)} placeholder="Descreva o conteúdo da sessão, estado emocional, avanços..." className="min-h-28" />
            </Field>
          )}

          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                setCreating(false)
                resetForm()
              }}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Salvar relatório
            </button>
          </div>
        </form>
      )}

      {/* Lista de relatórios */}
      {relatorios.length > 0 ? (
        <div className="space-y-3">
          {relatorios.map((r) => (
            <RelatorioCard key={r.id} relatorio={r} onDelete={() => setToDelete(r)} />
          ))}
        </div>
      ) : filtrosAtivos ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
          <Search className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Nenhum resultado encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros ou{" "}
              <button type="button" onClick={limparFiltros} className="underline hover:text-foreground">
                limpar a busca
              </button>
              .
            </p>
          </div>
        </div>
      ) : (
        !creating && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full ${CATEGORIA_TINT[categoria]}`}>
              <ClipboardList className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Nenhum relatório registrado</p>
              <p className="text-sm text-muted-foreground">Clique em "Novo relatório" para adicionar o primeiro registro.</p>
            </div>
          </div>
        )
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Remover relatório"
        description="Tem certeza que deseja remover este relatório? Esta ação não pode ser desfeita."
        onConfirm={() => {
          if (toDelete) removeRelatorio(acolhido.id, toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

function RelatorioCard({ relatorio, onDelete }: { relatorio: Relatorio; onDelete: () => void }) {
  const [open, setOpen] = useState(true)
  const tint = CATEGORIA_TINT[relatorio.categoria]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
          <Stethoscope className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tint}`}>
              {relatorio.tipo}
            </span>
            {relatorio.cid && (
              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                CID {relatorio.cid}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {formatLongDate(relatorio.data)}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            {relatorio.autor}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDelete}
            aria-label="Remover relatório"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Recolher" : "Expandir"}
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {relatorio.categoria === "medico" ? (
            <>
              <DetailBlock icon={FileText} label="Observações">
                {relatorio.observacoes || "—"}
              </DetailBlock>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailBlock icon={ClipboardList} label="Prescrições">
                  {relatorio.prescricoes || "—"}
                </DetailBlock>
                <DetailBlock icon={Pill} label="Medicamentos" accent>
                  {relatorio.medicamentos || "—"}
                </DetailBlock>
              </div>
            </>
          ) : (
            <DetailBlock icon={FileText} label="Evolução">
              {relatorio.evolucao || "—"}
            </DetailBlock>
          )}
        </div>
      )}
    </div>
  )
}

function DetailBlock({
  icon: Icon,
  label,
  children,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className={`text-sm leading-relaxed ${accent ? "text-primary" : "text-foreground"}`}>{children}</p>
    </div>
  )
}
