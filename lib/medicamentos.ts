export interface Medicamento {
  id: string
  nome: string
  preco: number
}

export type MedicamentoFormValues = Pick<Medicamento, "nome" | "preco">

export function createSeedMedicamentos(): Medicamento[] {
  return [
    { id: "med-1", nome: "Paracetamol 500mg", preco: 12.9 },
    { id: "med-2", nome: "Amoxicilina 500mg", preco: 28.5 },
    { id: "med-3", nome: "Ibuprofeno 600mg", preco: 18.75 },
    { id: "med-4", nome: "Omeprazol 20mg", preco: 16.4 },
  ]
}