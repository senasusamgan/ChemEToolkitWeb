import {
  useState,
} from 'react'

import {
  EvaporatorMassCoreError,
  EvaporatorSteamRequirementError,
  calculateEvaporatorSteamRequirementEconomy,
  createEvaporatorSteamRequirementEconomyCsv,
} from './engine'

import type {
  EvaporatorSteamRequirementInput,
  EvaporatorSteamRequirementResult,
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
    label: 'Boiling Temperature',
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
    label: 'Vaporization Latent Heat',
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
]

export function EvaporatorSteamRequirementEconomyCalculator() {
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
      EvaporatorSteamRequirementResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      EvaporatorSteamRequirementInput | null
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
    EvaporatorSteamRequirementInput {
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
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateEvaporatorSteamRequirementEconomy(
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
          EvaporatorMassCoreError ||
        error instanceof
          EvaporatorSteamRequirementError
          ? error.message
          : 'The evaporator steam requirement could not be calculated.',
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
      createEvaporatorSteamRequirementEconomyCsv(
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
      'evaporator-steam-requirement-economy.csv'

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
        code="MEB–30"
        icon="⇄"
        title="Evaporator Steam Requirement & Economy"
        subtitle="Single-effect evaporation duty, heating-steam demand and steam economy"
      />

      <ReferenceBasis>
        Nonvolatile solids are conserved
        through the evaporator. The feed is
        heated to its specified boiling
        temperature and the required water
        evaporation is supplied by
        condensing heating steam.
      </ReferenceBasis>

      <div className="native-formula">
        P = F xF / xP ·
        V = F − P ·
        S = Qsupplied / λs ·
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
        calculateLabel="Calculate steam requirement"
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
            headlineLabel="Required heating steam"
            headlineValue={`${formatEngineeringNumber(
              result.requiredSteamMassFlowRate,
            )} kg/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Product Mass Flow"
              value={formatEngineeringNumber(
                result.productMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Evaporated Water"
              value={formatEngineeringNumber(
                result.evaporatedWaterMassFlowRate,
              )}
              unit="kg/h"
            />

            <ResultItem
              label="Steam Economy"
              value={formatEngineeringNumber(
                result.steamEconomy,
              )}
              unit="kg water/kg steam"
            />

            <ResultItem
              label="Specific Steam Consumption"
              value={formatEngineeringNumber(
                result.specificSteamConsumption,
              )}
              unit="kg steam/kg water"
            />

            <ResultItem
              label="Sensible Heat Duty"
              value={formatEngineeringNumber(
                result.sensibleHeatDuty,
              )}
              unit="kJ/h"
            />

            <ResultItem
              label="Evaporation Heat Duty"
              value={formatEngineeringNumber(
                result.evaporationHeatDuty,
              )}
              unit="kJ/h"
            />

            <ResultItem
              label="Heat Loss"
              value={formatEngineeringNumber(
                result.heatLossDuty,
              )}
              unit="kJ/h"
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
