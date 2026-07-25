import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch02CalculationError,
  calculateAnnualOperatingCostEstimate,
  calculateInternalRateOfReturnAnalysis,
  calculateLangFactorCapitalEstimate,
  calculateNetPresentValueAnalysis,
  calculateStraightLineDepreciation,
  calculateTotalCapitalInvestmentEstimate,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch02Mode,
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
    ProcessSafetyEconomicsBatch02Mode
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
  ProcessSafetyEconomicsBatch02Mode,
  Definition
> = {
  langFactorCapitalEstimate: {
    code: 'SE–07',
    icon: 'LF',
    title:
      'Lang-Factor Capital Estimate',
    subtitle:
      'Estimate fixed and total capital from purchased-equipment cost',
    basis:
      'FCI = FLang × CPE',
    action:
      'Estimate capital investment',
    headline:
      'Total capital investment',
    fields: [
      { key: 'purchasedEquipmentCost', label: 'Purchased Equipment Cost', symbol: 'CPE', unit: 'currency' },
      { key: 'langFactor', label: 'Lang Factor', symbol: 'FLang', unit: '—' },
      { key: 'workingCapitalFractionOfFixedCapital', label: 'Working-Capital Fraction', symbol: 'fWC', unit: '0–1' },
      { key: 'startupCostFractionOfFixedCapital', label: 'Startup-Cost Fraction', symbol: 'fSU', unit: '0–1' },
      { key: 'landCost', label: 'Land Cost', symbol: 'CL', unit: 'currency' },
    ],
    example: {
      purchasedEquipmentCost: '2000000',
      langFactor: '4.7',
      workingCapitalFractionOfFixedCapital: '0.15',
      startupCostFractionOfFixedCapital: '0.05',
      landCost: '400000',
    },
  },

  totalCapitalInvestmentEstimate: {
    code: 'SE–08',
    icon: 'TCI',
    title:
      'Total Capital-Investment Estimate',
    subtitle:
      'Assemble fixed capital, contingency and working capital from explicit cost components',
    basis:
      'TCI = subtotal + contingency + working capital',
    action:
      'Calculate total capital',
    headline:
      'Total capital investment',
    fields: [
      { key: 'purchasedEquipmentCost', label: 'Purchased Equipment', symbol: 'CPE', unit: 'currency' },
      { key: 'equipmentInstallationCost', label: 'Equipment Installation', symbol: 'CINST', unit: 'currency' },
      { key: 'pipingCost', label: 'Piping', symbol: 'CP', unit: 'currency' },
      { key: 'instrumentationCost', label: 'Instrumentation', symbol: 'CI', unit: 'currency' },
      { key: 'electricalCost', label: 'Electrical', symbol: 'CE', unit: 'currency' },
      { key: 'buildingsAndYardCost', label: 'Buildings and Yard', symbol: 'CBY', unit: 'currency' },
      { key: 'utilitiesAndServiceFacilitiesCost', label: 'Utilities and Services', symbol: 'CUS', unit: 'currency' },
      { key: 'engineeringAndConstructionCost', label: 'Engineering and Construction', symbol: 'CEC', unit: 'currency' },
      { key: 'contingencyFractionOfSubtotal', label: 'Contingency Fraction', symbol: 'fC', unit: '0–1' },
      { key: 'workingCapitalFractionOfFixedCapital', label: 'Working-Capital Fraction', symbol: 'fWC', unit: '0–1' },
    ],
    example: {
      purchasedEquipmentCost: '2000000',
      equipmentInstallationCost: '800000',
      pipingCost: '700000',
      instrumentationCost: '400000',
      electricalCost: '300000',
      buildingsAndYardCost: '500000',
      utilitiesAndServiceFacilitiesCost: '600000',
      engineeringAndConstructionCost: '900000',
      contingencyFractionOfSubtotal: '0.1',
      workingCapitalFractionOfFixedCapital: '0.15',
    },
  },

  annualOperatingCostEstimate: {
    code: 'SE–09',
    icon: 'OPEX',
    title:
      'Annual Operating-Cost Estimate',
    subtitle:
      'Estimate direct annual cost, overhead, insurance, tax and unit production cost',
    basis:
      'AOC = direct cash cost + overhead + insurance/tax',
    action:
      'Calculate annual operating cost',
    headline:
      'Total annual operating cost',
    fields: [
      { key: 'rawMaterialCost', label: 'Raw-Material Cost', symbol: 'CRM', unit: 'currency/year' },
      { key: 'utilityCost', label: 'Utility Cost', symbol: 'CU', unit: 'currency/year' },
      { key: 'operatingLaborCost', label: 'Operating Labor', symbol: 'COL', unit: 'currency/year' },
      { key: 'maintenanceCost', label: 'Maintenance', symbol: 'CM', unit: 'currency/year' },
      { key: 'wasteTreatmentCost', label: 'Waste Treatment', symbol: 'CWT', unit: 'currency/year' },
      { key: 'laboratoryAndQualityCost', label: 'Laboratory and Quality', symbol: 'CLQ', unit: 'currency/year' },
      { key: 'plantOverheadFractionOfLaborAndMaintenance', label: 'Overhead Fraction', symbol: 'fOH', unit: '0–1' },
      { key: 'insuranceAndTaxFractionOfFixedCapital', label: 'Insurance + Tax Fraction', symbol: 'fIT', unit: '0–1' },
      { key: 'fixedCapitalInvestment', label: 'Fixed Capital Investment', symbol: 'FCI', unit: 'currency' },
      { key: 'annualProduction', label: 'Annual Production', symbol: 'P', unit: 'product/year' },
    ],
    example: {
      rawMaterialCost: '3500000',
      utilityCost: '900000',
      operatingLaborCost: '750000',
      maintenanceCost: '500000',
      wasteTreatmentCost: '180000',
      laboratoryAndQualityCost: '90000',
      plantOverheadFractionOfLaborAndMaintenance: '0.6',
      insuranceAndTaxFractionOfFixedCapital: '0.03',
      fixedCapitalInvestment: '10000000',
      annualProduction: '50000',
    },
  },

  straightLineDepreciation: {
    code: 'SE–10',
    icon: 'SL',
    title:
      'Straight-Line Depreciation',
    subtitle:
      'Calculate annual depreciation, accumulated depreciation and book value',
    basis:
      'Dannual = (C₀ − S)/N',
    action:
      'Calculate depreciation',
    headline:
      'Book value',
    fields: [
      { key: 'initialAssetCost', label: 'Initial Asset Cost', symbol: 'C₀', unit: 'currency' },
      { key: 'salvageValue', label: 'Salvage Value', symbol: 'S', unit: 'currency' },
      { key: 'usefulLifeYears', label: 'Useful Life', symbol: 'N', unit: 'years' },
      { key: 'elapsedYears', label: 'Elapsed Time', symbol: 't', unit: 'years' },
    ],
    example: {
      initialAssetCost: '1000000',
      salvageValue: '100000',
      usefulLifeYears: '10',
      elapsedYears: '4',
    },
  },

  netPresentValueAnalysis: {
    code: 'SE–11',
    icon: 'NPV',
    title:
      'Net Present Value Analysis',
    subtitle:
      'Discount a uniform annual project cash flow and terminal value',
    basis:
      'NPV = −I₀ + Σ CFt/(1+r)ᵗ + TV/(1+r)ᴺ',
    action:
      'Calculate net present value',
    headline:
      'Net present value',
    fields: [
      { key: 'initialInvestment', label: 'Initial Investment', symbol: 'I₀', unit: 'currency' },
      { key: 'annualNetCashFlow', label: 'Annual Net Cash Flow', symbol: 'CF', unit: 'currency/year' },
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

  internalRateOfReturnAnalysis: {
    code: 'SE–12',
    icon: 'IRR',
    title:
      'Internal Rate of Return Analysis',
    subtitle:
      'Solve the uniform-cash-flow project IRR with a bracketed bisection method',
    basis:
      'Find r such that NPV(r) = 0',
    action:
      'Calculate internal rate of return',
    headline:
      'Internal rate of return',
    fields: [
      { key: 'initialInvestment', label: 'Initial Investment', symbol: 'I₀', unit: 'currency' },
      { key: 'annualNetCashFlow', label: 'Annual Net Cash Flow', symbol: 'CF', unit: 'currency/year' },
      { key: 'terminalValue', label: 'Terminal Value', symbol: 'TV', unit: 'currency' },
      { key: 'projectLifeYears', label: 'Project Life', symbol: 'N', unit: 'years' },
      { key: 'minimumSearchRate', label: 'Minimum Search Rate', symbol: 'rmin', unit: 'fraction' },
      { key: 'maximumSearchRate', label: 'Maximum Search Rate', symbol: 'rmax', unit: 'fraction' },
    ],
    example: {
      initialInvestment: '5000000',
      annualNetCashFlow: '950000',
      terminalValue: '500000',
      projectLifeYears: '10',
      minimumSearchRate: '-0.5',
      maximumSearchRate: '1',
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

export function ProcessSafetyEconomicsBatch02Calculator({
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
        case 'langFactorCapitalEstimate':
          next =
            calculateLangFactorCapitalEstimate({
              purchasedEquipmentCost:
                number('purchasedEquipmentCost'),
              langFactor:
                number('langFactor'),
              workingCapitalFractionOfFixedCapital:
                number('workingCapitalFractionOfFixedCapital'),
              startupCostFractionOfFixedCapital:
                number('startupCostFractionOfFixedCapital'),
              landCost:
                number('landCost'),
            })
          break

        case 'totalCapitalInvestmentEstimate':
          next =
            calculateTotalCapitalInvestmentEstimate({
              purchasedEquipmentCost:
                number('purchasedEquipmentCost'),
              equipmentInstallationCost:
                number('equipmentInstallationCost'),
              pipingCost:
                number('pipingCost'),
              instrumentationCost:
                number('instrumentationCost'),
              electricalCost:
                number('electricalCost'),
              buildingsAndYardCost:
                number('buildingsAndYardCost'),
              utilitiesAndServiceFacilitiesCost:
                number('utilitiesAndServiceFacilitiesCost'),
              engineeringAndConstructionCost:
                number('engineeringAndConstructionCost'),
              contingencyFractionOfSubtotal:
                number('contingencyFractionOfSubtotal'),
              workingCapitalFractionOfFixedCapital:
                number('workingCapitalFractionOfFixedCapital'),
            })
          break

        case 'annualOperatingCostEstimate':
          next =
            calculateAnnualOperatingCostEstimate({
              rawMaterialCost:
                number('rawMaterialCost'),
              utilityCost:
                number('utilityCost'),
              operatingLaborCost:
                number('operatingLaborCost'),
              maintenanceCost:
                number('maintenanceCost'),
              wasteTreatmentCost:
                number('wasteTreatmentCost'),
              laboratoryAndQualityCost:
                number('laboratoryAndQualityCost'),
              plantOverheadFractionOfLaborAndMaintenance:
                number('plantOverheadFractionOfLaborAndMaintenance'),
              insuranceAndTaxFractionOfFixedCapital:
                number('insuranceAndTaxFractionOfFixedCapital'),
              fixedCapitalInvestment:
                number('fixedCapitalInvestment'),
              annualProduction:
                number('annualProduction'),
            })
          break

        case 'straightLineDepreciation':
          next =
            calculateStraightLineDepreciation({
              initialAssetCost:
                number('initialAssetCost'),
              salvageValue:
                number('salvageValue'),
              usefulLifeYears:
                number('usefulLifeYears'),
              elapsedYears:
                number('elapsedYears'),
            })
          break

        case 'netPresentValueAnalysis':
          next =
            calculateNetPresentValueAnalysis({
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

        case 'internalRateOfReturnAnalysis':
          next =
            calculateInternalRateOfReturnAnalysis({
              initialInvestment:
                number('initialInvestment'),
              annualNetCashFlow:
                number('annualNetCashFlow'),
              terminalValue:
                number('terminalValue'),
              projectLifeYears:
                number('projectLifeYears'),
              minimumSearchRate:
                number('minimumSearchRate'),
              maximumSearchRate:
                number('maximumSearchRate'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch02CalculationError
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
      case 'langFactorCapitalEstimate':
      case 'totalCapitalInvestmentEstimate':
        return record.totalCapitalInvestment
      case 'annualOperatingCostEstimate':
        return record.totalAnnualOperatingCost
      case 'straightLineDepreciation':
        return record.bookValue
      case 'netPresentValueAnalysis':
        return record.netPresentValue
      case 'internalRateOfReturnAnalysis':
        return Number(
          record.internalRateOfReturn,
        ) * 100
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'langFactorCapitalEstimate':
        return [
          ['Fixed Capital Investment', record.fixedCapitalInvestment, 'currency'],
          ['Working Capital', record.workingCapital, 'currency'],
          ['Startup Cost', record.startupCost, 'currency'],
          ['Land Cost', record.landCost, 'currency'],
          ['Total / Equipment Cost', record.totalToEquipmentCostRatio, '—'],
        ]

      case 'totalCapitalInvestmentEstimate':
        return [
          ['Direct + Indirect Subtotal', record.directAndIndirectSubtotal, 'currency'],
          ['Contingency Cost', record.contingencyCost, 'currency'],
          ['Fixed Capital Investment', record.fixedCapitalInvestment, 'currency'],
          ['Working Capital', record.workingCapital, 'currency'],
          ['Purchased-Equipment Share', Number(record.purchasedEquipmentFractionOfTotal) * 100, '%'],
        ]

      case 'annualOperatingCostEstimate':
        return [
          ['Direct Cash Operating Cost', record.directCashOperatingCost, 'currency/year'],
          ['Plant Overhead Cost', record.plantOverheadCost, 'currency/year'],
          ['Insurance + Tax Cost', record.insuranceAndTaxCost, 'currency/year'],
          ['Unit Production Cost', record.unitProductionCost, 'currency/product'],
          ['Variable-Cost Fraction', Number(record.variableCostFraction) * 100, '%'],
          ['Labor + Maintenance Fraction', Number(record.laborAndMaintenanceFraction) * 100, '%'],
          ['Largest Cost Category', record.largestCostCategory, ''],
        ]

      case 'straightLineDepreciation':
        return [
          ['Depreciable Basis', record.depreciableBasis, 'currency'],
          ['Annual Depreciation', record.annualDepreciation, 'currency/year'],
          ['Accumulated Depreciation', record.accumulatedDepreciation, 'currency'],
          ['Remaining Depreciable Amount', record.remainingDepreciableAmount, 'currency'],
          ['Depreciated Life Fraction', Number(record.depreciatedLifeFraction) * 100, '%'],
          ['Fully Depreciated', record.fullyDepreciated ? 'Yes' : 'No', ''],
        ]

      case 'netPresentValueAnalysis':
        return [
          ['PV of Annual Cash Flows', record.presentValueOfAnnualCashFlows, 'currency'],
          ['PV of Terminal Value', record.presentValueOfTerminalValue, 'currency'],
          ['Profitability Index', record.profitabilityIndex, '—'],
          ['Discounted Payback Approximation', record.discountedPaybackApproximationYears, 'years'],
          ['Value Creating', record.valueCreating ? 'Yes' : 'No', ''],
        ]

      case 'internalRateOfReturnAnalysis':
        return [
          ['NPV at IRR', record.netPresentValueAtIRR, 'currency'],
          ['Lower Bracket', Number(record.lowerBracketRate) * 100, '%'],
          ['Upper Bracket', Number(record.upperBracketRate) * 100, '%'],
          ['Iterations', record.iterationCount, '—'],
          ['Annual Cash Flow / Investment', Number(record.annualCashFlowToInvestmentRatio) * 100, '%'],
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
          note="Preliminary economic screening only. Verify cost year, currency basis, tax treatment, financing assumptions, project scope and organization-specific estimating practice before decisions."
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
