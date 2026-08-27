import type { ReactNode } from "react"
import { TriagensProvider } from "@/components/triagens/triagens-provider"
import { FuncionariosProvider } from "@/components/funcionarios/funcionarios-provider"
import { AcolhidosProvider } from "@/components/acolhidos/acolhidos-provider"
import { ModalidadesProvider } from "@/components/modalidades/modalidades-provider"
import { MedicamentosProvider } from "@/components/medicamentos/medicamentos-provider"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TriagensProvider>
      <FuncionariosProvider>
        <AcolhidosProvider>
          <ModalidadesProvider>
            <MedicamentosProvider>{children}</MedicamentosProvider>
          </ModalidadesProvider>
        </AcolhidosProvider>
      </FuncionariosProvider>
    </TriagensProvider>
  )
}
