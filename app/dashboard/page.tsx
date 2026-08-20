"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { EntradasSaidasChart } from "@/components/dashboard/entradas-saidas-chart"
import { AcoesRapidas } from "@/components/dashboard/acoes-rapidas"
import { AlertasAlta } from "@/components/dashboard/alertas-alta"
import { GuiaDrawer } from "@/components/ui/guia-drawer"
import { GUIA_DASHBOARD } from "@/lib/guias"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 space-y-6 p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Visão geral da clínica</h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe em tempo real os indicadores clínicos, triagens e movimentações de acolhidos.
              </p>
            </div>
            <GuiaDrawer guia={GUIA_DASHBOARD} />
          </div>

          <StatCards />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EntradasSaidasChart />
            </div>
            <AcoesRapidas />
          </div>

          <AlertasAlta />
        </main>
      </div>
    </div>
  )
}
