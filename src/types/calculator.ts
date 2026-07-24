export interface CalculatorDefinition {
  id: string
  title: string
  category: string
  available: boolean
}

export interface CategoryDefinition {
  number: number
  name: string
  icon: string
  total: number
  live: number
}
