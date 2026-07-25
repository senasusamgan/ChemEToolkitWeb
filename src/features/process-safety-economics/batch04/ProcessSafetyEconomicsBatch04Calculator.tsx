import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch04CalculationError,
  calculateChemicalProcessRiskMatrix,
  calculateHAZOPGuideWordAssistant,
  calculateInherentlySaferDesignChecklist,
  calculateLayerOfProtectionAnalysis,
  calculatePoolFireRadiationScreening,
  calculateSafetyIntegrityLevelTarget,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch04Mode,
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
    ProcessSafetyEconomicsBatch04Mode
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
  ProcessSafetyEconomicsBatch04Mode,
  Definition
> = {
  chemicalProcessRiskMatrix: {
    code: 'SE–19',
    icon: 'RM',
    title:
      'Chemical Process Risk Matrix',
    subtitle:
      'Screen likelihood, severity and existing safeguard credit',
    basis:
      'Adjusted risk score = likelihood × severity − safeguard credit',
    action:
      'Calculate risk rating',
    headline:
      'Adjusted risk score',
    fields: [
      { key: 'likelihoodRating', label: 'Likelihood Rating', symbol: 'L', unit: '1–5' },
      { key: 'severityRating', label: 'Severity Rating', symbol: 'S', unit: '1–5' },
      { key: 'existingSafeguardCredit', label: 'Existing Safeguard Credit', symbol: 'C', unit: '0–4' },
    ],
    example: {
      likelihoodRating: '4',
      severityRating: '5',
      existingSafeguardCredit: '2',
    },
  },

  hazopGuideWordAssistant: {
    code: 'SE–20',
    icon: 'HZ',
    title:
      'HAZOP Guide Word Assistant',
    subtitle:
      'Generate a structured deviation prompt from guide-word and parameter codes',
    basis:
      'Guide word 1–7; parameter 1–6; safeguard and consequence ratings 1–5',
    action:
      'Generate HAZOP prompt',
    headline:
      'Screening priority',
    fields: [
      { key: 'guideWordCode', label: 'Guide-Word Code', symbol: 'GW', unit: '1–7' },
      { key: 'parameterCode', label: 'Process-Parameter Code', symbol: 'P', unit: '1–6' },
      { key: 'safeguardStrengthRating', label: 'Safeguard Strength', symbol: 'SG', unit: '1–5' },
      { key: 'consequenceSeverityRating', label: 'Consequence Severity', symbol: 'S', unit: '1–5' },
    ],
    example: {
      guideWordCode: '2',
      parameterCode: '1',
      safeguardStrengthRating: '3',
      consequenceSeverityRating: '4',
    },
  },

  inherentlySaferDesignChecklist: {
    code: 'SE–21',
    icon: 'ISD',
    title:
      'Inherently Safer Design',
    subtitle:
      'Score minimize, substitute, moderate and simplify opportunities',
    basis:
      'Confidence-adjusted score = average principle rating × confidence/5',
    action:
      'Evaluate design principles',
    headline:
      'Confidence-adjusted score',
    fields: [
      { key: 'minimizeRating', label: 'Minimize Rating', symbol: 'M₁', unit: '0–5' },
      { key: 'substituteRating', label: 'Substitute Rating', symbol: 'M₂', unit: '0–5' },
      { key: 'moderateRating', label: 'Moderate Rating', symbol: 'M₃', unit: '0–5' },
      { key: 'simplifyRating', label: 'Simplify Rating', symbol: 'M₄', unit: '0–5' },
      { key: 'implementationConfidence', label: 'Implementation Confidence', symbol: 'C', unit: '0–5' },
    ],
    example: {
      minimizeRating: '4',
      substituteRating: '3',
      moderateRating: '2',
      simplifyRating: '4',
      implementationConfidence: '4',
    },
  },

  layerOfProtectionAnalysis: {
    code: 'SE–22',
    icon: 'LOPA',
    title:
      'Layer of Protection Analysis',
    subtitle:
      'Estimate mitigated scenario frequency from independent protection layers',
    basis:
      'Fmitigated = Finitiating × Penabling × Pconditional × ΠPFDIPL',
    action:
      'Calculate protected frequency',
    headline:
      'Mitigated scenario frequency',
    fields: [
      { key: 'initiatingEventFrequency', label: 'Initiating-Event Frequency', symbol: 'FIE', unit: '1/year' },
      { key: 'enablingConditionProbability', label: 'Enabling-Condition Probability', symbol: 'PEN', unit: '0–1' },
      { key: 'conditionalModifierProbability', label: 'Conditional Modifier', symbol: 'PCM', unit: '0–1' },
      { key: 'firstIPLProbabilityOfFailure', label: 'IPL 1 PFD', symbol: 'PFD₁', unit: '0–1' },
      { key: 'secondIPLProbabilityOfFailure', label: 'IPL 2 PFD', symbol: 'PFD₂', unit: '0–1' },
      { key: 'thirdIPLProbabilityOfFailure', label: 'IPL 3 PFD', symbol: 'PFD₃', unit: '0–1' },
      { key: 'tolerableEventFrequency', label: 'Tolerable Event Frequency', symbol: 'FT', unit: '1/year' },
    ],
    example: {
      initiatingEventFrequency: '0.1',
      enablingConditionProbability: '0.5',
      conditionalModifierProbability: '0.2',
      firstIPLProbabilityOfFailure: '0.1',
      secondIPLProbabilityOfFailure: '0.1',
      thirdIPLProbabilityOfFailure: '0.1',
      tolerableEventFrequency: '0.00001',
    },
  },

  safetyIntegrityLevelTarget: {
    code: 'SE–23',
    icon: 'SIL',
    title:
      'Safety Integrity Level Target',
    subtitle:
      'Estimate the SIF risk-reduction requirement after non-SIF safeguards',
    basis:
      'RRFrequired,SIF = (Funmitigated/Ftolerable) / RRFnon-SIF',
    action:
      'Calculate SIL target',
    headline:
      'Required SIF risk-reduction factor',
    fields: [
      { key: 'unmitigatedEventFrequency', label: 'Unmitigated Event Frequency', symbol: 'FU', unit: '1/year' },
      { key: 'tolerableEventFrequency', label: 'Tolerable Event Frequency', symbol: 'FT', unit: '1/year' },
      { key: 'nonSIFRiskReductionFactor', label: 'Non-SIF Risk-Reduction Factor', symbol: 'RRFNS', unit: '—' },
    ],
    example: {
      unmitigatedEventFrequency: '0.1',
      tolerableEventFrequency: '0.000001',
      nonSIFRiskReductionFactor: '100',
    },
  },

  poolFireRadiationScreening: {
    code: 'SE–24',
    icon: '🔥',
    title:
      'Pool Fire Radiation',
    subtitle:
      'Screen point-source thermal-radiation flux at a receptor distance',
    basis:
      'q″ = ṁ ΔHc χr τa / (4πR²)',
    action:
      'Calculate radiation flux',
    headline:
      'Thermal radiation flux',
    fields: [
      { key: 'burningMassRate', label: 'Burning Mass Rate', symbol: 'ṁ', unit: 'kg/s' },
      { key: 'heatOfCombustion', label: 'Heat of Combustion', symbol: 'ΔHc', unit: 'J/kg' },
      { key: 'radiantFraction', label: 'Radiant Fraction', symbol: 'χr', unit: '0–1' },
      { key: 'atmosphericTransmissivity', label: 'Atmospheric Transmissivity', symbol: 'τa', unit: '0–1' },
      { key: 'receptorDistance', label: 'Receptor Distance', symbol: 'R', unit: 'm' },
    ],
    example: {
      burningMassRate: '10',
      heatOfCombustion: '44000000',
      radiantFraction: '0.2',
      atmosphericTransmissivity: '0.85',
      receptorDistance: '50',
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

export function ProcessSafetyEconomicsBatch04Calculator({
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
        case 'chemicalProcessRiskMatrix':
          next =
            calculateChemicalProcessRiskMatrix({
              likelihoodRating:
                number('likelihoodRating'),
              severityRating:
                number('severityRating'),
              existingSafeguardCredit:
                number('existingSafeguardCredit'),
            })
          break

        case 'hazopGuideWordAssistant':
          next =
            calculateHAZOPGuideWordAssistant({
              guideWordCode:
                number('guideWordCode'),
              parameterCode:
                number('parameterCode'),
              safeguardStrengthRating:
                number('safeguardStrengthRating'),
              consequenceSeverityRating:
                number('consequenceSeverityRating'),
            })
          break

        case 'inherentlySaferDesignChecklist':
          next =
            calculateInherentlySaferDesignChecklist({
              minimizeRating:
                number('minimizeRating'),
              substituteRating:
                number('substituteRating'),
              moderateRating:
                number('moderateRating'),
              simplifyRating:
                number('simplifyRating'),
              implementationConfidence:
                number('implementationConfidence'),
            })
          break

        case 'layerOfProtectionAnalysis':
          next =
            calculateLayerOfProtectionAnalysis({
              initiatingEventFrequency:
                number('initiatingEventFrequency'),
              enablingConditionProbability:
                number('enablingConditionProbability'),
              conditionalModifierProbability:
                number('conditionalModifierProbability'),
              firstIPLProbabilityOfFailure:
                number('firstIPLProbabilityOfFailure'),
              secondIPLProbabilityOfFailure:
                number('secondIPLProbabilityOfFailure'),
              thirdIPLProbabilityOfFailure:
                number('thirdIPLProbabilityOfFailure'),
              tolerableEventFrequency:
                number('tolerableEventFrequency'),
            })
          break

        case 'safetyIntegrityLevelTarget':
          next =
            calculateSafetyIntegrityLevelTarget({
              unmitigatedEventFrequency:
                number('unmitigatedEventFrequency'),
              tolerableEventFrequency:
                number('tolerableEventFrequency'),
              nonSIFRiskReductionFactor:
                number('nonSIFRiskReductionFactor'),
            })
          break

        case 'poolFireRadiationScreening':
          next =
            calculatePoolFireRadiationScreening({
              burningMassRate:
                number('burningMassRate'),
              heatOfCombustion:
                number('heatOfCombustion'),
              radiantFraction:
                number('radiantFraction'),
              atmosphericTransmissivity:
                number('atmosphericTransmissivity'),
              receptorDistance:
                number('receptorDistance'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch04CalculationError
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
      case 'chemicalProcessRiskMatrix':
        return record.adjustedRiskScore
      case 'hazopGuideWordAssistant':
        return record.screeningPriority
      case 'inherentlySaferDesignChecklist':
        return record.confidenceAdjustedScore
      case 'layerOfProtectionAnalysis':
        return record.mitigatedScenarioFrequency
      case 'safetyIntegrityLevelTarget':
        return record.requiredSIFRiskReductionFactor
      case 'poolFireRadiationScreening':
        return Number(
          record.thermalRadiationFlux,
        ) / 1000
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'chemicalProcessRiskMatrix':
        return [
          ['Gross Risk Score', record.grossRiskScore, '—'],
          ['Risk Reduction', record.riskReductionPercent, '%'],
          ['Likelihood Band', record.likelihoodBand, ''],
          ['Severity Band', record.severityBand, ''],
          ['Risk Band', record.riskBand, ''],
          ['Recommended Action', record.recommendedAction, ''],
        ]

      case 'hazopGuideWordAssistant':
        return [
          ['Guide Word', record.guideWord, ''],
          ['Process Parameter', record.processParameter, ''],
          ['Deviation Phrase', record.deviationPhrase, ''],
          ['Priority Band', record.priorityBand, ''],
          ['Cause Prompt', record.likelyCausePrompt, ''],
          ['Consequence Prompt', record.consequencePrompt, ''],
          ['Safeguard Prompt', record.safeguardPrompt, ''],
          ['Recommendation Prompt', record.recommendationPrompt, ''],
        ]

      case 'inherentlySaferDesignChecklist':
        return [
          ['Average Principle Rating', record.averagePrincipleRating, '0–5'],
          ['Strongest Principle', record.strongestPrinciple, ''],
          ['Weakest Principle', record.weakestPrinciple, ''],
          ['Maturity Band', record.maturityBand, ''],
          ['Minimize Contribution', Number(record.minimizeContribution) * 100, '%'],
          ['Substitute Contribution', Number(record.substituteContribution) * 100, '%'],
          ['Moderate Contribution', Number(record.moderateContribution) * 100, '%'],
          ['Simplify Contribution', Number(record.simplifyContribution) * 100, '%'],
        ]

      case 'layerOfProtectionAnalysis':
        return [
          ['Unmitigated Scenario Frequency', record.unmitigatedScenarioFrequency, '1/year'],
          ['Combined IPL PFD', record.combinedIPLProbabilityOfFailure, '—'],
          ['Achieved Risk-Reduction Factor', record.achievedRiskReductionFactor, '—'],
          ['Required Risk-Reduction Factor', record.requiredRiskReductionFactor, '—'],
          ['Frequency Gap Factor', record.frequencyGapFactor, '—'],
          ['Target Met', record.targetMet ? 'Yes' : 'No', ''],
          ['Assessment', record.assessmentBand, ''],
        ]

      case 'safetyIntegrityLevelTarget':
        return [
          ['Total Required Risk Reduction', record.totalRequiredRiskReductionFactor, '—'],
          ['Target Average PFD', record.targetAverageProbabilityOfFailure, '—'],
          ['Target SIL', record.targetSIL, ''],
          ['Design Margin Factor', record.designMarginFactor, '—'],
          ['Beyond Conventional SIL Range', record.beyondConventionalSILRange ? 'Yes' : 'No', ''],
        ]

      case 'poolFireRadiationScreening':
        return [
          ['Total Heat-Release Rate', record.totalHeatReleaseRate, 'W'],
          ['Radiated Heat Rate', record.radiatedHeatRate, 'W'],
          ['Transmitted Radiated Heat', record.transmittedRadiatedHeatRate, 'W'],
          ['Hazard Band', record.hazardBand, ''],
          ['Screening Description', record.screeningDescription, ''],
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
          note="Preliminary screening only. HAZOP, LOPA, SIL selection and fire-radiation decisions require qualified multidisciplinary review and verification against applicable standards and project-specific data."
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
