import type {
  ReactNode,
} from 'react'

import { DarcyWeisbachPipeDiameterSizingCalculator } from '../../../features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/DarcyWeisbachPipeDiameterSizingCalculator'
import { FlowNozzleDifferentialPressureCalculator } from '../../../features/fluid-mechanics/flow-nozzle-differential-pressure/FlowNozzleDifferentialPressureCalculator'
import { MaximumMinorLossCoefficientCalculator } from '../../../features/fluid-mechanics/maximum-minor-loss-coefficient/MaximumMinorLossCoefficientCalculator'
import { MaximumPipeLengthFromPressureDropCalculator } from '../../../features/fluid-mechanics/maximum-pipe-length-pressure-drop/MaximumPipeLengthFromPressureDropCalculator'
import { MaximumSuctionFlowRateNpshMarginCalculator } from '../../../features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/MaximumSuctionFlowRateNpshMarginCalculator'
import { MaximumSuctionLineLengthNpshMarginCalculator } from '../../../features/fluid-mechanics/maximum-suction-line-length-npsh-margin/MaximumSuctionLineLengthNpshMarginCalculator'
import { MinimumSuctionPipeDiameterNpshMarginCalculator } from '../../../features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/MinimumSuctionPipeDiameterNpshMarginCalculator'
import { NpshAvailableCavitationMarginCalculator } from '../../../features/fluid-mechanics/npsh-available-cavitation-margin/NpshAvailableCavitationMarginCalculator'
import { PipeFlowRateFromPressureDropCalculator } from '../../../features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/PipeFlowRateFromPressureDropCalculator'
import { PitotTubeVelocityFlowCalculator } from '../../../features/fluid-mechanics/pitot-tube-velocity-flow/PitotTubeVelocityFlowCalculator'
import { PriorityTenNativeCalculator } from '../../../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'
import { RequiredStaticLiquidLevelNpshMarginCalculator } from '../../../features/fluid-mechanics/required-static-liquid-level-npsh-margin/RequiredStaticLiquidLevelNpshMarginCalculator'
import { SecondFiveNativeCalculator } from '../../../features/native-migrations/second-five-native/SecondFiveNativeCalculator'
import { VariableAreaRotameterFlowCalculator } from '../../../features/fluid-mechanics/variable-area-rotameter-flow/VariableAreaRotameterFlowCalculator'
import { VortexSheddingFlowMeterCalculator } from '../../../features/fluid-mechanics/vortex-shedding-flow-meter/VortexSheddingFlowMeterCalculator'


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
"criticalDepth": () => {
    const calculatorId = "criticalDepth" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"flowRate": () => {
    const calculatorId = "flowRate" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"darcyWeisbachPipeDiameterSizing": () => {
    return <DarcyWeisbachPipeDiameterSizingCalculator />
  },
"pipeFlowRateFromPressureDrop": () => {
    return <PipeFlowRateFromPressureDropCalculator />
  },
"maximumPipeLengthFromPressureDrop": () => {
    return <MaximumPipeLengthFromPressureDropCalculator />
  },
"maximumMinorLossCoefficient": () => {
    return <MaximumMinorLossCoefficientCalculator />
  },
"npshAvailableCavitationMargin": () => {
    return <NpshAvailableCavitationMarginCalculator />
  },
"minimumSuctionPipeDiameterNpshMargin": () => {
    return <MinimumSuctionPipeDiameterNpshMarginCalculator />
  },
"requiredStaticLiquidLevelNpshMargin": () => {
    return <RequiredStaticLiquidLevelNpshMarginCalculator />
  },
"maximumSuctionFlowRateNpshMargin": () => {
    return <MaximumSuctionFlowRateNpshMarginCalculator />
  },
"maximumSuctionLineLengthNpshMargin": () => {
    return <MaximumSuctionLineLengthNpshMarginCalculator />
  },
"pitotTubeVelocityFlow": () => {
    return <PitotTubeVelocityFlowCalculator />
  },
"flowNozzleDifferentialPressure": () => {
    return <FlowNozzleDifferentialPressureCalculator />
  },
"variableAreaRotameterFlow": () => {
    return <VariableAreaRotameterFlowCalculator />
  },
"vortexSheddingFlowMeter": () => {
    return <VortexSheddingFlowMeterCalculator />
  },
}

export default function FluidMechanicsShard02({
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
