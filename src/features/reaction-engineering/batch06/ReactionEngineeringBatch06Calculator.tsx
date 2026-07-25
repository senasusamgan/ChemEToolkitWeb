import { useState } from 'react'
import {
  ReactionEngineeringBatch06CalculationError,
  calculateNonIsothermalCSTRSteadyStates,
  calculatePBRPressureDropEffects,
  calculatePackedBedPressureDrop,
  calculatePackedBedReactorDesign,
  calculateParallelReactions,
  calculateRateConstant,
} from './engine'
import type {
  ReactionEngineeringBatch06Mode,
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
    ReactionEngineeringBatch06Mode
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
  ReactionEngineeringBatch06Mode,
  Definition
> = {
  nonIsothermalCSTRSteadyStates: {
    code: 'RE–41',
    icon: 'SS',
    title:
      'Non-Isothermal CSTR Steady States',
    subtitle:
      'Locate thermal steady states from coupled first-order material and energy balances',
    basis:
      'X(T)=k(T)τ/[1+k(T)τ]; T=[Tin+ΔTadX+HTc]/(1+H)',
    action:
      'Find steady states',
    headline:
      'Number of steady states',
    fields: [
      { key: 'spaceTime', label: 'Space Time', symbol: 'τ', unit: 's' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'inletTemperature', label: 'Inlet Temperature', symbol: 'Tin', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Adiabatic Temperature Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'coolantTemperature', label: 'Coolant Temperature', symbol: 'Tc', unit: 'K' },
      { key: 'heatRemovalNumber', label: 'Heat-Removal Number', symbol: 'H', unit: '—' },
      { key: 'minimumSearchTemperature', label: 'Minimum Search Temperature', symbol: 'Tmin', unit: 'K' },
      { key: 'maximumSearchTemperature', label: 'Maximum Search Temperature', symbol: 'Tmax', unit: 'K' },
    ],
    example: {
      spaceTime: '100',
      preExponentialFactor: '100000000',
      activationEnergy: '70000',
      inletTemperature: '350',
      adiabaticTemperatureRise: '250',
      coolantTemperature: '330',
      heatRemovalNumber: '0.4',
      minimumSearchTemperature: '300',
      maximumSearchTemperature: '700',
    },
  },

  packedBedPressureDrop: {
    code: 'RE–42',
    icon: 'ΔP',
    title:
      'Packed-Bed Pressure Drop',
    subtitle:
      'Calculate viscous and inertial Ergun pressure-drop contributions',
    basis:
      '−dP/dL = 150μ(1−ε)²vs/(ε³dp²) + 1.75ρ(1−ε)vs²/(ε³dp)',
    action:
      'Calculate packed-bed pressure drop',
    headline:
      'Total pressure drop',
    fields: [
      { key: 'bedLength', label: 'Bed Length', symbol: 'L', unit: 'm' },
      { key: 'particleDiameter', label: 'Particle Diameter', symbol: 'dp', unit: 'm' },
      { key: 'bedVoidFraction', label: 'Bed Void Fraction', symbol: 'ε', unit: '0–1' },
      { key: 'fluidDensity', label: 'Fluid Density', symbol: 'ρ', unit: 'kg/m³' },
      { key: 'fluidViscosity', label: 'Fluid Viscosity', symbol: 'μ', unit: 'Pa·s' },
      { key: 'superficialVelocity', label: 'Superficial Velocity', symbol: 'vs', unit: 'm/s' },
    ],
    example: {
      bedLength: '2',
      particleDiameter: '0.005',
      bedVoidFraction: '0.4',
      fluidDensity: '1000',
      fluidViscosity: '0.001',
      superficialVelocity: '0.02',
    },
  },

  packedBedReactorDesign: {
    code: 'RE–43',
    icon: 'W',
    title:
      'Packed-Bed Reactor Design',
    subtitle:
      'Size catalyst mass for a constant-density first-order packed-bed reactor',
    basis:
      'W = Q/kW · ln[1/(1−X)]',
    action:
      'Calculate catalyst weight',
    headline:
      'Required catalyst weight',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'inletVolumetricFlowRate', label: 'Inlet Volumetric Flow', symbol: 'Q0', unit: 'm³/s' },
      { key: 'massSpecificFirstOrderRateConstant', label: 'Mass-Specific First-Order Constant', symbol: 'kW', unit: 'm³/(kgcat·s)' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentrationA: '1000',
      inletVolumetricFlowRate: '0.01',
      massSpecificFirstOrderRateConstant: '0.00002',
      targetConversion: '0.8',
    },
  },

  parallelReactions: {
    code: 'RE–44',
    icon: 'A↗',
    title:
      'Parallel Reactions',
    subtitle:
      'Evaluate instantaneous rates and selectivity for competing power-law reactions',
    basis:
      'rD = kD CAᵐ; rU = kU CAⁿ; SD/U = rD/rU',
    action:
      'Calculate parallel reaction rates',
    headline:
      'Desired / undesired selectivity',
    fields: [
      { key: 'reactantConcentration', label: 'Reactant Concentration', symbol: 'CA', unit: 'mol/m³' },
      { key: 'desiredRateConstant', label: 'Desired-Reaction Constant', symbol: 'kD', unit: 'rate basis' },
      { key: 'desiredReactionOrder', label: 'Desired-Reaction Order', symbol: 'm', unit: '—' },
      { key: 'undesiredRateConstant', label: 'Undesired-Reaction Constant', symbol: 'kU', unit: 'rate basis' },
      { key: 'undesiredReactionOrder', label: 'Undesired-Reaction Order', symbol: 'n', unit: '—' },
    ],
    example: {
      reactantConcentration: '2',
      desiredRateConstant: '0.5',
      desiredReactionOrder: '1',
      undesiredRateConstant: '0.1',
      undesiredReactionOrder: '2',
    },
  },

  pbrPressureDropEffects: {
    code: 'RE–45',
    icon: 'PBR',
    title:
      'PBR Pressure-Drop Effects',
    subtitle:
      'Estimate gas-phase first-order packed-bed conversion with declining pressure',
    basis:
      'y=P/P0=√(1−αW); X=1−exp[−β∫y dW]',
    action:
      'Calculate pressure-drop effects',
    headline:
      'Conversion with pressure drop',
    fields: [
      { key: 'inletMolarFlowRateA', label: 'Inlet Molar Flow A', symbol: 'FA0', unit: 'mol/s' },
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'catalystWeight', label: 'Catalyst Weight', symbol: 'W', unit: 'kgcat' },
      { key: 'massSpecificFirstOrderRateConstant', label: 'Mass-Specific Rate Constant', symbol: 'kW', unit: 'm³/(kgcat·s)' },
      { key: 'pressureDropCoefficient', label: 'Pressure-Drop Coefficient', symbol: 'α', unit: '1/kgcat' },
      { key: 'inletPressure', label: 'Inlet Pressure', symbol: 'P0', unit: 'Pa' },
    ],
    example: {
      inletMolarFlowRateA: '10',
      inletConcentrationA: '1000',
      catalystWeight: '200',
      massSpecificFirstOrderRateConstant: '0.00002',
      pressureDropCoefficient: '0.002',
      inletPressure: '500000',
    },
  },

  rateConstantCalculation: {
    code: 'RE–46',
    icon: 'k',
    title:
      'Rate Constant Calculation',
    subtitle:
      'Back-calculate a power-law rate constant from one observed reaction-rate state',
    basis:
      'k = robs/(CAᵐ CBⁿ)',
    action:
      'Calculate rate constant',
    headline:
      'Rate constant',
    fields: [
      { key: 'observedReactionRate', label: 'Observed Reaction Rate', symbol: 'robs', unit: 'rate basis' },
      { key: 'concentrationA', label: 'Concentration A', symbol: 'CA', unit: 'mol/m³' },
      { key: 'reactionOrderA', label: 'Reaction Order A', symbol: 'm', unit: '—' },
      { key: 'concentrationB', label: 'Concentration B', symbol: 'CB', unit: 'mol/m³' },
      { key: 'reactionOrderB', label: 'Reaction Order B', symbol: 'n', unit: '—' },
    ],
    example: {
      observedReactionRate: '12',
      concentrationA: '2',
      reactionOrderA: '1',
      concentrationB: '3',
      reactionOrderB: '2',
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

export function ReactionEngineeringBatch06Calculator({
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
        case 'nonIsothermalCSTRSteadyStates':
          next =
            calculateNonIsothermalCSTRSteadyStates({
              spaceTime:
                number('spaceTime'),
              preExponentialFactor:
                number('preExponentialFactor'),
              activationEnergy:
                number('activationEnergy'),
              inletTemperature:
                number('inletTemperature'),
              adiabaticTemperatureRise:
                number('adiabaticTemperatureRise'),
              coolantTemperature:
                number('coolantTemperature'),
              heatRemovalNumber:
                number('heatRemovalNumber'),
              minimumSearchTemperature:
                number('minimumSearchTemperature'),
              maximumSearchTemperature:
                number('maximumSearchTemperature'),
            })
          break

        case 'packedBedPressureDrop':
          next =
            calculatePackedBedPressureDrop({
              bedLength:
                number('bedLength'),
              particleDiameter:
                number('particleDiameter'),
              bedVoidFraction:
                number('bedVoidFraction'),
              fluidDensity:
                number('fluidDensity'),
              fluidViscosity:
                number('fluidViscosity'),
              superficialVelocity:
                number('superficialVelocity'),
            })
          break

        case 'packedBedReactorDesign':
          next =
            calculatePackedBedReactorDesign({
              inletConcentrationA:
                number('inletConcentrationA'),
              inletVolumetricFlowRate:
                number('inletVolumetricFlowRate'),
              massSpecificFirstOrderRateConstant:
                number('massSpecificFirstOrderRateConstant'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'parallelReactions':
          next =
            calculateParallelReactions({
              reactantConcentration:
                number('reactantConcentration'),
              desiredRateConstant:
                number('desiredRateConstant'),
              desiredReactionOrder:
                number('desiredReactionOrder'),
              undesiredRateConstant:
                number('undesiredRateConstant'),
              undesiredReactionOrder:
                number('undesiredReactionOrder'),
            })
          break

        case 'pbrPressureDropEffects':
          next =
            calculatePBRPressureDropEffects({
              inletMolarFlowRateA:
                number('inletMolarFlowRateA'),
              inletConcentrationA:
                number('inletConcentrationA'),
              catalystWeight:
                number('catalystWeight'),
              massSpecificFirstOrderRateConstant:
                number('massSpecificFirstOrderRateConstant'),
              pressureDropCoefficient:
                number('pressureDropCoefficient'),
              inletPressure:
                number('inletPressure'),
            })
          break

        case 'rateConstantCalculation':
          next =
            calculateRateConstant({
              observedReactionRate:
                number('observedReactionRate'),
              concentrationA:
                number('concentrationA'),
              reactionOrderA:
                number('reactionOrderA'),
              concentrationB:
                number('concentrationB'),
              reactionOrderB:
                number('reactionOrderB'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch06CalculationError
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
      case 'nonIsothermalCSTRSteadyStates':
        return record.steadyStateCount
      case 'packedBedPressureDrop':
        return record.totalPressureDrop
      case 'packedBedReactorDesign':
        return record.requiredCatalystWeight
      case 'parallelReactions':
        return record.instantaneousSelectivity
      case 'pbrPressureDropEffects':
        return Number(
          record.conversionWithPressureDrop,
        ) *
        100
      case 'rateConstantCalculation':
        return record.rateConstant
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'nonIsothermalCSTRSteadyStates': {
        const temperatures =
          record.steadyStateTemperatures as number[]
        const conversions =
          record.steadyStateConversions as number[]
        const stability =
          record.stabilityDescriptions as string[]

        return [
          ['Steady-State Temperatures', temperatures.map(displayValue).join(', '), 'K'],
          ['Steady-State Conversions', conversions.map((value) => displayValue(value * 100)).join(', '), '%'],
          ['Stability Screening', stability.join(' · '), ''],
          ['Lowest-Temperature State', record.lowestTemperatureState ?? 'Not available', 'K'],
          ['Highest-Temperature State', record.highestTemperatureState ?? 'Not available', 'K'],
          ['Temperature Span', record.temperatureSpan, 'K'],
          ['Minimum Conversion', Number(record.minimumConversion) * 100, '%'],
          ['Maximum Conversion', Number(record.maximumConversion) * 100, '%'],
          ['Search Intervals', record.searchIntervals, '—'],
        ]
      }

      case 'packedBedPressureDrop':
        return [
          ['Total Pressure Gradient', record.totalPressureGradient, 'Pa/m'],
          ['Viscous Pressure Gradient', record.viscousPressureGradient, 'Pa/m'],
          ['Inertial Pressure Gradient', record.inertialPressureGradient, 'Pa/m'],
          ['Viscous Contribution', Number(record.viscousContributionFraction) * 100, '%'],
          ['Inertial Contribution', Number(record.inertialContributionFraction) * 100, '%'],
          ['Particle Reynolds Number', record.particleReynoldsNumber, '—'],
          ['Ergun Regime', record.ergunRegimeDescription, ''],
        ]

      case 'packedBedReactorDesign':
        return [
          ['Inlet Molar Flow A', record.inletMolarFlowRateA, 'mol/s'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Outlet Molar Flow A', record.outletMolarFlowRateA, 'mol/s'],
          ['Catalyst Weight / Volumetric Flow', record.catalystWeightPerVolumetricFlow, 'kgcat·s/m³'],
          ['Catalyst Weight / Molar Feed', record.catalystWeightPerMolarFeed, 'kgcat·s/mol'],
          ['Logarithmic Conversion Factor', record.logarithmicConversionFactor, '—'],
          ['Apparent Catalyst Space Velocity', record.apparentCatalystSpaceVelocity, 'm³/(kgcat·s)'],
        ]

      case 'parallelReactions':
        return [
          ['Desired Reaction Rate', record.desiredReactionRate, 'rate basis'],
          ['Undesired Reaction Rate', record.undesiredReactionRate, 'rate basis'],
          ['Total Disappearance Rate', record.totalDisappearanceRate, 'rate basis'],
          ['Desired Product Fraction', Number(record.desiredProductFraction) * 100, '%'],
          ['Undesired Product Fraction', Number(record.undesiredProductFraction) * 100, '%'],
          ['Local Overall Reaction Order', record.overallReactionOrderAtState, '—'],
          ['Concentration Effect', record.concentrationSensitivityDescription, ''],
        ]

      case 'pbrPressureDropEffects':
        return [
          ['Conversion with Pressure Drop', Number(record.conversionWithPressureDrop) * 100, '%'],
          ['Conversion without Pressure Drop', Number(record.conversionWithoutPressureDrop) * 100, '%'],
          ['Conversion Penalty', Number(record.conversionPenalty) * 100, 'percentage points'],
          ['Outlet Pressure', record.outletPressure, 'Pa'],
          ['Outlet / Inlet Pressure', Number(record.outletPressureRatio) * 100, '%'],
          ['Pressure-Drop Fraction', Number(record.pressureDropFraction) * 100, '%'],
          ['Effective Catalyst Exposure', record.effectiveCatalystExposureIntegral, 'kgcat'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Severity', record.pressureDropSeverityDescription, ''],
        ]

      case 'rateConstantCalculation':
        return [
          ['Overall Reaction Order', record.overallReactionOrder, '—'],
          ['Concentration Factor A', record.concentrationFactorA, 'concentration power'],
          ['Concentration Factor B', record.concentrationFactorB, 'concentration power'],
          ['Combined Concentration Factor', record.combinedConcentrationFactor, 'concentration power'],
          ['Reconstructed Reaction Rate', record.reconstructedReactionRate, 'rate basis'],
          ['Relative Reconstruction Error', Number(record.relativeReconstructionError) * 100, '%'],
          ['Dimensional Basis', record.dimensionalBasisDescription, ''],
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
          note="Engineering screening model. Verify kinetic units, heat-capacity and cooling assumptions, packed-bed geometry, Ergun applicability, gas-pressure-drop basis and reaction-rate dimensional basis before design use."
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
