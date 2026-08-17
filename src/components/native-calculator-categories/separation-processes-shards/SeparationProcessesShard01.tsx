import type {
  ReactNode,
} from 'react'

import { BatchSettlingAreaEstimateCalculator } from '../../../features/separation-processes/batch-settling-area-estimate/BatchSettlingAreaEstimateCalculator'
import { CentrifugeSigmaScaleUpCalculator } from '../../../features/separation-processes/centrifuge-sigma-scale-up/CentrifugeSigmaScaleUpCalculator'
import { PhaseNineNativeCalculator } from '../../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseThirteenNativeCalculator } from '../../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'

interface SeparationProcessesShardProps {
  calculatorId: string
  title: string
}

type ShardRenderer = (
  title: string,
) => ReactNode

const RENDERERS: Record<
  string,
  ShardRenderer
> = {
"binaryIsothermalFlash": () => {
    const calculatorId = "binaryIsothermalFlash" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryMinimumReflux": () => {
    const calculatorId = "binaryMinimumReflux" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryRelativeVolatilityVLE": () => {
    const calculatorId = "binaryRelativeVolatilityVLE" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"cycloneCutDiameter": () => {
    const calculatorId = "cycloneCutDiameter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"fenskeMinimumStages": () => {
    const calculatorId = "fenskeMinimumStages" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"absorptionMinimumSolventRate": () => {
    const calculatorId = "absorptionMinimumSolventRate" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"murphreeTrayEfficiency": () => {
    const calculatorId = "murphreeTrayEfficiency" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"packedColumnHTUNTU": () => {
    const calculatorId = "packedColumnHTUNTU" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"psychrometricAirEnthalpy": () => {
    const calculatorId = "psychrometricAirEnthalpy" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"raoultBubblePointPressure": () => {
    const calculatorId = "raoultBubblePointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"raoultDewPointPressure": () => {
    const calculatorId = "raoultDewPointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"batchSettlingAreaEstimate": () => {
    return <BatchSettlingAreaEstimateCalculator />
  },
"centrifugeSigmaScaleUp": () => {
    return <CentrifugeSigmaScaleUpCalculator />
  },
}

export default function SeparationProcessesShard01({
  calculatorId,
  title,
}: SeparationProcessesShardProps) {
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
