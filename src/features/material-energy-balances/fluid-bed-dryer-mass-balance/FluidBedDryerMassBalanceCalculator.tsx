import {
  useState,
} from 'react'

import {
  FluidBedDryerMassBalanceError,
  calculateFluidBedDryerMassBalance,
  createFluidBedDryerMassBalanceCsv,
} from './engine'

import type {
  FluidBedDryerMassBalanceInput,
  FluidBedDryerMassBalanceResult,
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
  wetFeedMassFlowRate: '1000',
  inletMoistureWetBasis: '0.25',
  outletMoistureWetBasis: '0.05',
  dryAirMassFlowRate: '5000',
  inletAirHumidityRatio: '0.01',
}

type FormField =
  keyof typeof exampleForm

export function FluidBedDryerMassBalanceCalculator() {
  const [
    form,
    setForm,
  ] = useState(exampleForm)

  const [
    result,
    setResult,
  ] = useState<
    FluidBedDryerMassBalanceResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    FluidBedDryerMassBalanceInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

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
    FluidBedDryerMassBalanceInput {
    return {
      wetFeedMassFlowRate:
        Number(
          form.wetFeedMassFlowRate,
        ),

      inletMoistureWetBasis:
        Number(
          form.inletMoistureWetBasis,
        ),

      outletMoistureWetBasis:
        Number(
          form.outletMoistureWetBasis,
        ),

      dryAirMassFlowRate:
        Number(
          form.dryAirMassFlowRate,
        ),

      inletAirHumidityRatio:
        Number(
          form.inletAirHumidityRatio,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateFluidBedDryerMassBalance(
          input,
        )

      setResult(nextResult)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          FluidBedDryerMassBalanceError
          ? error.message
          : 'The fluid-bed dryer mass balance could not be completed.',
      )
    }
  }

  function loadExample() {
    setForm(exampleForm)
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setForm({
      wetFeedMassFlowRate: '',
      inletMoistureWetBasis: '',
      outletMoistureWetBasis: '',
      dryAirMassFlowRate: '',
      inletAirHumidityRatio: '',
    })

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createFluidBedDryerMassBalanceCsv(
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
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      'fluid-bed-dryer-mass-balance.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MEB–26"
        icon="⇄"
        title="Fluid Bed Dryer Mass Balance"
        subtitle="Solids, moisture evaporation and drying-air humidity balance"
      />

      <ReferenceBasis>
        Steady-state fluid-bed drying with
        conserved dry solids, wet-basis
        product moisture and humidity ratio
        expressed per kilogram of dry air.
      </ReferenceBasis>

      <div className="native-formula">
        ṁdry = ṁfeed(1 − Xin) ·
        ṁproduct = ṁdry/(1 − Xout) ·
        ṁevap = ṁwater,in − ṁwater,out
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Wet Feed Mass Flow Rate"
          symbol="ṁfeed"
          value={
            form.wetFeedMassFlowRate
          }
          unit="kg/h"
          onChange={
            updateField(
              'wetFeedMassFlowRate',
            )
          }
        />

        <NumericInput
          label="Inlet Moisture — Wet Basis"
          symbol="Xin"
          value={
            form.inletMoistureWetBasis
          }
          unit="kg water/kg wet feed"
          onChange={
            updateField(
              'inletMoistureWetBasis',
            )
          }
        />

        <NumericInput
          label="Outlet Moisture — Wet Basis"
          symbol="Xout"
          value={
            form.outletMoistureWetBasis
          }
          unit="kg water/kg wet product"
          onChange={
            updateField(
              'outletMoistureWetBasis',
            )
          }
        />

        <NumericInput
          label="Dry-Air Mass Flow Rate"
          symbol="ṁda"
          value={
            form.dryAirMassFlowRate
          }
          unit="kg dry air/h"
          onChange={
            updateField(
              'dryAirMassFlowRate',
            )
          }
        />

        <NumericInput
          label="Inlet-Air Humidity Ratio"
          symbol="Win"
          value={
            form.inletAirHumidityRatio
          }
          unit="kg water/kg dry air"
          onChange={
            updateField(
              'inletAirHumidityRatio',
            )
          }
        />
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Calculate FBD mass balance"
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
            headlineLabel="Evaporated water"
            headlineValue={`${formatEngineeringNumber(
              result
                .evaporatedWaterMassFlowRate,
            )} kg/h`}
            modelName={
              result.modelName
            }
            note={
              result
                .limitationDescription
            }
          >
            <ResultItem
              label="Dry Solids Flow"
              value={
                formatEngineeringNumber(
                  result
                    .drySolidMassFlowRate,
                )
              }
              unit="kg/h"
            />

            <ResultItem
              label="Final Product Flow"
              value={
                formatEngineeringNumber(
                  result
                    .dryProductMassFlowRate,
                )
              }
              unit="kg/h"
            />

            <ResultItem
              label="Outlet Humidity Ratio"
              value={
                formatEngineeringNumber(
                  result
                    .outletAirHumidityRatio,
                )
              }
              unit="kg water/kg dry air"
            />

            <ResultItem
              label="Outlet Wet-Air Flow"
              value={
                formatEngineeringNumber(
                  result
                    .outletWetAirMassFlowRate,
                )
              }
              unit="kg/h"
            />

            <ResultItem
              label="Water Removal"
              value={
                formatEngineeringNumber(
                  result
                    .waterRemovalPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Mass-Balance Closure Error"
              value={
                formatEngineeringNumber(
                  result
                    .massBalanceClosurePercent,
                )
              }
              unit="%"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Fluid-bed dryer streams
                </p>

                <strong>
                  Water and overall mass balance
                </strong>
              </div>

              <span>
                Dry solids remain conserved
                while evaporated product water
                increases the outlet-air
                humidity ratio.
              </span>
            </div>

            <ol className="native-stage-list">
              <li>
                <strong>
                  Feed water
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result
                      .inletWaterMassFlowRate,
                  )
                } kg/h
              </li>

              <li>
                <strong>
                  Product water
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result
                      .outletProductWaterMassFlowRate,
                  )
                } kg/h
              </li>

              <li>
                <strong>
                  Total inlet mass
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result.totalMassIn,
                  )
                } kg/h
              </li>

              <li>
                <strong>
                  Total outlet mass
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result.totalMassOut,
                  )
                } kg/h
              </li>
            </ol>
          </div>

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
