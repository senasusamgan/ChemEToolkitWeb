import { useState } from 'react'
import {
  ReactionEngineeringBatch09CalculationError,
  calculateArrheniusThreePointFit,
  calculateSeriesParallelReactions,
  calculateStepResponseRTDAnalysis,
  calculateTanksInSeriesRTD,
} from './engine'
import type {
  ReactionEngineeringBatch09Mode,
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
  mode:
    ReactionEngineeringBatch09Mode
}

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

const stepFields: FieldDefinition[] = [
  { key: 't1', label: 'Time Point 1', symbol: 't₁', unit: 's' },
  { key: 'f1', label: 'Normalized Response 1', symbol: 'F₁', unit: '0–1' },
  { key: 't2', label: 'Time Point 2', symbol: 't₂', unit: 's' },
  { key: 'f2', label: 'Normalized Response 2', symbol: 'F₂', unit: '0–1' },
  { key: 't3', label: 'Time Point 3', symbol: 't₃', unit: 's' },
  { key: 'f3', label: 'Normalized Response 3', symbol: 'F₃', unit: '0–1' },
  { key: 't4', label: 'Time Point 4', symbol: 't₄', unit: 's' },
  { key: 'f4', label: 'Normalized Response 4', symbol: 'F₄', unit: '0–1' },
  { key: 't5', label: 'Time Point 5', symbol: 't₅', unit: 's' },
  { key: 'f5', label: 'Normalized Response 5', symbol: 'F₅', unit: '0–1' },
  { key: 't6', label: 'Time Point 6', symbol: 't₆', unit: 's' },
  { key: 'f6', label: 'Normalized Response 6', symbol: 'F₆', unit: '0–1' },
]

const definitions: Record<
  ReactionEngineeringBatch09Mode,
  Definition
> = {
  seriesParallelReactions: {
    code: 'RE–59',
    icon: 'A⇉',
    title:
      'Series–Parallel Reactions',
    subtitle:
      'Evaluate A-to-B-to-C consecutive chemistry with competing A-to-D formation',
    basis:
      'A → B → C and A → D with first-order rate constants',
    action:
      'Calculate reaction network',
    headline:
      'Desired intermediate yield',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'desiredRateConstant', label: 'A-to-B Rate Constant', symbol: 'k1', unit: '1/s' },
      { key: 'consecutiveRateConstant', label: 'B-to-C Rate Constant', symbol: 'k2', unit: '1/s' },
      { key: 'parallelUndesiredRateConstant', label: 'A-to-D Rate Constant', symbol: 'k3', unit: '1/s' },
      { key: 'reactionTime', label: 'Reaction Time', symbol: 't', unit: 's' },
    ],
    example: {
      initialConcentrationA: '1000',
      desiredRateConstant: '0.03',
      consecutiveRateConstant: '0.01',
      parallelUndesiredRateConstant: '0.005',
      reactionTime: '40',
    },
  },

  stepResponseRTDAnalysis: {
    code: 'RE–60',
    icon: 'F→E',
    title:
      'Step-Response RTD Analysis',
    subtitle:
      'Convert normalized outlet step-response data into RTD statistics',
    basis:
      'F(t)=Cout/Cin; E(t)=dF/dt; τ=∫[1−F(t)]dt',
    action:
      'Analyze step response',
    headline:
      'Mean residence time',
    fields:
      stepFields,
    example: {
      t1: '0',
      f1: '0.03',
      t2: '25',
      f2: '0.12',
      t3: '50',
      f3: '0.35',
      t4: '75',
      f4: '0.68',
      t5: '100',
      f5: '0.9',
      t6: '150',
      f6: '0.98',
    },
  },

  tanksInSeriesRTD: {
    code: 'RE–61',
    icon: 'N×',
    title:
      'Tanks-in-Series RTD',
    subtitle:
      'Evaluate the Erlang exit-age distribution for N equal ideal tanks',
    basis:
      'Eθ = Nᴺ θᴺ⁻¹ exp(−Nθ)/(N−1)!; σθ²=1/N',
    action:
      'Calculate tanks RTD',
    headline:
      'Exit-age density',
    fields: [
      { key: 'meanResidenceTime', label: 'Mean Residence Time', symbol: 'τ', unit: 's' },
      { key: 'tanksInSeries', label: 'Equivalent Tanks in Series', symbol: 'N', unit: 'integer' },
      { key: 'evaluationTime', label: 'Evaluation Time', symbol: 't', unit: 's' },
    ],
    example: {
      meanResidenceTime: '100',
      tanksInSeries: '5',
      evaluationTime: '100',
    },
  },

  arrheniusThreePointFit: {
    code: 'RE–62',
    icon: 'lnk',
    title:
      'Three-Point Arrhenius Fit',
    subtitle:
      'Fit activation energy and pre-exponential factor from three rate constants',
    basis:
      'ln k = ln A − Ea/(RT), fitted by linear regression against 1/T',
    action:
      'Fit Arrhenius parameters',
    headline:
      'Activation energy',
    fields: [
      { key: 'temperatureOne', label: 'Temperature 1', symbol: 'T₁', unit: 'K' },
      { key: 'rateConstantOne', label: 'Rate Constant 1', symbol: 'k₁', unit: 'rate basis' },
      { key: 'temperatureTwo', label: 'Temperature 2', symbol: 'T₂', unit: 'K' },
      { key: 'rateConstantTwo', label: 'Rate Constant 2', symbol: 'k₂', unit: 'rate basis' },
      { key: 'temperatureThree', label: 'Temperature 3', symbol: 'T₃', unit: 'K' },
      { key: 'rateConstantThree', label: 'Rate Constant 3', symbol: 'k₃', unit: 'rate basis' },
      { key: 'targetTemperature', label: 'Target Temperature', symbol: 'Ttarget', unit: 'K' },
    ],
    example: {
      temperatureOne: '330',
      rateConstantOne: '0.001218',
      temperatureTwo: '360',
      rateConstantTwo: '0.005558',
      temperatureThree: '400',
      rateConstantThree: '0.029542',
      targetTemperature: '380',
    },
  },
}

function displayValue(
  value: unknown,
): string {
  return typeof value === 'number'
    ? formatEngineeringNumber(value)
    : String(value)
}

export function ReactionEngineeringBatch09Calculator({
  mode,
}: Props) {
  const definition =
    definitions[mode]

  const [values, setValues] =
    useState<Record<string, string>>(
      definition.example,
    )

  const [result, setResult] =
    useState<unknown>(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  function number(
    key: string,
  ): number {
    return Number(values[key])
  }

  function stepTimes(): number[] {
    return [
      number('t1'),
      number('t2'),
      number('t3'),
      number('t4'),
      number('t5'),
      number('t6'),
    ]
  }

  function stepResponses(): number[] {
    return [
      number('f1'),
      number('f2'),
      number('f3'),
      number('f4'),
      number('f5'),
      number('f6'),
    ]
  }

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'seriesParallelReactions':
          next =
            calculateSeriesParallelReactions({
              initialConcentrationA:
                number('initialConcentrationA'),
              desiredRateConstant:
                number('desiredRateConstant'),
              consecutiveRateConstant:
                number('consecutiveRateConstant'),
              parallelUndesiredRateConstant:
                number('parallelUndesiredRateConstant'),
              reactionTime:
                number('reactionTime'),
            })
          break

        case 'stepResponseRTDAnalysis':
          next =
            calculateStepResponseRTDAnalysis({
              times:
                stepTimes(),
              normalizedOutletResponses:
                stepResponses(),
            })
          break

        case 'tanksInSeriesRTD':
          next =
            calculateTanksInSeriesRTD({
              meanResidenceTime:
                number('meanResidenceTime'),
              tanksInSeries:
                number('tanksInSeries'),
              evaluationTime:
                number('evaluationTime'),
            })
          break

        case 'arrheniusThreePointFit':
          next =
            calculateArrheniusThreePointFit({
              temperatureOne:
                number('temperatureOne'),
              rateConstantOne:
                number('rateConstantOne'),
              temperatureTwo:
                number('temperatureTwo'),
              rateConstantTwo:
                number('rateConstantTwo'),
              temperatureThree:
                number('temperatureThree'),
              rateConstantThree:
                number('rateConstantThree'),
              targetTemperature:
                number('targetTemperature'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch09CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  const record =
    result &&
    typeof result === 'object'
      ? result as Record<
          string,
          unknown
        >
      : null

  function headlineValue():
    unknown {
    if (!record) {
      return ''
    }

    switch (mode) {
      case 'seriesParallelReactions':
        return Number(
          record.desiredIntermediateYield,
        ) *
        100

      case 'stepResponseRTDAnalysis':
        return record.meanResidenceTime

      case 'tanksInSeriesRTD':
        return record.exitAgeDensity

      case 'arrheniusThreePointFit':
        return record.activationEnergy
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'seriesParallelReactions':
        return [
          ['Concentration A', record.concentrationA, 'mol/m³'],
          ['Desired Intermediate B', record.concentrationDesiredIntermediateB, 'mol/m³'],
          ['Consecutive Product C', record.concentrationConsecutiveProductC, 'mol/m³'],
          ['Parallel Product D', record.concentrationParallelProductD, 'mol/m³'],
          ['Conversion A', Number(record.conversionA) * 100, '%'],
          ['Intermediate Yield', Number(record.desiredIntermediateYield) * 100, '%'],
          ['Consecutive Product Yield', Number(record.consecutiveProductYield) * 100, '%'],
          ['Parallel Product Yield', Number(record.parallelProductYield) * 100, '%'],
          ['Intermediate Selectivity', record.desiredIntermediateSelectivity, '—'],
          ['Optimum Time for B', record.optimumTimeForIntermediate, 's'],
          ['Maximum B Concentration', record.maximumIntermediateConcentration, 'mol/m³'],
          ['Mass-Balance Residual', record.massBalanceResidual, 'mol/m³'],
        ]

      case 'stepResponseRTDAnalysis': {
        const normalized =
          record.normalizedResponses as number[]
        const eValues =
          record.intervalEValues as number[]
        const midpoints =
          record.intervalMidpointTimes as number[]

        return [
          ['Immediate Bypass Fraction', Number(record.immediateBypassFraction) * 100, '%'],
          ['Final Measured Response', Number(record.finalResponse) * 100, '%'],
          ['Response Completeness', Number(record.responseCompleteness) * 100, '%'],
          ['Mean Residence Time', record.meanResidenceTime, 's'],
          ['Variance', record.variance, 's²'],
          ['Standard Deviation', record.standardDeviation, 's'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Time at 10%', record.timeAtTenPercent, 's'],
          ['Median Residence Time', record.medianResidenceTime, 's'],
          ['Time at 90%', record.timeAtNinetyPercent, 's'],
          ['Normalized F Values', normalized.map(displayValue).join(', '), ''],
          ['Interval E Values', eValues.map(displayValue).join(', '), '1/s'],
          ['Interval Midpoints', midpoints.map(displayValue).join(', '), 's'],
        ]
      }

      case 'tanksInSeriesRTD':
        return [
          ['Dimensionless Time', record.dimensionlessTime, '—'],
          ['Exit-Age Density', record.exitAgeDensity, '1/s'],
          ['Cumulative Exit Fraction', Number(record.cumulativeExitFraction) * 100, '%'],
          ['Tail Fraction', Number(record.tailFraction) * 100, '%'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Residence-Time Variance', record.residenceTimeVariance, 's²'],
          ['Standard Deviation', record.residenceTimeStandardDeviation, 's'],
          ['Modal Residence Time', record.modalResidenceTime, 's'],
          ['Peak Exit-Age Density', record.peakExitAgeDensity, '1/s'],
          ['Mixing Interpretation', record.mixingInterpretation, ''],
        ]

      case 'arrheniusThreePointFit': {
        const fitted =
          record.fittedRateConstants as number[]
        const residuals =
          record.relativeResiduals as number[]

        return [
          ['Activation Energy', record.activationEnergy, 'J/mol'],
          ['Pre-Exponential Factor', record.preExponentialFactor, 'rate basis'],
          ['Arrhenius Slope', record.arrheniusSlope, 'K'],
          ['Intercept ln(A)', record.interceptLnA, '—'],
          ['Predicted Rate Constant at Target', record.predictedRateConstantAtTarget, 'rate basis'],
          ['Coefficient of Determination', record.coefficientOfDetermination, '—'],
          ['RMS Log Error', record.rootMeanSquareLogError, '—'],
          ['Fitted Rate Constants', fitted.map(displayValue).join(', '), ''],
          ['Relative Residuals', residuals.map((value) => displayValue(value * 100)).join(', '), '%'],
          ['Fit Quality', record.fitQualityDescription, ''],
        ]
      }
    }
  }

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
        {definition.fields.map(
          (field) => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={values[field.key] ?? ''}
              unit={field.unit}
              onChange={(value) =>
                setValues(
                  (current) => ({
                    ...current,
                    [field.key]: value,
                  }),
                )
              }
            />
          ),
        )}
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
              definition.fields.map(
                (field) => [
                  field.key,
                  '',
                ],
              ),
            ),
          )
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {record ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={
            displayValue(
              headlineValue(),
            )
          }
          modelName={definition.title}
          note="Engineering screening model. Verify reaction-network assumptions, RTD observation-window completeness, equal-tank behavior and Arrhenius linearity before design use."
        >
          {rows().map(
            ([label, value, unit]) => (
              <ResultItem
                key={label}
                label={label}
                value={displayValue(value)}
                unit={unit}
              />
            ),
          )}
        </ResultPanel>
      ) : null}
    </section>
  )
}
