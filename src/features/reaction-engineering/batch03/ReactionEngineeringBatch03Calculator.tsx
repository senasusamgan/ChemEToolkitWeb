import { useState } from 'react'
import {
  ReactionEngineeringBatch03CalculationError,
  calculateCSTRPFRSequence,
  calculateDeadVolumeEstimator,
  calculateDeactivatingPackedBedReactor,
  calculateECurveGenerator,
  calculateEconomicReactorSelection,
  calculateEnzymeBatchReactor,
} from './engine'
import type {
  ReactionEngineeringBatch03Mode,
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
    ReactionEngineeringBatch03Mode
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
  ReactionEngineeringBatch03Mode,
  Definition
> = {
  cstrPFRSequence: {
    code: 'RE–23',
    icon: 'C→P',
    title:
      'CSTR–PFR Sequence',
    subtitle:
      'Evaluate a first-order CSTR followed by a PFR at fixed total space time',
    basis:
      'CA,1 = CA0/(1+kτCSTR); CA,2 = CA,1 exp(−kτPFR)',
    action:
      'Calculate sequence conversion',
    headline:
      'Overall conversion',
    fields: [
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
      { key: 'totalSpaceTime', label: 'Total Space Time', symbol: 'τT', unit: 's' },
      { key: 'cstrSpaceTimeFraction', label: 'CSTR Fraction of Space Time', symbol: 'fCSTR', unit: '0–1' },
    ],
    example: {
      inletConcentration: '1000',
      firstOrderRateConstant: '0.02',
      totalSpaceTime: '100',
      cstrSpaceTimeFraction: '0.4',
    },
  },

  deactivatingPackedBedReactor: {
    code: 'RE–24',
    icon: 'PBR',
    title:
      'Deactivating Packed-Bed Reactor',
    subtitle:
      'Estimate first-order packed-bed conversion as catalyst activity decays',
    basis:
      'a = a0 exp(−kdt); X = 1 − exp[−ηkaCA0W/FA0]',
    action:
      'Calculate deactivating PBR',
    headline:
      'Current conversion',
    fields: [
      { key: 'inletMolarFlowRate', label: 'Inlet Molar Flow Rate', symbol: 'FA0', unit: 'mol/s' },
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'catalystWeight', label: 'Catalyst Weight', symbol: 'W', unit: 'kgcat' },
      { key: 'rateConstantPerCatalystMass', label: 'Rate Constant per Catalyst Mass', symbol: 'k', unit: 'm³/(kgcat·s)' },
      { key: 'effectivenessFactor', label: 'Effectiveness Factor', symbol: 'η', unit: '0–1' },
      { key: 'initialActivity', label: 'Initial Activity', symbol: 'a0', unit: '0–1' },
      { key: 'deactivationRateConstant', label: 'Deactivation Rate Constant', symbol: 'kd', unit: '1/time' },
      { key: 'timeOnStream', label: 'Time-on-Stream', symbol: 't', unit: 'time' },
    ],
    example: {
      inletMolarFlowRate: '10',
      inletConcentration: '1000',
      catalystWeight: '100',
      rateConstantPerCatalystMass: '0.00002',
      effectivenessFactor: '0.85',
      initialActivity: '1',
      deactivationRateConstant: '0.01',
      timeOnStream: '50',
    },
  },

  deadVolumeEstimator: {
    code: 'RE–25',
    icon: 'DV',
    title:
      'Dead Volume Estimator',
    subtitle:
      'Infer hydraulically inactive reactor volume from the measured mean residence time',
    basis:
      'Vactive = Q tmean; Vdead = Vnominal − Vactive',
    action:
      'Estimate dead volume',
    headline:
      'Estimated dead-volume fraction',
    fields: [
      { key: 'nominalReactorVolume', label: 'Nominal Reactor Volume', symbol: 'Vn', unit: 'm³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'measuredMeanResidenceTime', label: 'Measured Mean Residence Time', symbol: 'tm', unit: 's' },
    ],
    example: {
      nominalReactorVolume: '10',
      volumetricFlowRate: '0.1',
      measuredMeanResidenceTime: '85',
    },
  },

  eCurveGenerator: {
    code: 'RE–26',
    icon: 'E(t)',
    title:
      'E-Curve Generator',
    subtitle:
      'Evaluate the tanks-in-series exit-age distribution and cumulative response',
    basis:
      'Eθ = Nᴺ θᴺ⁻¹ exp(−Nθ)/(N−1)!',
    action:
      'Generate E-curve point',
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

  economicReactorSelection: {
    code: 'RE–27',
    icon: '₺',
    title:
      'Economic Reactor Selection',
    subtitle:
      'Compare first-order CSTR and PFR volume, installed cost and lifecycle cost',
    basis:
      'VCSTR = QX/[k(1−X)]; VPFR = −Q ln(1−X)/k',
    action:
      'Compare reactor economics',
    headline:
      'Preferred reactor',
    fields: [
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
      { key: 'cstrInstalledCostPerVolume', label: 'CSTR Installed Cost per Volume', symbol: 'CC', unit: '₺/m³' },
      { key: 'pfrInstalledCostPerVolume', label: 'PFR Installed Cost per Volume', symbol: 'CP', unit: '₺/m³' },
      { key: 'cstrAnnualOperatingCost', label: 'CSTR Annual Operating Cost', symbol: 'OC', unit: '₺/year' },
      { key: 'pfrAnnualOperatingCost', label: 'PFR Annual Operating Cost', symbol: 'OP', unit: '₺/year' },
      { key: 'projectLifeYears', label: 'Project Life', symbol: 'N', unit: 'years' },
    ],
    example: {
      inletConcentration: '1000',
      volumetricFlowRate: '0.1',
      firstOrderRateConstant: '0.02',
      targetConversion: '0.8',
      cstrInstalledCostPerVolume: '500000',
      pfrInstalledCostPerVolume: '700000',
      cstrAnnualOperatingCost: '300000',
      pfrAnnualOperatingCost: '220000',
      projectLifeYears: '10',
    },
  },

  enzymeBatchReactor: {
    code: 'RE–28',
    icon: 'MM',
    title:
      'Enzyme Batch Reactor',
    subtitle:
      'Calculate Michaelis–Menten substrate depletion time in a batch reactor',
    basis:
      't = [(S0−Sf) + Km ln(S0/Sf)] / Vmax',
    action:
      'Calculate enzyme batch time',
    headline:
      'Required batch time',
    fields: [
      { key: 'initialSubstrateConcentration', label: 'Initial Substrate Concentration', symbol: 'S0', unit: 'mol/m³' },
      { key: 'maximumReactionRate', label: 'Maximum Reaction Rate', symbol: 'Vmax', unit: 'mol/(m³·s)' },
      { key: 'michaelisConstant', label: 'Michaelis Constant', symbol: 'Km', unit: 'mol/m³' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      initialSubstrateConcentration: '100',
      maximumReactionRate: '2',
      michaelisConstant: '20',
      targetConversion: '0.9',
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

export function ReactionEngineeringBatch03Calculator({
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
        case 'cstrPFRSequence':
          next =
            calculateCSTRPFRSequence({
              inletConcentration:
                number('inletConcentration'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
              totalSpaceTime:
                number('totalSpaceTime'),
              cstrSpaceTimeFraction:
                number('cstrSpaceTimeFraction'),
            })
          break

        case 'deactivatingPackedBedReactor':
          next =
            calculateDeactivatingPackedBedReactor({
              inletMolarFlowRate:
                number('inletMolarFlowRate'),
              inletConcentration:
                number('inletConcentration'),
              catalystWeight:
                number('catalystWeight'),
              rateConstantPerCatalystMass:
                number('rateConstantPerCatalystMass'),
              effectivenessFactor:
                number('effectivenessFactor'),
              initialActivity:
                number('initialActivity'),
              deactivationRateConstant:
                number('deactivationRateConstant'),
              timeOnStream:
                number('timeOnStream'),
            })
          break

        case 'deadVolumeEstimator':
          next =
            calculateDeadVolumeEstimator({
              nominalReactorVolume:
                number('nominalReactorVolume'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              measuredMeanResidenceTime:
                number('measuredMeanResidenceTime'),
            })
          break

        case 'eCurveGenerator':
          next =
            calculateECurveGenerator({
              meanResidenceTime:
                number('meanResidenceTime'),
              tanksInSeries:
                number('tanksInSeries'),
              evaluationTime:
                number('evaluationTime'),
            })
          break

        case 'economicReactorSelection':
          next =
            calculateEconomicReactorSelection({
              inletConcentration:
                number('inletConcentration'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
              targetConversion:
                number('targetConversion'),
              cstrInstalledCostPerVolume:
                number('cstrInstalledCostPerVolume'),
              pfrInstalledCostPerVolume:
                number('pfrInstalledCostPerVolume'),
              cstrAnnualOperatingCost:
                number('cstrAnnualOperatingCost'),
              pfrAnnualOperatingCost:
                number('pfrAnnualOperatingCost'),
              projectLifeYears:
                number('projectLifeYears'),
            })
          break

        case 'enzymeBatchReactor':
          next =
            calculateEnzymeBatchReactor({
              initialSubstrateConcentration:
                number('initialSubstrateConcentration'),
              maximumReactionRate:
                number('maximumReactionRate'),
              michaelisConstant:
                number('michaelisConstant'),
              targetConversion:
                number('targetConversion'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch03CalculationError
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
      case 'cstrPFRSequence':
        return record.overallConversion
      case 'deactivatingPackedBedReactor':
        return record.conversion
      case 'deadVolumeEstimator':
        return record.deadVolumeFraction
      case 'eCurveGenerator':
        return record.exitAgeDensity
      case 'economicReactorSelection':
        return record.preferredReactor
      case 'enzymeBatchReactor':
        return record.requiredBatchTime
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'cstrPFRSequence':
        return [
          ['Overall Conversion', Number(record.overallConversion) * 100, '%'],
          ['CSTR Space Time', record.cstrSpaceTime, 's'],
          ['PFR Space Time', record.pfrSpaceTime, 's'],
          ['CSTR Outlet Concentration', record.cstrOutletConcentration, 'mol/m³'],
          ['Final Outlet Concentration', record.finalOutletConcentration, 'mol/m³'],
          ['Equivalent Ideal PFR Conversion', Number(record.equivalentIdealPFRConversion) * 100, '%'],
          ['Equivalent Ideal CSTR Conversion', Number(record.equivalentIdealCSTRConversion) * 100, '%'],
          ['Advantage over CSTR', Number(record.sequenceAdvantageOverCSTR) * 100, 'percentage points'],
          ['Penalty from PFR', Number(record.sequencePenaltyFromPFR) * 100, 'percentage points'],
        ]

      case 'deactivatingPackedBedReactor':
        return [
          ['Current Conversion', Number(record.conversion) * 100, '%'],
          ['Current Activity', record.currentActivity, '—'],
          ['Retained Activity', record.retainedActivityPercent, '%'],
          ['Effective Rate Constant', record.effectiveRateConstant, 'm³/(kgcat·s)'],
          ['Damköhler Number', record.damkohlerNumber, '—'],
          ['Outlet Concentration', record.outletConcentration, 'mol/m³'],
          ['Outlet Molar Flow', record.outletMolarFlowRate, 'mol/s'],
          ['Fresh-Catalyst Conversion', Number(record.freshCatalystConversion) * 100, '%'],
          ['Conversion Loss', Number(record.conversionLoss) * 100, 'percentage points'],
        ]

      case 'deadVolumeEstimator':
        return [
          ['Estimated Dead Volume', record.estimatedDeadVolume, 'm³'],
          ['Dead-Volume Fraction', Number(record.deadVolumeFraction) * 100, '%'],
          ['Active Reactor Volume', record.activeReactorVolume, 'm³'],
          ['Active-Volume Fraction', Number(record.activeVolumeFraction) * 100, '%'],
          ['Nominal Residence Time', record.nominalResidenceTime, 's'],
          ['Measured / Nominal Time', record.measuredToNominalTimeRatio, '—'],
          ['Hydraulic Utilization', record.hydraulicUtilizationPercent, '%'],
          ['Condition Band', record.conditionBand, ''],
        ]

      case 'eCurveGenerator':
        return [
          ['Dimensionless Time', record.dimensionlessTime, '—'],
          ['Dimensionless E-Curve', record.dimensionlessExitAgeDensity, '—'],
          ['Cumulative Exit Fraction', Number(record.cumulativeExitFraction) * 100, '%'],
          ['Tail Fraction', Number(record.tailFraction) * 100, '%'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Residence-Time Variance', record.residenceTimeVariance, 's²'],
          ['Residence-Time Standard Deviation', record.residenceTimeStandardDeviation, 's'],
        ]

      case 'economicReactorSelection':
        return [
          ['Required CSTR Volume', record.requiredCSTRVolume, 'm³'],
          ['Required PFR Volume', record.requiredPFRVolume, 'm³'],
          ['CSTR Capital Cost', record.cstrCapitalCost, '₺'],
          ['PFR Capital Cost', record.pfrCapitalCost, '₺'],
          ['CSTR Lifecycle Cost', record.cstrLifecycleCost, '₺'],
          ['PFR Lifecycle Cost', record.pfrLifecycleCost, '₺'],
          ['Lifecycle Cost Difference', record.lifecycleCostDifference, '₺'],
          ['Preferred Cost Saving', record.preferredCostSavingPercent, '%'],
          ['PFR Volume Reduction', record.pfrVolumeReductionPercent, '%'],
        ]

      case 'enzymeBatchReactor':
        return [
          ['Final Substrate Concentration', record.finalSubstrateConcentration, 'mol/m³'],
          ['Substrate Consumed', record.substrateConsumed, 'mol/m³'],
          ['Initial Reaction Rate', record.initialReactionRate, 'mol/(m³·s)'],
          ['Final Reaction Rate', record.finalReactionRate, 'mol/(m³·s)'],
          ['Average Reaction Rate', record.averageReactionRate, 'mol/(m³·s)'],
          ['Initial Saturation Fraction', Number(record.initialSaturationFraction) * 100, '%'],
          ['Final Saturation Fraction', Number(record.finalSaturationFraction) * 100, '%'],
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
          note="Engineering screening model. Verify reaction order, density and flow basis, catalyst-rate units, tracer normalization, cost basis and Michaelis–Menten assumptions before design use."
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
