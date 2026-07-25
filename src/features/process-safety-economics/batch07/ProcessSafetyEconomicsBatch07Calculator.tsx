import { useState } from 'react'
import {
  Batch07Error, calculateALARP, calculateIndividualRisk,
  calculatePortfolio, calculateSocietalRisk,
} from './engine'
import type { Mode } from './types'
import {
  ActionBar, CalculatorHeader, NumericInput, ReferenceBasis,
  ResultItem, ResultPanel, formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

interface Props { mode: Mode }
interface Field { key: string; label: string; symbol: string; unit: string }
interface Definition {
  code: string; icon: string; title: string; subtitle: string; basis: string
  action: string; headline: string; fields: Field[]; example: Record<string, string>
}

const definitions: Record<Mode, Definition> = {
  individualRiskScreening: {
    code: 'SE–37', icon: 'IR', title: 'Individual Risk Screening',
    subtitle: 'Estimate annual individual fatality risk from one scenario',
    basis: 'IR = scenario frequency × fatality probability × occupancy × presence',
    action: 'Calculate individual risk', headline: 'Annual individual risk',
    fields: [
      { key: 'scenarioFrequencyPerYear', label: 'Scenario Frequency', symbol: 'fs', unit: '1/year' },
      { key: 'fatalityProbabilityGivenExposure', label: 'Fatality Probability Given Exposure', symbol: 'Pf|e', unit: '0–1' },
      { key: 'occupancyFraction', label: 'Occupancy Fraction', symbol: 'Focc', unit: '0–1' },
      { key: 'presenceProbability', label: 'Presence Probability', symbol: 'Ppres', unit: '0–1' },
    ],
    example: {
      scenarioFrequencyPerYear: '0.001', fatalityProbabilityGivenExposure: '0.1',
      occupancyFraction: '0.25', presenceProbability: '0.5',
    },
  },
  societalRiskFNScreening: {
    code: 'SE–38', icon: 'F–N', title: 'Societal Risk F–N Screening',
    subtitle: 'Compare cumulative scenario frequency with a selected F–N criterion',
    basis: 'Fcriterion = k / Nᵅ', action: 'Evaluate F–N criterion',
    headline: 'Frequency-to-criterion ratio',
    fields: [
      { key: 'scenarioFrequencyPerYear', label: 'Cumulative Scenario Frequency', symbol: 'F', unit: '1/year' },
      { key: 'estimatedFatalities', label: 'Estimated Fatalities', symbol: 'N', unit: 'fatalities' },
      { key: 'criterionCoefficient', label: 'Criterion Coefficient', symbol: 'k', unit: '1/year' },
      { key: 'criterionExponent', label: 'Criterion Exponent', symbol: 'α', unit: '—' },
    ],
    example: {
      scenarioFrequencyPerYear: '0.00001', estimatedFatalities: '10',
      criterionCoefficient: '0.001', criterionExponent: '1',
    },
  },
  alarpGrossDisproportionScreening: {
    code: 'SE–39', icon: 'ALARP', title: 'ALARP Gross-Disproportion Screening',
    subtitle: 'Compare measure cost with discounted and adjusted risk-reduction benefit',
    basis: 'Reasonably practicable when cost ≤ GDF × PV(benefit)',
    action: 'Evaluate ALARP screening', headline: 'Cost-to-adjusted-benefit ratio',
    fields: [
      { key: 'measureCost', label: 'Risk-Reduction Measure Cost', symbol: 'C', unit: 'currency' },
      { key: 'annualRiskReductionBenefit', label: 'Annual Risk-Reduction Benefit', symbol: 'B', unit: 'currency/year' },
      { key: 'remainingLifeYears', label: 'Remaining Plant Life', symbol: 'N', unit: 'years' },
      { key: 'discountRateFraction', label: 'Discount Rate', symbol: 'r', unit: 'fraction' },
      { key: 'grossDisproportionFactor', label: 'Gross-Disproportion Factor', symbol: 'GDF', unit: '—' },
    ],
    example: {
      measureCost: '1000000', annualRiskReductionBenefit: '150000',
      remainingLifeYears: '15', discountRateFraction: '0.08',
      grossDisproportionFactor: '3',
    },
  },
  safetyProjectPortfolioRanking: {
    code: 'SE–40', icon: 'PR', title: 'Safety Project Portfolio Ranking',
    subtitle: 'Rank three projects by risk reduction per cost and urgency',
    basis: 'Priority score = (risk reduction / cost) × urgency',
    action: 'Rank safety projects', headline: 'Highest-priority project',
    fields: [
      { key: 'project1RiskReduction', label: 'Project 1 Risk Reduction', symbol: 'RR₁', unit: 'risk units/year' },
      { key: 'project1Cost', label: 'Project 1 Cost', symbol: 'C₁', unit: 'currency' },
      { key: 'project1UrgencyRating', label: 'Project 1 Urgency', symbol: 'U₁', unit: '1–5' },
      { key: 'project2RiskReduction', label: 'Project 2 Risk Reduction', symbol: 'RR₂', unit: 'risk units/year' },
      { key: 'project2Cost', label: 'Project 2 Cost', symbol: 'C₂', unit: 'currency' },
      { key: 'project2UrgencyRating', label: 'Project 2 Urgency', symbol: 'U₂', unit: '1–5' },
      { key: 'project3RiskReduction', label: 'Project 3 Risk Reduction', symbol: 'RR₃', unit: 'risk units/year' },
      { key: 'project3Cost', label: 'Project 3 Cost', symbol: 'C₃', unit: 'currency' },
      { key: 'project3UrgencyRating', label: 'Project 3 Urgency', symbol: 'U₃', unit: '1–5' },
    ],
    example: {
      project1RiskReduction: '0.5', project1Cost: '20', project1UrgencyRating: '3',
      project2RiskReduction: '0.3', project2Cost: '8', project2UrgencyRating: '5',
      project3RiskReduction: '0.1', project3Cost: '10', project3UrgencyRating: '1',
    },
  },
}

const display = (value: unknown) =>
  typeof value === 'number' ? formatEngineeringNumber(value) : String(value)

export function ProcessSafetyEconomicsBatch07Calculator({ mode }: Props) {
  const definition = definitions[mode]
  const [values, setValues] = useState<Record<string, string>>(definition.example)
  const [result, setResult] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const n = (key: string) => Number(values[key])

  function calculate() {
    try {
      let next: unknown
      if (mode === 'individualRiskScreening') {
        next = calculateIndividualRisk({
          scenarioFrequencyPerYear: n('scenarioFrequencyPerYear'),
          fatalityProbabilityGivenExposure: n('fatalityProbabilityGivenExposure'),
          occupancyFraction: n('occupancyFraction'),
          presenceProbability: n('presenceProbability'),
        })
      } else if (mode === 'societalRiskFNScreening') {
        next = calculateSocietalRisk({
          scenarioFrequencyPerYear: n('scenarioFrequencyPerYear'),
          estimatedFatalities: n('estimatedFatalities'),
          criterionCoefficient: n('criterionCoefficient'),
          criterionExponent: n('criterionExponent'),
        })
      } else if (mode === 'alarpGrossDisproportionScreening') {
        next = calculateALARP({
          measureCost: n('measureCost'),
          annualRiskReductionBenefit: n('annualRiskReductionBenefit'),
          remainingLifeYears: n('remainingLifeYears'),
          discountRateFraction: n('discountRateFraction'),
          grossDisproportionFactor: n('grossDisproportionFactor'),
        })
      } else {
        next = calculatePortfolio({
          project1RiskReduction: n('project1RiskReduction'),
          project1Cost: n('project1Cost'),
          project1UrgencyRating: n('project1UrgencyRating'),
          project2RiskReduction: n('project2RiskReduction'),
          project2Cost: n('project2Cost'),
          project2UrgencyRating: n('project2UrgencyRating'),
          project3RiskReduction: n('project3RiskReduction'),
          project3Cost: n('project3Cost'),
          project3UrgencyRating: n('project3UrgencyRating'),
        })
      }
      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(error instanceof Batch07Error ? error.message : 'The calculation could not be completed.')
    }
  }

  const record = result && typeof result === 'object'
    ? result as Record<string, unknown>
    : null

  function headline(): unknown {
    if (!record) return ''
    if (mode === 'individualRiskScreening') return record.annualIndividualRisk
    if (mode === 'societalRiskFNScreening') return record.frequencyToCriterionRatio
    if (mode === 'alarpGrossDisproportionScreening') return record.costToAdjustedBenefitRatio
    return record.highestPriorityProject
  }

  function rows(): Array<[string, unknown, string]> {
    if (!record) return []
    if (mode === 'individualRiskScreening') return [
      ['Combined Exposure Probability', record.combinedExposureProbability, '—'],
      ['Risk per Million', record.annualIndividualRiskPerMillion, 'per million/year'],
      ['Return Period', record.returnPeriodYears, 'years'],
      ['Screening Band', record.screeningBand, ''],
      ['Assessment', record.assessmentDescription, ''],
    ]
    if (mode === 'societalRiskFNScreening') return [
      ['Cumulative Frequency', record.cumulativeFrequency, '1/year'],
      ['Fatality Count', record.fatalityCount, 'fatalities'],
      ['Criterion Frequency', record.criterionFrequency, '1/year'],
      ['Logarithmic Margin', record.logarithmicMargin, 'decades'],
      ['Criterion Satisfied', record.criterionSatisfied ? 'Yes' : 'No', ''],
      ['Screening Band', record.screeningBand, ''],
      ['Assessment', record.assessmentDescription, ''],
    ]
    if (mode === 'alarpGrossDisproportionScreening') return [
      ['PV of Risk-Reduction Benefit', record.presentValueOfRiskReductionBenefit, 'currency'],
      ['Adjusted Benefit', record.grossDisproportionAdjustedBenefit, 'currency'],
      ['Cost-to-Benefit Ratio', record.costToBenefitRatio, '—'],
      ['Maximum Reasonably Practicable Cost', record.maximumReasonablyPracticableCost, 'currency'],
      ['Net Adjusted Benefit', record.netAdjustedBenefit, 'currency'],
      ['Reasonably Practicable', record.reasonablyPracticable ? 'Yes' : 'No', ''],
      ['Decision Band', record.decisionBand, ''],
    ]

    const names = record.rankedProjectNames as string[]
    const scores = record.rankedProjectScores as number[]
    return [
      ['Project 1 Benefit / Cost', record.project1BenefitCostRatio, '—'],
      ['Project 1 Score', record.project1Score, '—'],
      ['Project 2 Benefit / Cost', record.project2BenefitCostRatio, '—'],
      ['Project 2 Score', record.project2Score, '—'],
      ['Project 3 Benefit / Cost', record.project3BenefitCostRatio, '—'],
      ['Project 3 Score', record.project3Score, '—'],
      ['Rank 1', `${names[0]} · ${display(scores[0])}`, ''],
      ['Rank 2', `${names[1]} · ${display(scores[1])}`, ''],
      ['Rank 3', `${names[2]} · ${display(scores[2])}`, ''],
      ['Top-Score Separation', record.scoreSeparationPercent, '%'],
    ]
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code={definition.code}
        icon={definition.icon}
        title={definition.title}
        subtitle={definition.subtitle}
      />
      <ReferenceBasis>{definition.basis}</ReferenceBasis>
      <div className="native-input-grid">
        {definition.fields.map((field) => (
          <NumericInput
            key={field.key}
            label={field.label}
            symbol={field.symbol}
            value={values[field.key] ?? ''}
            unit={field.unit}
            onChange={(value) =>
              setValues((current) => ({ ...current, [field.key]: value }))
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
          setValues(Object.fromEntries(definition.fields.map((field) => [field.key, ''])))
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {record ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={display(headline())}
          modelName={definition.title}
          note="Preliminary screening only. Risk criteria, ALARP decisions and safety-project priorities require project-specific governance, validated data and qualified multidisciplinary review."
        >
          {rows().map(([label, value, unit]) => (
            <ResultItem key={label} label={label} value={display(value)} unit={unit} />
          ))}
        </ResultPanel>
      ) : null}
    </section>
  )
}
