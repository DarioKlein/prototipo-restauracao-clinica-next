"use client"

import { useEffect, useRef, useState } from "react"
import { CircleHelp, X } from "lucide-react"

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

export type GuiaTipo = "botão" | "ícone" | "status" | "filtro" | "campo" | "seção" | "info"

export interface GuiaItem {
  nome: string
  descricao: string
  tipo?: GuiaTipo
  /** Elemento React renderizado que clona visualmente o elemento da interface */
  preview?: React.ReactNode
}

export interface GuiaSecao {
  titulo: string
  itens: GuiaItem[]
}

export interface Guia {
  pagina: string
  descricao: string
  secoes: GuiaSecao[]
}

/* -------------------------------------------------------------------------- */
/*  Componente principal                                                       */
/* -------------------------------------------------------------------------- */

export function GuiaDrawer({ guia }: { guia: Guia }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Fecha com Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Trava scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Botão de abertura */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir guia desta página"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
        Guia
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Painel lateral */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Guia: ${guia.pagina}`}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-gradient-to-br from-primary/5 via-card to-card px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Guia de uso</p>
              <h2 className="text-base font-bold text-foreground">{guia.pagina}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{guia.descricao}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar guia"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {guia.secoes.map((secao) => (
            <section key={secao.titulo}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {secao.titulo}
              </h3>
              <div className="space-y-2">
                {secao.itens.map((item) => (
                  <div
                    key={item.nome}
                    className="rounded-xl border border-border bg-card p-3.5"
                  >
                    {item.preview ? (
                      /* Item com preview visual */
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.preview}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{item.descricao}</p>
                      </div>
                    ) : (
                      /* Item descritivo (seção / info) */
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.descricao}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Rodapé */}
        <div className="border-t border-border bg-muted/40 px-5 py-3">
          <p className="text-center text-[11px] text-muted-foreground">
            Em caso de dúvidas, entre em contato com o administrador do sistema.
          </p>
        </div>
      </div>
    </>
  )
}
