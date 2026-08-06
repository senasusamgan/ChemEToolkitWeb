import {
  useState,
} from 'react'

import {
  PackedColumnPressureDropError,
  calculatePackedColumnPressureDrop,
  createPackedColumnPressureDropCsv,
} from './engine'
import type {
  PackedColumnHydraulicStatus,
  PackedColumnPressureDropInput,
  PackedColumnPressureDropResult,
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
  gasFlow:
    '1.2',
  columnDiameter:
    '1.2',
  packingHeight:
    '4',
  voidFractionPercent:
    '90',
  packingDiameter:
    '0.025',
  gasDensity:
    '1.5',
  gasViscosity:
    '0.000018',
  liquidDensity:
    '800',
  capacityFactor:
    '0.12',
  designFloodPercent:
    '70',
}

type FormField =
  keyof typeof exampleForm

function statusLabel(
  status: PackedColumnHydraulicStatus,
): string {
  const labels: Record<
    PackedColumnHydraulicStatus,
    string
  > = {
    lowLoad:
      'Low gas loading',
    stable:
      'Inside design window',
    highLoad:
      'Above design flooding fraction',
    flooded:
      'Flooding predicted',
  }

  return labels[status]
}

export function PackedColumnPressureDropCalculator() {
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
    PackedColumnPressureDropResult |
    null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnPressureDropInput |
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
    PackedColumnPressureDropInput {
    return {
      gasVolumetricFlowRate:
        Number(
          form.gasFlow,
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
          form.voidFractionPercent,
        ) /
        100,
      packingEquivalentDiameter:
        Number(
          form.packingDiameter,
        ),
      gasDensity:
        Number(
          form.gasDensity,
        ),
      gasViscosity:
        Number(
          form.gasViscosity,
        ),
      liquidDensity:
        Number(
          form.liquidDensity,
        ),
      packingCapacityFactor:
        Number(
          form.capacityFactor,
        ),
      designFloodFraction:
        Number(
          form.designFloodPercent,
        ) /
        100,
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnPressureDrop(
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
          PackedColumnPressureDropError
          ? error.message
          : 'The packed-column hydraulic calculation could not be completed.',
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
      gasFlow:
        '',
      columnDiameter:
        '',
      packingHeight:
        '',
      voidFractionPercent:
        '',
      packingDiameter:
        '',
      gasDensity:
        '',
      gasViscosity:
        '',
      liquidDensity:
        '',
      capacityFactor:
        '',
      designFloodPercent:
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
      createPackedColumnPressureDropCsv(
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
      'packed-column-pressure-drop-flooding.csv'

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
        code="SP–46"
        icon="▥"
        title="Packed Column Pressure Drop & Flooding Check"
        subtitle="Ergun dry-pressure-drop estimate, flooding velocity and hydraulic capacity"
      />

      <ReferenceBasis>
        Ergun packed-bed pressure-drop
        equation with a user-supplied
        packing capacity factor for
        flooding screening
      </ReferenceBasis>

      <div className="native-formula">
        ΔP/L = 150μu(1−ε)²/(ε³dp²)
        + 1.75ρu²(1−ε)/(ε³dp)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Gas Volumetric Flow"
          symbol="QG"
          value={form.gasFlow}
          unit="m³/s"
          onChange={
            updateField(
              'gasFlow',
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
          label="Bed Void Fraction"
          symbol="ε"
          value={
            form.voidFractionPercent
          }
          unit="%"
          onChange={
            updateField(
              'voidFractionPercent',
            )
          }
        />

        <NumericInput
          label="Packing Equivalent Diameter"
          symbol="dp"
          value={form.packingDiameter}
          unit="m"
          onChange={
            updateField(
              'packingDiameter',
            )
          }
        />

        <NumericInput
          label="Gas Density"
          symbol="ρG"
          value={form.gasDensity}
          unit="kg/m³"
          onChange={
            updateField(
              'gasDensity',
            )
          }
        />

        <NumericInput
          label="Gas Dynamic Viscosity"
          symbol="μG"
          value={form.gasViscosity}
          unit="Pa·s"
          onChange={
            updateField(
              'gasViscosity',
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
          label="Packing Capacity Factor"
          symbol="K"
          value={form.capacityFactor}
          unit="m/s"
          onChange={
            updateField(
              'capacityFactor',
            )
          }
        />

        <NumericInput
          label="Design Flooding Fraction"
          symbol="fdesign"
          value={
            form.designFloodPercent
          }
          unit="%"
          onChange={
            updateField(
              'designFloodPercent',
            )
          }
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Check packed-column hydraulics"
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
            headlineLabel="Total dry packing pressure drop"
            headlineValue={`${
              formatEngineeringNumber(
                result
                  .selectedScenario
                  .totalDryPressureDrop /
                1000,
              )
            } kPa`}
            modelName={result.modelName}
            note={
              result
                .limitationDescription
            }
          >
            <ResultItem
              label="Hydraulic Status"
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
              label="Superficial Gas Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .superficialGasVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Packing Reynolds Number"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .packingReynoldsNumber,
                )
              }
              unit="—"
            />

            <ResultItem
              label="Viscous Pressure Gradient"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .viscousPressureGradient,
                )
              }
              unit="Pa/m"
            />

            <ResultItem
              label="Inertial Pressure Gradient"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .inertialPressureGradient,
                )
              }
              unit="Pa/m"
            />

            <ResultItem
              label="Dry Pressure Drop per Length"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .dryPressureDropPerLength,
                )
              }
              unit="Pa/m"
            />

            <ResultItem
              label="Flooding Velocity"
              value={
                formatEngineeringNumber(
                  result.floodingVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Current Flooding Fraction"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .floodFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Design Gas Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .designSuperficialGasVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Maximum Gas Flow at Design"
              value={
                formatEngineeringNumber(
                  result
                    .maximumGasFlowAtDesign,
                )
              }
              unit="m³/s"
            />

            <ResultItem
              label="Design Capacity Usage"
              value={
                formatEngineeringNumber(
                  result
                    .currentDesignCapacityFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Design Capacity Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .designCapacityMarginPercent,
                )
              }
              unit="%"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Gas-load operating window
                </p>

                <strong>
                  Pressure drop and flooding
                  sensitivity
                </strong>
              </div>

              <span>
                Inertial pressure losses rise
                approximately with the square
                of superficial gas velocity
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
                        .gasFlowMultiplier
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario
                            .gasFlowMultiplier *
                          100,
                        )
                      }% gas load
                    </strong>
                    {' — '}
                    ΔP = {
                      formatEngineeringNumber(
                        scenario
                          .totalDryPressureDrop /
                        1000,
                      )
                    } kPa, flood = {
                      formatEngineeringNumber(
                        scenario
                          .floodFraction *
                        100,
                      )
                    }%, margin = {
                      formatEngineeringNumber(
                        scenario
                          .designCapacityMarginPercent,
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
