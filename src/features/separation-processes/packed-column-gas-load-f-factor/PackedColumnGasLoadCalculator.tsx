import {
  useState,
} from 'react'

import {
  PackedColumnGasLoadError,
  calculatePackedColumnGasLoad,
  createPackedColumnGasLoadCsv,
} from './engine'

import type {
  PackedColumnGasLoadInput,
  PackedColumnGasLoadResult,
  PackedColumnGasLoadStatus,
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
  gasFlow: '2.5',
  columnDiameter: '1.8',
  gasDensity: '3.2',
  minimumFFactor: '1.0',
  maximumFFactor: '2.2',
}

type FormField =
  keyof typeof exampleForm

function statusLabel(
  status: PackedColumnGasLoadStatus,
): string {
  const labels: Record<
    PackedColumnGasLoadStatus,
    string
  > = {
    underloaded:
      'Below minimum gas-load criterion',
    stable:
      'Inside gas-load operating window',
    marginal:
      'Approaching maximum design F-factor',
    overloaded:
      'Above maximum design F-factor',
  }

  return labels[status]
}

export function PackedColumnGasLoadCalculator() {
  const [
    form,
    setForm,
  ] = useState(exampleForm)

  const [
    result,
    setResult,
  ] = useState<
    PackedColumnGasLoadResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnGasLoadInput | null
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
    PackedColumnGasLoadInput {
    return {
      gasVolumetricFlowRate:
        Number(form.gasFlow),

      columnDiameter:
        Number(
          form.columnDiameter,
        ),

      gasDensity:
        Number(
          form.gasDensity,
        ),

      minimumOperatingFFactor:
        Number(
          form.minimumFFactor,
        ),

      maximumDesignFFactor:
        Number(
          form.maximumFFactor,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnGasLoad(
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
          PackedColumnGasLoadError
          ? error.message
          : 'The packed-column gas-load calculation could not be completed.',
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
      gasFlow: '',
      columnDiameter: '',
      gasDensity: '',
      minimumFFactor: '',
      maximumFFactor: '',
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
      createPackedColumnGasLoadCsv(
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
      'packed-column-gas-load-f-factor.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–49"
        icon="⌄"
        title="Packed Column Gas Load & F-Factor Operating Window"
        subtitle="Gas superficial velocity, F-factor, mass flux and operating-window screening"
      />

      <ReferenceBasis>
        Packed-column gas-load screening
        based on superficial gas velocity
        and the conventional gas F-factor
        relative to user-defined minimum
        operating and maximum design limits.
      </ReferenceBasis>

      <div className="native-formula">
        Ac = πD²/4 · uG = QG/Ac ·
        F = uG√ρG · qdyn = ρGuG²/2
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
          value={
            form.columnDiameter
          }
          unit="m"
          onChange={
            updateField(
              'columnDiameter',
            )
          }
        />

        <NumericInput
          label="Gas Density"
          symbol="ρG"
          value={
            form.gasDensity
          }
          unit="kg/m³"
          onChange={
            updateField(
              'gasDensity',
            )
          }
        />

        <NumericInput
          label="Minimum Operating F-Factor"
          symbol="Fmin"
          value={
            form.minimumFFactor
          }
          unit="m/s·√(kg/m³)"
          onChange={
            updateField(
              'minimumFFactor',
            )
          }
        />

        <NumericInput
          label="Maximum Design F-Factor"
          symbol="Fmax"
          value={
            form.maximumFFactor
          }
          unit="m/s·√(kg/m³)"
          onChange={
            updateField(
              'maximumFFactor',
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
        calculateLabel="Evaluate gas load"
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
            headlineLabel="Gas F-factor"
            headlineValue={`${formatEngineeringNumber(
              result
                .selectedScenario
                .fFactor,
            )} m/s·√(kg/m³)`}
            modelName={
              result.modelName
            }
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
              label="Gas Mass Flow Rate"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .gasMassFlowRate,
                )
              }
              unit="kg/s"
            />

            <ResultItem
              label="Gas Mass Flux"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .gasMassFlux,
                )
              }
              unit="kg/m²·s"
            />

            <ResultItem
              label="Kinetic Pressure"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .kineticPressure,
                )
              }
              unit="Pa"
            />

            <ResultItem
              label="F/Fmin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .minimumFFactorRatio,
                )
              }
              unit="× minimum"
            />

            <ResultItem
              label="F/Fmax"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .maximumFFactorRatio,
                )
              }
              unit="× maximum"
            />

            <ResultItem
              label="Margin to Maximum F-Factor"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .marginToMaximumPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Minimum Gas Flow by F-Factor"
              value={
                formatEngineeringNumber(
                  result
                    .minimumGasFlowByFFactor,
                )
              }
              unit="m³/s"
            />

            <ResultItem
              label="Maximum Gas Flow by F-Factor"
              value={
                formatEngineeringNumber(
                  result
                    .maximumGasFlowByFFactor,
                )
              }
              unit="m³/s"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Gas-load operating window
                </p>

                <strong>
                  F-factor turndown screening
                </strong>
              </div>

              <span>
                Gas flow changes directly
                with superficial velocity
                and F-factor at fixed
                diameter and gas density.
              </span>
            </div>

            <ol className="native-stage-list">
              {result.scenarios.map(
                scenario => (
                  <li
                    key={
                      scenario.multiplier
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario.multiplier *
                          100,
                        )
                      }% gas load
                    </strong>

                    {' — F = '}

                    {
                      formatEngineeringNumber(
                        scenario.fFactor,
                      )
                    }

                    {', uG = '}

                    {
                      formatEngineeringNumber(
                        scenario
                          .superficialGasVelocity,
                      )
                    }

                    {' m/s, margin = '}

                    {
                      formatEngineeringNumber(
                        scenario
                          .marginToMaximumPercent,
                      )
                    }

                    {'%, '}

                    {
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
