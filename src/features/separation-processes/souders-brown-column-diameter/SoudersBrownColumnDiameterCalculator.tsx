import {
  useState,
} from 'react'

import {
  SoudersBrownCalculationError,
  calculateSoudersBrownColumnDiameter,
  createSoudersBrownColumnCsv,
} from './engine'
import type {
  SoudersBrownColumnInput,
  SoudersBrownColumnResult,
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
  vaporVolumetricFlowRate:
    '2',
  vaporDensity:
    '2',
  liquidDensity:
    '800',
  capacityFactor:
    '0.11',
  designFloodPercent:
    '80',
  downcomerAreaPercent:
    '15',
  diameterIncrement:
    '0.05',
}

export function SoudersBrownColumnDiameterCalculator() {
  const [
    vaporVolumetricFlowRate,
    setVaporVolumetricFlowRate,
  ] = useState(
    example.vaporVolumetricFlowRate,
  )

  const [
    vaporDensity,
    setVaporDensity,
  ] = useState(
    example.vaporDensity,
  )

  const [
    liquidDensity,
    setLiquidDensity,
  ] = useState(
    example.liquidDensity,
  )

  const [
    capacityFactor,
    setCapacityFactor,
  ] = useState(
    example.capacityFactor,
  )

  const [
    designFloodPercent,
    setDesignFloodPercent,
  ] = useState(
    example.designFloodPercent,
  )

  const [
    downcomerAreaPercent,
    setDowncomerAreaPercent,
  ] = useState(
    example.downcomerAreaPercent,
  )

  const [
    diameterIncrement,
    setDiameterIncrement,
  ] = useState(
    example.diameterIncrement,
  )

  const [
    result,
    setResult,
  ] = useState<
    SoudersBrownColumnResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    SoudersBrownColumnInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function currentInput():
    SoudersBrownColumnInput {
    return {
      vaporVolumetricFlowRate:
        Number(
          vaporVolumetricFlowRate,
        ),
      vaporDensity:
        Number(
          vaporDensity,
        ),
      liquidDensity:
        Number(
          liquidDensity,
        ),
      capacityFactor:
        Number(
          capacityFactor,
        ),
      designFloodFraction:
        Number(
          designFloodPercent,
        ) /
        100,
      downcomerAreaFraction:
        Number(
          downcomerAreaPercent,
        ) /
        100,
      diameterIncrement:
        Number(
          diameterIncrement,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateSoudersBrownColumnDiameter(
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
          SoudersBrownCalculationError
          ? error.message
          : 'The column-diameter calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setVaporVolumetricFlowRate(
      example.vaporVolumetricFlowRate,
    )

    setVaporDensity(
      example.vaporDensity,
    )

    setLiquidDensity(
      example.liquidDensity,
    )

    setCapacityFactor(
      example.capacityFactor,
    )

    setDesignFloodPercent(
      example.designFloodPercent,
    )

    setDowncomerAreaPercent(
      example.downcomerAreaPercent,
    )

    setDiameterIncrement(
      example.diameterIncrement,
    )

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setVaporVolumetricFlowRate('')
    setVaporDensity('')
    setLiquidDensity('')
    setCapacityFactor('')
    setDesignFloodPercent('')
    setDowncomerAreaPercent('')
    setDiameterIncrement('')
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
      createSoudersBrownColumnCsv(
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
      'souders-brown-column-diameter.csv'

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
        code="SP–42"
        icon="↕"
        title="Souders–Brown Distillation Column Diameter"
        subtitle="Flooding velocity, vapor-capacity area and rounded tower diameter"
      />

      <ReferenceBasis>
        Souders–Brown vapor-capacity relationship with a
        user-selected service capacity factor, operating
        fraction of flooding and downcomer-area allowance
      </ReferenceBasis>

      <div className="native-formula">
        uflood = K √[(ρL − ρV)/ρV] ·
        udesign = fflood uflood ·
        D = √(4Agross/π)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Vapor Volumetric Flow Rate"
          symbol="Qv"
          value={
            vaporVolumetricFlowRate
          }
          unit="m³/s"
          onChange={
            setVaporVolumetricFlowRate
          }
        />

        <NumericInput
          label="Vapor Density"
          symbol="ρV"
          value={
            vaporDensity
          }
          unit="kg/m³"
          onChange={
            setVaporDensity
          }
        />

        <NumericInput
          label="Liquid Density"
          symbol="ρL"
          value={
            liquidDensity
          }
          unit="kg/m³"
          onChange={
            setLiquidDensity
          }
        />

        <NumericInput
          label="Capacity Factor"
          symbol="K"
          value={
            capacityFactor
          }
          unit="m/s"
          onChange={
            setCapacityFactor
          }
        />

        <NumericInput
          label="Design Flood Fraction"
          symbol="fflood"
          value={
            designFloodPercent
          }
          unit="%"
          onChange={
            setDesignFloodPercent
          }
        />

        <NumericInput
          label="Downcomer Area Fraction"
          symbol="Adc/Agross"
          value={
            downcomerAreaPercent
          }
          unit="%"
          onChange={
            setDowncomerAreaPercent
          }
        />

        <NumericInput
          label="Diameter Rounding Increment"
          symbol="ΔD"
          value={
            diameterIncrement
          }
          unit="m"
          onChange={
            setDiameterIncrement
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
        calculateLabel="Size column diameter"
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
            headlineLabel="Recommended rounded column diameter"
            headlineValue={`${
              formatEngineeringNumber(
                result
                  .selectedScenario
                  .roundedColumnDiameter,
              )
            } m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
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
              label="Selected Design Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .designVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Required Net Vapor Area"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .requiredNetArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Required Gross Area"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .requiredGrossArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Unrounded Diameter"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .rawColumnDiameter,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Actual Vapor Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .actualVaporVelocity,
                )
              }
              unit="m/s"
            />

            <ResultItem
              label="Actual Flooding Level"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .actualFloodFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Capacity Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .capacityMarginPercent,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Vapor F-Factor"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .vaporFfactor,
                )
              }
              unit="velocity-density basis"
            />

            <ResultItem
              label="Vapor Mass Flow Rate"
              value={
                formatEngineeringNumber(
                  result.vaporMassFlowRate,
                )
              }
              unit="kg/s"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Flooding-fraction sensitivity
                </p>

                <strong>
                  Compare capacity and diameter trade-offs
                </strong>
              </div>

              <span>
                Higher allowable flooding fractions reduce
                calculated area but reduce hydraulic margin
              </span>
            </div>

            <ol className="native-stage-list">
              {result.scenarios.map(
                (
                  scenario,
                ) => (
                  <li
                    key={
                      scenario.designFloodFraction
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario.designFloodFraction *
                          100,
                        )
                      }% design flood
                    </strong>
                    {' — '}
                    D raw = {
                      formatEngineeringNumber(
                        scenario.rawColumnDiameter,
                      )
                    } m, D selected = {
                      formatEngineeringNumber(
                        scenario.roundedColumnDiameter,
                      )
                    } m, actual flood = {
                      formatEngineeringNumber(
                        scenario.actualFloodFraction *
                        100,
                      )
                    }%
                  </li>
                ),
              )}
            </ol>
          </div>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
