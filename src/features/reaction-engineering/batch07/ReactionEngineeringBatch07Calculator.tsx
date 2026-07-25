import { useState } from 'react'
import {
  ReactionEngineeringBatch07CalculationError,
  calculateRateConstantTemperatureShift,
  calculateRateLawBuilder,
  calculateReactionOrderDetermination,
  calculateReactiveDistillationBasics,
  calculateReactorOptimization,
  calculateRecyclePFR,
} from './engine'
import type {
  ReactionEngineeringBatch07Mode,
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
    ReactionEngineeringBatch07Mode
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
  ReactionEngineeringBatch07Mode,
  Definition
> = {
  rateConstantTemperatureShift: {
    code: 'RE–47',
    icon: 'kT',
    title:
      'Rate Constant Temperature Shift',
    subtitle:
      'Shift a known rate constant between two temperatures using Arrhenius behavior',
    basis:
      'ln(k₂/k₁) = −Ea/R · (1/T₂ − 1/T₁)',
    action:
      'Shift rate constant',
    headline:
      'Target rate constant',
    fields: [
      { key: 'referenceRateConstant', label: 'Reference Rate Constant', symbol: 'k₁', unit: 'rate basis' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'referenceTemperature', label: 'Reference Temperature', symbol: 'T₁', unit: 'K' },
      { key: 'targetTemperature', label: 'Target Temperature', symbol: 'T₂', unit: 'K' },
    ],
    example: {
      referenceRateConstant: '0.02',
      activationEnergy: '50000',
      referenceTemperature: '350',
      targetTemperature: '400',
    },
  },

  rateLawBuilder: {
    code: 'RE–48',
    icon: 'r',
    title:
      'Rate-Law Builder',
    subtitle:
      'Build power-law and stoichiometric rate relationships for two reactants',
    basis:
      'r = k C_A^α C_B^β',
    action:
      'Build rate law',
    headline:
      'Overall reaction order',
    fields: [
      { key: 'stoichiometricCoefficientA', label: 'Stoichiometric Coefficient A', symbol: 'a', unit: '—' },
      { key: 'stoichiometricCoefficientB', label: 'Stoichiometric Coefficient B', symbol: 'b', unit: '—' },
      { key: 'reactionOrderA', label: 'Reaction Order in A', symbol: 'α', unit: '—' },
      { key: 'reactionOrderB', label: 'Reaction Order in B', symbol: 'β', unit: '—' },
    ],
    example: {
      stoichiometricCoefficientA: '1',
      stoichiometricCoefficientB: '2',
      reactionOrderA: '1',
      reactionOrderB: '2',
    },
  },

  reactionOrderDetermination: {
    code: 'RE–49',
    icon: 'n',
    title:
      'Reaction Order Determination',
    subtitle:
      'Determine a power-law reaction order from two initial-rate experiments',
    basis:
      'n = ln(r₂/r₁) / ln(C₂/C₁)',
    action:
      'Determine reaction order',
    headline:
      'Reaction order',
    fields: [
      { key: 'concentrationExperimentOne', label: 'Experiment 1 Concentration', symbol: 'C₁', unit: 'mol/m³' },
      { key: 'rateExperimentOne', label: 'Experiment 1 Rate', symbol: 'r₁', unit: 'rate basis' },
      { key: 'concentrationExperimentTwo', label: 'Experiment 2 Concentration', symbol: 'C₂', unit: 'mol/m³' },
      { key: 'rateExperimentTwo', label: 'Experiment 2 Rate', symbol: 'r₂', unit: 'rate basis' },
    ],
    example: {
      concentrationExperimentOne: '1',
      rateExperimentOne: '2',
      concentrationExperimentTwo: '2',
      rateExperimentTwo: '8',
    },
  },

  reactiveDistillationBasics: {
    code: 'RE–50',
    icon: 'RD',
    title:
      'Reactive Distillation Basics',
    subtitle:
      'Screen conversion enhancement from stagewise equilibrium and product removal',
    basis:
      'A + B ⇌ P; each stage reaches equilibrium before a fraction of P is removed',
    action:
      'Calculate stagewise enhancement',
    headline:
      'Overall conversion of A',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'initialConcentrationB', label: 'Initial Concentration B', symbol: 'CB0', unit: 'mol/m³' },
      { key: 'equilibriumConstant', label: 'Equilibrium Constant', symbol: 'Keq', unit: 'concentration⁻¹' },
      { key: 'stageProductRemovalFraction', label: 'Product Removal per Stage', symbol: 'fP', unit: '0–1' },
      { key: 'equilibriumStages', label: 'Equilibrium Stages', symbol: 'N', unit: 'integer' },
    ],
    example: {
      initialConcentrationA: '1',
      initialConcentrationB: '1',
      equilibriumConstant: '4',
      stageProductRemovalFraction: '0.5',
      equilibriumStages: '5',
    },
  },

  reactorOptimization: {
    code: 'RE–51',
    icon: 'OPT',
    title:
      'Reactor Optimization',
    subtitle:
      'Optimize first-order PFR conversion against annual product value and reactor cost',
    basis:
      'V = −Q ln(1−X)/k; annual margin = product value − annualized reactor cost',
    action:
      'Optimize reactor conversion',
    headline:
      'Optimum conversion',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
      { key: 'annualOperatingHours', label: 'Annual Operating Hours', symbol: 'H', unit: 'h/year' },
      { key: 'productValuePerMole', label: 'Product Value', symbol: 'Vp', unit: '₺/mol' },
      { key: 'annualizedReactorCostPerVolume', label: 'Annualized Reactor Cost', symbol: 'Cv', unit: '₺/(m³·year)' },
      { key: 'minimumConversion', label: 'Minimum Conversion', symbol: 'Xmin', unit: '0–1' },
      { key: 'maximumConversion', label: 'Maximum Conversion', symbol: 'Xmax', unit: '0–1' },
    ],
    example: {
      inletConcentrationA: '1000',
      volumetricFlowRate: '0.01',
      firstOrderRateConstant: '0.02',
      annualOperatingHours: '8000',
      productValuePerMole: '0.001',
      annualizedReactorCostPerVolume: '200000',
      minimumConversion: '0.1',
      maximumConversion: '0.99',
    },
  },

  recyclePFR: {
    code: 'RE–52',
    icon: '↻P',
    title:
      'Recycle PFR',
    subtitle:
      'Calculate first-order recycle PFR mixing, single-pass and overall conversion',
    basis:
      'Cout = e⁻ᵏτ C0 / [1+R−R e⁻ᵏτ], τ = V/[Q0(1+R)]',
    action:
      'Calculate recycle PFR',
    headline:
      'Overall conversion',
    fields: [
      { key: 'freshFeedConcentrationA', label: 'Fresh-Feed Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'freshVolumetricFlowRate', label: 'Fresh Volumetric Flow', symbol: 'Q0', unit: 'm³/s' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
      { key: 'reactorVolume', label: 'Reactor Volume', symbol: 'V', unit: 'm³' },
      { key: 'recycleRatio', label: 'Recycle Ratio', symbol: 'R', unit: '—' },
    ],
    example: {
      freshFeedConcentrationA: '1000',
      freshVolumetricFlowRate: '0.01',
      firstOrderRateConstant: '0.02',
      reactorVolume: '1',
      recycleRatio: '2',
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

export function ReactionEngineeringBatch07Calculator({
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
        case 'rateConstantTemperatureShift':
          next =
            calculateRateConstantTemperatureShift({
              referenceRateConstant:
                number('referenceRateConstant'),
              activationEnergy:
                number('activationEnergy'),
              referenceTemperature:
                number('referenceTemperature'),
              targetTemperature:
                number('targetTemperature'),
            })
          break

        case 'rateLawBuilder':
          next =
            calculateRateLawBuilder({
              stoichiometricCoefficientA:
                number('stoichiometricCoefficientA'),
              stoichiometricCoefficientB:
                number('stoichiometricCoefficientB'),
              reactionOrderA:
                number('reactionOrderA'),
              reactionOrderB:
                number('reactionOrderB'),
            })
          break

        case 'reactionOrderDetermination':
          next =
            calculateReactionOrderDetermination({
              concentrationExperimentOne:
                number('concentrationExperimentOne'),
              rateExperimentOne:
                number('rateExperimentOne'),
              concentrationExperimentTwo:
                number('concentrationExperimentTwo'),
              rateExperimentTwo:
                number('rateExperimentTwo'),
            })
          break

        case 'reactiveDistillationBasics':
          next =
            calculateReactiveDistillationBasics({
              initialConcentrationA:
                number('initialConcentrationA'),
              initialConcentrationB:
                number('initialConcentrationB'),
              equilibriumConstant:
                number('equilibriumConstant'),
              stageProductRemovalFraction:
                number('stageProductRemovalFraction'),
              equilibriumStages:
                number('equilibriumStages'),
            })
          break

        case 'reactorOptimization':
          next =
            calculateReactorOptimization({
              inletConcentrationA:
                number('inletConcentrationA'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
              annualOperatingHours:
                number('annualOperatingHours'),
              productValuePerMole:
                number('productValuePerMole'),
              annualizedReactorCostPerVolume:
                number('annualizedReactorCostPerVolume'),
              minimumConversion:
                number('minimumConversion'),
              maximumConversion:
                number('maximumConversion'),
            })
          break

        case 'recyclePFR':
          next =
            calculateRecyclePFR({
              freshFeedConcentrationA:
                number('freshFeedConcentrationA'),
              freshVolumetricFlowRate:
                number('freshVolumetricFlowRate'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
              reactorVolume:
                number('reactorVolume'),
              recycleRatio:
                number('recycleRatio'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch07CalculationError
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
      case 'rateConstantTemperatureShift':
        return record.shiftedRateConstant
      case 'rateLawBuilder':
        return record.overallReactionOrder
      case 'reactionOrderDetermination':
        return record.reactionOrder
      case 'reactiveDistillationBasics':
        return Number(
          record.overallConversionA,
        ) *
        100
      case 'reactorOptimization':
        return Number(
          record.optimumConversion,
        ) *
        100
      case 'recyclePFR':
        return Number(
          record.overallConversionA,
        ) *
        100
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'rateConstantTemperatureShift':
        return [
          ['Rate-Constant Ratio', record.rateConstantRatio, '—'],
          ['ln(k₂/k₁)', record.logarithmicRateConstantRatio, '—'],
          ['Temperature Difference', record.temperatureDifference, 'K'],
          ['Inverse-Temperature Difference', record.inverseTemperatureDifference, '1/K'],
          ['Arrhenius Exponent', record.activationExponent, '—'],
          ['Direction', record.rateDirectionDescription, ''],
        ]

      case 'rateLawBuilder':
        return [
          ['Overall Reaction Order', record.overallReactionOrder, '—'],
          ['k Concentration Exponent', record.rateConstantConcentrationExponent, '—'],
          ['Power-Law Expression', record.powerLawExpression, ''],
          ['A Disappearance Rate', record.disappearanceRateExpressionA, ''],
          ['B Disappearance Rate', record.disappearanceRateExpressionB, ''],
          ['Stoichiometric Relationship', record.stoichiometricRateRelationship, ''],
          ['Rate-Constant Units', record.rateConstantUnitsDescription, ''],
          ['Interpretation', record.consistencyDescription, ''],
        ]

      case 'reactionOrderDetermination':
        return [
          ['Reaction Order', record.reactionOrder, '—'],
          ['Experiment 1 Rate Constant', record.rateConstantExperimentOne, 'rate basis'],
          ['Experiment 2 Rate Constant', record.rateConstantExperimentTwo, 'rate basis'],
          ['Representative Rate Constant', record.representativeRateConstant, 'rate basis'],
          ['Concentration Ratio', record.concentrationRatio, '—'],
          ['Rate Ratio', record.rateRatio, '—'],
          ['Rate-Constant Relative Difference', Number(record.rateConstantRelativeDifference) * 100, '%'],
          ['Classification', record.orderClassification, ''],
          ['Power-Law Expression', record.powerLawExpression, ''],
        ]

      case 'reactiveDistillationBasics': {
        const stageConversions =
          record.stageConversionsA as number[]

        return [
          ['Overall Conversion A', Number(record.overallConversionA) * 100, '%'],
          ['Overall Conversion B', Number(record.overallConversionB) * 100, '%'],
          ['Remaining Concentration A', record.remainingConcentrationA, 'mol/m³'],
          ['Remaining Concentration B', record.remainingConcentrationB, 'mol/m³'],
          ['Retained Product', record.retainedProductConcentration, 'mol/m³'],
          ['Removed Product', record.removedProductConcentration, 'mol/m³'],
          ['Total Product Formed', record.totalProductFormed, 'mol/m³'],
          ['Product Recovery', Number(record.productRecoveryFraction) * 100, '%'],
          ['Stage Conversions A', stageConversions.map((value) => displayValue(value * 100)).join(', '), '%'],
          ['Enhancement over One Stage', Number(record.conversionEnhancementOverSingleStage) * 100, 'percentage points'],
        ]
      }

      case 'reactorOptimization':
        return [
          ['Optimum Conversion', Number(record.optimumConversion) * 100, '%'],
          ['Optimum Reactor Volume', record.optimumReactorVolume, 'm³'],
          ['Annual Product Amount', record.annualProductMoles, 'mol/year'],
          ['Annual Product Value', record.annualProductValue, '₺/year'],
          ['Annualized Reactor Cost', record.annualizedReactorCost, '₺/year'],
          ['Optimum Annual Margin', record.optimumAnnualMargin, '₺/year'],
          ['Lower-Bound Margin', record.lowerBoundAnnualMargin, '₺/year'],
          ['Upper-Bound Margin', record.upperBoundAnnualMargin, '₺/year'],
          ['Optimization Grid Points', record.optimizationGridPoints, '—'],
          ['Optimum at Search Boundary', record.optimumAtBoundary ? 'Yes' : 'No', ''],
        ]

      case 'recyclePFR':
        return [
          ['Overall Conversion A', Number(record.overallConversionA) * 100, '%'],
          ['Single-Pass Conversion', Number(record.singlePassConversion) * 100, '%'],
          ['Total Reactor Flow', record.totalReactorFlowRate, 'm³/s'],
          ['Recycle Flow', record.recycleFlowRate, 'm³/s'],
          ['Reactor Space Time', record.reactorSpaceTime, 's'],
          ['Single-Pass Decay Factor', record.singlePassDecayFactor, '—'],
          ['Mixed Inlet Concentration A', record.mixedInletConcentrationA, 'mol/m³'],
          ['Reactor Outlet Concentration A', record.reactorOutletConcentrationA, 'mol/m³'],
          ['Fresh-Feed Molar Rate A', record.freshFeedMolarRateA, 'mol/s'],
          ['Net Outlet Molar Rate A', record.outletMolarRateA, 'mol/s'],
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
          note="Engineering screening model. Verify kinetic units, elementary-reaction assumptions, equilibrium and stage definitions, economic basis, recycle mixing and constant-density assumptions before design use."
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
