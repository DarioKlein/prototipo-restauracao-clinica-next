"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  FileText,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Eye,
  Download,
  Loader2,
  Pencil,
  Check,
  History,
} from "lucide-react"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_DECLARACOES } from "@/lib/guias"
import { Field, TextInput, TextArea, SelectInput } from "@/components/ui/form-controls"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { AcolhidoPicker } from "@/components/declaracoes/acolhido-picker"
import {
  DECLARACOES,
  getDeclaracao,
  valoresPadrao,
  buildDeclaracaoData,
  gerarDeclaracao,
  type TipoDeclaracao,
  type CampoDef,
} from "@/lib/declaracoes"
import type { Acolhido } from "@/lib/acolhidos"

const DocumentoPreview = dynamic(() => import("@/components/acolhidos/pdf/documento-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Preparando pré-visualização...
    </div>
  ),
})

type Step = "tipo" | "config" | "preview"

/**
 * Motor único de emissão de declarações. Usado tanto pela página global
 * "Declarações" (o acolhido é escolhido no fluxo) quanto pela aba
 * "Declarações" do prontuário (o acolhido já é fixo — `acolhidoFixo`),
 * garantindo que o conteúdo gerado seja sempre idêntico nos dois lugares.
 */
export function DeclaracoesView({ acolhidoFixo }: { acolhidoFixo?: Acolhido } = {}) {
  const { acolhidos, registrarEmissao } = useAcolhidos()
  const [step, setStep] = useState<Step>("tipo")
  const [tipoId, setTipoId] = useState<TipoDeclaracao | null>(null)
  const [acolhidoId, setAcolhidoId] = useState<string | null>(acolhidoFixo?.id ?? null)
  const [valores, setValores] = useState<Record<string, string>>({})
  const [gerando, setGerando] = useState(false)

  const disponiveis = useMemo(() => acolhidos.filter((a) => a.situacao !== "inativo"), [acolhidos])

  const config = tipoId ? getDeclaracao(tipoId) : undefined
  const acolhido = acolhidoFixo ?? (acolhidoId ? acolhidos.find((a) => a.id === acolhidoId) ?? null : null)

  const historico = useMemo(
    () => (acolhidoFixo ? acolhidoFixo.documentosEmitidos.filter((d) => d.categoria === "declaracao") : []),
    [acolhidoFixo],
  )

  function escolherTipo(id: TipoDeclaracao) {
    setTipoId(id)
    setValores({})
    const cfg = getDeclaracao(id)
    if (acolhidoFixo && cfg) {
      setValores(valoresPadrao(cfg, acolhidoFixo))
    } else {
      setAcolhidoId(null)
    }
    setStep("config")
  }

  function escolherAcolhido(a: Acolhido) {
    setAcolhidoId(a.id)
    if (config) setValores(valoresPadrao(config, a))
  }

  function setCampo(key: string, value: string) {
    setValores((prev) => ({ ...prev, [key]: value }))
  }

  const camposObrigatoriosOk = useMemo(() => {
    if (!config) return false
    return config.campos.every((c) => !c.obrigatorio || (valores[c.key] || "").trim() !== "")
  }, [config, valores])

  const podePrever = Boolean(config && acolhido && camposObrigatoriosOk)

  const previewData = useMemo(() => {
    if (!config || !acolhido) return null
    return buildDeclaracaoData(config, acolhido, valores)
  }, [config, acolhido, valores])

  async function handleGerar() {
    if (!config || !acolhido) return
    setGerando(true)
    try {
      await gerarDeclaracao(config, acolhido, valores)
      registrarEmissao(acolhido.id, {
        categoria: "declaracao",
        tipo: config.id,
        titulo: config.titulo,
        emitidoEm: new Date().toISOString(),
      })
    } catch (err) {
      console.error("[v0] erro ao gerar declaração:", err)
    } finally {
      setGerando(false)
    }
  }

  function novaDeclaracao() {
    setTipoId(null)
    setValores({})
    if (!acolhidoFixo) setAcolhidoId(null)
    setStep("tipo")
  }

  return (
    <div className={acolhidoFixo ? "space-y-6" : "mx-auto max-w-6xl space-y-6"}>
      {/* Cabeçalho */}
      {!acolhidoFixo && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-foreground text-balance">Declarações</h2>
            <p className="text-sm text-muted-foreground">
              Emita declarações oficiais da comunidade terapêutica com pré-visualização antes de gerar o PDF.
            </p>
          </div>
          <GuiaDrawer guia={GUIA_DECLARACOES} />
        </div>
      )}

      {acolhidoFixo && step === "tipo" && <HistoricoEmissoes historico={historico} tipo="declaracao" />}

      {/* Passos */}
      <Steps step={step} tipoTitulo={config?.titulo} acolhidoNome={acolhidoFixo ? undefined : acolhido?.nome} />

      {step === "tipo" && <TipoGrid onSelect={escolherTipo} selectedId={tipoId} />}

      {step === "config" && config && (
        <div className={acolhidoFixo ? "" : "grid gap-6 lg:grid-cols-5"}>
          {/* Coluna de seleção do acolhido (somente quando não há acolhido fixo) */}
          {!acolhidoFixo && (
            <section className="lg:col-span-2 rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">1. Selecione o acolhido</h3>
                <p className="text-xs text-muted-foreground">
                  A declaração será emitida em nome do acolhido escolhido.
                </p>
              </div>
              <div className="p-5">
                <AcolhidoPicker acolhidos={disponiveis} selectedId={acolhidoId} onSelect={escolherAcolhido} />
              </div>
            </section>
          )}

          {/* Coluna de dados da declaração */}
          <section className={acolhidoFixo ? "rounded-2xl border border-border bg-card" : "lg:col-span-3 rounded-2xl border border-border bg-card"}>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.tint}`}>
                <config.icone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {acolhidoFixo ? "Dados da declaração" : "2. Dados da declaração"}
                </h3>
                <p className="text-xs text-muted-foreground">{config.subtitulo}</p>
              </div>
            </div>

            <div className="p-5">
              {acolhido ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {config.campos.map((campo) => (
                    <div key={campo.key} className={campo.full ? "sm:col-span-2" : ""}>
                      <CampoInput campo={campo} value={valores[campo.key] ?? ""} onChange={setCampo} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Selecione um acolhido ao lado para preencher os dados da declaração.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={() => setStep("tipo")}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Trocar tipo
              </button>
              <button
                type="button"
                onClick={() => setStep("preview")}
                disabled={!podePrever}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Pré-visualizar
              </button>
            </div>
          </section>
        </div>
      )}

      {step === "preview" && config && acolhido && previewData && (
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${config.tint}`}>
                <config.icone className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{config.titulo}</h3>
                <p className="text-xs text-muted-foreground">
                  {acolhido.nome} · {acolhido.matricula}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep("config")}
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Voltar para editar
              </button>
              <button
                type="button"
                onClick={handleGerar}
                disabled={gerando}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {gerando ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Gerar PDF
              </button>
            </div>
          </div>

          <div className="bg-muted/40 p-3 sm:p-5">
            <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <DocumentoPreview data={previewData} />
            </div>
          </div>

          {gerando === false && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={novaDeclaracao}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Emitir outra declaração
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export function HistoricoEmissoes({
  historico,
  tipo,
}: {
  historico: Array<{ id: string; titulo: string; emitidoEm: string }>
  tipo: "declaracao" | "documento"
}) {
  if (historico.length === 0) return null
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
          <History className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {tipo === "declaracao" ? "Declarações já emitidas" : "Documentos já emitidos"}
          </h3>
          <p className="text-xs text-muted-foreground">Histórico para este acolhido nesta sessão.</p>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {historico.map((h) => (
          <li key={h.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">{h.titulo}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(h.emitidoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------------------------------------------------------------- */

function Steps({
  step,
  tipoTitulo,
  acolhidoNome,
}: {
  step: Step
  tipoTitulo?: string
  acolhidoNome?: string
}) {
  const items: Array<{ key: Step; label: string; detail?: string }> = [
    { key: "tipo", label: "Tipo de declaração", detail: tipoTitulo },
    { key: "config", label: "Acolhido e dados", detail: acolhidoNome },
    { key: "preview", label: "Pré-visualizar e gerar" },
  ]
  const order: Step[] = ["tipo", "config", "preview"]
  const current = order.indexOf(step)

  return (
    <nav className="flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl border border-border bg-card px-4 py-3">
      {items.map((item, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo"
        return (
          <div key={item.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                state === "done"
                  ? "bg-primary text-primary-foreground"
                  : state === "current"
                    ? "border-2 border-primary bg-background text-primary"
                    : "border border-border bg-background text-muted-foreground"
              }`}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
            </span>
            <div className="leading-tight">
              <p
                className={`text-xs font-medium ${state === "todo" ? "text-muted-foreground" : "text-foreground"}`}
              >
                {item.label}
              </p>
              {item.detail && <p className="max-w-[160px] truncate text-[11px] text-muted-foreground">{item.detail}</p>}
            </div>
            {i < items.length - 1 && (
              <ChevronRight className="ml-1 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            )}
          </div>
        )
      })}
    </nav>
  )
}

function TipoGrid({
  onSelect,
  selectedId,
}: {
  onSelect: (id: TipoDeclaracao) => void
  selectedId: TipoDeclaracao | null
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {DECLARACOES.map((d) => {
        const isSelected = d.id === selectedId
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className={`group flex flex-col items-start gap-4 rounded-2xl border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
              isSelected ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40"
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${d.tint}`}>
              <d.icone className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{d.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d.descricao}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
              Selecionar
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CampoInput({
  campo,
  value,
  onChange,
}: {
  campo: CampoDef
  value: string
  onChange: (key: string, value: string) => void
}) {
  const id = `campo-${campo.key}`
  return (
    <Field label={campo.label} htmlFor={id} required={campo.obrigatorio} hint={campo.hint}>
      {campo.tipo === "textarea" ? (
        <TextArea id={id} value={value} onChange={(e) => onChange(campo.key, e.target.value)} />
      ) : campo.tipo === "select" ? (
        <SelectInput id={id} value={value} onChange={(e) => onChange(campo.key, e.target.value)}>
          {campo.opcoes?.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </SelectInput>
      ) : (
        <TextInput
          id={id}
          type={campo.tipo === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => onChange(campo.key, e.target.value)}
        />
      )}
    </Field>
  )
}
