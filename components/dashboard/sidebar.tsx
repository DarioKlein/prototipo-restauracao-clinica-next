"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HeartHandshake,
  LayoutGrid,
  Layers,
  Users,
  Pill,
  Briefcase,
  BarChart3,
  FileText,
  ClipboardCheck,
  Stethoscope,
  LogOut,
  X,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
  { label: "Modalidades", icon: Layers, href: "/dashboard/modalidades" },
  { label: "Acolhidos", icon: Users, href: "/dashboard/acolhidos" },
  { label: "Medicamentos", icon: Pill, href: "/dashboard/medicamentos" },
  { label: "Colaboradores", icon: Briefcase, href: "/dashboard/funcionarios" },
  { label: "Relatórios", icon: BarChart3, href: "/dashboard/relatorios" },
  { label: "Declarações", icon: FileText, href: "/dashboard/declaracoes" },
  { label: "Documentos", icon: ClipboardCheck, href: "/dashboard/documentos" },
  { label: "Triagens", icon: Stethoscope, href: "/dashboard/triagens" },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-full shrink-0 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:w-60 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HeartHandshake className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-primary">Clínica</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Restauração</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Menu</p>
          <ul className="space-y-1">
            {navItems.map(({ label, icon: Icon, href }) => {
              const isActive =
                href !== "#" &&
                (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Rodapé */}
        <div className="mt-auto space-y-1 border-t border-border px-3 py-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </button>

          <div className="mt-2 flex items-center gap-3 rounded-md px-3 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              RA
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Dra. Rafaela</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
