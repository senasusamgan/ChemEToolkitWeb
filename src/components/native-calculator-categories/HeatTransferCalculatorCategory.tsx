import type {
  ReactNode,
} from 'react'

import { PhaseNineNativeCalculator } from '../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseTwelveNativeCalculator } from '../../features/native-migrations/phase-twelve/PhaseTwelveNativeCalculator'
import { PriorityTenNativeCalculator } from '../../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'
import { TopFiveNativeCalculator } from '../../features/native-migrations/top-five-native/TopFiveNativeCalculator'

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
"biotNumber": () => {
    const calculatorId = "biotNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"combinedConvectionRadiation": () => {
    const calculatorId = "combinedConvectionRadiation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"compositeWallConduction": () => {
    const calculatorId = "compositeWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"criticalRadiusOfInsulation": () => {
    const calculatorId = "criticalRadiusOfInsulation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"cylindricalWallConduction": () => {
    const calculatorId = "cylindricalWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"forcedConvectionCorrelation": () => {
    const calculatorId = "forcedConvectionCorrelation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"foulingAnalysis": () => {
    const calculatorId = "foulingAnalysis" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"fourierNumber": () => {
    const calculatorId = "fourierNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"grashofNumber": () => {
    const calculatorId = "grashofNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"naturalConvectionCorrelation": () => {
    const calculatorId = "naturalConvectionCorrelation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"nusseltNumber": () => {
    const calculatorId = "nusseltNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"planeWallConduction": () => {
    const calculatorId = "planeWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"prandtlNumber": () => {
    const calculatorId = "prandtlNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"rayleighNumber": () => {
    const calculatorId = "rayleighNumber" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"shellAndTubeHeatExchanger": () => {
    const calculatorId = "shellAndTubeHeatExchanger" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"sphericalWallConduction": () => {
    const calculatorId = "sphericalWallConduction" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"thermalRadiation": () => {
    const calculatorId = "thermalRadiation" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"thermalResistanceNetwork": () => {
    const calculatorId = "thermalResistanceNetwork" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"lumpedCapacitance": () => {
    const calculatorId = "lumpedCapacitance" as const
    return (
      <PhaseTwelveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"finHeatTransfer": () => {
    const calculatorId = "finHeatTransfer" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"heatExchangerLMTD": () => {
    const calculatorId = "heatExchangerLMTD" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"heatExchangerAreaSizing": () => {
    const calculatorId = "heatExchangerAreaSizing" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"heatExchangerEffectivenessNTU": () => {
    const calculatorId = "heatExchangerEffectivenessNTU" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"overallHeatTransferCoefficient": () => {
    const calculatorId = "overallHeatTransferCoefficient" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"boilingHeatTransfer": () => {
    const calculatorId = "boilingHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"condensationHeatTransfer": () => {
    const calculatorId = "condensationHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"convectionHeatTransfer": () => {
    const calculatorId = "convectionHeatTransfer" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"doublePipeHeatExchanger": () => {
    const calculatorId = "doublePipeHeatExchanger" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
}

export default function HeatTransferCalculatorCategory({
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
