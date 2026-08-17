import type {
  ReactNode,
} from 'react'

import { BroadCrestedWeirFlowCalculator } from '../../features/fluid-mechanics/broad-crested-weir-flow/BroadCrestedWeirFlowCalculator'
import { DarcyWeisbachPipeDiameterSizingCalculator } from '../../features/fluid-mechanics/darcy-weisbach-pipe-diameter-sizing/DarcyWeisbachPipeDiameterSizingCalculator'
import { ElectromagneticFlowMeterCalculator } from '../../features/fluid-mechanics/electromagnetic-flow-meter/ElectromagneticFlowMeterCalculator'
import { FlowNozzleDifferentialPressureCalculator } from '../../features/fluid-mechanics/flow-nozzle-differential-pressure/FlowNozzleDifferentialPressureCalculator'
import { MaximumMinorLossCoefficientCalculator } from '../../features/fluid-mechanics/maximum-minor-loss-coefficient/MaximumMinorLossCoefficientCalculator'
import { MaximumPipeLengthFromPressureDropCalculator } from '../../features/fluid-mechanics/maximum-pipe-length-pressure-drop/MaximumPipeLengthFromPressureDropCalculator'
import { MaximumSuctionFlowRateNpshMarginCalculator } from '../../features/fluid-mechanics/maximum-suction-flow-rate-npsh-margin/MaximumSuctionFlowRateNpshMarginCalculator'
import { MaximumSuctionLineLengthNpshMarginCalculator } from '../../features/fluid-mechanics/maximum-suction-line-length-npsh-margin/MaximumSuctionLineLengthNpshMarginCalculator'
import { MinimumSuctionPipeDiameterNpshMarginCalculator } from '../../features/fluid-mechanics/minimum-suction-pipe-diameter-npsh-margin/MinimumSuctionPipeDiameterNpshMarginCalculator'
import { MostEconomicalTrapezoidalChannelCalculator } from '../../features/fluid-mechanics/most-economical-trapezoidal-channel/MostEconomicalTrapezoidalChannelCalculator'
import { NpshAvailableCavitationMarginCalculator } from '../../features/fluid-mechanics/npsh-available-cavitation-margin/NpshAvailableCavitationMarginCalculator'
import { PartiallyFullCircularChannelAdaptiveGvfProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-adaptive-gvf-profile/PartiallyFullCircularChannelAdaptiveGvfProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-adaptive-standard-step-profile/PartiallyFullCircularChannelAdaptiveStandardStepProfileCalculator'
import { PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-adaptive-upstream-standard-step-profile/PartiallyFullCircularChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { PartiallyFullCircularChannelAlternateDepthsCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-alternate-depths/PartiallyFullCircularChannelAlternateDepthsCalculator'
import { PartiallyFullCircularChannelCapacityChokingMarginCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-capacity-choking-margin/PartiallyFullCircularChannelCapacityChokingMarginCalculator'

import { PartiallyFullCircularChannelCriticalDepthCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-critical-depth/PartiallyFullCircularChannelCriticalDepthCalculator'
import { PartiallyFullCircularChannelCriticalSlopeCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-critical-slope/PartiallyFullCircularChannelCriticalSlopeCalculator'
import { PartiallyFullCircularChannelDirectStepCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-direct-step/PartiallyFullCircularChannelDirectStepCalculator'
import { PartiallyFullCircularChannelGvfProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-gvf-profile/PartiallyFullCircularChannelGvfProfileCalculator'
import { PartiallyFullCircularChannelGvfSlopeCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-gvf-slope/PartiallyFullCircularChannelGvfSlopeCalculator'
import { PartiallyFullCircularChannelHydraulicJumpCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-hydraulic-jump/PartiallyFullCircularChannelHydraulicJumpCalculator'
import { PartiallyFullCircularChannelManningFlowCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-manning-flow/PartiallyFullCircularChannelManningFlowCalculator'
import { PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-maximum-discharge-specific-energy/PartiallyFullCircularChannelMaximumDischargeSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-minimum-diameter-specific-energy/PartiallyFullCircularChannelMinimumDiameterSpecificEnergyCalculator'
import { PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-minimum-required-specific-energy/PartiallyFullCircularChannelMinimumRequiredSpecificEnergyCalculator'
import { PartiallyFullCircularChannelNormalDepthCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-normal-depth/PartiallyFullCircularChannelNormalDepthCalculator'
import { PartiallyFullCircularChannelStandardStepCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-standard-step/PartiallyFullCircularChannelStandardStepCalculator'
import { PartiallyFullCircularChannelStandardStepProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-standard-step-profile/PartiallyFullCircularChannelStandardStepProfileCalculator'
import { PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator } from '../../features/fluid-mechanics/partially-full-circular-channel-upstream-standard-step-profile/PartiallyFullCircularChannelUpstreamStandardStepProfileCalculator'
import { PhaseNineNativeCalculator } from '../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PipeFlowRateFromPressureDropCalculator } from '../../features/fluid-mechanics/pipe-flow-rate-from-pressure-drop/PipeFlowRateFromPressureDropCalculator'
import { PitotTubeVelocityFlowCalculator } from '../../features/fluid-mechanics/pitot-tube-velocity-flow/PitotTubeVelocityFlowCalculator'
import { PositiveDisplacementFlowMeterCalculator } from '../../features/fluid-mechanics/positive-displacement-flow-meter/PositiveDisplacementFlowMeterCalculator'
import { PriorityTenNativeCalculator } from '../../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'
import { RectangularChannelAlternateDepthCalculator } from '../../features/fluid-mechanics/rectangular-channel-alternate-depth/RectangularChannelAlternateDepthCalculator'
import { RectangularHydraulicJumpCalculator } from '../../features/fluid-mechanics/rectangular-hydraulic-jump/RectangularHydraulicJumpCalculator'
import { RequiredStaticLiquidLevelNpshMarginCalculator } from '../../features/fluid-mechanics/required-static-liquid-level-npsh-margin/RequiredStaticLiquidLevelNpshMarginCalculator'
import { SecondFiveNativeCalculator } from '../../features/native-migrations/second-five-native/SecondFiveNativeCalculator'
import { SharpCrestedRectangularWeirCalculator } from '../../features/fluid-mechanics/sharp-crested-rectangular-weir/SharpCrestedRectangularWeirCalculator'
import { TrapezoidalChannelAdaptiveStandardStepProfileCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-adaptive-standard-step-profile/TrapezoidalChannelAdaptiveStandardStepProfileCalculator'
import { TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-adaptive-upstream-standard-step-profile/TrapezoidalChannelAdaptiveUpstreamStandardStepProfileCalculator'
import { TrapezoidalChannelAlternateDepthCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-alternate-depth/TrapezoidalChannelAlternateDepthCalculator'
import { TrapezoidalChannelBedRiseCrestDepthCalculator } from '../../features/fluid-mechanics/trapezoidal-bed-rise-crest-depth/TrapezoidalChannelBedRiseCrestDepthCalculator'
import { TrapezoidalChannelChezyFlowCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-chezy-flow/TrapezoidalChannelChezyFlowCalculator'
import { TrapezoidalChannelCriticalDepthCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-critical-depth/TrapezoidalChannelCriticalDepthCalculator'
import { TrapezoidalChannelCriticalSlopeCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-critical-slope/TrapezoidalChannelCriticalSlopeCalculator'
import { TrapezoidalChannelDirectStepCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-direct-step/TrapezoidalChannelDirectStepCalculator'
import { TrapezoidalChannelGvfProfileRk4Calculator } from '../../features/fluid-mechanics/trapezoidal-channel-gvf-profile-rk4/TrapezoidalChannelGvfProfileRk4Calculator'
import { TrapezoidalChannelGvfSlopeCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-gvf-slope/TrapezoidalChannelGvfSlopeCalculator'
import { TrapezoidalChannelManningFlowCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-manning-flow/TrapezoidalChannelManningFlowCalculator'
import { TrapezoidalChannelNormalDepthCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-normal-depth/TrapezoidalChannelNormalDepthCalculator'
import { TrapezoidalChannelStandardStepCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-standard-step/TrapezoidalChannelStandardStepCalculator'
import { TrapezoidalChannelStandardStepProfileCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-standard-step-profile/TrapezoidalChannelStandardStepProfileCalculator'
import { TrapezoidalChannelUpstreamStandardStepProfileCalculator } from '../../features/fluid-mechanics/trapezoidal-channel-upstream-standard-step-profile/TrapezoidalChannelUpstreamStandardStepProfileCalculator'
import { TrapezoidalContractionThroatAnalysisCalculator } from '../../features/fluid-mechanics/trapezoidal-contraction-throat-analysis/TrapezoidalContractionThroatAnalysisCalculator'
import { TrapezoidalContractionTransitionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-contraction-transition-loss/TrapezoidalContractionTransitionLossCalculator'
import { TrapezoidalCriticalControlWidthCalculator } from '../../features/fluid-mechanics/trapezoidal-critical-control-width/TrapezoidalCriticalControlWidthCalculator'
import { TrapezoidalHydraulicJumpCalculator } from '../../features/fluid-mechanics/trapezoidal-hydraulic-jump/TrapezoidalHydraulicJumpCalculator'
import { TrapezoidalMaximumBedRiseBeforeChokingCalculator } from '../../features/fluid-mechanics/trapezoidal-max-bed-rise-choking/TrapezoidalMaximumBedRiseBeforeChokingCalculator'
import { TrapezoidalMaximumBedRiseContractionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-max-bed-rise-contraction-loss/TrapezoidalMaximumBedRiseContractionLossCalculator'
import { TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-max-discharge-bed-rise-transition-loss/TrapezoidalMaximumDischargeBedRiseTransitionLossCalculator'
import { TrapezoidalMaximumDischargeSpecificEnergyCalculator } from '../../features/fluid-mechanics/trapezoidal-max-discharge-specific-energy/TrapezoidalMaximumDischargeSpecificEnergyCalculator'
import { TrapezoidalMaximumDischargeTransitionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-max-discharge-transition-loss/TrapezoidalMaximumDischargeTransitionLossCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator } from '../../features/fluid-mechanics/trapezoidal-max-transition-loss-bed-rise/TrapezoidalMaximumTransitionLossCoefficientBedRiseCalculator'
import { TrapezoidalMaximumTransitionLossCoefficientCalculator } from '../../features/fluid-mechanics/trapezoidal-max-transition-loss-coefficient/TrapezoidalMaximumTransitionLossCoefficientCalculator'
import { TrapezoidalMinimumContractionWidthCalculator } from '../../features/fluid-mechanics/trapezoidal-min-contraction-width/TrapezoidalMinimumContractionWidthCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseCalculator } from '../../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise/TrapezoidalMinimumUpstreamDepthBedRiseCalculator'
import { TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-min-upstream-depth-bed-rise-transition-loss/TrapezoidalMinimumUpstreamDepthBedRiseTransitionLossCalculator'
import { TrapezoidalMinimumUpstreamDepthContractionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-min-upstream-depth-contraction-loss/TrapezoidalMinimumUpstreamDepthContractionLossCalculator'
import { TrapezoidalMinimumWidthBedRiseTransitionLossCalculator } from '../../features/fluid-mechanics/trapezoidal-min-width-bed-rise-transition-loss/TrapezoidalMinimumWidthBedRiseTransitionLossCalculator'
import { TurbineFlowMeterCalculator } from '../../features/fluid-mechanics/turbine-flow-meter/TurbineFlowMeterCalculator'
import { UltrasonicTransitTimeFlowMeterCalculator } from '../../features/fluid-mechanics/ultrasonic-transit-time-flow-meter/UltrasonicTransitTimeFlowMeterCalculator'
import { VNotchTriangularWeirCalculator } from '../../features/fluid-mechanics/v-notch-triangular-weir/VNotchTriangularWeirCalculator'
import { VariableAreaRotameterFlowCalculator } from '../../features/fluid-mechanics/variable-area-rotameter-flow/VariableAreaRotameterFlowCalculator'
import { VortexSheddingFlowMeterCalculator } from '../../features/fluid-mechanics/vortex-shedding-flow-meter/VortexSheddingFlowMeterCalculator'

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

export default function FluidMechanicsCalculatorCategory({
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
