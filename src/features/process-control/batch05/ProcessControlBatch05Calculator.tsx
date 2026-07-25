import { useState } from 'react'
import {
  ProcessControlBatch05CalculationError,
  calculateAdaptiveControl,
  calculateMIMODecoupling,
  calculateRatioControl,
  calculateSecondOrderFrequencyResponse,
  calculateSmithPredictor,
  calculateSplitRangeControl,
} from './engine'
import type {
  AdaptiveControlResult,
  MIMODecouplingResult,
  ProcessControlBatch05Mode,
  RatioControlResult,
  SecondOrderFrequencyResponseResult,
  SmithPredictorResult,
  SplitRangeControlResult,
} from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

interface Props {
  mode: ProcessControlBatch05Mode
}

type ProcessControlBatch05Result =
  | MIMODecouplingResult
  | AdaptiveControlResult
  | RatioControlResult
  | SecondOrderFrequencyResponseResult
  | SmithPredictorResult
  | SplitRangeControlResult

interface FieldDefinition {
  key: string
  label: string
  symbol: string
  unit: string
}

interface Definition {
  code: string
  icon: string
  title: string
  subtitle: string
  basis: string
  action: string
  headline: string
  fields: FieldDefinition[]
  example: Record<string, string>
}

const definitions: Record<
  ProcessControlBatch05Mode,
  Definition
> = {
  mimoDecouplingControl: {
    code: 'PC–25',
    icon: '2×2',
    title: '2×2 MIMO Decoupling',
    subtitle:
      'Steady-state decoupling, RGA and interaction screening',
    basis:
      'u = K⁻¹y and Λ = K ⊙ (K⁻¹)ᵀ',
    action: 'Analyze MIMO interaction',
    headline: 'Manipulated input 1',
    fields: [
      { key: 'k11', label: 'Process Gain 11', symbol: 'K₁₁', unit: '—' },
      { key: 'k12', label: 'Process Gain 12', symbol: 'K₁₂', unit: '—' },
      { key: 'k21', label: 'Process Gain 21', symbol: 'K₂₁', unit: '—' },
      { key: 'k22', label: 'Process Gain 22', symbol: 'K₂₂', unit: '—' },
      { key: 'outputTarget1', label: 'Output Target 1', symbol: 'y₁', unit: 'output' },
      { key: 'outputTarget2', label: 'Output Target 2', symbol: 'y₂', unit: 'output' },
    ],
    example: {
      k11: '2',
      k12: '0.4',
      k21: '0.3',
      k22: '1.5',
      outputTarget1: '5',
      outputTarget2: '3',
    },
  },
  adaptiveControl: {
    code: 'PC–26',
    icon: 'θ̂',
    title: 'Adaptive Control',
    subtitle:
      'One-step normalized gradient update for process gain and bias',
    basis:
      'θ̂ₖ₊₁ = θ̂ₖ + γΔt φe / (c + φᵀφ)',
    action: 'Update model parameters',
    headline: 'Updated gain estimate',
    fields: [
      { key: 'currentGainEstimate', label: 'Current Gain Estimate', symbol: 'K̂', unit: '—' },
      { key: 'currentBiasEstimate', label: 'Current Bias Estimate', symbol: 'b̂', unit: 'output' },
      { key: 'manipulatedInput', label: 'Manipulated Input', symbol: 'u', unit: 'input' },
      { key: 'measuredOutput', label: 'Measured Output', symbol: 'y', unit: 'output' },
      { key: 'adaptationGain', label: 'Adaptation Gain', symbol: 'γ', unit: '—' },
      { key: 'sampleTime', label: 'Sample Time', symbol: 'Δt', unit: 'time' },
      { key: 'normalizationConstant', label: 'Normalization Constant', symbol: 'c', unit: '—' },
    ],
    example: {
      currentGainEstimate: '1.5',
      currentBiasEstimate: '0.5',
      manipulatedInput: '4',
      measuredOutput: '8',
      adaptationGain: '0.8',
      sampleTime: '1',
      normalizationConstant: '1',
    },
  },
  ratioControl: {
    code: 'PC–27',
    icon: 'R',
    title: 'Ratio Control',
    subtitle:
      'Generate the controlled-flow setpoint from a wild-flow measurement',
    basis:
      'Fcontrolled,sp = R · Fwild',
    action: 'Calculate ratio control',
    headline: 'Controlled-flow setpoint',
    fields: [
      { key: 'wildFlow', label: 'Wild Flow', symbol: 'Fw', unit: 'flow' },
      { key: 'desiredRatio', label: 'Desired Ratio', symbol: 'R', unit: '—' },
      { key: 'measuredControlledFlow', label: 'Measured Controlled Flow', symbol: 'Fc', unit: 'flow' },
      { key: 'controllerGain', label: 'Controller Gain', symbol: 'Kc', unit: '%/flow' },
      { key: 'controllerBias', label: 'Controller Bias', symbol: 'ub', unit: '%' },
      { key: 'minimumOutput', label: 'Minimum Output', symbol: 'umin', unit: '%' },
      { key: 'maximumOutput', label: 'Maximum Output', symbol: 'umax', unit: '%' },
    ],
    example: {
      wildFlow: '100',
      desiredRatio: '0.6',
      measuredControlledFlow: '54',
      controllerGain: '2',
      controllerBias: '40',
      minimumOutput: '0',
      maximumOutput: '100',
    },
  },
  secondOrderFrequencyResponse: {
    code: 'PC–28',
    icon: 'ω₂',
    title: 'Second-Order Frequency Response',
    subtitle:
      'Magnitude, phase and resonance of a standard second-order process',
    basis:
      'G(jω) = Kωₙ² / (ωₙ² − ω² + j2ζωₙω)',
    action: 'Calculate frequency response',
    headline: 'Magnitude ratio',
    fields: [
      { key: 'processGain', label: 'Process Gain', symbol: 'K', unit: '—' },
      { key: 'naturalFrequency', label: 'Natural Frequency', symbol: 'ωn', unit: 'rad/s' },
      { key: 'dampingRatio', label: 'Damping Ratio', symbol: 'ζ', unit: '—' },
      { key: 'angularFrequency', label: 'Angular Frequency', symbol: 'ω', unit: 'rad/s' },
    ],
    example: {
      processGain: '2',
      naturalFrequency: '1.5',
      dampingRatio: '0.4',
      angularFrequency: '1',
    },
  },
  smithPredictor: {
    code: 'PC–29',
    icon: 'SP',
    title: 'Smith Predictor',
    subtitle:
      'Compare delay-free prediction, delayed model response and approximate actual output',
    basis:
      'The controller acts on a delay-free model while dead time is added outside the inner prediction',
    action: 'Analyze Smith predictor',
    headline: 'Approximate actual output',
    fields: [
      { key: 'actualProcessGain', label: 'Actual Process Gain', symbol: 'Kp', unit: '—' },
      { key: 'actualTimeConstant', label: 'Actual Time Constant', symbol: 'τp', unit: 'time' },
      { key: 'actualDeadTime', label: 'Actual Dead Time', symbol: 'θp', unit: 'time' },
      { key: 'modelProcessGain', label: 'Model Process Gain', symbol: 'Km', unit: '—' },
      { key: 'modelTimeConstant', label: 'Model Time Constant', symbol: 'τm', unit: 'time' },
      { key: 'modelDeadTime', label: 'Model Dead Time', symbol: 'θm', unit: 'time' },
      { key: 'controllerGain', label: 'Controller Gain', symbol: 'Kc', unit: '—' },
      { key: 'setpointStep', label: 'Setpoint Step', symbol: 'Δr', unit: 'output' },
      { key: 'evaluationTime', label: 'Evaluation Time', symbol: 't', unit: 'time' },
    ],
    example: {
      actualProcessGain: '2.2',
      actualTimeConstant: '8',
      actualDeadTime: '3',
      modelProcessGain: '2',
      modelTimeConstant: '7',
      modelDeadTime: '2.5',
      controllerGain: '1.5',
      setpointStep: '5',
      evaluationTime: '12',
    },
  },
  splitRangeControl: {
    code: 'PC–30',
    icon: '⇆',
    title: 'Split-Range Control',
    subtitle:
      'Map one controller demand across two final control elements',
    basis:
      'A configurable split point and overlap band determine both valve openings',
    action: 'Calculate split range',
    headline: 'First valve opening',
    fields: [
      { key: 'controllerDemandPercent', label: 'Controller Demand', symbol: 'u', unit: '%' },
      { key: 'splitPointPercent', label: 'Split Point', symbol: 'S', unit: '%' },
      { key: 'overlapBandPercent', label: 'Overlap Band', symbol: 'B', unit: '%' },
      { key: 'firstValveMinimumPercent', label: 'First Valve Minimum', symbol: 'V1,min', unit: '%' },
      { key: 'firstValveMaximumPercent', label: 'First Valve Maximum', symbol: 'V1,max', unit: '%' },
      { key: 'secondValveMinimumPercent', label: 'Second Valve Minimum', symbol: 'V2,min', unit: '%' },
      { key: 'secondValveMaximumPercent', label: 'Second Valve Maximum', symbol: 'V2,max', unit: '%' },
    ],
    example: {
      controllerDemandPercent: '52',
      splitPointPercent: '50',
      overlapBandPercent: '10',
      firstValveMinimumPercent: '0',
      firstValveMaximumPercent: '100',
      secondValveMinimumPercent: '0',
      secondValveMaximumPercent: '100',
    },
  },
}

export function ProcessControlBatch05Calculator({
  mode,
}: Props) {
  const definition = definitions[mode]
  const [values, setValues] = useState(
    definition.example,
  )
  const [result, setResult] =
    useState<ProcessControlBatch05Result | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function number(key: string): number {
    return Number(values[key])
  }

  function calculate() {
    try {
      let next: ProcessControlBatch05Result

      switch (mode) {
        case 'mimoDecouplingControl':
          next = calculateMIMODecoupling({
            k11: number('k11'),
            k12: number('k12'),
            k21: number('k21'),
            k22: number('k22'),
            outputTarget1: number('outputTarget1'),
            outputTarget2: number('outputTarget2'),
          })
          break
        case 'adaptiveControl':
          next = calculateAdaptiveControl({
            currentGainEstimate: number('currentGainEstimate'),
            currentBiasEstimate: number('currentBiasEstimate'),
            manipulatedInput: number('manipulatedInput'),
            measuredOutput: number('measuredOutput'),
            adaptationGain: number('adaptationGain'),
            sampleTime: number('sampleTime'),
            normalizationConstant: number('normalizationConstant'),
          })
          break
        case 'ratioControl':
          next = calculateRatioControl({
            wildFlow: number('wildFlow'),
            desiredRatio: number('desiredRatio'),
            measuredControlledFlow: number('measuredControlledFlow'),
            controllerGain: number('controllerGain'),
            controllerBias: number('controllerBias'),
            minimumOutput: number('minimumOutput'),
            maximumOutput: number('maximumOutput'),
          })
          break
        case 'secondOrderFrequencyResponse':
          next = calculateSecondOrderFrequencyResponse({
            processGain: number('processGain'),
            naturalFrequency: number('naturalFrequency'),
            dampingRatio: number('dampingRatio'),
            angularFrequency: number('angularFrequency'),
          })
          break
        case 'smithPredictor':
          next = calculateSmithPredictor({
            actualProcessGain: number('actualProcessGain'),
            actualTimeConstant: number('actualTimeConstant'),
            actualDeadTime: number('actualDeadTime'),
            modelProcessGain: number('modelProcessGain'),
            modelTimeConstant: number('modelTimeConstant'),
            modelDeadTime: number('modelDeadTime'),
            controllerGain: number('controllerGain'),
            setpointStep: number('setpointStep'),
            evaluationTime: number('evaluationTime'),
          })
          break
        case 'splitRangeControl':
          next = calculateSplitRangeControl({
            controllerDemandPercent: number('controllerDemandPercent'),
            splitPointPercent: number('splitPointPercent'),
            overlapBandPercent: number('overlapBandPercent'),
            firstValveMinimumPercent: number('firstValveMinimumPercent'),
            firstValveMaximumPercent: number('firstValveMaximumPercent'),
            secondValveMinimumPercent: number('secondValveMinimumPercent'),
            secondValveMaximumPercent: number('secondValveMaximumPercent'),
          })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessControlBatch05CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function rows(): Array<[string, unknown, string]> {
    if (!result) {
      return []
    }

    const resultRecord =
      result as unknown as Record<string, unknown>

    switch (mode) {
      case 'mimoDecouplingControl':
        return [
          ['Manipulated Input 2', resultRecord.manipulatedInput2, 'input'],
          ['Matrix Determinant', resultRecord.determinant, '—'],
          ['Relative Gain λ11', resultRecord.relativeGain11, '—'],
          ['Relative Gain λ12', resultRecord.relativeGain12, '—'],
          ['Condition Estimate', resultRecord.conditionEstimate, '—'],
          ['Interaction Index', resultRecord.interactionIndex, '—'],
        ]
      case 'adaptiveControl':
        return [
          ['Prediction Before Update', resultRecord.predictedOutputBeforeUpdate, 'output'],
          ['Prediction Error', resultRecord.predictionError, 'output'],
          ['Updated Bias Estimate', resultRecord.updatedBiasEstimate, 'output'],
          ['Prediction After Update', resultRecord.predictedOutputAfterUpdate, 'output'],
          ['Normalized Step', resultRecord.normalizedAdaptationStep, '—'],
        ]
      case 'ratioControl':
        return [
          ['Flow Error', resultRecord.flowError, 'flow'],
          ['Raw Controller Output', resultRecord.rawControllerOutput, '%'],
          ['Controller Output', resultRecord.controllerOutput, '%'],
          ['Actual Measured Ratio', resultRecord.actualMeasuredRatio, '—'],
          ['Output Limited', resultRecord.outputWasLimited ? 'Yes' : 'No', ''],
        ]
      case 'secondOrderFrequencyResponse':
        return [
          ['Magnitude', resultRecord.magnitudeDecibels, 'dB'],
          ['Phase', resultRecord.phaseDegrees, 'deg'],
          ['Real Part', resultRecord.realPart, '—'],
          ['Imaginary Part', resultRecord.imaginaryPart, '—'],
          ['Normalized Frequency', resultRecord.normalizedFrequency, '—'],
          ['Resonant Frequency', resultRecord.resonantFrequency ?? 'No resonance', 'rad/s'],
          ['Resonant Peak', resultRecord.resonantPeak ?? 'No resonance', '—'],
        ]
      case 'smithPredictor':
        return [
          ['Model Loop Gain', resultRecord.modelLoopGain, '—'],
          ['Nominal Closed-Loop Gain', resultRecord.nominalClosedLoopGain, '—'],
          ['Nominal Closed-Loop Time Constant', resultRecord.nominalClosedLoopTimeConstant, 'time'],
          ['Delay-Free Prediction', resultRecord.delayFreePrediction, 'output'],
          ['Delayed Model Prediction', resultRecord.delayedModelPrediction, 'output'],
          ['Model Mismatch', resultRecord.modelMismatch, 'output'],
          ['Effective Response Time', resultRecord.effectiveResponseTime, 'time'],
        ]
      case 'splitRangeControl':
        return [
          ['Second Valve Opening', resultRecord.secondValveOpeningPercent, '%'],
          ['Active Region', resultRecord.activeRegion, ''],
          ['Simultaneous Operation', resultRecord.simultaneousOperation ? 'Yes' : 'No', ''],
          ['First Valve Span Fraction', resultRecord.firstValveSpanFraction, '—'],
          ['Second Valve Span Fraction', resultRecord.secondValveSpanFraction, '—'],
        ]
    }
  }

  const headlineValue = (() => {
    if (!result) return ''

    const resultRecord =
      result as unknown as Record<string, unknown>

    switch (mode) {
      case 'mimoDecouplingControl':
        return resultRecord.manipulatedInput1
      case 'adaptiveControl':
        return resultRecord.updatedGainEstimate
      case 'ratioControl':
        return resultRecord.controlledFlowSetpoint
      case 'secondOrderFrequencyResponse':
        return resultRecord.magnitudeRatio
      case 'smithPredictor':
        return resultRecord.approximateActualOutput
      case 'splitRangeControl':
        return resultRecord.firstValveOpeningPercent
    }
  })()

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code={definition.code}
        icon={definition.icon}
        title={definition.title}
        subtitle={definition.subtitle}
      />

      <ReferenceBasis>
        {definition.basis}
      </ReferenceBasis>

      <div className="native-input-grid">
        {definition.fields.map((field) => (
          <NumericInput
            key={field.key}
            label={field.label}
            symbol={field.symbol}
            value={values[field.key] ?? ''}
            unit={field.unit}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                [field.key]: value,
              }))
            }
          />
        ))}
      </div>

      <ActionBar
        onLoadExample={() => {
          setValues(definition.example)
          setResult(null)
          setErrorMessage('')
        }}
        onClear={() => {
          setValues(
            Object.fromEntries(
              definition.fields.map((field) => [
                field.key,
                '',
              ]),
            ),
          )
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={
            typeof headlineValue === 'number'
              ? formatEngineeringNumber(headlineValue)
              : String(headlineValue)
          }
          modelName={definition.title}
          note="Engineering screening result. Validate assumptions, units, constraints and dynamic behavior before design use."
        >
          {rows().map(([label, value, unit]) => (
            <ResultItem
              key={label}
              label={label}
              value={
                typeof value === 'number'
                  ? formatEngineeringNumber(value)
                  : String(value)
              }
              unit={unit}
            />
          ))}
        </ResultPanel>
      ) : null}
    </section>
  )
}
