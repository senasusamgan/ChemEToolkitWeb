import type {
  ReactNode,
} from 'react'

import { BroadCrestedWeirFlowCalculator } from '../../../features/fluid-mechanics/broad-crested-weir-flow/BroadCrestedWeirFlowCalculator'
import { ElectromagneticFlowMeterCalculator } from '../../../features/fluid-mechanics/electromagnetic-flow-meter/ElectromagneticFlowMeterCalculator'
import { PositiveDisplacementFlowMeterCalculator } from '../../../features/fluid-mechanics/positive-displacement-flow-meter/PositiveDisplacementFlowMeterCalculator'
import { RectangularChannelAlternateDepthCalculator } from '../../../features/fluid-mechanics/rectangular-channel-alternate-depth/RectangularChannelAlternateDepthCalculator'
import { RectangularHydraulicJumpCalculator } from '../../../features/fluid-mechanics/rectangular-hydraulic-jump/RectangularHydraulicJumpCalculator'
import { SharpCrestedRectangularWeirCalculator } from '../../../features/fluid-mechanics/sharp-crested-rectangular-weir/SharpCrestedRectangularWeirCalculator'
import { TrapezoidalChannelAlternateDepthCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-alternate-depth/TrapezoidalChannelAlternateDepthCalculator'
import { TrapezoidalChannelCriticalDepthCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-critical-depth/TrapezoidalChannelCriticalDepthCalculator'
import { TrapezoidalChannelCriticalSlopeCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-critical-slope/TrapezoidalChannelCriticalSlopeCalculator'
import { TrapezoidalChannelManningFlowCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-manning-flow/TrapezoidalChannelManningFlowCalculator'
import { TrapezoidalChannelNormalDepthCalculator } from '../../../features/fluid-mechanics/trapezoidal-channel-normal-depth/TrapezoidalChannelNormalDepthCalculator'
import { TrapezoidalHydraulicJumpCalculator } from '../../../features/fluid-mechanics/trapezoidal-hydraulic-jump/TrapezoidalHydraulicJumpCalculator'
import { TurbineFlowMeterCalculator } from '../../../features/fluid-mechanics/turbine-flow-meter/TurbineFlowMeterCalculator'
import { UltrasonicTransitTimeFlowMeterCalculator } from '../../../features/fluid-mechanics/ultrasonic-transit-time-flow-meter/UltrasonicTransitTimeFlowMeterCalculator'
import { VNotchTriangularWeirCalculator } from '../../../features/fluid-mechanics/v-notch-triangular-weir/VNotchTriangularWeirCalculator'

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
"ultrasonicTransitTimeFlowMeter": () => {
    return <UltrasonicTransitTimeFlowMeterCalculator />
  },
"electromagneticFlowMeter": () => {
    return <ElectromagneticFlowMeterCalculator />
  },
"positiveDisplacementFlowMeter": () => {
    return <PositiveDisplacementFlowMeterCalculator />
  },
"turbineFlowMeter": () => {
    return <TurbineFlowMeterCalculator />
  },
"sharpCrestedRectangularWeir": () => {
    return <SharpCrestedRectangularWeirCalculator />
  },
"vNotchTriangularWeir": () => {
    return <VNotchTriangularWeirCalculator />
  },
"trapezoidalChannelManningFlow": () => {
    return <TrapezoidalChannelManningFlowCalculator />
  },
"trapezoidalChannelNormalDepth": () => {
    return <TrapezoidalChannelNormalDepthCalculator />
  },
"rectangularHydraulicJump": () => {
    return <RectangularHydraulicJumpCalculator />
  },
"trapezoidalChannelCriticalDepth": () => {
    return <TrapezoidalChannelCriticalDepthCalculator />
  },
"rectangularChannelAlternateDepth": () => {
    return <RectangularChannelAlternateDepthCalculator />
  },
"trapezoidalChannelCriticalSlope": () => {
    return <TrapezoidalChannelCriticalSlopeCalculator />
  },
"trapezoidalHydraulicJump": () => {
    return <TrapezoidalHydraulicJumpCalculator />
  },
"broadCrestedWeirFlow": () => {
    return <BroadCrestedWeirFlowCalculator />
  },
"trapezoidalChannelAlternateDepth": () => {
    return <TrapezoidalChannelAlternateDepthCalculator />
  },
}

export default function FluidMechanicsShard03({
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
