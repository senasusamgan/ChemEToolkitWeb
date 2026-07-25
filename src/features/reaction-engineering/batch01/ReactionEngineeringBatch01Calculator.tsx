import { useState } from 'react'
import {
  ReactionEngineeringBatch01CalculationError,
  calculateAdiabaticBatchReactor,
  calculateAdiabaticCSTR,
  calculateAdiabaticPFR,
  calculateAutocatalyticBatchReactor,
  calculateAxialDispersionRTD,
  calculateBypassFractionEstimator,
} from './engine'
import type {
  ReactionEngineeringBatch01Mode,
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
    ReactionEngineeringBatch01Mode
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
  ReactionEngineeringBatch01Mode,
  Definition
> = {
  adiabaticBatchReactor: {
    code: 'RE–11',
    icon: 'AB',
    title:
      'Adiabatic Batch Reactor',
    subtitle:
      'Integrate conversion time with Arrhenius acceleration from adiabatic heating',
    basis:
      't = ∫ dX / [k(T) CA0ⁿ⁻¹(1−X)ⁿ], T = T0 + ΔTadX',
    action:
      'Calculate batch time',
    headline:
      'Required batch time',
    fields: [
      { key: 'initialConcentration', label: 'Initial Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: 'rate basis' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'reactionOrder', label: 'Reaction Order', symbol: 'n', unit: '—' },
      { key: 'inletTemperature', label: 'Initial Temperature', symbol: 'T0', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Full-Conversion Adiabatic Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      initialConcentration: '1000',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      reactionOrder: '1',
      inletTemperature: '350',
      adiabaticTemperatureRise: '100',
      targetConversion: '0.8',
    },
  },

  adiabaticCSTR: {
    code: 'RE–12',
    icon: 'CSTR',
    title:
      'Adiabatic CSTR',
    subtitle:
      'Size a first-order adiabatic CSTR at a selected conversion',
    basis:
      'V = FA0X/[k(T)CA], T = T0 + ΔTadX',
    action:
      'Calculate CSTR volume',
    headline:
      'Required reactor volume',
    fields: [
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'inletTemperature', label: 'Inlet Temperature', symbol: 'T0', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Full-Conversion Adiabatic Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentration: '1000',
      volumetricFlowRate: '0.01',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      inletTemperature: '350',
      adiabaticTemperatureRise: '100',
      targetConversion: '0.8',
    },
  },

  adiabaticPFR: {
    code: 'RE–13',
    icon: 'PFR',
    title:
      'Adiabatic PFR',
    subtitle:
      'Integrate first-order plug-flow volume with temperature-dependent kinetics',
    basis:
      'V = Q∫dX/[k(T)(1−X)], T = T0 + ΔTadX',
    action:
      'Calculate PFR volume',
    headline:
      'Required reactor volume',
    fields: [
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'inletTemperature', label: 'Inlet Temperature', symbol: 'T0', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Full-Conversion Adiabatic Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentration: '1000',
      volumetricFlowRate: '0.01',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      inletTemperature: '350',
      adiabaticTemperatureRise: '100',
      targetConversion: '0.8',
    },
  },

  autocatalyticBatchReactor: {
    code: 'RE–14',
    icon: 'AUTO',
    title:
      'Autocatalytic Batch Reactor',
    subtitle:
      'Calculate batch time for A + B → 2B with product-assisted kinetics',
    basis:
      '−rA = kCACB; CB = CB0 + CA0X',
    action:
      'Calculate autocatalytic batch',
    headline:
      'Required batch time',
    fields: [
      { key: 'initialReactantConcentration', label: 'Initial Reactant Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'initialAutocatalystConcentration', label: 'Initial Autocatalyst Concentration', symbol: 'CB0', unit: 'mol/m³' },
      { key: 'rateConstant', label: 'Rate Constant', symbol: 'k', unit: 'm³/(mol·s)' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      initialReactantConcentration: '1000',
      initialAutocatalystConcentration: '50',
      rateConstant: '0.00001',
      targetConversion: '0.9',
    },
  },

  axialDispersionRTD: {
    code: 'RE–15',
    icon: 'RTD',
    title:
      'Axial-Dispersion RTD',
    subtitle:
      'Evaluate an open-open axial-dispersion residence-time distribution',
    basis:
      'Eθ = √[Pe/(4πθ)] exp[−Pe(1−θ)²/(4θ)]',
    action:
      'Calculate RTD response',
    headline:
      'Exit-age density',
    fields: [
      { key: 'meanResidenceTime', label: 'Mean Residence Time', symbol: 'τ', unit: 's' },
      { key: 'pecletNumber', label: 'Peclet Number', symbol: 'Pe', unit: '—' },
      { key: 'evaluationTime', label: 'Evaluation Time', symbol: 't', unit: 's' },
    ],
    example: {
      meanResidenceTime: '100',
      pecletNumber: '20',
      evaluationTime: '100',
    },
  },

  bypassFractionEstimator: {
    code: 'RE–16',
    icon: 'BP',
    title:
      'Bypass Fraction Estimator',
    subtitle:
      'Estimate hydraulic bypass from the early tracer-response area',
    basis:
      'fbypass = early bypass tracer area / total recovered tracer area',
    action:
      'Estimate bypass fraction',
    headline:
      'Estimated bypass fraction',
    fields: [
      { key: 'earlyBypassTracerArea', label: 'Early Bypass Tracer Area', symbol: 'Ab', unit: 'tracer·time' },
      { key: 'totalRecoveredTracerArea', label: 'Total Recovered Tracer Area', symbol: 'At', unit: 'tracer·time' },
      { key: 'injectedTracerArea', label: 'Injected Tracer Basis', symbol: 'Ai', unit: 'tracer·time' },
      { key: 'reactorVolume', label: 'Reactor Volume', symbol: 'V', unit: 'm³' },
      { key: 'totalVolumetricFlowRate', label: 'Total Volumetric Flow', symbol: 'Q', unit: 'm³/s' },
    ],
    example: {
      earlyBypassTracerArea: '8',
      totalRecoveredTracerArea: '100',
      injectedTracerArea: '105',
      reactorVolume: '10',
      totalVolumetricFlowRate: '0.1',
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

export function ReactionEngineeringBatch01Calculator({
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

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'adiabaticBatchReactor':
          next =
            calculateAdiabaticBatchReactor({
              initialConcentration:
                number('initialConcentration'),
              preExponentialFactor:
                number('preExponentialFactor'),
              activationEnergy:
                number('activationEnergy'),
              reactionOrder:
                number('reactionOrder'),
              inletTemperature:
                number('inletTemperature'),
              adiabaticTemperatureRise:
                number('adiabaticTemperatureRise'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'adiabaticCSTR':
          next =
            calculateAdiabaticCSTR({
              inletConcentration:
                number('inletConcentration'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              preExponentialFactor:
                number('preExponentialFactor'),
              activationEnergy:
                number('activationEnergy'),
              inletTemperature:
                number('inletTemperature'),
              adiabaticTemperatureRise:
                number('adiabaticTemperatureRise'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'adiabaticPFR':
          next =
            calculateAdiabaticPFR({
              inletConcentration:
                number('inletConcentration'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              preExponentialFactor:
                number('preExponentialFactor'),
              activationEnergy:
                number('activationEnergy'),
              inletTemperature:
                number('inletTemperature'),
              adiabaticTemperatureRise:
                number('adiabaticTemperatureRise'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'autocatalyticBatchReactor':
          next =
            calculateAutocatalyticBatchReactor({
              initialReactantConcentration:
                number('initialReactantConcentration'),
              initialAutocatalystConcentration:
                number('initialAutocatalystConcentration'),
              rateConstant:
                number('rateConstant'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'axialDispersionRTD':
          next =
            calculateAxialDispersionRTD({
              meanResidenceTime:
                number('meanResidenceTime'),
              pecletNumber:
                number('pecletNumber'),
              evaluationTime:
                number('evaluationTime'),
            })
          break

        case 'bypassFractionEstimator':
          next =
            calculateBypassFractionEstimator({
              earlyBypassTracerArea:
                number('earlyBypassTracerArea'),
              totalRecoveredTracerArea:
                number('totalRecoveredTracerArea'),
              injectedTracerArea:
                number('injectedTracerArea'),
              reactorVolume:
                number('reactorVolume'),
              totalVolumetricFlowRate:
                number('totalVolumetricFlowRate'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch01CalculationError
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
      case 'adiabaticBatchReactor':
      case 'autocatalyticBatchReactor':
        return record.requiredBatchTime
      case 'adiabaticCSTR':
      case 'adiabaticPFR':
        return record.requiredReactorVolume
      case 'axialDispersionRTD':
        return record.exitAgeDensity
      case 'bypassFractionEstimator':
        return record.bypassFraction
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'adiabaticBatchReactor':
        return [
          ['Outlet Temperature', record.outletTemperature, 'K'],
          ['Temperature Rise', record.temperatureRise, 'K'],
          ['Outlet Concentration', record.outletConcentration, 'mol/m³'],
          ['Initial Rate Constant', record.initialRateConstant, 'rate basis'],
          ['Outlet Rate Constant', record.outletRateConstant, 'rate basis'],
          ['Initial Reaction Rate', record.initialReactionRate, 'mol/(m³·s)'],
          ['Outlet Reaction Rate', record.outletReactionRate, 'mol/(m³·s)'],
        ]

      case 'adiabaticCSTR':
        return [
          ['Space Time', record.spaceTime, 's'],
          ['Outlet Temperature', record.outletTemperature, 'K'],
          ['Outlet Concentration', record.outletConcentration, 'mol/m³'],
          ['Outlet Rate Constant', record.outletRateConstant, '1/s'],
          ['Outlet Reaction Rate', record.outletReactionRate, 'mol/(m³·s)'],
          ['Inlet Molar Flow', record.inletMolarFlowRate, 'mol/s'],
          ['Temperature Rise', record.heatReleaseTemperatureRise, 'K'],
        ]

      case 'adiabaticPFR':
        return [
          ['Space Time', record.spaceTime, 's'],
          ['Outlet Temperature', record.outletTemperature, 'K'],
          ['Outlet Concentration', record.outletConcentration, 'mol/m³'],
          ['Outlet Rate Constant', record.outletRateConstant, '1/s'],
          ['Average Rate Constant', record.averageRateConstant, '1/s'],
          ['Inlet Molar Flow', record.inletMolarFlowRate, 'mol/s'],
          ['Integration Intervals', record.integrationIntervals, '—'],
        ]

      case 'autocatalyticBatchReactor':
        return [
          ['Outlet Reactant Concentration', record.outletReactantConcentration, 'mol/m³'],
          ['Outlet Autocatalyst Concentration', record.outletAutocatalystConcentration, 'mol/m³'],
          ['Initial Reaction Rate', record.initialReactionRate, 'mol/(m³·s)'],
          ['Outlet Reaction Rate', record.outletReactionRate, 'mol/(m³·s)'],
          ['Peak-Rate Conversion', Number(record.peakRateConversion) * 100, '%'],
          ['Peak Reaction Rate', record.peakReactionRate, 'mol/(m³·s)'],
          ['Total Reactive Concentration', record.totalReactiveConcentration, 'mol/m³'],
        ]

      case 'axialDispersionRTD':
        return [
          ['Dimensionless Time', record.dimensionlessTime, '—'],
          ['Dimensionless Exit-Age Density', record.dimensionlessExitAgeDensity, '—'],
          ['Dispersion Number', record.dispersionNumber, '—'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Residence-Time Standard Deviation', record.residenceTimeStandardDeviation, 's'],
          ['Cumulative Exit Fraction', Number(record.cumulativeExitFraction) * 100, '%'],
          ['Tail Fraction', Number(record.tailFraction) * 100, '%'],
        ]

      case 'bypassFractionEstimator':
        return [
          ['Bypass Fraction', Number(record.bypassFraction) * 100, '%'],
          ['Active Flow Fraction', Number(record.activeFlowFraction) * 100, '%'],
          ['Tracer Recovery', Number(record.tracerRecoveryFraction) * 100, '%'],
          ['Bypass Flow Rate', record.bypassFlowRate, 'm³/s'],
          ['Active Flow Rate', record.activeFlowRate, 'm³/s'],
          ['Nominal Space Time', record.nominalSpaceTime, 's'],
          ['Active-Path Space Time', record.activePathSpaceTime, 's'],
          ['Bypass Severity', record.bypassSeverityBand, ''],
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
          note="Engineering screening model. Verify kinetic units, heat-capacity assumptions, density and flow basis, RTD boundary model and tracer normalization before design use."
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
