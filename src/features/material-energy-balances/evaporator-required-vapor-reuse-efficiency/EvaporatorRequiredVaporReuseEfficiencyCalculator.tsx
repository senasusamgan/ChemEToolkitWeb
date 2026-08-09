import {
  useState,
} from 'react'

import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
  EvaporatorRequiredVaporReuseEfficiencyError,
  calculateEvaporatorRequiredVaporReuseEfficiency,
  createEvaporatorRequiredVaporReuseEfficiencyCsv,
} from './engine'

import type {
  EvaporatorRequiredVaporReuseEfficiencyInput,
  EvaporatorRequiredVaporReuseEfficiencyResult,
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

const exampleForm = {
  feedMassFlowRate: '1000',

  feedSolidsMassFraction: '0.10',
  productSolidsMassFraction: '0.40',

  feedTemperature: '25',
  boilingTemperature: '80',

  feedHeatCapacity: '4.0',

  vaporizationLatentHeat: '2300',
  steamLatentHeat: '2200',

  heatLossFraction: '0.10',

  effectCount: '4',

  targetSteamEconomy: '2.0',
}

type FormField =
  keyof typeof exampleForm

const fields: Array<{
  key: FormField
  label: string
  symbol: string
  unit: string
}> = [
  {
    key: 'feedMassFlowRate',
    label: 'Feed Mass Flow Rate',
    symbol: 'F',
    unit: 'kg/h',
  },
  {
    key: 'feedSolidsMassFraction',
    label: 'Feed Solids Mass Fraction',
    symbol: 'xF',
    unit: 'fraction',
  },
  {
    key: 'productSolidsMassFraction',
    label: 'Product Solids Mass Fraction',
    symbol: 'xP',
    unit: 'fraction',
  },
  {
    key: 'feedTemperature',
    label: 'Feed Temperature',
    symbol: 'TF',
    unit: '°C',
  },
  {
    key: 'boilingTemperature',
    label: 'First-Effect Boiling Temperature',
    symbol: 'Tb',
    unit: '°C',
  },
  {
    key: 'feedHeatCapacity',
    label: 'Feed Heat Capacity',
    symbol: 'cp',
    unit: 'kJ/(kg·K)',
  },
  {
    key: 'vaporizationLatentHeat',
    label: 'Water Vaporization Latent Heat',
    symbol: 'λv',
    unit: 'kJ/kg',
  },
  {
    key: 'steamLatentHeat',
    label: 'Heating Steam Latent Heat',
    symbol: 'λs',
    unit: 'kJ/kg',
  },
  {
    key: 'heatLossFraction',
    label: 'Heat-Loss Fraction',
    symbol: 'fLoss',
    unit: 'fraction',
  },
  {
    key: 'effectCount',
    label: 'Number of Effects',
    symbol: 'N',
    unit: '-',
  },
  {
    key: 'targetSteamEconomy',
    label: 'Target Steam Economy',
    symbol: 'Etarget',
    unit: 'kg water/kg steam',
  },
]

export function EvaporatorRequiredVaporReuseEfficiencyCalculator() {
  const [
    form,
    setForm,
  ] =
    useState(
      exampleForm,
    )

  const [
    result,
    setResult,
  ] =
    useState<
      EvaporatorRequiredVaporReuseEfficiencyResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      EvaporatorRequiredVaporReuseEfficiencyInput | null
    >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')

  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,
          [field]: value,
        }),
      )
    }
  }

  function currentInput():
    EvaporatorRequiredVaporReuseEfficiencyInput {
    return {
      feedMassFlowRate:
        Number(
          form.feedMassFlowRate,
        ),

      feedSolidsMassFraction:
        Number(
          form.feedSolidsMassFraction,
        ),

      productSolidsMassFraction:
        Number(
          form.productSolidsMassFraction,
        ),

      feedTemperature:
        Number(
          form.feedTemperature,
        ),

      boilingTemperature:
        Number(
          form.boilingTemperature,
        ),

      feedHeatCapacity:
        Number(
          form.feedHeatCapacity,
        ),

      vaporizationLatentHeat:
        Number(
          form.vaporizationLatentHeat,
        ),

      steamLatentHeat:
        Number(
          form.steamLatentHeat,
        ),

      heatLossFraction:
        Number(
          form.heatLossFraction,
        ),

      effectCount:
        Number(
          form.effectCount,
        ),

      targetSteamEconomy:
        Number(
          form.targetSteamEconomy,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateEvaporatorRequiredVaporReuseEfficiency(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage(
        '',
      )
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          EvaporatorRequiredVaporReuseEfficiencyError ||
        error instanceof
          MultipleEffectEvaporatorSteamEconomyError ||
        error instanceof
          EvaporatorSteamRequirementError ||
        error instanceof
          EvaporatorMassCoreError
          ? error.message
          : 'The required vapor-reuse efficiency could not be solved.',
      )
    }
  }

  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage(
      '',
    )
  }

  function clearInputs() {
    setForm(
      Object.fromEntries(
        Object.keys(
          exampleForm,
        ).map(
          key => [
            key,
            '',
          ],
        ),
      ) as typeof exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage(
      '',
    )
  }

  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createEvaporatorRequiredVaporReuseEfficiencyCsv(
        calculatedInput,
        result,
      )

    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8',
        },
      )

    const url =
      URL.createObjectURL(
        blob,
      )

    const link =
      document.createElement(
        'a',
      )

    link.href =
      url

    link.download =
      'evaporator-required-vapor-reuse-efficiency.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MEB–33"
        icon="⇄"
        title="Required Vapor-Reuse Efficiency for Target Steam Economy"
        subtitle="400th calculator milestone — inverse-design vapor reuse for a fixed multiple-effect evaporator"
      />

      <ReferenceBasis>
        Calculator 400 treats Calculator 398
        as the process model and solves the
        inverse-design problem. For a fixed
        number of effects, vapor-reuse
        efficiency is varied until the target
        steam economy is reached.
      </ReferenceBasis>

      <div className="native-formula">
        Find minimum ηreuse such that
        E(N, ηreuse) ≥ Etarget ·
        0 &lt; ηreuse ≤ 1
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={form[field.key]}
              unit={field.unit}
              onChange={updateField(
                field.key,
              )}
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve required reuse efficiency"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <>
          <ResultPanel
            headlineLabel="Required vapor-reuse efficiency"
            headlineValue={`${formatEngineeringNumber(
              result.requiredVaporReuseEfficiencyPercent,
            )} %`}
            modelName="Calculator 400 Inverse Evaporator Design"
            note={result.limitationDescription}
          >
            <ResultItem
              label="Required Reuse Fraction"
              value={formatEngineeringNumber(
                result.requiredVaporReuseEfficiency,
              )}
              unit="-"
            />

            <ResultItem
              label="Target Steam Economy"
              value={formatEngineeringNumber(
                result.targetSteamEconomy,
              )}
              unit="kg water/kg steam"
            />

            <ResultItem
              label="Achieved Steam Economy"
              value={formatEngineeringNumber(
                result.steamEconomy,
              )}
              unit="kg water/kg steam"
            />

            <ResultItem
              label="Economy Margin"
              value={formatEngineeringNumber(
                result.economyMargin,
              )}
              unit="kg water/kg steam"
            />

            <ResultItem
              label="Required Heating Steam"
              value={formatEngineeringNumber(
                result.requiredSteamMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Steam Reduction"
              value={formatEngineeringNumber(
                result.steamReductionPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Maximum Economy at Perfect Reuse"
              value={formatEngineeringNumber(
                result.maximumSteamEconomyAtPerfectReuse,
              )}
              unit="kg water/kg steam"
            />

            <ResultItem
              label="Bisection Iterations"
              value={`${result.iterationCount}`}
              unit="-"
            />

            <ResultItem
              label="Mass-Balance Closure Error"
              value={formatEngineeringNumber(
                result.massBalanceClosurePercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Energy-Balance Closure Error"
              value={formatEngineeringNumber(
                result.energyBalanceClosurePercent,
              )}
              unit="%"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={exportCsv}
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
