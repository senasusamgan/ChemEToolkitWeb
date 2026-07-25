import { useState } from 'react'
import {
  ProcessControlBatch06CalculationError,
  calculateTemperatureProcessDynamics,
  calculateTransferFunctionBuilder,
  calculateValveCharacteristics,
  calculateZieglerNicholsUltimateGain,
} from './engine'
import type {
  ProcessControlBatch06Mode,
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
  mode: ProcessControlBatch06Mode
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

const definitions: Record<
  ProcessControlBatch06Mode,
  Definition
> = {
  temperatureProcessDynamics: {
    code: 'PC–31',
    icon: 'T',
    title: 'Temperature-Process Dynamics',
    subtitle:
      'Lumped thermal response with heat input and ambient heat loss',
    basis:
      'Cth dT/dt = Q̇ − UA(T − Tamb)',
    action:
      'Calculate temperature response',
    headline:
      'Temperature at evaluation time',
    fields: [
      {
        key: 'thermalCapacitance',
        label: 'Thermal Capacitance',
        symbol: 'Cth',
        unit: 'energy/temperature',
      },
      {
        key: 'heatTransferConductance',
        label: 'Heat-Transfer Conductance',
        symbol: 'UA',
        unit: 'power/temperature',
      },
      {
        key: 'ambientTemperature',
        label: 'Ambient Temperature',
        symbol: 'Tamb',
        unit: 'temperature',
      },
      {
        key: 'heatInputRate',
        label: 'Heat Input Rate',
        symbol: 'Q̇',
        unit: 'power',
      },
      {
        key: 'initialTemperature',
        label: 'Initial Temperature',
        symbol: 'T₀',
        unit: 'temperature',
      },
      {
        key: 'evaluationTime',
        label: 'Evaluation Time',
        symbol: 't',
        unit: 'time',
      },
      {
        key: 'maximumAllowableTemperature',
        label: 'Maximum Allowable Temperature',
        symbol: 'Tmax',
        unit: 'temperature',
      },
    ],
    example: {
      thermalCapacitance: '500',
      heatTransferConductance: '20',
      ambientTemperature: '25',
      heatInputRate: '1000',
      initialTemperature: '25',
      evaluationTime: '30',
      maximumAllowableTemperature: '80',
    },
  },
  transferFunctionBuilder: {
    code: 'PC–32',
    icon: 'G(s)',
    title: 'Transfer Function Builder',
    subtitle:
      'Build and evaluate a two-lag process model with optional integration and dead time',
    basis:
      'G(s) = K exp(−θs) / [sⁿ(τ₁s+1)(τ₂s+1)]',
    action:
      'Build transfer function',
    headline:
      'Frequency-response magnitude',
    fields: [
      {
        key: 'processGain',
        label: 'Process Gain',
        symbol: 'K',
        unit: '—',
      },
      {
        key: 'firstTimeConstant',
        label: 'First Time Constant',
        symbol: 'τ₁',
        unit: 'time',
      },
      {
        key: 'secondTimeConstant',
        label: 'Second Time Constant',
        symbol: 'τ₂',
        unit: 'time',
      },
      {
        key: 'deadTime',
        label: 'Dead Time',
        symbol: 'θ',
        unit: 'time',
      },
      {
        key: 'integratorOrder',
        label: 'Integrator Order',
        symbol: 'n',
        unit: '0 or 1',
      },
      {
        key: 'angularFrequency',
        label: 'Angular Frequency',
        symbol: 'ω',
        unit: 'rad/time',
      },
    ],
    example: {
      processGain: '2',
      firstTimeConstant: '5',
      secondTimeConstant: '2',
      deadTime: '1',
      integratorOrder: '0',
      angularFrequency: '0.2',
    },
  },
  valveCharacteristics: {
    code: 'PC–33',
    icon: 'Cv',
    title: 'Valve Characteristics',
    subtitle:
      'Compare linear, equal-percentage and quick-opening inherent characteristics',
    basis:
      'Mode 1 = linear, 2 = equal percentage, 3 = quick opening',
    action:
      'Calculate valve characteristic',
    headline:
      'Effective flow coefficient',
    fields: [
      {
        key: 'characteristicMode',
        label: 'Characteristic Mode',
        symbol: 'm',
        unit: '1, 2 or 3',
      },
      {
        key: 'ratedFlowCoefficient',
        label: 'Rated Flow Coefficient',
        symbol: 'Cv,rated',
        unit: 'US Cv',
      },
      {
        key: 'valveTravelPercent',
        label: 'Valve Travel',
        symbol: 'x',
        unit: '%',
      },
      {
        key: 'rangeability',
        label: 'Rangeability',
        symbol: 'R',
        unit: '—',
      },
      {
        key: 'pressureDrop',
        label: 'Pressure Drop',
        symbol: 'ΔP',
        unit: 'psi',
      },
      {
        key: 'liquidSpecificGravity',
        label: 'Liquid Specific Gravity',
        symbol: 'SG',
        unit: '—',
      },
    ],
    example: {
      characteristicMode: '2',
      ratedFlowCoefficient: '100',
      valveTravelPercent: '60',
      rangeability: '50',
      pressureDrop: '25',
      liquidSpecificGravity: '1',
    },
  },
  zieglerNicholsUltimateGain: {
    code: 'PC–34',
    icon: 'ZN',
    title: 'Ziegler–Nichols Ultimate Gain',
    subtitle:
      'Classic closed-loop tuning from ultimate gain and oscillation period',
    basis:
      'Mode 1 = P, 2 = PI, 3 = PID',
    action:
      'Calculate Ziegler–Nichols settings',
    headline:
      'Controller gain',
    fields: [
      {
        key: 'controllerMode',
        label: 'Controller Mode',
        symbol: 'm',
        unit: '1, 2 or 3',
      },
      {
        key: 'ultimateGain',
        label: 'Ultimate Gain',
        symbol: 'Ku',
        unit: '—',
      },
      {
        key: 'ultimatePeriod',
        label: 'Ultimate Period',
        symbol: 'Pu',
        unit: 'time',
      },
    ],
    example: {
      controllerMode: '3',
      ultimateGain: '8',
      ultimatePeriod: '12',
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

export function ProcessControlBatch06Calculator({
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

  function number(key: string): number {
    return Number(values[key])
  }

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'temperatureProcessDynamics':
          next =
            calculateTemperatureProcessDynamics({
              thermalCapacitance:
                number('thermalCapacitance'),
              heatTransferConductance:
                number('heatTransferConductance'),
              ambientTemperature:
                number('ambientTemperature'),
              heatInputRate:
                number('heatInputRate'),
              initialTemperature:
                number('initialTemperature'),
              evaluationTime:
                number('evaluationTime'),
              maximumAllowableTemperature:
                number(
                  'maximumAllowableTemperature',
                ),
            })
          break

        case 'transferFunctionBuilder':
          next =
            calculateTransferFunctionBuilder({
              processGain:
                number('processGain'),
              firstTimeConstant:
                number('firstTimeConstant'),
              secondTimeConstant:
                number('secondTimeConstant'),
              deadTime:
                number('deadTime'),
              integratorOrder:
                number('integratorOrder'),
              angularFrequency:
                number('angularFrequency'),
            })
          break

        case 'valveCharacteristics':
          next =
            calculateValveCharacteristics({
              characteristicMode:
                number('characteristicMode'),
              ratedFlowCoefficient:
                number('ratedFlowCoefficient'),
              valveTravelPercent:
                number('valveTravelPercent'),
              rangeability:
                number('rangeability'),
              pressureDrop:
                number('pressureDrop'),
              liquidSpecificGravity:
                number('liquidSpecificGravity'),
            })
          break

        case 'zieglerNicholsUltimateGain':
          next =
            calculateZieglerNicholsUltimateGain({
              controllerMode:
                number('controllerMode'),
              ultimateGain:
                number('ultimateGain'),
              ultimatePeriod:
                number('ultimatePeriod'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessControlBatch06CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  const record =
    result && typeof result === 'object'
      ? result as Record<string, unknown>
      : null

  function headlineValue(): unknown {
    if (!record) {
      return ''
    }

    switch (mode) {
      case 'temperatureProcessDynamics':
        return record
          .temperatureAtEvaluationTime
      case 'transferFunctionBuilder':
        return record.magnitudeRatio
      case 'valveCharacteristics':
        return record
          .effectiveFlowCoefficient
      case 'zieglerNicholsUltimateGain':
        return record.controllerGain
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'temperatureProcessDynamics':
        return [
          [
            'Process Time Constant',
            record.processTimeConstant,
            'time',
          ],
          [
            'Steady-State Temperature',
            record.steadyStateTemperature,
            'temperature',
          ],
          [
            'Response Fraction',
            record.responseFraction,
            '—',
          ],
          [
            'Initial Heating Rate',
            record.initialHeatingRate,
            'temperature/time',
          ],
          [
            'Heat Loss at Evaluation Time',
            record.heatLossAtEvaluationTime,
            'power',
          ],
          [
            'Temperature Margin',
            record.temperatureMargin,
            'temperature',
          ],
          [
            'Overtemperature Risk',
            record.overtemperatureRisk
              ? 'Yes'
              : 'No',
            '',
          ],
        ]

      case 'transferFunctionBuilder':
        return [
          [
            'Magnitude',
            record.magnitudeDecibels,
            'dB',
          ],
          [
            'Phase',
            record.phaseDegrees,
            'deg',
          ],
          [
            'Real Part',
            record.realPart,
            '—',
          ],
          [
            'Imaginary Part',
            record.imaginaryPart,
            '—',
          ],
          [
            'First Pole',
            record.poleOne,
            '1/time',
          ],
          [
            'Second Pole',
            record.poleTwo,
            '1/time',
          ],
          [
            'Transfer Function',
            record.transferFunctionExpression,
            '',
          ],
          [
            'Evaluation',
            record.frequencyDomainExpression,
            '',
          ],
        ]

      case 'valveCharacteristics':
        return [
          [
            'Characteristic',
            record.characteristicName,
            '',
          ],
          [
            'Normalized Travel',
            record.normalizedTravel,
            '—',
          ],
          [
            'Normalized Cv',
            record.normalizedFlowCoefficient,
            '—',
          ],
          [
            'Estimated Liquid Flow',
            record.estimatedLiquidFlowRate,
            'US gpm',
          ],
          [
            'Normalized Slope',
            record.normalizedCharacteristicSlope,
            '—',
          ],
          [
            'Cv Slope',
            record.effectiveCvSlopePerPercentTravel,
            'Cv/% travel',
          ],
          [
            'Turndown from Rated',
            record.turndownFromRated,
            '—',
          ],
        ]

      case 'zieglerNicholsUltimateGain':
        return [
          [
            'Controller Mode',
            record.controllerModeName,
            '',
          ],
          [
            'Integral Time',
            record.integralTime,
            'time',
          ],
          [
            'Derivative Time',
            record.derivativeTime,
            'time',
          ],
          [
            'Integral Gain',
            record.integralGain,
            '1/time',
          ],
          [
            'Derivative Gain',
            record.derivativeGain,
            'time',
          ],
          [
            'Recommended Sample Time',
            record.recommendedSampleTime,
            'time',
          ],
          [
            'Proportional Band',
            record.proportionalBandPercent,
            '%',
          ],
        ]
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
              value={
                values[field.key] ?? ''
              }
              unit={field.unit}
              onChange={(value) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: value,
                }))
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={() => {
          setValues(
            definition.example,
          )
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
        calculateLabel={
          definition.action
        }
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
          headlineLabel={
            definition.headline
          }
          headlineValue={
            displayValue(
              headlineValue(),
            )
          }
          modelName={
            definition.title
          }
          note="Engineering screening result. Verify units, model assumptions, equipment limits and plant-specific dynamics before design or safety-critical use."
        >
          {rows().map(
            ([
              label,
              value,
              unit,
            ]) => (
              <ResultItem
                key={label}
                label={label}
                value={
                  displayValue(value)
                }
                unit={unit}
              />
            ),
          )}
        </ResultPanel>
      ) : null}
    </section>
  )
}
