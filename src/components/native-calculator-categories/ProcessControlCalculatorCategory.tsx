import type {
  ReactNode,
} from 'react'

import { BlockDiagramAlgebraCalculator } from '../../features/process-control/block-diagram-algebra/BlockDiagramAlgebraCalculator'
import { CascadeControlCalculator } from '../../features/process-control/cascade-control/CascadeControlCalculator'
import { ClosedLoopFeedbackAnalysisCalculator } from '../../features/process-control/closed-loop-feedback-analysis/ClosedLoopFeedbackAnalysisCalculator'
import { CohenCoonTuningCalculator } from '../../features/process-control/cohen-coon-tuning/CohenCoonTuningCalculator'
import { CubicRouthHurwitzStabilityCalculator } from '../../features/process-control/cubic-routh-hurwitz-stability/CubicRouthHurwitzStabilityCalculator'
import { FeedforwardControlCalculator } from '../../features/process-control/feedforward-control/FeedforwardControlCalculator'
import { FirstOrderFrequencyResponseCalculator } from '../../features/process-control/first-order-frequency-response/FirstOrderFrequencyResponseCalculator'
import { GainSchedulingCalculator } from '../../features/process-control/gain-scheduling/GainSchedulingCalculator'
import { IntegratingProcessResponseCalculator } from '../../features/process-control/integrating-process-response/IntegratingProcessResponseCalculator'
import { InteractingTankSystemCalculator } from '../../features/process-control/interacting-tank-system/InteractingTankSystemCalculator'
import { InternalModelControlAnalysisCalculator } from '../../features/process-control/internal-model-control-analysis/InternalModelControlAnalysisCalculator'
import { OpenLoopResponseCalculator } from '../../features/process-control/open-loop-response/OpenLoopResponseCalculator'
import { OverrideSelectiveControlCalculator } from '../../features/process-control/override-selective-control/OverrideSelectiveControlCalculator'
import { PDControllerCalculator } from '../../features/process-control/pd-controller/PDControllerCalculator'
import { PIControllerCalculator } from '../../features/process-control/pi-controller/PIControllerCalculator'
import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PressureProcessDynamicsCalculator } from '../../features/process-control/pressure-process-dynamics/PressureProcessDynamicsCalculator'
import { ProcessControlBatch03Calculator } from '../../features/process-control/batch03/ProcessControlBatch03Calculator'
import { ProcessControlBatch05Calculator } from '../../features/process-control/batch05/ProcessControlBatch05Calculator'
import { ProcessControlBatch06Calculator } from '../../features/process-control/batch06/ProcessControlBatch06Calculator'
import { ProcessControlStrategyComparisonCalculator } from '../../features/process-control/process-control-strategy-comparison/ProcessControlStrategyComparisonCalculator'
import { ProportionalControllerCalculator } from '../../features/process-control/proportional-controller/ProportionalControllerCalculator'

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
"firstOrderPlusDeadTimeProcess": () => {
    const calculatorId = "firstOrderPlusDeadTimeProcess" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"firstOrderProcessResponse": () => {
    const calculatorId = "firstOrderProcessResponse" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"imcControllerTuning": () => {
    const calculatorId = "imcControllerTuning" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"pidController": () => {
    const calculatorId = "pidController" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"secondOrderProcessResponse": () => {
    const calculatorId = "secondOrderProcessResponse" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"zieglerNicholsReactionCurveTuning": () => {
    const calculatorId = "zieglerNicholsReactionCurveTuning" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"blockDiagramAlgebra": () => {
    return <BlockDiagramAlgebraCalculator />
  },
"cascadeControl": () => {
    return <CascadeControlCalculator />
  },
"closedLoopFeedbackAnalysis": () => {
    return <ClosedLoopFeedbackAnalysisCalculator />
  },
"cohenCoonTuning": () => {
    return <CohenCoonTuningCalculator />
  },
"processControlStrategyComparison": () => {
    return <ProcessControlStrategyComparisonCalculator />
  },
"cubicRouthHurwitzStability": () => {
    return <CubicRouthHurwitzStabilityCalculator />
  },
"feedforwardControl": () => {
    return <FeedforwardControlCalculator />
  },
"firstOrderFrequencyResponse": () => {
    return <FirstOrderFrequencyResponseCalculator />
  },
"gainScheduling": () => {
    return <GainSchedulingCalculator />
  },
"integratingProcessResponse": () => {
    return <IntegratingProcessResponseCalculator />
  },
"interactingTankSystem": () => {
    return <InteractingTankSystemCalculator />
  },
"internalModelControlAnalysis": () => {
    return <InternalModelControlAnalysisCalculator />
  },
"inverseLaplaceTransformHelper": () => {
    const calculatorId = "inverseLaplaceTransformHelper" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"laplaceTransformHelper": () => {
    const calculatorId = "laplaceTransformHelper" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"liquidControlValveSizing": () => {
    const calculatorId = "liquidControlValveSizing" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"liquidLevelDynamics": () => {
    const calculatorId = "liquidLevelDynamics" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"modelPredictiveControl": () => {
    const calculatorId = "modelPredictiveControl" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"nonInteractingTankSystem": () => {
    const calculatorId = "nonInteractingTankSystem" as const
    return <ProcessControlBatch03Calculator calculatorId={calculatorId as any} />
  },
"openLoopResponse": () => {
    return <OpenLoopResponseCalculator />
  },
"overrideSelectiveControl": () => {
    return <OverrideSelectiveControlCalculator />
  },
"pdController": () => {
    return <PDControllerCalculator />
  },
"piController": () => {
    return <PIControllerCalculator />
  },
"pressureProcessDynamics": () => {
    return <PressureProcessDynamicsCalculator />
  },
"proportionalController": () => {
    return <ProportionalControllerCalculator />
  },
"mimoDecouplingControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="mimoDecouplingControl" />
    )
  },
"adaptiveControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="adaptiveControl" />
    )
  },
"ratioControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="ratioControl" />
    )
  },
"secondOrderFrequencyResponse": () => {
    return (
      <ProcessControlBatch05Calculator mode="secondOrderFrequencyResponse" />
    )
  },
"smithPredictor": () => {
    return (
      <ProcessControlBatch05Calculator mode="smithPredictor" />
    )
  },
"splitRangeControl": () => {
    return (
      <ProcessControlBatch05Calculator mode="splitRangeControl" />
    )
  },
"temperatureProcessDynamics": () => {
    return (
      <ProcessControlBatch06Calculator mode="temperatureProcessDynamics" />
    )
  },
"transferFunctionBuilder": () => {
    return (
      <ProcessControlBatch06Calculator mode="transferFunctionBuilder" />
    )
  },
"valveCharacteristics": () => {
    return (
      <ProcessControlBatch06Calculator mode="valveCharacteristics" />
    )
  },
"zieglerNicholsUltimateGainTuning": () => {
    return (
      <ProcessControlBatch06Calculator mode="zieglerNicholsUltimateGain" />
    )
  },
}

export default function ProcessControlCalculatorCategory({
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
