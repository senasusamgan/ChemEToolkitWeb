import {
  lazy,
} from 'react'

import type {
  ComponentType,
  LazyExoticComponent,
} from 'react'

interface CategoryCalculatorProps {
  calculatorId: string
  title: string
}

type FluidMechanicsShardKey =
  | "shard-01"
  | "shard-02"
  | "shard-03"
  | "shard-04"
  | "shard-05"
  | "shard-06"

const SHARD_BY_CALCULATOR: Record<
  string,
  FluidMechanicsShardKey
> = {
  "dragForce": "shard-01",
  "minorLosses": "shard-01",
  "orificeMeter": "shard-01",
  "particleSettling": "shard-01",
  "minimumFluidizationVelocity": "shard-01",
  "fluidizedBedPressureDropCheck": "shard-01",
  "geldartParticleClassification": "shard-01",
  "fluidizedBedExpansionRichardsonZaki": "shard-01",
  "reynoldsNumber": "shard-01",
  "tankDrainTime": "shard-01",
  "uTubeManometer": "shard-01",
  "venturiMeter": "shard-01",
  "pressureDrop": "shard-01",
  "froudeNumber": "shard-01",
  "hydrostaticPressure": "shard-01",
  "openChannelFlow": "shard-01",
  "frictionFactor": "shard-01",
  "pumpPower": "shard-01",
  "bernoulliEquation": "shard-01",
  "criticalDepth": "shard-02",
  "flowRate": "shard-02",
  "darcyWeisbachPipeDiameterSizing": "shard-02",
  "pipeFlowRateFromPressureDrop": "shard-02",
  "maximumPipeLengthFromPressureDrop": "shard-02",
  "maximumMinorLossCoefficient": "shard-02",
  "npshAvailableCavitationMargin": "shard-02",
  "minimumSuctionPipeDiameterNpshMargin": "shard-02",
  "requiredStaticLiquidLevelNpshMargin": "shard-02",
  "maximumSuctionFlowRateNpshMargin": "shard-02",
  "maximumSuctionLineLengthNpshMargin": "shard-02",
  "pitotTubeVelocityFlow": "shard-02",
  "flowNozzleDifferentialPressure": "shard-02",
  "variableAreaRotameterFlow": "shard-02",
  "vortexSheddingFlowMeter": "shard-02",
  "ultrasonicTransitTimeFlowMeter": "shard-03",
  "electromagneticFlowMeter": "shard-03",
  "positiveDisplacementFlowMeter": "shard-03",
  "turbineFlowMeter": "shard-03",
  "sharpCrestedRectangularWeir": "shard-03",
  "vNotchTriangularWeir": "shard-03",
  "trapezoidalChannelManningFlow": "shard-03",
  "trapezoidalChannelNormalDepth": "shard-03",
  "rectangularHydraulicJump": "shard-03",
  "trapezoidalChannelCriticalDepth": "shard-03",
  "rectangularChannelAlternateDepth": "shard-03",
  "trapezoidalChannelCriticalSlope": "shard-03",
  "trapezoidalHydraulicJump": "shard-03",
  "broadCrestedWeirFlow": "shard-03",
  "trapezoidalChannelAlternateDepth": "shard-03",
  "trapezoidalChannelChezyFlow": "shard-04",
  "mostEconomicalTrapezoidalChannelDesign": "shard-04",
  "trapezoidalChannelDirectStep": "shard-04",
  "trapezoidalChannelGvfSlope": "shard-04",
  "trapezoidalChannelGvfProfileRk4": "shard-04",
  "trapezoidalMaximumDischargeSpecificEnergy": "shard-04",
  "trapezoidalCriticalControlWidth": "shard-04",
  "trapezoidalMaximumBedRiseBeforeChoking": "shard-04",
  "trapezoidalChannelBedRiseCrestDepth": "shard-04",
  "trapezoidalMinimumUpstreamDepthBedRise": "shard-04",
  "trapezoidalMinimumContractionWidth": "shard-04",
  "trapezoidalContractionThroatAnalysis": "shard-04",
  "trapezoidalContractionTransitionLoss": "shard-04",
  "trapezoidalMaximumTransitionLossCoefficient": "shard-04",
  "trapezoidalMaximumDischargeTransitionLoss": "shard-04",
  "trapezoidalMinimumUpstreamDepthContractionLoss": "shard-05",
  "trapezoidalMaximumBedRiseContractionLoss": "shard-05",
  "trapezoidalMinimumWidthBedRiseTransitionLoss": "shard-05",
  "trapezoidalMaximumDischargeBedRiseTransitionLoss": "shard-05",
  "trapezoidalMaximumTransitionLossCoefficientBedRise": "shard-05",
  "trapezoidalMinimumUpstreamDepthBedRiseTransitionLoss": "shard-05",
  "trapezoidalChannelStandardStep": "shard-05",
  "trapezoidalChannelStandardStepProfile": "shard-05",
  "trapezoidalChannelAdaptiveStandardStepProfile": "shard-05",
  "trapezoidalChannelUpstreamStandardStepProfile": "shard-05",
  "trapezoidalChannelAdaptiveUpstreamStandardStepProfile": "shard-05",
  "partiallyFullCircularChannelManningFlow": "shard-05",
  "partiallyFullCircularChannelNormalDepth": "shard-05",
  "partiallyFullCircularChannelCriticalDepth": "shard-05",
  "partiallyFullCircularChannelAlternateDepths": "shard-05",
  "partiallyFullCircularChannelCriticalSlope": "shard-06",
  "partiallyFullCircularChannelHydraulicJump": "shard-06",
  "partiallyFullCircularChannelDirectStep": "shard-06",
  "partiallyFullCircularChannelGvfSlope": "shard-06",
  "partiallyFullCircularChannelGvfProfile": "shard-06",
  "partiallyFullCircularChannelAdaptiveGvfProfile": "shard-06",
  "partiallyFullCircularChannelStandardStep": "shard-06",
  "partiallyFullCircularChannelStandardStepProfile": "shard-06",
  "partiallyFullCircularChannelAdaptiveStandardStepProfile": "shard-06",
  "partiallyFullCircularChannelUpstreamStandardStepProfile": "shard-06",
  "partiallyFullCircularChannelAdaptiveUpstreamStandardStepProfile": "shard-06",
  "partiallyFullCircularChannelMaximumDischargeSpecificEnergy": "shard-06",
  "partiallyFullCircularChannelMinimumDiameterSpecificEnergy": "shard-06",
  "partiallyFullCircularChannelMinimumRequiredSpecificEnergy": "shard-06",
  "partiallyFullCircularChannelCapacityChokingMargin": "shard-06",
}

const LazyFluidMechanicsShard01 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard01'
      ),
  )
const LazyFluidMechanicsShard02 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard02'
      ),
  )
const LazyFluidMechanicsShard03 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard03'
      ),
  )
const LazyFluidMechanicsShard04 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard04'
      ),
  )
const LazyFluidMechanicsShard05 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard05'
      ),
  )
const LazyFluidMechanicsShard06 =
  lazy(
    () =>
      import(
        './fluid-mechanics-shards/FluidMechanicsShard06'
      ),
  )

const SHARDS: Record<
  FluidMechanicsShardKey,
  LazyExoticComponent<
    ComponentType<
      CategoryCalculatorProps
    >
  >
> = {
  "shard-01": LazyFluidMechanicsShard01,
  "shard-02": LazyFluidMechanicsShard02,
  "shard-03": LazyFluidMechanicsShard03,
  "shard-04": LazyFluidMechanicsShard04,
  "shard-05": LazyFluidMechanicsShard05,
  "shard-06": LazyFluidMechanicsShard06,
}

export default function FluidMechanicsCalculatorCategory({
  calculatorId,
  title,
}: CategoryCalculatorProps) {
  const shardKey =
    SHARD_BY_CALCULATOR[
      calculatorId
    ]

  if (!shardKey) {
    return null
  }

  const Shard =
    SHARDS[
      shardKey
    ]

  return (
    <Shard
      calculatorId={calculatorId}
      title={title}
    />
  )
}
