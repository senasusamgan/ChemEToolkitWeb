import { useState } from 'react'
import {
  ReactionEngineeringBatch02CalculationError,
  calculateBypassDeadVolumeReactor,
  calculateCatalystDeactivationKinetics,
  calculateCatalystRegenerationCycle,
  calculateCatalystTimeOnStream,
  calculateCatalystWeightFromRateData,
  calculateConversionFromRTD,
} from './engine'
import type {
  ReactionEngineeringBatch02Mode,
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
    ReactionEngineeringBatch02Mode
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
  ReactionEngineeringBatch02Mode,
  Definition
> = {
  bypassDeadVolumeReactor: {
    code: 'RE–17',
    icon: 'BDV',
    title:
      'Bypass–Dead-Volume Reactor',
    subtitle:
      'Estimate first-order conversion with hydraulic bypass and inactive volume',
    basis:
      'Vactive = V(1−fd), Qactive = Q(1−fb), Xoverall = (1−fb)[1−exp(−kVactive/Qactive)]',
    action:
      'Calculate nonideal conversion',
    headline:
      'Overall conversion',
    fields: [
      { key: 'nominalReactorVolume', label: 'Nominal Reactor Volume', symbol: 'V', unit: 'm³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
      { key: 'bypassFraction', label: 'Bypass Fraction', symbol: 'fb', unit: '0–1' },
      { key: 'deadVolumeFraction', label: 'Dead-Volume Fraction', symbol: 'fd', unit: '0–1' },
    ],
    example: {
      nominalReactorVolume: '10',
      volumetricFlowRate: '0.1',
      firstOrderRateConstant: '0.02',
      bypassFraction: '0.08',
      deadVolumeFraction: '0.15',
    },
  },

  catalystDeactivationKinetics: {
    code: 'RE–18',
    icon: 'a(t)',
    title:
      'Catalyst Deactivation Kinetics',
    subtitle:
      'Evaluate generalized catalyst activity decay and target lifetime',
    basis:
      'da/dt = −kd aᵐ',
    action:
      'Calculate activity decay',
    headline:
      'Current catalyst activity',
    fields: [
      { key: 'initialActivity', label: 'Initial Activity', symbol: 'a₀', unit: '0–1' },
      { key: 'deactivationRateConstant', label: 'Deactivation Rate Constant', symbol: 'kd', unit: 'time⁻¹' },
      { key: 'deactivationOrder', label: 'Deactivation Order', symbol: 'm', unit: '0–2' },
      { key: 'elapsedTime', label: 'Elapsed Time', symbol: 't', unit: 'time' },
      { key: 'targetActivity', label: 'Target Activity', symbol: 'atarget', unit: '0–1' },
    ],
    example: {
      initialActivity: '1',
      deactivationRateConstant: '0.02',
      deactivationOrder: '1',
      elapsedTime: '20',
      targetActivity: '0.5',
    },
  },

  catalystRegenerationCycle: {
    code: 'RE–19',
    icon: '↻',
    title:
      'Catalyst Regeneration Cycle',
    subtitle:
      'Estimate recovered activity, cycle availability and irreversible decay',
    basis:
      'areg = abefore + frecovery(1−abefore); anext = areg(1−floss)',
    action:
      'Calculate regeneration cycle',
    headline:
      'Next-cycle starting activity',
    fields: [
      { key: 'activityBeforeRegeneration', label: 'Activity Before Regeneration', symbol: 'ab', unit: '0–1' },
      { key: 'regenerationRecoveryFraction', label: 'Recovery Fraction', symbol: 'fr', unit: '0–1' },
      { key: 'irreversibleLossFractionPerCycle', label: 'Irreversible Loss per Cycle', symbol: 'floss', unit: '0–1' },
      { key: 'serviceTimePerCycle', label: 'Service Time per Cycle', symbol: 'ts', unit: 'time' },
      { key: 'regenerationTimePerCycle', label: 'Regeneration Time per Cycle', symbol: 'tr', unit: 'time' },
    ],
    example: {
      activityBeforeRegeneration: '0.55',
      regenerationRecoveryFraction: '0.8',
      irreversibleLossFractionPerCycle: '0.03',
      serviceTimePerCycle: '100',
      regenerationTimePerCycle: '12',
    },
  },

  catalystTimeOnStream: {
    code: 'RE–20',
    icon: 'TOS',
    title:
      'Catalyst Time-on-Stream',
    subtitle:
      'Infer deactivation kinetics from an observed activity measurement',
    basis:
      'Fit da/dt = −kd aᵐ from a₀, aobserved and time-on-stream',
    action:
      'Estimate catalyst lifetime',
    headline:
      'Remaining time to target',
    fields: [
      { key: 'initialActivity', label: 'Initial Activity', symbol: 'a₀', unit: '0–1' },
      { key: 'observedActivity', label: 'Observed Activity', symbol: 'aobs', unit: '0–1' },
      { key: 'observedTime', label: 'Observed Time-on-Stream', symbol: 'tobs', unit: 'time' },
      { key: 'deactivationOrder', label: 'Deactivation Order', symbol: 'm', unit: '0–2' },
      { key: 'targetActivity', label: 'Minimum Target Activity', symbol: 'amin', unit: '0–1' },
    ],
    example: {
      initialActivity: '1',
      observedActivity: '0.75',
      observedTime: '100',
      deactivationOrder: '1',
      targetActivity: '0.5',
    },
  },

  catalystWeightFromRateData: {
    code: 'RE–21',
    icon: 'Wcat',
    title:
      'Catalyst Weight from Rate Data',
    subtitle:
      'Integrate packed-bed catalyst requirement from an observed rate expression',
    basis:
      'W = FA0∫dX/[η k CA0ⁿ(1−X)ⁿ]',
    action:
      'Calculate catalyst weight',
    headline:
      'Required catalyst weight',
    fields: [
      { key: 'inletMolarFlowRate', label: 'Inlet Molar Flow Rate', symbol: 'FA0', unit: 'mol/s' },
      { key: 'inletConcentration', label: 'Inlet Concentration', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
      { key: 'rateConstantPerCatalystMass', label: 'Rate Constant per Catalyst Mass', symbol: 'kW', unit: 'rate basis' },
      { key: 'reactionOrder', label: 'Reaction Order', symbol: 'n', unit: '—' },
      { key: 'effectivenessFactor', label: 'Effectiveness Factor', symbol: 'η', unit: '0–1' },
    ],
    example: {
      inletMolarFlowRate: '10',
      inletConcentration: '1000',
      targetConversion: '0.8',
      rateConstantPerCatalystMass: '0.00002',
      reactionOrder: '1',
      effectivenessFactor: '0.85',
    },
  },

  conversionFromRTD: {
    code: 'RE–22',
    icon: 'XRTD',
    title:
      'Conversion from RTD',
    subtitle:
      'Estimate first-order conversion from measured RTD moments',
    basis:
      'N = τ²/σ²; X = 1 − (1 + kτ/N)⁻ᴺ',
    action:
      'Calculate RTD conversion',
    headline:
      'RTD-based conversion',
    fields: [
      { key: 'meanResidenceTime', label: 'Mean Residence Time', symbol: 'τ', unit: 's' },
      { key: 'residenceTimeVariance', label: 'Residence-Time Variance', symbol: 'σ²', unit: 's²' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
    ],
    example: {
      meanResidenceTime: '100',
      residenceTimeVariance: '1000',
      firstOrderRateConstant: '0.02',
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

export function ReactionEngineeringBatch02Calculator({
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
        case 'bypassDeadVolumeReactor':
          next =
            calculateBypassDeadVolumeReactor({
              nominalReactorVolume:
                number('nominalReactorVolume'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
              bypassFraction:
                number('bypassFraction'),
              deadVolumeFraction:
                number('deadVolumeFraction'),
            })
          break

        case 'catalystDeactivationKinetics':
          next =
            calculateCatalystDeactivationKinetics({
              initialActivity:
                number('initialActivity'),
              deactivationRateConstant:
                number('deactivationRateConstant'),
              deactivationOrder:
                number('deactivationOrder'),
              elapsedTime:
                number('elapsedTime'),
              targetActivity:
                number('targetActivity'),
            })
          break

        case 'catalystRegenerationCycle':
          next =
            calculateCatalystRegenerationCycle({
              activityBeforeRegeneration:
                number('activityBeforeRegeneration'),
              regenerationRecoveryFraction:
                number('regenerationRecoveryFraction'),
              irreversibleLossFractionPerCycle:
                number('irreversibleLossFractionPerCycle'),
              serviceTimePerCycle:
                number('serviceTimePerCycle'),
              regenerationTimePerCycle:
                number('regenerationTimePerCycle'),
            })
          break

        case 'catalystTimeOnStream':
          next =
            calculateCatalystTimeOnStream({
              initialActivity:
                number('initialActivity'),
              observedActivity:
                number('observedActivity'),
              observedTime:
                number('observedTime'),
              deactivationOrder:
                number('deactivationOrder'),
              targetActivity:
                number('targetActivity'),
            })
          break

        case 'catalystWeightFromRateData':
          next =
            calculateCatalystWeightFromRateData({
              inletMolarFlowRate:
                number('inletMolarFlowRate'),
              inletConcentration:
                number('inletConcentration'),
              targetConversion:
                number('targetConversion'),
              rateConstantPerCatalystMass:
                number('rateConstantPerCatalystMass'),
              reactionOrder:
                number('reactionOrder'),
              effectivenessFactor:
                number('effectivenessFactor'),
            })
          break

        case 'conversionFromRTD':
          next =
            calculateConversionFromRTD({
              meanResidenceTime:
                number('meanResidenceTime'),
              residenceTimeVariance:
                number('residenceTimeVariance'),
              firstOrderRateConstant:
                number('firstOrderRateConstant'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch02CalculationError
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
      case 'bypassDeadVolumeReactor':
        return record.overallConversion
      case 'catalystDeactivationKinetics':
        return record.currentActivity
      case 'catalystRegenerationCycle':
        return record.nextCycleStartingActivity
      case 'catalystTimeOnStream':
        return record.remainingTimeToTargetActivity
      case 'catalystWeightFromRateData':
        return record.requiredCatalystWeight
      case 'conversionFromRTD':
        return record.rtdBasedConversion
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'bypassDeadVolumeReactor':
        return [
          ['Overall Conversion', Number(record.overallConversion) * 100, '%'],
          ['Active-Path Conversion', Number(record.activePathConversion) * 100, '%'],
          ['Active Reactor Volume', record.activeReactorVolume, 'm³'],
          ['Reacting Flow Rate', record.reactingFlowRate, 'm³/s'],
          ['Bypass Flow Rate', record.bypassFlowRate, 'm³/s'],
          ['Nominal Space Time', record.nominalSpaceTime, 's'],
          ['Active-Path Space Time', record.activePathSpaceTime, 's'],
          ['Hydraulic Effectiveness', record.hydraulicEffectiveness, '—'],
          ['Outlet Concentration Fraction', record.outletConcentrationFraction, '—'],
        ]

      case 'catalystDeactivationKinetics':
        return [
          ['Retained Activity', record.retainedActivityPercent, '%'],
          ['Lost Activity Fraction', record.lostActivityFraction, '—'],
          ['Total Time to Target', record.timeToTargetActivity, 'time'],
          ['Remaining Time to Target', record.remainingTimeToTarget, 'time'],
          ['Time to Half Activity', record.timeToHalfInitialActivity, 'time'],
          ['Target Already Passed', record.targetAlreadyPassed ? 'Yes' : 'No', ''],
          ['Finite Extinction Time', record.finiteExtinctionTime ?? 'Not finite', 'time'],
        ]

      case 'catalystRegenerationCycle':
        return [
          ['Regenerated Activity', record.regeneratedActivity, '—'],
          ['Recovered Activity', record.recoveredActivity, '—'],
          ['Irreversible Activity Loss', record.irreversibleActivityLoss, '—'],
          ['Cycle Uptime', Number(record.cycleUptimeFraction) * 100, '%'],
          ['Average Cycle Activity Index', record.averageCycleActivityIndex, '—'],
          ['Cycle Duration', record.cycleDuration, 'time'],
          ['Cycles to Half Starting Activity', record.cyclesToHalfStartingActivity, 'cycles'],
        ]

      case 'catalystTimeOnStream':
        return [
          ['Inferred Deactivation Constant', record.inferredDeactivationRateConstant, 'time⁻¹'],
          ['Total Time to Target', record.totalTimeToTargetActivity, 'time'],
          ['Total Time to Half Activity', record.totalTimeToHalfActivity, 'time'],
          ['Observed Activity Loss', record.observedActivityLossPercent, '%'],
          ['Observed Target Already Passed', record.observedTargetAlreadyPassed ? 'Yes' : 'No', ''],
          ['Deactivation Model', record.deactivationModelDescription, ''],
        ]

      case 'catalystWeightFromRateData':
        return [
          ['Inlet Observed Rate', record.inletObservedRatePerCatalystMass, 'mol/(kgcat·s)'],
          ['Outlet Observed Rate', record.outletObservedRatePerCatalystMass, 'mol/(kgcat·s)'],
          ['Outlet Concentration', record.outletConcentration, 'mol/m³'],
          ['Catalyst Weight per Molar Feed', record.catalystWeightPerMolarFeed, 'kgcat·s/mol'],
          ['Average Observed Rate', record.averageObservedRatePerCatalystMass, 'mol/(kgcat·s)'],
          ['Integration Intervals', record.integrationIntervals, '—'],
        ]

      case 'conversionFromRTD':
        return [
          ['RTD-Based Conversion', Number(record.rtdBasedConversion) * 100, '%'],
          ['Equivalent Tanks in Series', record.equivalentTanksInSeries, '—'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Damköhler Number', record.damkohlerNumber, '—'],
          ['Ideal PFR Conversion', Number(record.idealPFRConversion) * 100, '%'],
          ['Ideal CSTR Conversion', Number(record.idealCSTRConversion) * 100, '%'],
          ['RTD / PFR Conversion Ratio', record.conversionRelativeToPFR, '—'],
          ['RTD / CSTR Conversion Ratio', record.conversionRelativeToCSTR, '—'],
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
          note="Engineering screening model. Verify the hydraulic model, activity-decay law, regeneration mechanism, observed-rate units, RTD moments and kinetic assumptions before design use."
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
