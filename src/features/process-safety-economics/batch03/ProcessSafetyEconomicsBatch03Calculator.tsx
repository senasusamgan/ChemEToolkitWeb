import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch03CalculationError,
  calculateBreakEvenProductionAnalysis,
  calculateEconomicSensitivityAnalysis,
  calculateEquivalentAnnualWorth,
  calculateFlammabilityMixtureLimits,
  calculateGasReliefValveSizing,
  calculateLiquidReliefValveSizing,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch03Mode,
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
    ProcessSafetyEconomicsBatch03Mode
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
  ProcessSafetyEconomicsBatch03Mode,
  Definition
> = {
  breakEvenProductionAnalysis: {
    code: 'SE–13',
    icon: 'BE',
    title:
      'Break-Even Production Analysis',
    subtitle:
      'Estimate break-even production, revenue and margin of safety',
    basis:
      'QBE = fixed annual cost / (price − variable cost)',
    action:
      'Calculate break-even production',
    headline:
      'Break-even production',
    fields: [
      { key: 'fixedAnnualCost', label: 'Fixed Annual Cost', symbol: 'FC', unit: 'currency/year' },
      { key: 'variableCostPerUnit', label: 'Variable Cost per Unit', symbol: 'VC', unit: 'currency/unit' },
      { key: 'sellingPricePerUnit', label: 'Selling Price per Unit', symbol: 'P', unit: 'currency/unit' },
      { key: 'expectedAnnualProduction', label: 'Expected Annual Production', symbol: 'Q', unit: 'unit/year' },
    ],
    example: {
      fixedAnnualCost: '1200000',
      variableCostPerUnit: '45',
      sellingPricePerUnit: '80',
      expectedAnnualProduction: '50000',
    },
  },

  equivalentAnnualWorth: {
    code: 'SE–14',
    icon: 'EAW',
    title:
      'Equivalent Annual Worth',
    subtitle:
      'Convert project present worth into an equivalent uniform annual value',
    basis:
      'EAW = PW × capital-recovery factor',
    action:
      'Calculate equivalent annual worth',
    headline:
      'Equivalent annual worth',
    fields: [
      { key: 'initialInvestment', label: 'Initial Investment', symbol: 'I₀', unit: 'currency' },
      { key: 'annualNetCashFlow', label: 'Annual Net Cash Flow', symbol: 'A', unit: 'currency/year' },
      { key: 'terminalValue', label: 'Terminal Value', symbol: 'TV', unit: 'currency' },
      { key: 'projectLifeYears', label: 'Project Life', symbol: 'N', unit: 'years' },
      { key: 'discountRateFraction', label: 'Discount Rate', symbol: 'r', unit: 'fraction' },
    ],
    example: {
      initialInvestment: '5000000',
      annualNetCashFlow: '950000',
      terminalValue: '500000',
      projectLifeYears: '10',
      discountRateFraction: '0.1',
    },
  },

  economicSensitivityAnalysis: {
    code: 'SE–15',
    icon: 'Δ',
    title:
      'Economic Sensitivity Analysis',
    subtitle:
      'Compare base and adjusted project NPV under revenue, cost and capital changes',
    basis:
      'Adjusted NPV = −Iadj + (Radj − OPEXadj)(P/A,r,N)',
    action:
      'Calculate sensitivity case',
    headline:
      'Adjusted net present value',
    fields: [
      { key: 'baseAnnualRevenue', label: 'Base Annual Revenue', symbol: 'R₀', unit: 'currency/year' },
      { key: 'baseAnnualOperatingCost', label: 'Base Annual Operating Cost', symbol: 'OPEX₀', unit: 'currency/year' },
      { key: 'baseInitialInvestment', label: 'Base Initial Investment', symbol: 'I₀', unit: 'currency' },
      { key: 'revenueChangeFraction', label: 'Revenue Change', symbol: 'ΔR', unit: 'fraction' },
      { key: 'operatingCostChangeFraction', label: 'Operating-Cost Change', symbol: 'ΔOPEX', unit: 'fraction' },
      { key: 'capitalChangeFraction', label: 'Capital Change', symbol: 'ΔI', unit: 'fraction' },
      { key: 'projectLifeYears', label: 'Project Life', symbol: 'N', unit: 'years' },
      { key: 'discountRateFraction', label: 'Discount Rate', symbol: 'r', unit: 'fraction' },
    ],
    example: {
      baseAnnualRevenue: '2200000',
      baseAnnualOperatingCost: '1100000',
      baseInitialInvestment: '5000000',
      revenueChangeFraction: '-0.1',
      operatingCostChangeFraction: '0.1',
      capitalChangeFraction: '0.05',
      projectLifeYears: '10',
      discountRateFraction: '0.1',
    },
  },

  flammabilityMixtureLimits: {
    code: 'SE–16',
    icon: 'LFL',
    title:
      'Flammability Mixture Limits',
    subtitle:
      'Estimate binary-fuel mixture limits with the Le Chatelier mixing rule',
    basis:
      '1/LFLmix = Σ yi/LFLi; 1/UFLmix = Σ yi/UFLi',
    action:
      'Calculate mixture limits',
    headline:
      'Mixture lower flammability limit',
    fields: [
      { key: 'componentOneFuelFraction', label: 'Fuel Component 1 Fraction', symbol: 'y₁', unit: '—' },
      { key: 'componentTwoFuelFraction', label: 'Fuel Component 2 Fraction', symbol: 'y₂', unit: '—' },
      { key: 'componentOneLFLPercent', label: 'Component 1 LFL', symbol: 'LFL₁', unit: 'vol %' },
      { key: 'componentOneUFLPercent', label: 'Component 1 UFL', symbol: 'UFL₁', unit: 'vol %' },
      { key: 'componentTwoLFLPercent', label: 'Component 2 LFL', symbol: 'LFL₂', unit: 'vol %' },
      { key: 'componentTwoUFLPercent', label: 'Component 2 UFL', symbol: 'UFL₂', unit: 'vol %' },
      { key: 'actualFuelConcentrationPercent', label: 'Actual Fuel Concentration', symbol: 'C', unit: 'vol %' },
    ],
    example: {
      componentOneFuelFraction: '0.6',
      componentTwoFuelFraction: '0.4',
      componentOneLFLPercent: '5',
      componentOneUFLPercent: '15',
      componentTwoLFLPercent: '2.1',
      componentTwoUFLPercent: '9.5',
      actualFuelConcentrationPercent: '4',
    },
  },

  gasReliefValveSizing: {
    code: 'SE–17',
    icon: 'G',
    title:
      'Gas Relief Valve Sizing',
    subtitle:
      'Screen required gas-discharge area for choked or subcritical ideal-gas flow',
    basis:
      'A = ṁ / (Cd × ideal isentropic mass flux)',
    action:
      'Calculate gas relief area',
    headline:
      'Required flow area',
    fields: [
      { key: 'requiredMassFlowRate', label: 'Required Mass Flow', symbol: 'ṁ', unit: 'kg/s' },
      { key: 'relievingAbsolutePressure', label: 'Relieving Absolute Pressure', symbol: 'P₀', unit: 'Pa' },
      { key: 'backAbsolutePressure', label: 'Back Absolute Pressure', symbol: 'Pb', unit: 'Pa' },
      { key: 'relievingTemperature', label: 'Relieving Temperature', symbol: 'T', unit: 'K' },
      { key: 'molecularWeight', label: 'Molecular Weight', symbol: 'MW', unit: 'kg/kmol' },
      { key: 'compressibilityFactor', label: 'Compressibility Factor', symbol: 'Z', unit: '—' },
      { key: 'heatCapacityRatio', label: 'Heat-Capacity Ratio', symbol: 'k', unit: '—' },
      { key: 'dischargeCoefficient', label: 'Discharge Coefficient', symbol: 'Cd', unit: '—' },
    ],
    example: {
      requiredMassFlowRate: '2',
      relievingAbsolutePressure: '1000000',
      backAbsolutePressure: '101325',
      relievingTemperature: '350',
      molecularWeight: '28',
      compressibilityFactor: '0.95',
      heatCapacityRatio: '1.4',
      dischargeCoefficient: '0.9',
    },
  },

  liquidReliefValveSizing: {
    code: 'SE–18',
    icon: 'L',
    title:
      'Liquid Relief Valve Sizing',
    subtitle:
      'Screen required liquid-discharge area from incompressible orifice flow',
    basis:
      'A = Q / [Cd √(2ΔP/ρ)]',
    action:
      'Calculate liquid relief area',
    headline:
      'Required flow area',
    fields: [
      { key: 'requiredVolumetricFlowRate', label: 'Required Volumetric Flow', symbol: 'Q', unit: 'm³/s' },
      { key: 'liquidDensity', label: 'Liquid Density', symbol: 'ρ', unit: 'kg/m³' },
      { key: 'upstreamAbsolutePressure', label: 'Upstream Absolute Pressure', symbol: 'P₁', unit: 'Pa' },
      { key: 'downstreamAbsolutePressure', label: 'Downstream Absolute Pressure', symbol: 'P₂', unit: 'Pa' },
      { key: 'dischargeCoefficient', label: 'Discharge Coefficient', symbol: 'Cd', unit: '—' },
    ],
    example: {
      requiredVolumetricFlowRate: '0.02',
      liquidDensity: '850',
      upstreamAbsolutePressure: '700000',
      downstreamAbsolutePressure: '200000',
      dischargeCoefficient: '0.62',
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

export function ProcessSafetyEconomicsBatch03Calculator({
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
        case 'breakEvenProductionAnalysis':
          next =
            calculateBreakEvenProductionAnalysis({
              fixedAnnualCost:
                number('fixedAnnualCost'),
              variableCostPerUnit:
                number('variableCostPerUnit'),
              sellingPricePerUnit:
                number('sellingPricePerUnit'),
              expectedAnnualProduction:
                number('expectedAnnualProduction'),
            })
          break

        case 'equivalentAnnualWorth':
          next =
            calculateEquivalentAnnualWorth({
              initialInvestment:
                number('initialInvestment'),
              annualNetCashFlow:
                number('annualNetCashFlow'),
              terminalValue:
                number('terminalValue'),
              projectLifeYears:
                number('projectLifeYears'),
              discountRateFraction:
                number('discountRateFraction'),
            })
          break

        case 'economicSensitivityAnalysis':
          next =
            calculateEconomicSensitivityAnalysis({
              baseAnnualRevenue:
                number('baseAnnualRevenue'),
              baseAnnualOperatingCost:
                number('baseAnnualOperatingCost'),
              baseInitialInvestment:
                number('baseInitialInvestment'),
              revenueChangeFraction:
                number('revenueChangeFraction'),
              operatingCostChangeFraction:
                number('operatingCostChangeFraction'),
              capitalChangeFraction:
                number('capitalChangeFraction'),
              projectLifeYears:
                number('projectLifeYears'),
              discountRateFraction:
                number('discountRateFraction'),
            })
          break

        case 'flammabilityMixtureLimits':
          next =
            calculateFlammabilityMixtureLimits({
              componentOneFuelFraction:
                number('componentOneFuelFraction'),
              componentTwoFuelFraction:
                number('componentTwoFuelFraction'),
              componentOneLFLPercent:
                number('componentOneLFLPercent'),
              componentOneUFLPercent:
                number('componentOneUFLPercent'),
              componentTwoLFLPercent:
                number('componentTwoLFLPercent'),
              componentTwoUFLPercent:
                number('componentTwoUFLPercent'),
              actualFuelConcentrationPercent:
                number('actualFuelConcentrationPercent'),
            })
          break

        case 'gasReliefValveSizing':
          next =
            calculateGasReliefValveSizing({
              requiredMassFlowRate:
                number('requiredMassFlowRate'),
              relievingAbsolutePressure:
                number('relievingAbsolutePressure'),
              backAbsolutePressure:
                number('backAbsolutePressure'),
              relievingTemperature:
                number('relievingTemperature'),
              molecularWeight:
                number('molecularWeight'),
              compressibilityFactor:
                number('compressibilityFactor'),
              heatCapacityRatio:
                number('heatCapacityRatio'),
              dischargeCoefficient:
                number('dischargeCoefficient'),
            })
          break

        case 'liquidReliefValveSizing':
          next =
            calculateLiquidReliefValveSizing({
              requiredVolumetricFlowRate:
                number('requiredVolumetricFlowRate'),
              liquidDensity:
                number('liquidDensity'),
              upstreamAbsolutePressure:
                number('upstreamAbsolutePressure'),
              downstreamAbsolutePressure:
                number('downstreamAbsolutePressure'),
              dischargeCoefficient:
                number('dischargeCoefficient'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch03CalculationError
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
      case 'breakEvenProductionAnalysis':
        return record.breakEvenProductionUnits
      case 'equivalentAnnualWorth':
        return record.equivalentAnnualWorth
      case 'economicSensitivityAnalysis':
        return record.adjustedNetPresentValue
      case 'flammabilityMixtureLimits':
        return record.mixtureLFLPercent
      case 'gasReliefValveSizing':
      case 'liquidReliefValveSizing':
        return record.requiredArea
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'breakEvenProductionAnalysis':
        return [
          ['Contribution Margin', record.contributionMarginPerUnit, 'currency/unit'],
          ['Contribution-Margin Ratio', Number(record.contributionMarginRatio) * 100, '%'],
          ['Break-Even Revenue', record.breakEvenRevenue, 'currency/year'],
          ['Expected Annual Profit', record.expectedAnnualProfit, 'currency/year'],
          ['Margin of Safety', record.marginOfSafetyUnits, 'unit/year'],
          ['Margin of Safety', record.marginOfSafetyPercent, '%'],
          ['Profitable at Expected Production', record.profitableAtExpectedProduction ? 'Yes' : 'No', ''],
        ]

      case 'equivalentAnnualWorth':
        return [
          ['Present Worth', record.presentWorth, 'currency'],
          ['Capital-Recovery Factor', record.capitalRecoveryFactor, '1/year'],
          ['Annualized Initial Investment', record.annualizedInitialInvestment, 'currency/year'],
          ['Annualized Terminal Value', record.annualizedTerminalValue, 'currency/year'],
          ['Value Creating', record.valueCreating ? 'Yes' : 'No', ''],
        ]

      case 'economicSensitivityAnalysis':
        return [
          ['Adjusted Annual Revenue', record.adjustedAnnualRevenue, 'currency/year'],
          ['Adjusted Annual Operating Cost', record.adjustedAnnualOperatingCost, 'currency/year'],
          ['Adjusted Initial Investment', record.adjustedInitialInvestment, 'currency'],
          ['Base Net Present Value', record.baseNetPresentValue, 'currency'],
          ['NPV Change', record.netPresentValueChange, 'currency'],
          ['NPV Change', record.netPresentValueChangePercent, '%'],
          ['Adjusted Annual Net Cash Flow', record.adjustedAnnualNetCashFlow, 'currency/year'],
          ['Value Creating', record.adjustedCaseValueCreating ? 'Yes' : 'No', ''],
        ]

      case 'flammabilityMixtureLimits':
        return [
          ['Normalized Component 1', Number(record.normalizedComponentOneFraction) * 100, '% of fuel'],
          ['Normalized Component 2', Number(record.normalizedComponentTwoFraction) * 100, '% of fuel'],
          ['Mixture Upper Flammability Limit', record.mixtureUFLPercent, 'vol %'],
          ['Concentration Status', record.concentrationStatus, ''],
          ['Within Estimated Flammable Range', record.flammableMixture ? 'Yes' : 'No', ''],
          ['Distance to Nearest Limit', record.distanceToNearestLimitPercent, 'vol %'],
        ]

      case 'gasReliefValveSizing':
        return [
          ['Equivalent Diameter', record.equivalentDiameter, 'm'],
          ['Critical Pressure Ratio', record.criticalPressureRatio, '—'],
          ['Actual Pressure Ratio', record.actualPressureRatio, '—'],
          ['Choked Flow', record.chokedFlow ? 'Yes' : 'No', ''],
          ['Ideal Mass Flux', record.idealMassFlux, 'kg/(m²·s)'],
          ['Effective Mass Flux', record.effectiveMassFlux, 'kg/(m²·s)'],
          ['Pressure Drop', record.pressureDrop, 'Pa'],
        ]

      case 'liquidReliefValveSizing':
        return [
          ['Equivalent Diameter', record.equivalentDiameter, 'm'],
          ['Pressure Drop', record.pressureDrop, 'Pa'],
          ['Ideal Velocity', record.idealVelocity, 'm/s'],
          ['Effective Velocity', record.effectiveVelocity, 'm/s'],
          ['Required Mass Flow', record.requiredMassFlowRate, 'kg/s'],
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
          note="Preliminary screening only. Verify currency year, tax and financing basis, mixture data, relief assumptions and all applicable codes and standards before design or safety-critical use."
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
