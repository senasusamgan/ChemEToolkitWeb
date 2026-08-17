import type {
  ReactNode,
} from 'react'

import { PartiallyFullCircularChannelAdaptiveGvfProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/PartiallyFullCircularChannelAdaptiveGvfProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { PartiallyFullCircularChannelCapacityChokingMarginCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/PartiallyFullCircularChannelCapacityChokingMarginCalculator'

import { PartiallyFullCircularChannelCriticalSlopeCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-critical-slope/PartiallyFullCircularChannelCriticalSlopeCalculator'
import { PartiallyFullCircularChannelDirectStepCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-direct-step/PartiallyFullCircularChannelDirectStepCalculator'
import { PartiallyFullCircularChannelGvfProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-gvf-profile/PartiallyFullCircularChannelGvfProfileCalculator'
import { PartiallyFullCircularChannelGvfSlopeCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-gvf-slope/PartiallyFullCircularChannelGvfSlopeCalculator'
import { PartiallyFullCircularChannelHydraulicJumpCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/PartiallyFullCircularChannelHydraulicJumpCalculator'
import { PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-minimum-diameter-specific-energy/PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-minimum-required-specific-energy/PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator'
import { PartiallyFullCircularChannelStandardStepCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-standard-step/PartiallyFullCircularChannelStandardStepCalculator'
import { PartiallyFullCircularChannelStandardStepProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/PartiallyFullCircularChannelStandardStepProfileCalculator'
import { PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator } from '../../../features/fluid-mechanics/partially-full-circular-channel-upstream-standard-step-profile/PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator'

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
"partiallyFullCircularChannelCriticalSlope": () => {
    return <PartiallyFullCircularChannelCriticalSlopeCalculator />
  },
"partiallyFullCircularChannelHydraulicJump": () => {
    return <PartiallyFullCircularChannelHydraulicJumpCalculator />
  },
"partiallyFullCircularChannelDirectStep": () => {
    return <PartiallyFullCircularChannelDirectStepCalculator />
  },
"partiallyFullCircularChannelGvfSlope": () => {
    return <PartiallyFullCircularChannelGvfSlopeCalculator />
  },
"partiallyFullCircularChannelGvfProfile": () => {
    return <PartiallyFullCircularChannelGvfProfileCalculator />
  },
"partiallyFullCircularChannelAdaptiveGvfProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveGvfProfileCalculator />
  },
"partiallyFullCircularChannelStandardStep": () => {
    return <PartiallyFullCircularChannelStandardStepCalculator />
  },
"partiallyFullCircularChannelStandardStepProfile": () => {
    return <PartiallyFullCircularChannelStandardStepProfileCalculator />
  },
"partiallyFullCircularChannelAdaptiveStandardStepProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator />
  },
"partiallyFullCircularChannelUpstreamStandardStepProfile": () => {
    return <PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator />
  },
"partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile": () => {
    return <PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator />
  },
"partiallyFullCircularChannelMaximumDischargeSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator />
  },
"partiallyFullCircularChannelMinimumDiameterSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator />
  },
"partiallyFullCircularChannelMinimumRequiredSpecificEnergy": () => {
    return <PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator />
  },
"partiallyFullCircularChannelCapacityChokingMargin": () => {
    return <PartiallyFullCircularChannelCapacityChokingMarginCalculator />
  },
}

export default function FluidMechanicsShard06({
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
