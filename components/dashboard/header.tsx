"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Bell, Menu, UserRound, FileText, Stethoscope, X, CheckCheck } from "lucide-react"
import { useAcolhidos } from "@/components/acolhidos/acolhidos-provider"
import { CATEGORIA_INFO, formatLongDate, getInitials, avatarTint } from "@/lib/acolhidos"

interface Notificacao {
  id: string
  titulo: string
  descricao: string
  quando: string
  lida: boolean
}

const NOTIFICACOES_INICIAIS: Notificacao[] = [
  {
    id: "n1",
    titulo: "Previsão de alta próxima",
    descricao: "Bruno Henrique Santos está a poucos dias da alta prevista.",
    quando: "há 2 horas",
    lida: false,
  },
  {
    id: "n2",
    titulo: "Novo relatório médico",
    descricao: "Dr. Carlos Mendes registrou uma evolução para Anderson Pereira da Silva.",
    quando: "há 5 horas",
    lida: false,
  },
  {
    id: "n3",
    titulo: "Documento emitido",
    descricao: "Laudo técnico gerado para Carlos Eduardo Almeida.",
    quando: "ontem",
    lida: true,
  },
]

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-4 md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <h1 className="shrink-0 text-base font-semibold text-foreground md:text-lg">Olá, Dra. Rafaela</h1>

      <HeaderSearch />

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          <span>Quinta, 23 de Abril</span>
        </div>
        <HeaderNotifications />
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */

type ResultadoBusca =
  | { tipo: "acolhido"; id: string; nome: string; subtitulo: string }
  | { tipo: "relatorio"; id: string; acolhidoId: string; titulo: string; subtitulo: string }

function HeaderSearch() {
  const router = useRouter()
  const { acolhidos } = useAcolhidos()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const resultados = useMemo<ResultadoBusca[]>(() => {
    const termo = query.trim().toLowerCase()
    if (!termo) return []
    const digitos = termo.replace(/\D/g, "")

    const acolhidoResultados: ResultadoBusca[] = acolhidos
      .filter((a) => {
        const matchNome = a.nome.toLowerCase().includes(termo)
        const matchMat = a.matricula.toLowerCase().includes(termo)
        const matchCpf = digitos.length > 0 && a.cpf.replace(/\D/g, "").includes(digitos)
        return matchNome || matchMat || matchCpf
      })
      .slice(0, 5)
      .map((a) => ({
        tipo: "acolhido" as const,
        id: a.id,
        nome: a.nome,
        subtitulo: `${a.matricula} · ${a.modalidade}`,
      }))

    const relatorioResultados: ResultadoBusca[] = acolhidos
      .flatMap((a) => a.relatorios.map((r) => ({ acolhido: a, relatorio: r })))
      .filter(({ acolhido: a, relatorio: r }) => {
        const info = CATEGORIA_INFO[r.categoria]
        return (
          r.tipo.toLowerCase().includes(termo) ||
          info.label.toLowerCase().includes(termo) ||
          a.nome.toLowerCase().includes(termo)
        )
      })
      .slice(0, 4)
      .map(({ acolhido: a, relatorio: r }) => ({
        tipo: "relatorio" as const,
        id: r.id,
        acolhidoId: a.id,
        titulo: `${CATEGORIA_INFO[r.categoria].label} · ${r.tipo}`,
        subtitulo: `${a.nome} · ${formatLongDate(r.data)}`,
      }))

    return [...acolhidoResultados, ...relatorioResultados]
  }, [acolhidos, query])

  function irParaAcolhido(id: string) {
    router.push(`/dashboard/acolhidos/${id}`)
    setOpen(false)
    setQuery("")
  }

  return (
    <div ref={containerRef} className="relative mx-auto hidden w-full max-w-md md:block">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="Buscar acolhidos, relatórios..."
        className="h-9 w-full rounded-md border border-input bg-white pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {resultados.length > 0 ? (
            <ul className="divide-y divide-border">
              {resultados.map((r) => (
                <li key={`${r.tipo}-${r.id}`}>
                  <button
                    type="button"
                    onClick={() => irParaAcolhido(r.tipo === "acolhido" ? r.id : r.acolhidoId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                  >
                    {r.tipo === "acolhido" ? (
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-xs"
                      >
                        {getInitials(r.nome)}
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <Stethoscope className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.tipo === "acolhido" ? r.nome : r.titulo}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{r.subtitulo}</p>
                    </div>
                    {r.tipo === "acolhido" ? (
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado para &quot;{query}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function HeaderNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(NOTIFICACOES_INICIAIS)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function marcarComoLida(id: string) {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  function marcarTodasComoLidas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {naoLidas > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {naoLidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notificações</h3>
            <div className="flex items-center gap-1">
              {naoLidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasComoLidas}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Marcar todas
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {notificacoes.length > 0 ? (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notificacoes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => marcarComoLida(n.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.lida ? "bg-transparent" : "bg-primary"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.lida ? "font-medium text-muted-foreground" : "font-semibold text-foreground"}`}>
                        {n.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.descricao}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/80">{n.quando}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação.</p>
          )}
        </div>
      )}
    </div>
  )
}
