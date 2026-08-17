import type {
  ReactNode,
} from 'react'

import { PartiallyFullCircularChannelAlternateDepthsCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-alternate-depths/PartiallyFullCircularChannelAlternateDepthsCalculator'
import { PartiallyFullCircularChannelCriticalDepthCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-critical-depth/PartiallyFullCircularChannelCriticalDepthCalculator'
import { PartiallyFullCircularChannelManningFlowCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-manning-flow/PartiallyFullCircularChannelManningFlowCalculator'
import { PartiallyFullCircularChannelNormalDepthCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-normal-depth/PartiallyFullCircularChannelNormalDepthCalculator'
import { TrapezoidalChannelAdaptiveStandardStepProfileCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/TrapezoidalChannelAdaptiveStandardStepProfileCalculator'
import { TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { TrapezoidalChannelStandardStepCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-standard-step/TrapezoidalChannelStandardStepCalculator'
import { TrapezoidalChannelStandardStepProfileCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-standard-step-profile/TrapezoidalChannelStandardStepProfileCalculator'
import { TrapezoidalChannelUpstreamStandardStepProfileCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/TrapezoidalChannelUpstreamStandardStepProfileCalculator'
import { TrapezoidalMaximumBedRiseContractionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/TrapezoidalMaximumBedRiseContractionLossCalculator'
import { TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator } from '../../../features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator'
import { TrapezoidalMinimumUpstreamDepthContractionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/TrapezoidalMinimumUpstreamDepthContractionLossCalculator'
import { TrapezoidalMinimumWidthBedRiseTransitionLossCalculator } from '../../../features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/TrapezoidalMinimumWidthBedRiseTransitionLossCalculator'

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
"trapezoidalMinimumUpstreamDepthContractionLoss": () => {
    return <TrapezoidalMinimumUpstreamDepthContractionLossCalculator />
  },
"trapezoidalMaximumBedRiseContractionLoss": () => {
    return <TrapezoidalMaximumBedRiseContractionLossCalculator />
  },
"trapezoidalMinimumWidthBedRiseTransitionLoss": () => {
    return <TrapezoidalMinimumWidthBedRiseTransitionLossCalculator />
  },
"trapezoidalMaximumDischargeBedRiseTransitionLoss": () => {
    return <TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator />
  },
"trapezoidalMaximumTransitionLossCoefficientBedRise": () => {
    return <TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator />
  },
"trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss": () => {
    return <TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator />
  },
"trapezoidalChannelStandardStep": () => {
    return <TrapezoidalChannelStandardStepCalculator />
  },
"trapezoidalChannelStandardStepProfile": () => {
    return <TrapezoidalChannelStandardStepProfileCalculator />
  },
"trapezoidalChannelAdaptiveStandardStepProfile": () => {
    return <TrapezoidalChannelAdaptiveStandardStepProfileCalculator />
  },
"trapezoidalChannelUpstreamStandardStepProfile": () => {
    return <TrapezoidalChannelUpstreamStandardStepProfileCalculator />
  },
"trapezoidalChannelAdaptiveUpstreamStandardStepProfile": () => {
    return <TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator />
  },
"partiallyFullCircularChannelManningFlow": () => {
    return <PartiallyFullCircularChannelManningFlowCalculator />
  },
"partiallyFullCircularChannelNormalDepth": () => {
    return <PartiallyFullCircularChannelNormalDepthCalculator />
  },
"partiallyFullCircularChannelCriticalDepth": () => {
    return <PartiallyFullCircularChannelCriticalDepthCalculator />
  },
"partiallyFullCircularChannelAlternateDepths": () => {
    return <PartiallyFullCircularChannelAlternateDepthsCalculator />
  },
}

export default function FluidMechanicsShard05({
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
