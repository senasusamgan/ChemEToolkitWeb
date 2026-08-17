import type {
  ReactNode,
} from 'react'

import { MostEconomicalTrapezoidalChannelCalculator } from '../../../features/fluid-mechanics/most-economical-trapezoidal-channel/MostEconomicalTrapezoidalChannelCalculator'
import { TrapezoidalChannelBedRiseCrestDepthCalculator } from '../../../features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/TrapezoidalChannelBedRiseCrestDepthCalculator'
import { TrapezoidalChannelChezyFlowCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-chezy-flow/TrapezoidalChannelChezyFlowCalculator'
import { TrapezoidalChannelDirectStepCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-direct-step/TrapezoidalChannelDirectStepCalculator'
import { TrapezoidalChannelGvfProfileRk4Calculator } from '../../../features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/TrapezoidalChannelGvfProfileRk4Calculator'
import { TrapezoidalChannelGvfSlopeCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-gvf-slope/TrapezoidalChannelGvfSlopeCalculator'
import { TrapezoidalContractionThroatAnalysisCalculator } from '../../../features/fluid-mechanics/trapezoidal-contraction-throat-analysis/TrapezoidalContractionThroatAnalysisCalculator'
import { TrapezoidalContractionTransitionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-contraction-transition-loss/TrapezoidalContractionTransitionLossCalculator'
import { TrapezoidalCriticalControlWidthCalculator } from '../../../features/fluid-mechanics/trapezoidal-critical-control-width/TrapezoidalCriticalControlWidthCalculator'
import { TrapezoidalMaximumBedRiseBeforeChokingCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-bed-rise-choking/TrapezoidalMaximumBedRiseBeforeChokingCalculator'
import { TrapezoidalMaximumDischargeSpecificEnergyCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/TrapezoidalMaximumDischargeSpecificEnergyCalculator'
import { TrapezoidalMaximumDischargeTransitionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/TrapezoidalMaximumDischargeTransitionLossCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/TrapezoidalMaximumTransitionLossCoefficientCalculator'
import { TrapezoidalMinimumContractionWidthCalculator } from '../../../features/fluid-mechanics/trapezoidal-min-contraction-width/TrapezoidalMinimumContractionWidthCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseCalculator } from '../../../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/TrapezoidalMinimumUpstreamDepthBedRiseCalculator'

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
"trapezoidalChannelChezyFlow": () => {
    return <TrapezoidalChannelChezyFlowCalculator />
  },
"mostEconomicalTrapezoidalChannelDesign": () => {
    return <MostEconomicalTrapezoidalChannelCalculator />
  },
"trapezoidalChannelDirectStep": () => {
    return <TrapezoidalChannelDirectStepCalculator />
  },
"trapezoidalChannelGvfSlope": () => {
    return <TrapezoidalChannelGvfSlopeCalculator />
  },
"trapezoidalChannelGvfProfileRk4": () => {
    return <TrapezoidalChannelGvfProfileRk4Calculator />
  },
"trapezoidalMaximumDischargeSpecificEnergy": () => {
    return <TrapezoidalMaximumDischargeSpecificEnergyCalculator />
  },
"trapezoidalCriticalControlWidth": () => {
    return <TrapezoidalCriticalControlWidthCalculator />
  },
"trapezoidalMaximumBedRiseBeforeChoking": () => {
    return <TrapezoidalMaximumBedRiseBeforeChokingCalculator />
  },
"trapezoidalChannelBedRiseCrestDepth": () => {
    return <TrapezoidalChannelBedRiseCrestDepthCalculator />
  },
"trapezoidalMinimumUpstreamDepthBedRise": () => {
    return <TrapezoidalMinimumUpstreamDepthBedRiseCalculator />
  },
"trapezoidalMinimumContractionWidth": () => {
    return <TrapezoidalMinimumContractionWidthCalculator />
  },
"trapezoidalContractionThroatAnalysis": () => {
    return <TrapezoidalContractionThroatAnalysisCalculator />
  },
"trapezoidalContractionTransitionLoss": () => {
    return <TrapezoidalContractionTransitionLossCalculator />
  },
"trapezoidalMaximumTransitionLossCoefficient": () => {
    return <TrapezoidalMaximumTransitionLossCoefficientCalculator />
  },
"trapezoidalMaximumDischargeTransitionLoss": () => {
    return <TrapezoidalMaximumDischargeTransitionLossCalculator />
  },
}

export default function FluidMechanicsShard04({
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
