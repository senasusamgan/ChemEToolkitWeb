import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch01CalculationError,
  calculateAnnualizedLossExpectancy,
  calculateCostIndexEscalation,
  calculateEmergencyVentilationDilution,
  calculateEquipmentCostScaling,
  calculateLiquidLeakRateScreening,
  calculatePaybackAndROIAnalysis,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch01Mode,
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
    ProcessSafetyEconomicsBatch01Mode
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
  ProcessSafetyEconomicsBatch01Mode,
  Definition
> = {
  equipmentCostScaling: {
    code: 'SE–01',
    icon: '↗',
    title:
      'Equipment Cost Scaling',
    subtitle:
      'Scale a known equipment cost to a different processing capacity',
    basis:
      'C₂ = C₁(S₂/S₁)ⁿ',
    action:
      'Scale equipment cost',
    headline:
      'Scaled equipment cost',
    fields: [
      {
        key:
          'referenceEquipmentCost',
        label:
          'Reference Equipment Cost',
        symbol: 'C₁',
        unit: 'currency',
      },
      {
        key:
          'referenceCapacity',
        label:
          'Reference Capacity',
        symbol: 'S₁',
        unit: 'capacity',
      },
      {
        key:
          'targetCapacity',
        label:
          'Target Capacity',
        symbol: 'S₂',
        unit: 'capacity',
      },
      {
        key:
          'scalingExponent',
        label:
          'Scaling Exponent',
        symbol: 'n',
        unit: '—',
      },
    ],
    example: {
      referenceEquipmentCost:
        '1000000',
      referenceCapacity:
        '100',
      targetCapacity:
        '250',
      scalingExponent:
        '0.6',
    },
  },

  costIndexEscalation: {
    code: 'SE–02',
    icon: 'CI',
    title:
      'Cost Index Escalation',
    subtitle:
      'Update a historical cost using a base-to-target index ratio',
    basis:
      'C₂ = C₁(I₂/I₁)',
    action:
      'Escalate historical cost',
    headline:
      'Escalated cost',
    fields: [
      {
        key:
          'historicalCost',
        label:
          'Historical Cost',
        symbol: 'C₁',
        unit: 'currency',
      },
      {
        key:
          'baseCostIndex',
        label:
          'Base Cost Index',
        symbol: 'I₁',
        unit: '—',
      },
      {
        key:
          'targetCostIndex',
        label:
          'Target Cost Index',
        symbol: 'I₂',
        unit: '—',
      },
      {
        key:
          'elapsedYears',
        label:
          'Elapsed Years',
        symbol: 'N',
        unit: 'years',
      },
    ],
    example: {
      historicalCost:
        '750000',
      baseCostIndex:
        '550',
      targetCostIndex:
        '820',
      elapsedYears:
        '8',
    },
  },

  emergencyVentilationDilution: {
    code: 'SE–03',
    icon: 'ACH',
    title:
      'Emergency Ventilation Dilution',
    subtitle:
      'Estimate well-mixed contaminant decay during emergency ventilation',
    basis:
      'C(t) = C₀ exp[−(Q/V)t]',
    action:
      'Calculate dilution response',
    headline:
      'Concentration at elapsed time',
    fields: [
      {
        key:
          'enclosureVolume',
        label:
          'Enclosure Volume',
        symbol: 'V',
        unit: 'm³',
      },
      {
        key:
          'ventilationFlowRate',
        label:
          'Ventilation Flow Rate',
        symbol: 'Q',
        unit: 'm³/s',
      },
      {
        key:
          'initialConcentration',
        label:
          'Initial Concentration',
        symbol: 'C₀',
        unit: 'concentration',
      },
      {
        key:
          'targetConcentration',
        label:
          'Target Concentration',
        symbol: 'Ct',
        unit: 'concentration',
      },
      {
        key:
          'elapsedTime',
        label:
          'Elapsed Time',
        symbol: 't',
        unit: 's',
      },
    ],
    example: {
      enclosureVolume:
        '1000',
      ventilationFlowRate:
        '2',
      initialConcentration:
        '1000',
      targetConcentration:
        '200',
      elapsedTime:
        '600',
    },
  },

  annualizedLossExpectancy: {
    code: 'SE–04',
    icon: 'ALE',
    title:
      'Annualized Loss Expectancy',
    subtitle:
      'Combine event frequency, consequence costs and insurance recovery',
    basis:
      'ALE = frequency × retained consequence',
    action:
      'Calculate annualized loss',
    headline:
      'Annualized loss expectancy',
    fields: [
      {
        key:
          'eventFrequencyPerYear',
        label:
          'Event Frequency',
        symbol: 'f',
        unit: '1/year',
      },
      {
        key:
          'assetDamageCost',
        label:
          'Asset-Damage Cost',
        symbol: 'CA',
        unit: 'currency/event',
      },
      {
        key:
          'businessInterruptionCost',
        label:
          'Business-Interruption Cost',
        symbol: 'CBI',
        unit: 'currency/event',
      },
      {
        key:
          'environmentalRemediationCost',
        label:
          'Environmental Remediation',
        symbol: 'CER',
        unit: 'currency/event',
      },
      {
        key:
          'injuryAndLiabilityCost',
        label:
          'Injury and Liability Cost',
        symbol: 'CIL',
        unit: 'currency/event',
      },
      {
        key:
          'insuranceRecoveryFraction',
        label:
          'Insurance Recovery Fraction',
        symbol: 'fIR',
        unit: '0–1',
      },
    ],
    example: {
      eventFrequencyPerYear:
        '0.02',
      assetDamageCost:
        '2000000',
      businessInterruptionCost:
        '1000000',
      environmentalRemediationCost:
        '500000',
      injuryAndLiabilityCost:
        '750000',
      insuranceRecoveryFraction:
        '0.4',
    },
  },

  liquidLeakRateScreening: {
    code: 'SE–05',
    icon: 'ṁ',
    title:
      'Liquid Leak Rate Screening',
    subtitle:
      'Estimate incompressible liquid release through a circular opening',
    basis:
      'Q = Cd A √(2ΔP/ρ)',
    action:
      'Calculate liquid leak rate',
    headline:
      'Mass leak rate',
    fields: [
      {
        key:
          'upstreamPressure',
        label:
          'Upstream Pressure',
        symbol: 'P₁',
        unit: 'Pa',
      },
      {
        key:
          'downstreamPressure',
        label:
          'Downstream Pressure',
        symbol: 'P₂',
        unit: 'Pa',
      },
      {
        key:
          'liquidDensity',
        label:
          'Liquid Density',
        symbol: 'ρ',
        unit: 'kg/m³',
      },
      {
        key:
          'orificeDiameter',
        label:
          'Orifice Diameter',
        symbol: 'd',
        unit: 'm',
      },
      {
        key:
          'dischargeCoefficient',
        label:
          'Discharge Coefficient',
        symbol: 'Cd',
        unit: '—',
      },
      {
        key:
          'releaseDuration',
        label:
          'Release Duration',
        symbol: 't',
        unit: 's',
      },
    ],
    example: {
      upstreamPressure:
        '500000',
      downstreamPressure:
        '101325',
      liquidDensity:
        '900',
      orificeDiameter:
        '0.01',
      dischargeCoefficient:
        '0.62',
      releaseDuration:
        '300',
    },
  },

  paybackAndROIAnalysis: {
    code: 'SE–06',
    icon: 'ROI',
    title:
      'Payback & ROI Analysis',
    subtitle:
      'Estimate after-tax annual cash flow, simple payback and annual ROI',
    basis:
      'Payback = initial investment / annual cash flow',
    action:
      'Calculate payback and ROI',
    headline:
      'Simple payback period',
    fields: [
      {
        key:
          'initialInvestment',
        label:
          'Initial Investment',
        symbol: 'I₀',
        unit: 'currency',
      },
      {
        key:
          'annualRevenue',
        label:
          'Annual Revenue',
        symbol: 'R',
        unit: 'currency/year',
      },
      {
        key:
          'annualOperatingCost',
        label:
          'Annual Operating Cost',
        symbol: 'OPEX',
        unit: 'currency/year',
      },
      {
        key:
          'annualDepreciation',
        label:
          'Annual Depreciation',
        symbol: 'D',
        unit: 'currency/year',
      },
      {
        key:
          'incomeTaxRate',
        label:
          'Income-Tax Rate',
        symbol: 'τ',
        unit: '0–1',
      },
      {
        key:
          'projectLifeYears',
        label:
          'Project Life',
        symbol: 'N',
        unit: 'years',
      },
    ],
    example: {
      initialInvestment:
        '5000000',
      annualRevenue:
        '2200000',
      annualOperatingCost:
        '1100000',
      annualDepreciation:
        '400000',
      incomeTaxRate:
        '0.25',
      projectLifeYears:
        '10',
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

export function ProcessSafetyEconomicsBatch01Calculator({
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
        case 'equipmentCostScaling':
          next =
            calculateEquipmentCostScaling({
              referenceEquipmentCost:
                number(
                  'referenceEquipmentCost',
                ),
              referenceCapacity:
                number(
                  'referenceCapacity',
                ),
              targetCapacity:
                number(
                  'targetCapacity',
                ),
              scalingExponent:
                number(
                  'scalingExponent',
                ),
            })
          break

        case 'costIndexEscalation':
          next =
            calculateCostIndexEscalation({
              historicalCost:
                number(
                  'historicalCost',
                ),
              baseCostIndex:
                number(
                  'baseCostIndex',
                ),
              targetCostIndex:
                number(
                  'targetCostIndex',
                ),
              elapsedYears:
                number(
                  'elapsedYears',
                ),
            })
          break

        case 'emergencyVentilationDilution':
          next =
            calculateEmergencyVentilationDilution({
              enclosureVolume:
                number(
                  'enclosureVolume',
                ),
              ventilationFlowRate:
                number(
                  'ventilationFlowRate',
                ),
              initialConcentration:
                number(
                  'initialConcentration',
                ),
              targetConcentration:
                number(
                  'targetConcentration',
                ),
              elapsedTime:
                number(
                  'elapsedTime',
                ),
            })
          break

        case 'annualizedLossExpectancy':
          next =
            calculateAnnualizedLossExpectancy({
              eventFrequencyPerYear:
                number(
                  'eventFrequencyPerYear',
                ),
              assetDamageCost:
                number(
                  'assetDamageCost',
                ),
              businessInterruptionCost:
                number(
                  'businessInterruptionCost',
                ),
              environmentalRemediationCost:
                number(
                  'environmentalRemediationCost',
                ),
              injuryAndLiabilityCost:
                number(
                  'injuryAndLiabilityCost',
                ),
              insuranceRecoveryFraction:
                number(
                  'insuranceRecoveryFraction',
                ),
            })
          break

        case 'liquidLeakRateScreening':
          next =
            calculateLiquidLeakRateScreening({
              upstreamPressure:
                number(
                  'upstreamPressure',
                ),
              downstreamPressure:
                number(
                  'downstreamPressure',
                ),
              liquidDensity:
                number(
                  'liquidDensity',
                ),
              orificeDiameter:
                number(
                  'orificeDiameter',
                ),
              dischargeCoefficient:
                number(
                  'dischargeCoefficient',
                ),
              releaseDuration:
                number(
                  'releaseDuration',
                ),
            })
          break

        case 'paybackAndROIAnalysis':
          next =
            calculatePaybackAndROIAnalysis({
              initialInvestment:
                number(
                  'initialInvestment',
                ),
              annualRevenue:
                number(
                  'annualRevenue',
                ),
              annualOperatingCost:
                number(
                  'annualOperatingCost',
                ),
              annualDepreciation:
                number(
                  'annualDepreciation',
                ),
              incomeTaxRate:
                number(
                  'incomeTaxRate',
                ),
              projectLifeYears:
                number(
                  'projectLifeYears',
                ),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch01CalculationError
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
      case 'equipmentCostScaling':
        return record
          .scaledEquipmentCost
      case 'costIndexEscalation':
        return record
          .escalatedCost
      case 'emergencyVentilationDilution':
        return record
          .concentrationAtElapsedTime
      case 'annualizedLossExpectancy':
        return record
          .annualizedLossExpectancy
      case 'liquidLeakRateScreening':
        return record.massLeakRate
      case 'paybackAndROIAnalysis':
        return record
          .simplePaybackPeriodYears
    }
  }

  function rows():
    Array<
      [
        string,
        unknown,
        string,
      ]
    > {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'equipmentCostScaling':
        return [
          [
            'Capacity Ratio',
            record.capacityRatio,
            '—',
          ],
          [
            'Reference Unit Cost',
            record.referenceUnitCost,
            'currency/capacity',
          ],
          [
            'Target Unit Cost',
            record.targetUnitCost,
            'currency/capacity',
          ],
          [
            'Unit-Cost Change',
            record.unitCostChangePercent,
            '%',
          ],
          [
            'Economies of Scale',
            record
              .economiesOfScaleObserved
              ? 'Observed'
              : 'Not observed',
            '',
          ],
        ]

      case 'costIndexEscalation':
        return [
          [
            'Index Ratio',
            record.indexRatio,
            '—',
          ],
          [
            'Absolute Cost Change',
            record.absoluteCostChange,
            'currency',
          ],
          [
            'Cost Change',
            record.costChangePercent,
            '%',
          ],
          [
            'Annualized Escalation',
            record
              .annualizedEscalationRatePercent,
            '%/year',
          ],
        ]

      case 'emergencyVentilationDilution':
        return [
          [
            'Air-Change Rate',
            record.airChangeRatePerHour,
            '1/h',
          ],
          [
            'Exchange Time Constant',
            record.exchangeTimeConstant,
            's',
          ],
          [
            'Air Changes Elapsed',
            record.airChangesElapsed,
            '—',
          ],
          [
            'Removal Fraction',
            Number(
              record.removalFraction,
            ) *
              100,
            '%',
          ],
          [
            'Time to Target',
            record.timeToTarget,
            's',
          ],
          [
            'Target Achieved',
            record.targetAchieved
              ? 'Yes'
              : 'No',
            '',
          ],
        ]

      case 'annualizedLossExpectancy':
        return [
          [
            'Gross Consequence Cost',
            record.grossConsequenceCost,
            'currency/event',
          ],
          [
            'Insurance Recovery',
            record.insuranceRecoveryAmount,
            'currency/event',
          ],
          [
            'Retained Consequence',
            record.retainedConsequenceCost,
            'currency/event',
          ],
          [
            'Expected Events per Decade',
            record.expectedEventsPerDecade,
            'events/decade',
          ],
          [
            'Retained Loss Fraction',
            Number(
              record.retainedLossFraction,
            ) *
              100,
            '%',
          ],
        ]

      case 'liquidLeakRateScreening':
        return [
          [
            'Pressure Drop',
            record.pressureDrop,
            'Pa',
          ],
          [
            'Orifice Area',
            record.orificeArea,
            'm²',
          ],
          [
            'Volumetric Leak Rate',
            record.volumetricLeakRate,
            'm³/s',
          ],
          [
            'Equivalent Flow',
            record.equivalentLitersPerMinute,
            'L/min',
          ],
          [
            'Released Volume',
            record.releasedVolume,
            'm³',
          ],
          [
            'Released Mass',
            record.releasedMass,
            'kg',
          ],
        ]

      case 'paybackAndROIAnalysis':
        return [
          [
            'Annual EBITDA',
            record.annualEBITDA,
            'currency/year',
          ],
          [
            'Taxable Income',
            record.taxableIncome,
            'currency/year',
          ],
          [
            'Annual Tax',
            record.annualTax,
            'currency/year',
          ],
          [
            'Annual Net Income',
            record.annualNetIncome,
            'currency/year',
          ],
          [
            'Annual Cash Flow',
            record.annualCashFlow,
            'currency/year',
          ],
          [
            'Annual ROI',
            record
              .annualReturnOnInvestmentPercent,
            '%',
          ],
          [
            'End-of-Life Cumulative Cash Flow',
            record
              .cumulativeCashFlowAtProjectEnd,
            'currency',
          ],
          [
            'Recovered Within Project Life',
            record
              .investmentRecoveredWithinProjectLife
              ? 'Yes'
              : 'No',
            '',
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
        subtitle={
          definition.subtitle
        }
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
                values[field.key] ??
                ''
              }
              unit={field.unit}
              onChange={(value) =>
                setValues(
                  (current) => ({
                    ...current,
                    [field.key]:
                      value,
                  }),
                )
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
          note="Preliminary engineering screening only. Verify source data, units, release assumptions, tax basis, insurance terms, cost year and applicable safety requirements before decisions."
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
                  displayValue(
                    value,
                  )
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
