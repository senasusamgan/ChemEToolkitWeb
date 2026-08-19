import type {
  ReactNode,
} from 'react'

import { PhaseNineNativeCalculator } from '../../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseThirteenNativeCalculator } from '../../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { MinimumFluidizationVelocityCalculator } from '../../../features/fluid-mechanics/minimum-fluidization-velocity/MinimumFluidizationVelocityCalculator'
import { FluidizedBedPressureDropCalculator } from '../../../features/fluid-mechanics/fluidized-bed-pressure-drop-check/FluidizedBedPressureDropCalculator'
import { GeldartParticleClassificationCalculator } from '../../../features/fluid-mechanics/geldart-particle-classification/GeldartParticleClassificationCalculator'
import { FluidizedBedExpansionRichardsonZakiCalculator } from '../../../features/fluid-mechanics/fluidized-bed-expansion-richardson-zaki/FluidizedBedExpansionRichardsonZakiCalculator'
import { PriorityTenNativeCalculator } from '../../../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'

interface FluidMechanicsShardProps {
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
"dragForce": () => {
    const calculatorId = "dragForce" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"minorLosses": () => {
    const calculatorId = "minorLosses" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"orificeMeter": () => {
    const calculatorId = "orificeMeter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"particleSettling": () => {
    const calculatorId = "particleSettling" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"minimumFluidizationVelocity": () => {
    return (
      <MinimumFluidizationVelocityCalculator />
    )
  },
"fluidizedBedPressureDropCheck": () => {
    return (
      <FluidizedBedPressureDropCalculator />
    )
  },
"geldartParticleClassification": () => {
    return (
      <GeldartParticleClassificationCalculator />
    )
  },
"fluidizedBedExpansionRichardsonZaki": () => {
    return (
      <FluidizedBedExpansionRichardsonZakiCalculator />
    )
  },
"reynoldsNumber": () => {
    const calculatorId = "reynoldsNumber" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"tankDrainTime": () => {
    const calculatorId = "tankDrainTime" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"uTubeManometer": () => {
    const calculatorId = "uTubeManometer" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"venturiMeter": () => {
    const calculatorId = "venturiMeter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"pressureDrop": () => {
    const calculatorId = "pressureDrop" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"froudeNumber": () => {
    const calculatorId = "froudeNumber" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"hydrostaticPressure": () => {
    const calculatorId = "hydrostaticPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"openChannelFlow": () => {
    const calculatorId = "openChannelFlow" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"frictionFactor": () => {
    const calculatorId = "frictionFactor" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"pumpPower": () => {
    const calculatorId = "pumpPower" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"bernoulliEquation": () => {
    const calculatorId = "bernoulliEquation" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
}

export default function FluidMechanicsShard01({
  calculatorId,
  title,
}: FluidMechanicsShardProps) {
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
