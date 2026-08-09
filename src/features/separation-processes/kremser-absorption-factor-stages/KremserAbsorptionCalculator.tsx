import {
  useState,
} from 'react'

import {
  KremserAbsorptionError,
  calculateKremserAbsorption,
  createKremserAbsorptionCsv,
} from './engine'

import type {
  KremserAbsorptionInput,
  KremserAbsorptionRegime,
  KremserAbsorptionResult,
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
  inletGasSoluteMoleFraction: '0.12',
  targetOutletGasSoluteMoleFraction: '0.015',
  absorptionFactor: '1.8',
}

type FormField =
  keyof typeof exampleForm

function regimeLabel(
  regime: KremserAbsorptionRegime,
): string {
  const labels: Record<
    KremserAbsorptionRegime,
    string
  > = {
    favorable:
      'Favorable absorption factor above unity',
    unity:
      'Unity absorption-factor limit',
    limited:
      'Absorption factor below unity',
  }

  return labels[regime]
}

export function KremserAbsorptionCalculator() {
  const [
    form,
    setForm,
  ] = useState(exampleForm)

  const [
    result,
    setResult,
  ] = useState<
    KremserAbsorptionResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    KremserAbsorptionInput | null
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
    KremserAbsorptionInput {
    return {
      inletGasSoluteMoleFraction:
        Number(
          form.inletGasSoluteMoleFraction,
        ),

      targetOutletGasSoluteMoleFraction:
        Number(
          form.targetOutletGasSoluteMoleFraction,
        ),

      absorptionFactor:
        Number(
          form.absorptionFactor,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateKremserAbsorption(
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
          KremserAbsorptionError
          ? error.message
          : 'The Kremser absorption calculation could not be completed.',
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
      inletGasSoluteMoleFraction: '',
      targetOutletGasSoluteMoleFraction: '',
      absorptionFactor: '',
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
      createKremserAbsorptionCsv(
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
      'kremser-absorption-factor-stages.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–51"
        icon="⋈"
        title="Kremser Absorption Factor & Ideal Stages"
        subtitle="Ideal equilibrium-stage requirement from the classical Kremser absorption relation"
      />

      <ReferenceBasis>
        Dilute countercurrent absorption
        with constant molar gas and
        liquid flow, linear equilibrium
        behavior and solute-free entering
        solvent.
      </ReferenceBasis>

      <div className="native-formula">
        A = L/(mV) ·
        yN+1/y1 =
        (A^(N+1) − 1)/(A − 1)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Inlet Gas Solute Mole Fraction"
          symbol="y in"
          value={
            form
              .inletGasSoluteMoleFraction
          }
          unit="mol/mol"
          onChange={
            updateField(
              'inletGasSoluteMoleFraction',
            )
          }
        />

        <NumericInput
          label="Target Outlet Gas Solute Mole Fraction"
          symbol="y out"
          value={
            form
              .targetOutletGasSoluteMoleFraction
          }
          unit="mol/mol"
          onChange={
            updateField(
              'targetOutletGasSoluteMoleFraction',
            )
          }
        />

        <NumericInput
          label="Absorption Factor"
          symbol="A"
          value={
            form.absorptionFactor
          }
          unit="dimensionless"
          onChange={
            updateField(
              'absorptionFactor',
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
        calculateLabel="Calculate ideal stages"
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
            headlineLabel="Required ideal stages"
            headlineValue={
              String(
                result
                  .requiredIdealStages,
              )
            }
            modelName={
              result.modelName
            }
            note={
              result
                .limitationDescription
            }
          >
            <ResultItem
              label="Operating Regime"
              value={
                regimeLabel(
                  result
                    .operatingRegime,
                )
              }
              unit=""
            />

            <ResultItem
              label="Absorption Factor"
              value={
                formatEngineeringNumber(
                  result
                    .absorptionFactor,
                )
              }
              unit="A"
            />

            <ResultItem
              label="Inlet / Target Ratio"
              value={
                formatEngineeringNumber(
                  result
                    .inletToTargetRatio,
                )
              }
              unit="ratio"
            />

            <ResultItem
              label="Target Removal"
              value={
                formatEngineeringNumber(
                  result
                    .targetRemovalPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Exact Ideal Stage Requirement"
              value={
                formatEngineeringNumber(
                  result
                    .exactIdealStageRequirement,
                )
              }
              unit="stages"
            />

            <ResultItem
              label="Stage Rounding Margin"
              value={
                formatEngineeringNumber(
                  result
                    .stageRoundingMargin,
                )
              }
              unit="stage"
            />

            <ResultItem
              label="Predicted Outlet Mole Fraction"
              value={
                formatEngineeringNumber(
                  result
                    .predictedOutletMoleFraction,
                )
              }
              unit="mol/mol"
            />

            <ResultItem
              label="Predicted Removal"
              value={
                formatEngineeringNumber(
                  result
                    .predictedRemovalPercent,
                )
              }
              unit="%"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Kremser stage screening
                </p>

                <strong>
                  Integer-stage performance
                </strong>
              </div>

              <span>
                The continuous stage
                requirement is rounded
                upward to the next whole
                ideal equilibrium stage.
              </span>
            </div>

            <ol className="native-stage-list">
              <li>
                <strong>
                  Target outlet
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    calculatedInput
                      ?.targetOutletGasSoluteMoleFraction ??
                    0,
                  )
                }
              </li>

              <li>
                <strong>
                  Continuous requirement
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result
                      .exactIdealStageRequirement,
                  )
                } stages
              </li>

              <li>
                <strong>
                  Selected integer design
                </strong>

                {' — '}

                {
                  result
                    .requiredIdealStages
                } ideal stages
              </li>

              <li>
                <strong>
                  Predicted outlet
                </strong>

                {' — '}

                {
                  formatEngineeringNumber(
                    result
                      .predictedOutletMoleFraction,
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
