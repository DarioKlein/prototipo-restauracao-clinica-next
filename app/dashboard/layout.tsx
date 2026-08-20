import type { ReactNode } from "react"
import { TriagensProvider } from "@/components/triagens/triagens-provider"
import { FuncionariosProvider } from "@/components/funcionarios/funcionarios-provider"
import { AcolhidosProvider } from "@/components/acolhidos/acolhidos-provider"
import { ModalidadesProvider } from "@/components/modalidades/modalidades-provider"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TriagensProvider>
      <FuncionariosProvider>
        <AcolhidosProvider>
          <ModalidadesProvider>{children}</ModalidadesProvider>
        </AcolhidosProvider>
      </FuncionariosProvider>
    </TriagensProvider>
  )
}
