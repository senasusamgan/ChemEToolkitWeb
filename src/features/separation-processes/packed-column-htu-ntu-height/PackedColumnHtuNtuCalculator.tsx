import {
  useState,
} from 'react'

import {
  PackedColumnCalculationError,
  calculatePackedColumnHtuNtu,
  createPackedColumnHtuNtuCsv,
} from './engine'
import type {
  PackedColumnInput,
  PackedColumnResult,
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

const example = {
  inletGasPercent:
    '8',
  outletGasPercent:
    '1',
  equilibriumGasPercent:
    '0.2',
  overallGasHtu:
    '0.75',
  designMarginPercent:
    '15',
}

export function PackedColumnHtuNtuCalculator() {
  const [
    inletGasPercent,
    setInletGasPercent,
  ] = useState(
    example.inletGasPercent,
  )

  const [
    outletGasPercent,
    setOutletGasPercent,
  ] = useState(
    example.outletGasPercent,
  )

  const [
    equilibriumGasPercent,
    setEquilibriumGasPercent,
  ] = useState(
    example.equilibriumGasPercent,
  )

  const [
    overallGasHtu,
    setOverallGasHtu,
  ] = useState(
    example.overallGasHtu,
  )

  const [
    designMarginPercent,
    setDesignMarginPercent,
  ] = useState(
    example.designMarginPercent,
  )

  const [
    result,
    setResult,
  ] = useState<
    PackedColumnResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    PackedColumnInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function currentInput():
    PackedColumnInput {
    return {
      inletGasSoluteFraction:
        Number(
          inletGasPercent,
        ) /
        100,
      outletGasSoluteFraction:
        Number(
          outletGasPercent,
        ) /
        100,
      equilibriumGasFraction:
        Number(
          equilibriumGasPercent,
        ) /
        100,
      overallGasHtu:
        Number(
          overallGasHtu,
        ),
      designMarginFraction:
        Number(
          designMarginPercent,
        ) /
        100,
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculatePackedColumnHtuNtu(
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
          PackedColumnCalculationError
          ? error.message
          : 'The packed-column height calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInletGasPercent(
      example.inletGasPercent,
    )

    setOutletGasPercent(
      example.outletGasPercent,
    )

    setEquilibriumGasPercent(
      example.equilibriumGasPercent,
    )

    setOverallGasHtu(
      example.overallGasHtu,
    )

    setDesignMarginPercent(
      example.designMarginPercent,
    )

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInletGasPercent('')
    setOutletGasPercent('')
    setEquilibriumGasPercent('')
    setOverallGasHtu('')
    setDesignMarginPercent('')
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

    const blob =
      new Blob(
        [
          createPackedColumnHtuNtuCsv(
            calculatedInput,
            result,
          ),
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
      'packed-column-htu-ntu-height.csv'

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
        code="SP–45"
        icon="⋮"
        title="Packed Column HTU–NTU Height"
        subtitle="Overall gas-phase transfer units, packing height and outlet-target sensitivity"
      />

      <ReferenceBasis>
        Constant overall gas-phase HTU with
        a constant equilibrium gas composition
        across the packed section
      </ReferenceBasis>

      <div className="native-formula">
        NOG = ln[(yin − y*)/(yout − y*)]
        · Z = HOG NOG
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Inlet Gas Solute Fraction"
          symbol="yin"
          value={inletGasPercent}
          unit="%"
          onChange={setInletGasPercent}
        />

        <NumericInput
          label="Target Outlet Gas Fraction"
          symbol="yout"
          value={outletGasPercent}
          unit="%"
          onChange={setOutletGasPercent}
        />

        <NumericInput
          label="Equilibrium Gas Fraction"
          symbol="y*"
          value={equilibriumGasPercent}
          unit="%"
          onChange={
            setEquilibriumGasPercent
          }
        />

        <NumericInput
          label="Overall Gas-Phase HTU"
          symbol="HOG"
          value={overallGasHtu}
          unit="m"
          onChange={setOverallGasHtu}
        />

        <NumericInput
          label="Packing Design Margin"
          symbol="M"
          value={designMarginPercent}
          unit="%"
          onChange={
            setDesignMarginPercent
          }
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate packing height"
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
            headlineLabel="Design packing height"
            headlineValue={`${
              formatEngineeringNumber(
                result
                  .selectedScenario
                  .designPackingHeight,
              )
            } m`}
            modelName={result.modelName}
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Overall Gas-Phase NTU"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .overallGasNtu,
                )
              }
              unit="NOG"
            />

            <ResultItem
              label="Theoretical Packing Height"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .theoreticalPackingHeight,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Solute Removal"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .removalPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Inlet Driving Force"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .inletDrivingForce,
                )
              }
              unit="mole fraction"
            />

            <ResultItem
              label="Outlet Driving Force"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .outletDrivingForce,
                )
              }
              unit="mole fraction"
            />

            <ResultItem
              label="Log-Mean Driving Force"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .logarithmicMeanDrivingForce,
                )
              }
              unit="mole fraction"
            />

            <ResultItem
              label="Equilibrium Approach"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .equilibriumApproachPercent,
                )
              }
              unit="% of inlet driving force"
            />

            <ResultItem
              label="Equilibrium Outlet Limit"
              value={
                formatEngineeringNumber(
                  result.equilibriumLimit *
                  100,
                )
              }
              unit="% gas solute"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Outlet-target sensitivity
                </p>

                <strong>
                  Packing height versus removal target
                </strong>
              </div>

              <span>
                Approaching the equilibrium limit
                increases the required number of
                transfer units
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
                        .outletGasSoluteFraction
                    }
                  >
                    <strong>
                      yout = {
                        formatEngineeringNumber(
                          scenario
                            .outletGasSoluteFraction *
                          100,
                        )
                      }%
                    </strong>
                    {' — '}
                    removal = {
                      formatEngineeringNumber(
                        scenario.removalPercent,
                      )
                    }%, NOG = {
                      formatEngineeringNumber(
                        scenario.overallGasNtu,
                      )
                    }, Zdesign = {
                      formatEngineeringNumber(
                        scenario.designPackingHeight,
                      )
                    } m
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
