import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DocumentosView } from "@/components/documentos/documentos-view"

export default function DocumentosPage() {
  return (
    <DashboardShell>
      <DocumentosView />
    </DashboardShell>
  )
}
