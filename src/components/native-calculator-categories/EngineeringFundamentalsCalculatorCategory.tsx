import type {
  ReactNode,
} from 'react'

import { LinearInterpolationCalculator } from '../../features/engineering-fundamentals/linear-interpolation/LinearInterpolationCalculator'
import { PhaseTwelveNativeCalculator } from '../../features/native-migrations/phase-twelve/PhaseTwelveNativeCalculator'
import { WeightedAveragePropertyCalculator } from '../../features/engineering-fundamentals/weighted-average-property/WeightedAveragePropertyCalculator'

interface CategoryCalculatorProps {
  calculatorId: string
  title: string
}

type CategoryRenderer = (
  title: string,
) => ReactNode

const RENDERERS: Record<
  string,
  CategoryRenderer
> = {
"averageMolecularWeight": () => {
    const calculatorId = "averageMolecularWeight" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryCompositionBasisConversion": () => {
    const calculatorId = "binaryCompositionBasisConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"chemicalFormulaMolecularWeight": () => {
    const calculatorId = "chemicalFormulaMolecularWeight" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"densitySpecificGravity": () => {
    const calculatorId = "densitySpecificGravity" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"engineeringPrefixConverter": () => {
    const calculatorId = "engineeringPrefixConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"massFlowMolarFlowConversion": () => {
    const calculatorId = "massFlowMolarFlowConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"massFractionCalculator": () => {
    const calculatorId = "massFractionCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"massMoleConversion": () => {
    const calculatorId = "massMoleConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"mixtureDensityCalculator": () => {
    const calculatorId = "mixtureDensityCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"moleFractionCalculator": () => {
    const calculatorId = "moleFractionCalculator" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"concentrationScaleConverter": () => {
    const calculatorId = "concentrationScaleConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"significantFiguresRounding": () => {
    const calculatorId = "significantFiguresRounding" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"solutionConcentration": () => {
    const calculatorId = "solutionConcentration" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"standardGasFlowConverter": () => {
    const calculatorId = "standardGasFlowConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"unitConverter": () => {
    const calculatorId = "unitConverter" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"volumetricMassFlowConversion": () => {
    const calculatorId = "volumetricMassFlowConversion" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"linearInterpolationCalculator": () => {
    return <LinearInterpolationCalculator />
  },
"weightedAverageProperty": () => {
    return <WeightedAveragePropertyCalculator />
  },
}

export default function EngineeringFundamentalsCalculatorCategory({
  calculatorId,
  title,
}: CategoryCalculatorProps) {
  const renderer =
    RENDERERS[
      calculatorId
    ]

  if (!renderer) {
    return null
  }

  return renderer(
    title,
  )
}
