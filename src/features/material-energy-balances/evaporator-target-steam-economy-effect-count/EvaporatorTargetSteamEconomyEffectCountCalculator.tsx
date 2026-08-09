import {
  useState,
} from 'react'

import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
  EvaporatorTargetSteamEconomyEffectCountError,
  calculateEvaporatorTargetSteamEconomyEffectCount,
  createEvaporatorTargetSteamEconomyEffectCountCsv,
} from './engine'

import type {
  EvaporatorTargetSteamEconomyEffectCountInput,
  EvaporatorTargetSteamEconomyEffectCountResult,
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

  vaporReuseEfficiency: '0.90',

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
    key: 'vaporReuseEfficiency',
    label: 'Vapor Reuse Efficiency',
    symbol: 'ηreuse',
    unit: 'fraction',
  },
  {
    key: 'targetSteamEconomy',
    label: 'Target Steam Economy',
    symbol: 'Etarget',
    unit: 'kg water/kg steam',
  },
]

export function EvaporatorTargetSteamEconomyEffectCountCalculator() {
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
      EvaporatorTargetSteamEconomyEffectCountResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      EvaporatorTargetSteamEconomyEffectCountInput | null
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
    EvaporatorTargetSteamEconomyEffectCountInput {
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

      vaporReuseEfficiency:
        Number(
          form.vaporReuseEfficiency,
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
        calculateEvaporatorTargetSteamEconomyEffectCount(
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
          EvaporatorTargetSteamEconomyEffectCountError ||
        error instanceof
          MultipleEffectEvaporatorSteamEconomyError ||
        error instanceof
          EvaporatorSteamRequirementError ||
        error instanceof
          EvaporatorMassCoreError
          ? error.message
          : 'The target steam-economy effect count could not be solved.',
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
      createEvaporatorTargetSteamEconomyEffectCountCsv(
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
      'evaporator-target-steam-economy-effect-count.csv'

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
        code="MEB–32"
        icon="⇄"
        title="Evaporator Effect Count for Target Steam Economy"
        subtitle="Find the minimum multiple-effect count required to meet a specified steam economy"
      />

      <ReferenceBasis>
        Calculator 399 repeatedly evaluates
        Calculator 398 from two through ten
        effects and selects the first design
        that reaches the requested steam
        economy. The 397 mass and thermal
        model remains unchanged.
      </ReferenceBasis>

      <div className="native-formula">
        Find minimum N such that
        E(N) ≥ Etarget ·
        N ∈ [2, 10]
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
        calculateLabel="Find required effect count"
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
            headlineLabel="Minimum required effects"
            headlineValue={`${result.requiredEffectCount}`}
            modelName="Target Steam Economy Effect-Count Search"
            note="The returned count is the first integer effect count from 2 to 10 that reaches or exceeds the target."
          >
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

            {result.previousEffectSteamEconomy !== null ? (
              <ResultItem
                label="Previous-Effect Economy"
                value={formatEngineeringNumber(
                  result.previousEffectSteamEconomy,
                )}
                unit="kg water/kg steam"
              />
            ) : null}

            <ResultItem
              label="Required Heating Steam"
              value={formatEngineeringNumber(
                result.requiredSteamMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Steam Savings"
              value={formatEngineeringNumber(
                result.steamSavingsMassFlowRate,
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
              label="Latent-Heat Amplification"
              value={formatEngineeringNumber(
                result.latentHeatAmplificationFactor,
              )}
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
