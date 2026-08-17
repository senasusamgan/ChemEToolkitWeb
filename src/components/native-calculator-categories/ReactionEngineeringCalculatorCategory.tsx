import type {
  ReactNode,
} from 'react'

import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { ReactionEngineeringBatch01Calculator } from '../../features/reaction-engineering/batch01/ReactionEngineeringBatch01Calculator'
import { ReactionEngineeringBatch02Calculator } from '../../features/reaction-engineering/batch02/ReactionEngineeringBatch02Calculator'
import { ReactionEngineeringBatch03Calculator } from '../../features/reaction-engineering/batch03/ReactionEngineeringBatch03Calculator'
import { ReactionEngineeringBatch04Calculator } from '../../features/reaction-engineering/batch04/ReactionEngineeringBatch04Calculator'
import { ReactionEngineeringBatch05Calculator } from '../../features/reaction-engineering/batch05/ReactionEngineeringBatch05Calculator'
import { ReactionEngineeringBatch06Calculator } from '../../features/reaction-engineering/batch06/ReactionEngineeringBatch06Calculator'
import { ReactionEngineeringBatch07Calculator } from '../../features/reaction-engineering/batch07/ReactionEngineeringBatch07Calculator'
import { ReactionEngineeringBatch08Calculator } from '../../features/reaction-engineering/batch08/ReactionEngineeringBatch08Calculator'
import { ReactionEngineeringBatch09Calculator } from '../../features/reaction-engineering/batch09/ReactionEngineeringBatch09Calculator'
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
"arrheniusRateConstant": () => {
    const calculatorId = "arrheniusRateConstant" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"constantVolumeStoichiometry": () => {
    const calculatorId = "constantVolumeStoichiometry" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"conversionYieldSelectivity": () => {
    const calculatorId = "conversionYieldSelectivity" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"cstrsInSeries": () => {
    const calculatorId = "cstrsInSeries" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"pfrSections": () => {
    const calculatorId = "pfrSections" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reactionRateCalculator": () => {
    const calculatorId = "reactionRateCalculator" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reactorComparison": () => {
    const calculatorId = "reactorComparison" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reactorDesign": () => {
    const calculatorId = "reactorDesign" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"spaceTimeSpaceVelocity": () => {
    const calculatorId = "spaceTimeSpaceVelocity" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"activationEnergyTwoPoint": () => {
    const calculatorId = "activationEnergyTwoPoint" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"adiabaticBatchReactor": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticBatchReactor" />
    )
  },
"adiabaticCSTR": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticCSTR" />
    )
  },
"adiabaticPFR": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="adiabaticPFR" />
    )
  },
"autocatalyticBatchReactor": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="autocatalyticBatchReactor" />
    )
  },
"axialDispersionRTD": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="axialDispersionRTD" />
    )
  },
"bypassFractionEstimator": () => {
    return (
      <ReactionEngineeringBatch01Calculator mode="bypassFractionEstimator" />
    )
  },
"bypassDeadVolumeReactor": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="bypassDeadVolumeReactor" />
    )
  },
"catalystDeactivationKinetics": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystDeactivationKinetics" />
    )
  },
"catalystRegenerationCycle": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystRegenerationCycle" />
    )
  },
"catalystTimeOnStream": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystTimeOnStream" />
    )
  },
"catalystWeightFromRateData": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="catalystWeightFromRateData" />
    )
  },
"conversionFromRTD": () => {
    return (
      <ReactionEngineeringBatch02Calculator mode="conversionFromRTD" />
    )
  },
"cstrPFRSequence": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="cstrPFRSequence" />
    )
  },
"deactivatingPackedBedReactor": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="deactivatingPackedBedReactor" />
    )
  },
"deadVolumeEstimator": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="deadVolumeEstimator" />
    )
  },
"eCurveGenerator": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="eCurveGenerator" />
    )
  },
"economicReactorSelection": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="economicReactorSelection" />
    )
  },
"enzymeBatchReactor": () => {
    return (
      <ReactionEngineeringBatch03Calculator mode="enzymeBatchReactor" />
    )
  },
"equilibriumConversion": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="equilibriumConversion" />
    )
  },
"fCurveGenerator": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="fCurveGenerator" />
    )
  },
"heatExchangeBatchReactor": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangeBatchReactor" />
    )
  },
"heatExchangeCSTR": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangeCSTR" />
    )
  },
"heatExchangePFR": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="heatExchangePFR" />
    )
  },
"immobilizedEnzymeReactor": () => {
    return (
      <ReactionEngineeringBatch04Calculator mode="immobilizedEnzymeReactor" />
    )
  },
"levenspielPlotSizing": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="levenspielPlotSizing" />
    )
  },
"membraneReactor": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="membraneReactor" />
    )
  },
"michaelisMentenReactor": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="michaelisMentenReactor" />
    )
  },
"monodBioreactorDesign": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="monodBioreactorDesign" />
    )
  },
"multipleReactionsCSTR": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="multipleReactionsCSTR" />
    )
  },
"multipleReactionsPFR": () => {
    return (
      <ReactionEngineeringBatch05Calculator mode="multipleReactionsPFR" />
    )
  },
"nonIsothermalCSTRSteadyStates": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="nonIsothermalCSTRSteadyStates" />
    )
  },
"packedBedPressureDrop": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="packedBedPressureDrop" />
    )
  },
"packedBedReactorDesign": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="packedBedReactorDesign" />
    )
  },
"parallelReactions": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="parallelReactions" />
    )
  },
"pbrPressureDropEffects": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="pbrPressureDropEffects" />
    )
  },
"rateConstantCalculation": () => {
    return (
      <ReactionEngineeringBatch06Calculator mode="rateConstantCalculation" />
    )
  },
"rateConstantTemperatureShift": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="rateConstantTemperatureShift" />
    )
  },
"rateLawBuilder": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="rateLawBuilder" />
    )
  },
"reactionOrderDetermination": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactionOrderDetermination" />
    )
  },
"reactiveDistillationBasics": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactiveDistillationBasics" />
    )
  },
"reactorOptimization": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="reactorOptimization" />
    )
  },
"recyclePFR": () => {
    return (
      <ReactionEngineeringBatch07Calculator mode="recyclePFR" />
    )
  },
"reversibleReactions": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="reversibleReactions" />
    )
  },
"rtdModelComparison": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="rtdModelComparison" />
    )
  },
"rtdMoments": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="rtdMoments" />
    )
  },
"segregationModelConversion": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="segregationModelConversion" />
    )
  },
"semibatchReactor": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="semibatchReactor" />
    )
  },
"seriesReactions": () => {
    return (
      <ReactionEngineeringBatch08Calculator mode="seriesReactions" />
    )
  },
"seriesParallelReactions": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="seriesParallelReactions" />
    )
  },
"stepResponseRTDAnalysis": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="stepResponseRTDAnalysis" />
    )
  },
"tanksInSeriesRTD": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="tanksInSeriesRTD" />
    )
  },
"arrheniusThreePointFit": () => {
    return (
      <ReactionEngineeringBatch09Calculator mode="arrheniusThreePointFit" />
    )
  },
}

export default function ReactionEngineeringCalculatorCategory({
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
