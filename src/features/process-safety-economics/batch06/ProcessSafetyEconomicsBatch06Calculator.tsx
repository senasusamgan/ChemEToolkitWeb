import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch06CalculationError,
  calculateExpectedMonetaryValueDecision,
  calculateFaultTreeProbability,
  calculateLifecycleCostAnalysis,
  calculateProofTestInterval,
  calculateRiskReductionCostEffectiveness,
  calculateSIFAveragePFD,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch06Mode,
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
    ProcessSafetyEconomicsBatch06Mode
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
  headlineUnit: string
  fields: FieldDefinition[]
  example: Record<string, string>
}

const definitions: Record<
  ProcessSafetyEconomicsBatch06Mode,
  Definition
> = {
  faultTreeProbability: {
    code: 'SE–31',
    icon: 'FT',
    title:
      'Fault Tree Probability',
    subtitle:
      'Calculate a three-event OR- or AND-gate top-event probability',
    basis:
      'OR: Ptop = 1 − Π(1 − Pi); AND: Ptop = ΠPi',
    action:
      'Calculate top-event probability',
    headline:
      'Top-event probability',
    headlineUnit: '—',
    fields: [
      { key: 'gateTypeCode', label: 'Gate-Type Code', symbol: 'G', unit: '1 OR · 2 AND' },
      { key: 'basicEventOneProbability', label: 'Basic Event 1 Probability', symbol: 'P₁', unit: '0–1' },
      { key: 'basicEventTwoProbability', label: 'Basic Event 2 Probability', symbol: 'P₂', unit: '0–1' },
      { key: 'basicEventThreeProbability', label: 'Basic Event 3 Probability', symbol: 'P₃', unit: '0–1' },
    ],
    example: {
      gateTypeCode: '1',
      basicEventOneProbability: '0.1',
      basicEventTwoProbability: '0.05',
      basicEventThreeProbability: '0.02',
    },
  },

  sifAveragePFD: {
    code: 'SE–32',
    icon: 'PFD',
    title:
      'SIF Average PFD',
    subtitle:
      'Screen average probability of failure on demand from failure, test and repair terms',
    basis:
      'PFDavg ≈ λDU·TI/2 + λDD·MTTR + PFDcommon',
    action:
      'Calculate average PFD',
    headline:
      'Average probability of failure on demand',
    headlineUnit: '—',
    fields: [
      { key: 'dangerousFailureRate', label: 'Dangerous Failure Rate', symbol: 'λD', unit: '1/h' },
      { key: 'diagnosticCoverageFraction', label: 'Diagnostic Coverage', symbol: 'DC', unit: '0–1' },
      { key: 'proofTestIntervalHours', label: 'Proof-Test Interval', symbol: 'TI', unit: 'h' },
      { key: 'meanRepairTimeHours', label: 'Mean Repair Time', symbol: 'MTTR', unit: 'h' },
      { key: 'commonCausePFD', label: 'Common-Cause PFD Contribution', symbol: 'PFDCC', unit: '—' },
    ],
    example: {
      dangerousFailureRate: '0.000001',
      diagnosticCoverageFraction: '0.7',
      proofTestIntervalHours: '8760',
      meanRepairTimeHours: '24',
      commonCausePFD: '0.0001',
    },
  },

  proofTestIntervalCalculator: {
    code: 'SE–33',
    icon: 'TI',
    title:
      'Proof-Test Interval Calculator',
    subtitle:
      'Solve the maximum test interval that satisfies a target average PFD',
    basis:
      'TImax = 2(PFDtarget − λDD·MTTR − PFDcommon)/λDU',
    action:
      'Calculate test interval',
    headline:
      'Maximum proof-test interval',
    headlineUnit: 'h',
    fields: [
      { key: 'dangerousFailureRate', label: 'Dangerous Failure Rate', symbol: 'λD', unit: '1/h' },
      { key: 'diagnosticCoverageFraction', label: 'Diagnostic Coverage', symbol: 'DC', unit: '0–1' },
      { key: 'meanRepairTimeHours', label: 'Mean Repair Time', symbol: 'MTTR', unit: 'h' },
      { key: 'commonCausePFD', label: 'Common-Cause PFD Contribution', symbol: 'PFDCC', unit: '—' },
      { key: 'targetAveragePFD', label: 'Target Average PFD', symbol: 'PFDtarget', unit: '—' },
    ],
    example: {
      dangerousFailureRate: '0.000001',
      diagnosticCoverageFraction: '0.7',
      meanRepairTimeHours: '24',
      commonCausePFD: '0.0001',
      targetAveragePFD: '0.001',
    },
  },

  riskReductionCostEffectiveness: {
    code: 'SE–34',
    icon: 'RCE',
    title:
      'Risk-Reduction Cost Effectiveness',
    subtitle:
      'Compare discounted risk-reduction benefits with implementation and maintenance cost',
    basis:
      'NPV = PV[(baseline loss − residual loss − maintenance)] − implementation cost',
    action:
      'Calculate cost effectiveness',
    headline:
      'Net present value',
    headlineUnit: 'currency',
    fields: [
      { key: 'baselineAnnualExpectedLoss', label: 'Baseline Annual Expected Loss', symbol: 'ALE₀', unit: 'currency/year' },
      { key: 'residualAnnualExpectedLoss', label: 'Residual Annual Expected Loss', symbol: 'ALE₁', unit: 'currency/year' },
      { key: 'implementationCost', label: 'Implementation Cost', symbol: 'C₀', unit: 'currency' },
      { key: 'annualMaintenanceCost', label: 'Annual Maintenance Cost', symbol: 'CM', unit: 'currency/year' },
      { key: 'analysisPeriodYears', label: 'Analysis Period', symbol: 'N', unit: 'years' },
      { key: 'discountRateFraction', label: 'Discount Rate', symbol: 'r', unit: 'fraction' },
    ],
    example: {
      baselineAnnualExpectedLoss: '500000',
      residualAnnualExpectedLoss: '100000',
      implementationCost: '1000000',
      annualMaintenanceCost: '50000',
      analysisPeriodYears: '10',
      discountRateFraction: '0.1',
    },
  },

  expectedMonetaryValueDecision: {
    code: 'SE–35',
    icon: 'EMV',
    title:
      'Expected Monetary Value Decision',
    subtitle:
      'Compare two alternatives using success and failure monetary outcomes',
    basis:
      'EMV = Psuccess·Vsuccess + (1 − Psuccess)·Vfailure',
    action:
      'Compare expected values',
    headline:
      'Expected-value difference',
    headlineUnit: 'currency',
    fields: [
      { key: 'optionASuccessProbability', label: 'Option A Success Probability', symbol: 'PA', unit: '0–1' },
      { key: 'optionASuccessValue', label: 'Option A Success Value', symbol: 'VA+', unit: 'currency' },
      { key: 'optionAFailureValue', label: 'Option A Failure Value', symbol: 'VA−', unit: 'currency' },
      { key: 'optionBSuccessProbability', label: 'Option B Success Probability', symbol: 'PB', unit: '0–1' },
      { key: 'optionBSuccessValue', label: 'Option B Success Value', symbol: 'VB+', unit: 'currency' },
      { key: 'optionBFailureValue', label: 'Option B Failure Value', symbol: 'VB−', unit: 'currency' },
    ],
    example: {
      optionASuccessProbability: '0.7',
      optionASuccessValue: '2000000',
      optionAFailureValue: '-500000',
      optionBSuccessProbability: '0.9',
      optionBSuccessValue: '1200000',
      optionBFailureValue: '-200000',
    },
  },

  lifecycleCostAnalysis: {
    code: 'SE–36',
    icon: 'LCC',
    title:
      'Lifecycle Cost Analysis',
    subtitle:
      'Discount capital, operating, maintenance, replacement and salvage cash flows',
    basis:
      'LCC = C₀ + PV(OPEX) + PV(maintenance) + PV(replacement) − PV(salvage)',
    action:
      'Calculate lifecycle cost',
    headline:
      'Total lifecycle cost',
    headlineUnit: 'currency',
    fields: [
      { key: 'initialCapitalCost', label: 'Initial Capital Cost', symbol: 'C₀', unit: 'currency' },
      { key: 'annualOperatingCost', label: 'Annual Operating Cost', symbol: 'OPEX', unit: 'currency/year' },
      { key: 'annualMaintenanceCost', label: 'Annual Maintenance Cost', symbol: 'CM', unit: 'currency/year' },
      { key: 'replacementCost', label: 'Replacement Cost', symbol: 'CR', unit: 'currency' },
      { key: 'replacementYear', label: 'Replacement Year', symbol: 'NR', unit: 'year' },
      { key: 'projectLifeYears', label: 'Project Life', symbol: 'N', unit: 'years' },
      { key: 'discountRateFraction', label: 'Discount Rate', symbol: 'r', unit: 'fraction' },
      { key: 'terminalSalvageValue', label: 'Terminal Salvage Value', symbol: 'S', unit: 'currency' },
    ],
    example: {
      initialCapitalCost: '5000000',
      annualOperatingCost: '600000',
      annualMaintenanceCost: '150000',
      replacementCost: '1000000',
      replacementYear: '8',
      projectLifeYears: '15',
      discountRateFraction: '0.08',
      terminalSalvageValue: '500000',
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

export function ProcessSafetyEconomicsBatch06Calculator({
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
        case 'faultTreeProbability':
          next =
            calculateFaultTreeProbability({
              gateTypeCode:
                number('gateTypeCode'),
              basicEventOneProbability:
                number('basicEventOneProbability'),
              basicEventTwoProbability:
                number('basicEventTwoProbability'),
              basicEventThreeProbability:
                number('basicEventThreeProbability'),
            })
          break

        case 'sifAveragePFD':
          next =
            calculateSIFAveragePFD({
              dangerousFailureRate:
                number('dangerousFailureRate'),
              diagnosticCoverageFraction:
                number('diagnosticCoverageFraction'),
              proofTestIntervalHours:
                number('proofTestIntervalHours'),
              meanRepairTimeHours:
                number('meanRepairTimeHours'),
              commonCausePFD:
                number('commonCausePFD'),
            })
          break

        case 'proofTestIntervalCalculator':
          next =
            calculateProofTestInterval({
              dangerousFailureRate:
                number('dangerousFailureRate'),
              diagnosticCoverageFraction:
                number('diagnosticCoverageFraction'),
              meanRepairTimeHours:
                number('meanRepairTimeHours'),
              commonCausePFD:
                number('commonCausePFD'),
              targetAveragePFD:
                number('targetAveragePFD'),
            })
          break

        case 'riskReductionCostEffectiveness':
          next =
            calculateRiskReductionCostEffectiveness({
              baselineAnnualExpectedLoss:
                number('baselineAnnualExpectedLoss'),
              residualAnnualExpectedLoss:
                number('residualAnnualExpectedLoss'),
              implementationCost:
                number('implementationCost'),
              annualMaintenanceCost:
                number('annualMaintenanceCost'),
              analysisPeriodYears:
                number('analysisPeriodYears'),
              discountRateFraction:
                number('discountRateFraction'),
            })
          break

        case 'expectedMonetaryValueDecision':
          next =
            calculateExpectedMonetaryValueDecision({
              optionASuccessProbability:
                number('optionASuccessProbability'),
              optionASuccessValue:
                number('optionASuccessValue'),
              optionAFailureValue:
                number('optionAFailureValue'),
              optionBSuccessProbability:
                number('optionBSuccessProbability'),
              optionBSuccessValue:
                number('optionBSuccessValue'),
              optionBFailureValue:
                number('optionBFailureValue'),
            })
          break

        case 'lifecycleCostAnalysis':
          next =
            calculateLifecycleCostAnalysis({
              initialCapitalCost:
                number('initialCapitalCost'),
              annualOperatingCost:
                number('annualOperatingCost'),
              annualMaintenanceCost:
                number('annualMaintenanceCost'),
              replacementCost:
                number('replacementCost'),
              replacementYear:
                number('replacementYear'),
              projectLifeYears:
                number('projectLifeYears'),
              discountRateFraction:
                number('discountRateFraction'),
              terminalSalvageValue:
                number('terminalSalvageValue'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch06CalculationError
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
      case 'faultTreeProbability':
        return record.topEventProbability
      case 'sifAveragePFD':
        return record.averageProbabilityOfFailureOnDemand
      case 'proofTestIntervalCalculator':
        return record.maximumProofTestIntervalHours
      case 'riskReductionCostEffectiveness':
        return record.netPresentValue
      case 'expectedMonetaryValueDecision':
        return record.expectedValueDifference
      case 'lifecycleCostAnalysis':
        return record.totalLifecycleCost
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'faultTreeProbability':
        return [
          ['Gate Type', record.gateType, ''],
          ['Top-Event Failure', record.topEventFailurePercent, '%'],
          ['Top-Event Success Probability', record.topEventSuccessProbability, '—'],
          ['Equivalent Risk-Reduction Factor', record.equivalentRiskReductionFactor, '—'],
          ['Dominant Basic Event', record.dominantBasicEvent, ''],
          ['Probability Bounds', record.probabilityBoundsDescription, ''],
        ]

      case 'sifAveragePFD':
        return [
          ['Dangerous Detected Failure Rate', record.dangerousDetectedFailureRate, '1/h'],
          ['Dangerous Undetected Failure Rate', record.dangerousUndetectedFailureRate, '1/h'],
          ['Proof-Test Contribution', record.proofTestContribution, '—'],
          ['Repair Contribution', record.repairContribution, '—'],
          ['Common-Cause Contribution', record.commonCauseContribution, '—'],
          ['Risk-Reduction Factor', record.riskReductionFactor, '—'],
          ['Screening SIL Band', record.screeningSILBand, ''],
        ]

      case 'proofTestIntervalCalculator':
        return [
          ['Dangerous Detected Failure Rate', record.dangerousDetectedFailureRate, '1/h'],
          ['Dangerous Undetected Failure Rate', record.dangerousUndetectedFailureRate, '1/h'],
          ['Fixed PFD Contribution', record.fixedPFDContribution, '—'],
          ['Available PFD for Proof Test', record.availablePFDForProofTest, '—'],
          ['Maximum Interval', record.maximumProofTestIntervalDays, 'days'],
          ['Maximum Interval', record.maximumProofTestIntervalYears, 'years'],
          ['Target Feasible', record.targetFeasible ? 'Yes' : 'No', ''],
        ]

      case 'riskReductionCostEffectiveness':
        return [
          ['Gross Annual Risk Reduction', record.grossAnnualRiskReduction, 'currency/year'],
          ['Net Annual Benefit', record.netAnnualBenefit, 'currency/year'],
          ['Simple Payback Period', record.simplePaybackPeriodYears, 'years'],
          ['PV of Net Benefits', record.presentValueOfNetBenefits, 'currency'],
          ['Benefit-Cost Ratio', record.benefitCostRatio, '—'],
          ['Cost per Annual Risk Reduction', record.costPerUnitAnnualRiskReduction, '—'],
          ['Economically Favorable', record.economicallyFavorable ? 'Yes' : 'No', ''],
        ]

      case 'expectedMonetaryValueDecision':
        return [
          ['Option A Expected Monetary Value', record.optionAExpectedMonetaryValue, 'currency'],
          ['Option B Expected Monetary Value', record.optionBExpectedMonetaryValue, 'currency'],
          ['Preferred Option', record.preferredOption, ''],
          ['Option A Downside Probability', Number(record.optionADownsideProbability) * 100, '%'],
          ['Option B Downside Probability', Number(record.optionBDownsideProbability) * 100, '%'],
          ['Decision Strength', record.decisionStrengthBand, ''],
        ]

      case 'lifecycleCostAnalysis':
        return [
          ['PV of Operating Cost', record.presentValueOfOperatingCost, 'currency'],
          ['PV of Maintenance Cost', record.presentValueOfMaintenanceCost, 'currency'],
          ['PV of Replacement Cost', record.presentValueOfReplacementCost, 'currency'],
          ['PV of Salvage Value', record.presentValueOfSalvageValue, 'currency'],
          ['Equivalent Annual Cost', record.equivalentAnnualCost, 'currency/year'],
          ['Operating + Maintenance Share', record.operatingAndMaintenanceSharePercent, '%'],
          ['Capital + Replacement Share', record.capitalAndReplacementSharePercent, '%'],
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
          note="Preliminary screening only. Fault-tree structure, SIF architecture, proof-test strategy and economic decisions require qualified review, validated failure data and project-specific financial assumptions."
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
