import {
  useState,
} from 'react'

import {
  PackedColumnLiquidDistributorError,
  calculatePackedColumnLiquidDistributor,
  createPackedColumnLiquidDistributorCsv,
} from './engine'

import type {
  PackedColumnDistributorStatus,
  PackedColumnLiquidDistributorInput,
  PackedColumnLiquidDistributorResult,
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
    '0.015',
  columnDiameter:
    '1.5',
  liquidDensity:
    '850',
  distributorPointCount:
    '120',
  minimumIrrigationDensity:
    '20',
  minimumPointDensity:
    '50',
}

type FormField =
  keyof typeof exampleForm

function statusLabel(
  status: PackedColumnDistributorStatus,
): string {
  const labels: Record<
    PackedColumnDistributorStatus,
    string
  > = {
    inadequate:
      'Below distributor screening criterion',
    marginal:
      'Marginal distributor operating margin',
    stable:
      'Screening criteria satisfied',
  }

  return labels[status]
}

export function PackedColumnLiquidDistributorCalculator() {
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
    PackedColumnLiquidDistributorResult |
    null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnLiquidDistributorInput |
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
    PackedColumnLiquidDistributorInput {
    return {
      liquidVolumetricFlowRate:
        Number(
          form.liquidFlow,
        ),
      columnDiameter:
        Number(
          form.columnDiameter,
        ),
      liquidDensity:
        Number(
          form.liquidDensity,
        ),
      distributorPointCount:
        Number(
          form.distributorPointCount,
        ),
      minimumIrrigationDensity:
        Number(
          form.minimumIrrigationDensity,
        ),
      minimumPointDensity:
        Number(
          form.minimumPointDensity,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnLiquidDistributor(
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
          PackedColumnLiquidDistributorError
          ? error.message
          : 'The packed-column liquid-distributor calculation could not be completed.',
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
      liquidDensity:
        '',
      distributorPointCount:
        '',
      minimumIrrigationDensity:
        '',
      minimumPointDensity:
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
      createPackedColumnLiquidDistributorCsv(
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
      'packed-column-liquid-distributor-irrigation.csv'

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
        code="SP–48"
        icon="⌄"
        title="Packed Column Liquid Distributor & Irrigation Density"
        subtitle="Liquid irrigation rate, distributor point density, coverage and turndown screening"
      />

      <ReferenceBasis>
        Packed-column liquid-distributor
        screening based on superficial
        irrigation density and distributor
        point density over the column
        cross-sectional area
      </ReferenceBasis>

      <div className="native-formula">
        Ac = πD²/4 · JL = 3600 QL/Ac
        · np = Np/Ac · peq = √(Ac/Np)
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
          label="Distributor Point Count"
          symbol="Np"
          value={
            form.distributorPointCount
          }
          unit="points"
          onChange={
            updateField(
              'distributorPointCount',
            )
          }
        />

        <NumericInput
          label="Minimum Irrigation Density"
          symbol="JL,min"
          value={
            form.minimumIrrigationDensity
          }
          unit="m³/m²·h"
          onChange={
            updateField(
              'minimumIrrigationDensity',
            )
          }
        />

        <NumericInput
          label="Minimum Point Density"
          symbol="np,min"
          value={
            form.minimumPointDensity
          }
          unit="points/m²"
          onChange={
            updateField(
              'minimumPointDensity',
            )
          }
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Evaluate distributor"
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
            headlineLabel="Liquid irrigation density"
            headlineValue={`${formatEngineeringNumber(
              result
                .selectedScenario
                .irrigationDensity,
            )} m³/m²·h`}
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
              label="Column Area"
              value={
                formatEngineeringNumber(
                  result.columnArea,
                )
              }
              unit="m²"
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
              label="Distributor Point Density"
              value={
                formatEngineeringNumber(
                  result
                    .distributorPointDensity,
                )
              }
              unit="points/m²"
            />

            <ResultItem
              label="Area per Distributor Point"
              value={
                formatEngineeringNumber(
                  result
                    .areaPerDistributorPoint,
                )
              }
              unit="m²/point"
            />

            <ResultItem
              label="Equivalent Square Pitch"
              value={
                formatEngineeringNumber(
                  result
                    .equivalentSquarePitch,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Flow per Distributor Point"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .flowPerDistributorPoint,
                )
              }
              unit="m³/h/point"
            />

            <ResultItem
              label="Irrigation Criterion Ratio"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .irrigationRatio,
                )
              }
              unit="× minimum"
            />

            <ResultItem
              label="Point-Density Criterion Ratio"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .pointDensityRatio,
                )
              }
              unit="× minimum"
            />

            <ResultItem
              label="Irrigation Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .irrigationMarginPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Point-Density Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .pointDensityMarginPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Minimum Liquid Flow by Irrigation"
              value={
                formatEngineeringNumber(
                  result
                    .minimumLiquidFlowByIrrigation,
                )
              }
              unit="m³/s"
            />

            <ResultItem
              label="Minimum Distributor Point Count"
              value={
                String(
                  result
                    .minimumDistributorPointCount,
                )
              }
              unit="points"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Liquid-distributor turndown
                </p>

                <strong>
                  Irrigation-density operating window
                </strong>
              </div>

              <span>
                Point density is fixed by
                distributor geometry while
                irrigation density changes
                directly with liquid flow
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
                    JL = {
                      formatEngineeringNumber(
                        scenario
                          .irrigationDensity,
                      )
                    } m³/m²·h,
                    flow/point = {
                      formatEngineeringNumber(
                        scenario
                          .flowPerDistributorPoint,
                      )
                    } m³/h,
                    irrigation margin = {
                      formatEngineeringNumber(
                        scenario
                          .irrigationMarginPercent,
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
