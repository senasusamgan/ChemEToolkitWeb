import {
  useState,
} from 'react'

import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  MultipleEffectEvaporatorSteamEconomyError,
  calculateMultipleEffectEvaporatorSteamEconomy,
  createMultipleEffectEvaporatorSteamEconomyCsv,
} from './engine'

import type {
  MultipleEffectEvaporatorSteamEconomyInput,
  MultipleEffectEvaporatorSteamEconomyResult,
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

  effectCount: '3',
  vaporReuseEfficiency: '0.90',
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
    key: 'vaporReuseEfficiency',
    label: 'Vapor Reuse Efficiency',
    symbol: 'ηreuse',
    unit: 'fraction',
  },
]

export function MultipleEffectEvaporatorSteamEconomyCalculator() {
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
      MultipleEffectEvaporatorSteamEconomyResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MultipleEffectEvaporatorSteamEconomyInput | null
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
    MultipleEffectEvaporatorSteamEconomyInput {
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

      vaporReuseEfficiency:
        Number(
          form.vaporReuseEfficiency,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateMultipleEffectEvaporatorSteamEconomy(
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
          MultipleEffectEvaporatorSteamEconomyError ||
        error instanceof
          EvaporatorSteamRequirementError ||
        error instanceof
          EvaporatorMassCoreError
          ? error.message
          : 'The multiple-effect evaporator calculation could not be completed.',
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
      createMultipleEffectEvaporatorSteamEconomyCsv(
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
      'multiple-effect-evaporator-steam-economy.csv'

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
        code="MEB–31"
        icon="⇄"
        title="Multiple-Effect Evaporator Steam Economy"
        subtitle="Estimate steam demand reduction from vapor reuse across multiple evaporator effects"
      />

      <ReferenceBasis>
        Calculator 398 reuses the complete
        Calculator 397 single-effect
        evaporator model. Vapor generated in
        each effect contributes an
        effectiveness-weighted latent-energy
        credit to downstream effects.
      </ReferenceBasis>

      <div className="native-formula">
        A = 1 + η + η² + ... +
        η^(N−1) ·
        λeq = λv / A ·
        economy = V / S
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
        calculateLabel="Calculate multiple-effect economy"
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
            headlineLabel="Multiple-effect steam economy"
            headlineValue={`${formatEngineeringNumber(
              result.steamEconomy,
            )} kg water/kg steam`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Required Heating Steam"
              value={formatEngineeringNumber(
                result.requiredSteamMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Single-Effect Steam Reference"
              value={formatEngineeringNumber(
                result.singleEffectRequiredSteamMassFlowRate,
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
              label="Evaporated Water"
              value={formatEngineeringNumber(
                result.evaporatedWaterMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Latent-Heat Amplification Factor"
              value={formatEngineeringNumber(
                result.latentHeatAmplificationFactor,
              )}
              unit="-"
            />

            <ResultItem
              label="Effect Utilization"
              value={formatEngineeringNumber(
                result.idealizedEffectUtilizationPercent,
              )}
              unit="%"
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
