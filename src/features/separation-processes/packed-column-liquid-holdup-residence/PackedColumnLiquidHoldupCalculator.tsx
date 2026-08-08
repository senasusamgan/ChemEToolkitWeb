import {
  useState,
} from 'react'

import {
  PackedColumnLiquidHoldupError,
  calculatePackedColumnLiquidHoldup,
  createPackedColumnLiquidHoldupCsv,
} from './engine'
import type {
  PackedColumnHoldupStatus,
  PackedColumnLiquidHoldupInput,
  PackedColumnLiquidHoldupResult,
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
  liquidFlow:
    '0.01',
  columnDiameter:
    '1.2',
  packingHeight:
    '4',
  bedVoidPercent:
    '90',
  liquidHoldupPercent:
    '8',
  liquidDensity:
    '800',
  minimumResidenceTime:
    '20',
}

type FormField =
  keyof typeof exampleForm

function statusLabel(
  status: PackedColumnHoldupStatus,
): string {
  const labels: Record<
    PackedColumnHoldupStatus,
    string
  > = {
    stable:
      'Stable liquid inventory',
    marginal:
      'Marginal residence-time margin',
    highHoldup:
      'High packed-bed liquid holdup',
    shortResidence:
      'Residence time below minimum',
  }

  return labels[status]
}

export function PackedColumnLiquidHoldupCalculator() {
  const [
    form,
    setForm,
  ] = useState(
    exampleForm,
  )

  const [
    result,
    setResult,
  ] = useState<
    PackedColumnLiquidHoldupResult |
    null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnLiquidHoldupInput |
    null
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
        (
          current,
        ) => ({
          ...current,
          [field]:
            value,
        }),
      )
    }
  }

  function currentInput():
    PackedColumnLiquidHoldupInput {
    return {
      liquidVolumetricFlowRate:
        Number(
          form.liquidFlow,
        ),
      columnDiameter:
        Number(
          form.columnDiameter,
        ),
      packingHeight:
        Number(
          form.packingHeight,
        ),
      bedVoidFraction:
        Number(
          form.bedVoidPercent,
        ) /
        100,
      liquidHoldupFraction:
        Number(
          form.liquidHoldupPercent,
        ) /
        100,
      liquidDensity:
        Number(
          form.liquidDensity,
        ),
      minimumResidenceTime:
        Number(
          form.minimumResidenceTime,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnLiquidHoldup(
          input,
        )

      setResult(
        nextResult,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          PackedColumnLiquidHoldupError
          ? error.message
          : 'The packed-column liquid-holdup calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setForm({
      liquidFlow:
        '',
      columnDiameter:
        '',
      packingHeight:
        '',
      bedVoidPercent:
        '',
      liquidHoldupPercent:
        '',
      liquidDensity:
        '',
      minimumResidenceTime:
        '',
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
      createPackedColumnLiquidHoldupCsv(
        calculatedInput,
        result,
      )

    const blob =
      new Blob(
        [
          csv,
        ],
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
      'packed-column-liquid-holdup-residence.csv'

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
        code="SP–47"
        icon="◒"
        title="Packed Column Liquid Holdup & Residence Time"
        subtitle="Liquid inventory, void saturation, residence time and flow-capacity screening"
      />

      <ReferenceBasis>
        Uniform liquid holdup over the
        packed-bed volume with residence
        time calculated from liquid
        inventory divided by volumetric
        liquid flow
      </ReferenceBasis>

      <div className="native-formula">
        VL = hL Ac Z · tres = VL/QL
        · umax = VL/(Ac tmin)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Liquid Volumetric Flow"
          symbol="QL"
          value={form.liquidFlow}
          unit="m³/s"
          onChange={
            updateField(
              'liquidFlow',
            )
          }
        />

        <NumericInput
          label="Column Diameter"
          symbol="D"
          value={form.columnDiameter}
          unit="m"
          onChange={
            updateField(
              'columnDiameter',
            )
          }
        />

        <NumericInput
          label="Packing Height"
          symbol="Z"
          value={form.packingHeight}
          unit="m"
          onChange={
            updateField(
              'packingHeight',
            )
          }
        />

        <NumericInput
          label="Packed-Bed Void Fraction"
          symbol="ε"
          value={form.bedVoidPercent}
          unit="%"
          onChange={
            updateField(
              'bedVoidPercent',
            )
          }
        />

        <NumericInput
          label="Liquid Holdup Fraction"
          symbol="hL"
          value={
            form.liquidHoldupPercent
          }
          unit="% bed volume"
          onChange={
            updateField(
              'liquidHoldupPercent',
            )
          }
        />

        <NumericInput
          label="Liquid Density"
          symbol="ρL"
          value={form.liquidDensity}
          unit="kg/m³"
          onChange={
            updateField(
              'liquidDensity',
            )
          }
        />

        <NumericInput
          label="Minimum Residence Time"
          symbol="tmin"
          value={
            form.minimumResidenceTime
          }
          unit="s"
          onChange={
            updateField(
              'minimumResidenceTime',
            )
          }
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate liquid holdup"
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
            headlineLabel="Liquid holdup volume"
            headlineValue={`${
              formatEngineeringNumber(
                result.liquidHoldupVolume,
              )
            } m³`}
            modelName={result.modelName}
            note={
              result
                .limitationDescription
            }
          >
            <ResultItem
              label="Operating Status"
              value={
                statusLabel(
                  result
                    .selectedScenario
                    .status,
                )
              }
              unit=""
            />

            <ResultItem
              label="Liquid Residence Time"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .residenceTime,
                )
              }
              unit="s"
            />

            <ResultItem
              label="Residence-Time Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .residenceMarginPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Column Area"
              value={
                formatEngineeringNumber(
                  result.columnArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Packed-Bed Volume"
              value={
                formatEngineeringNumber(
                  result.packedBedVolume,
                )
              }
              unit="m³"
            />

            <ResultItem
              label="Packed-Bed Void Volume"
              value={
                formatEngineeringNumber(
                  result
                    .packedBedVoidVolume,
                )
              }
              unit="m³"
            />

            <ResultItem
              label="Liquid Inventory Mass"
              value={
                formatEngineeringNumber(
                  result
                    .liquidInventoryMass,
                )
              }
              unit="kg"
            />

            <ResultItem
              label="Void Saturation"
              value={
                formatEngineeringNumber(
                  result
                    .voidSaturationFraction *
                  100,
                )
              }
              unit="% of void volume"
            />

            <ResultItem
              label="Superficial Liquid Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .superficialLiquidVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Interstitial Liquid Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .interstitialLiquidVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Liquid Mass Flux"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .liquidMassFlux,
                )
              }
              unit="kg/m²·s"
            />

            <ResultItem
              label="Inventory Turnover Rate"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .turnoverRatePerHour,
                )
              }
              unit="1/h"
            />

            <ResultItem
              label="Minimum Holdup Volume"
              value={
                formatEngineeringNumber(
                  result.minimumHoldupVolume,
                )
              }
              unit="m³"
            />

            <ResultItem
              label="Minimum Holdup Fraction"
              value={
                formatEngineeringNumber(
                  result
                    .minimumHoldupFraction *
                  100,
                )
              }
              unit="% bed volume"
            />

            <ResultItem
              label="Maximum Flow by Residence"
              value={
                formatEngineeringNumber(
                  result
                    .maximumLiquidFlowByResidence,
                )
              }
              unit="m³/s"
            />

            <ResultItem
              label="Residence Capacity Usage"
              value={
                formatEngineeringNumber(
                  result
                    .currentResidenceCapacityFraction *
                  100,
                )
              }
              unit="%"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Liquid-load operating window
                </p>

                <strong>
                  Residence-time and turnover
                  sensitivity
                </strong>
              </div>

              <span>
                Increasing liquid flow reduces
                residence time for a fixed
                packed-bed liquid inventory
              </span>
            </div>

            <ol className="native-stage-list">
              {result.scenarios.map(
                (
                  scenario,
                ) => (
                  <li
                    key={
                      scenario
                        .liquidFlowMultiplier
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario
                            .liquidFlowMultiplier *
                          100,
                        )
                      }% liquid load
                    </strong>
                    {' — '}
                    tres = {
                      formatEngineeringNumber(
                        scenario.residenceTime,
                      )
                    } s, turnover = {
                      formatEngineeringNumber(
                        scenario
                          .turnoverRatePerHour,
                      )
                    } 1/h, margin = {
                      formatEngineeringNumber(
                        scenario
                          .residenceMarginPercent,
                      )
                    }%, {
                      statusLabel(
                        scenario.status,
                      )
                    }
                  </li>
                ),
              )}
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
