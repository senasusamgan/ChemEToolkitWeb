import {
  useState,
} from 'react'

import {
  AbsorberMinimumSolventRateError,
  calculateAbsorberMinimumSolventRate,
  createAbsorberMinimumSolventRateCsv,
} from './engine'

import type {
  AbsorberMinimumSolventRateInput,
  AbsorberMinimumSolventRateResult,
  AbsorberSolventRateStatus,
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
  gasMolarFlowRate: '100',
  inletGasSoluteMoleFraction: '0.10',
  outletGasSoluteMoleFraction: '0.02',
  inletLiquidSoluteMoleFraction: '0.005',
  equilibriumSlope: '1.5',
  solventDesignFactor: '1.5',
}

type FormField =
  keyof typeof exampleForm

function statusLabel(
  status: AbsorberSolventRateStatus,
): string {
  return status === 'minimum'
    ? 'Operating exactly at minimum solvent rate'
    : 'Operating above minimum solvent rate'
}

export function AbsorberMinimumSolventRateCalculator() {
  const [
    form,
    setForm,
  ] = useState(exampleForm)

  const [
    result,
    setResult,
  ] = useState<
    AbsorberMinimumSolventRateResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    AbsorberMinimumSolventRateInput | null
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
    AbsorberMinimumSolventRateInput {
    return {
      gasMolarFlowRate:
        Number(
          form.gasMolarFlowRate,
        ),

      inletGasSoluteMoleFraction:
        Number(
          form.inletGasSoluteMoleFraction,
        ),

      outletGasSoluteMoleFraction:
        Number(
          form.outletGasSoluteMoleFraction,
        ),

      inletLiquidSoluteMoleFraction:
        Number(
          form.inletLiquidSoluteMoleFraction,
        ),

      equilibriumSlope:
        Number(
          form.equilibriumSlope,
        ),

      solventDesignFactor:
        Number(
          form.solventDesignFactor,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateAbsorberMinimumSolventRate(
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
          AbsorberMinimumSolventRateError
          ? error.message
          : 'The minimum-solvent-rate calculation could not be completed.',
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
      gasMolarFlowRate: '',
      inletGasSoluteMoleFraction: '',
      outletGasSoluteMoleFraction: '',
      inletLiquidSoluteMoleFraction: '',
      equilibriumSlope: '',
      solventDesignFactor: '',
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
      createAbsorberMinimumSolventRateCsv(
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
      'absorber-minimum-solvent-rate.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–52"
        icon="⋈"
        title="Absorber Minimum Solvent Rate & Operating Line"
        subtitle="Bottom-pinch solvent requirement, design margin and operating-line screening"
      />

      <ReferenceBasis>
        Dilute countercurrent absorption
        with constant molar flow and
        linear equilibrium relation
        y* = mx.
      </ReferenceBasis>

      <div className="native-formula">
        x*bottom = yin/m ·
        Lmin/G =
        (yin − yout)/(x*bottom − xin)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Gas Molar Flow Rate"
          symbol="G"
          value={
            form.gasMolarFlowRate
          }
          unit="kmol/h"
          onChange={
            updateField(
              'gasMolarFlowRate',
            )
          }
        />

        <NumericInput
          label="Inlet Gas Solute Mole Fraction"
          symbol="yin"
          value={
            form.inletGasSoluteMoleFraction
          }
          unit="mol/mol"
          onChange={
            updateField(
              'inletGasSoluteMoleFraction',
            )
          }
        />

        <NumericInput
          label="Outlet Gas Solute Mole Fraction"
          symbol="yout"
          value={
            form.outletGasSoluteMoleFraction
          }
          unit="mol/mol"
          onChange={
            updateField(
              'outletGasSoluteMoleFraction',
            )
          }
        />

        <NumericInput
          label="Inlet Liquid Solute Mole Fraction"
          symbol="xin"
          value={
            form.inletLiquidSoluteMoleFraction
          }
          unit="mol/mol"
          onChange={
            updateField(
              'inletLiquidSoluteMoleFraction',
            )
          }
        />

        <NumericInput
          label="Equilibrium Slope"
          symbol="m"
          value={
            form.equilibriumSlope
          }
          unit="dimensionless"
          onChange={
            updateField(
              'equilibriumSlope',
            )
          }
        />

        <NumericInput
          label="Solvent Design Factor"
          symbol="L/Lmin"
          value={
            form.solventDesignFactor
          }
          unit="× minimum"
          onChange={
            updateField(
              'solventDesignFactor',
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
        calculateLabel="Calculate solvent rate"
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
            headlineLabel="Minimum solvent flow"
            headlineValue={`${formatEngineeringNumber(
              result
                .minimumSolventMolarFlowRate,
            )} kmol/h`}
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
                  result.status,
                )
              }
              unit=""
            />

            <ResultItem
              label="Design Solvent Flow"
              value={
                formatEngineeringNumber(
                  result
                    .designSolventMolarFlowRate,
                )
              }
              unit="kmol/h"
            />

            <ResultItem
              label="Minimum L/G"
              value={
                formatEngineeringNumber(
                  result
                    .minimumLiquidToGasRatio,
                )
              }
              unit="mol/mol"
            />

            <ResultItem
              label="Design L/G"
              value={
                formatEngineeringNumber(
                  result
                    .designLiquidToGasRatio,
                )
              }
              unit="mol/mol"
            />

            <ResultItem
              label="Minimum Absorption Factor"
              value={
                formatEngineeringNumber(
                  result
                    .minimumAbsorptionFactor,
                )
              }
              unit="Amin"
            />

            <ResultItem
              label="Design Absorption Factor"
              value={
                formatEngineeringNumber(
                  result
                    .designAbsorptionFactor,
                )
              }
              unit="A"
            />

            <ResultItem
              label="Bottom Pinch Liquid Composition"
              value={
                formatEngineeringNumber(
                  result
                    .pinchLiquidMoleFraction,
                )
              }
              unit="mol/mol"
            />

            <ResultItem
              label="Outlet Liquid Solute Mole Fraction"
              value={
                formatEngineeringNumber(
                  result
                    .outletLiquidSoluteMoleFraction,
                )
              }
              unit="mol/mol"
            />

            <ResultItem
              label="Bottom Driving Force"
              value={
                formatEngineeringNumber(
                  result
                    .bottomDrivingForce,
                )
              }
              unit="mole fraction"
            />

            <ResultItem
              label="Solvent Margin"
              value={
                formatEngineeringNumber(
                  result
                    .solventMarginPercent,
                )
              }
              unit="% above minimum"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Absorber operating line
                </p>

                <strong>
                  Minimum-rate and design screening
                </strong>
              </div>

              <span>
                Positive bottom driving
                force appears when solvent
                flow is increased above
                the minimum pinch rate.
              </span>
            </div>

            <ol className="native-stage-list">
              <li>
                <strong>
                  Solute removal rate
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result.soluteRemovalRate,
                  )
                } kmol/h
              </li>

              <li>
                <strong>
                  Operating-line slope
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result.operatingLineSlope,
                  )
                }
              </li>

              <li>
                <strong>
                  Operating-line intercept
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result.operatingLineIntercept,
                  )
                }
              </li>

              <li>
                <strong>
                  Bottom equilibrium gas fraction
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result
                      .bottomEquilibriumGasMoleFraction,
                  )
                }
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
