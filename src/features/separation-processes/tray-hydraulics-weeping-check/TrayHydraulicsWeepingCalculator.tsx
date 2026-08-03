import {
  useState,
} from 'react'

import {
  TrayHydraulicsCalculationError,
  calculateTrayHydraulics,
  createTrayHydraulicsCsv,
} from './engine'
import type {
  TrayHydraulicStatus,
  TrayHydraulicsInput,
  TrayHydraulicsResult,
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
  vaporFlow: '1.5',
  liquidFlow: '0.01',
  columnDiameter: '1.5',
  activeAreaPercent: '80',
  holeAreaPercent: '5',
  dischargeCoefficient: '0.65',
  vaporDensity: '2',
  liquidDensity: '800',
  weirLength: '1.2',
  weirHeight: '0.05',
  capacityFactor: '0.11',
}

function statusLabel(
  status: TrayHydraulicStatus,
): string {
  const labels: Record<
    TrayHydraulicStatus,
    string
  > = {
    stable: 'Stable operating window',
    marginal: 'Marginal weeping margin',
    weepingRisk: 'Weeping risk',
    highFlooding: 'High flooding load',
    flooded: 'Flooding predicted',
  }

  return labels[status]
}

export function TrayHydraulicsWeepingCalculator() {
  const [vaporFlow, setVaporFlow] =
    useState(example.vaporFlow)

  const [liquidFlow, setLiquidFlow] =
    useState(example.liquidFlow)

  const [
    columnDiameter,
    setColumnDiameter,
  ] = useState(example.columnDiameter)

  const [
    activeAreaPercent,
    setActiveAreaPercent,
  ] = useState(example.activeAreaPercent)

  const [
    holeAreaPercent,
    setHoleAreaPercent,
  ] = useState(example.holeAreaPercent)

  const [
    dischargeCoefficient,
    setDischargeCoefficient,
  ] = useState(example.dischargeCoefficient)

  const [
    vaporDensity,
    setVaporDensity,
  ] = useState(example.vaporDensity)

  const [
    liquidDensity,
    setLiquidDensity,
  ] = useState(example.liquidDensity)

  const [weirLength, setWeirLength] =
    useState(example.weirLength)

  const [weirHeight, setWeirHeight] =
    useState(example.weirHeight)

  const [
    capacityFactor,
    setCapacityFactor,
  ] = useState(example.capacityFactor)

  const [result, setResult] =
    useState<TrayHydraulicsResult | null>(
      null,
    )

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<TrayHydraulicsInput | null>(
    null,
  )

  const [errorMessage, setErrorMessage] =
    useState('')

  function currentInput():
    TrayHydraulicsInput {
    return {
      vaporVolumetricFlowRate:
        Number(vaporFlow),
      liquidVolumetricFlowRate:
        Number(liquidFlow),
      columnDiameter:
        Number(columnDiameter),
      activeAreaFraction:
        Number(activeAreaPercent) / 100,
      holeAreaFraction:
        Number(holeAreaPercent) / 100,
      dischargeCoefficient:
        Number(dischargeCoefficient),
      vaporDensity:
        Number(vaporDensity),
      liquidDensity:
        Number(liquidDensity),
      weirLength:
        Number(weirLength),
      weirHeight:
        Number(weirHeight),
      capacityFactor:
        Number(capacityFactor),
    }
  }

  function calculate() {
    try {
      const input = currentInput()
      const nextResult =
        calculateTrayHydraulics(input)

      setResult(nextResult)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          TrayHydraulicsCalculationError
          ? error.message
          : 'The tray-hydraulic calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setVaporFlow(example.vaporFlow)
    setLiquidFlow(example.liquidFlow)
    setColumnDiameter(
      example.columnDiameter,
    )
    setActiveAreaPercent(
      example.activeAreaPercent,
    )
    setHoleAreaPercent(
      example.holeAreaPercent,
    )
    setDischargeCoefficient(
      example.dischargeCoefficient,
    )
    setVaporDensity(
      example.vaporDensity,
    )
    setLiquidDensity(
      example.liquidDensity,
    )
    setWeirLength(example.weirLength)
    setWeirHeight(example.weirHeight)
    setCapacityFactor(
      example.capacityFactor,
    )
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setVaporFlow('')
    setLiquidFlow('')
    setColumnDiameter('')
    setActiveAreaPercent('')
    setHoleAreaPercent('')
    setDischargeCoefficient('')
    setVaporDensity('')
    setLiquidDensity('')
    setWeirLength('')
    setWeirHeight('')
    setCapacityFactor('')
    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function exportCsv() {
    if (!result || !calculatedInput) {
      return
    }

    const blob = new Blob(
      [
        createTrayHydraulicsCsv(
          calculatedInput,
          result,
        ),
      ],
      {
        type: 'text/csv;charset=utf-8',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      'tray-hydraulics-weeping-check.csv'

    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–43"
        icon="⌁"
        title="Tray Hydraulic Pressure Drop & Weeping Check"
        subtitle="Dry-hole loss, liquid-head pressure drop, weeping limit and flooding window"
      />

      <ReferenceBasis>
        Sieve-tray orifice pressure loss,
        Francis rectangular-weir overflow
        relation and Souders–Brown vapor
        capacity screening
      </ReferenceBasis>

      <div className="native-formula">
        ΔPdry = ρV uh²/(2C₀²) ·
        how = [QL/(1.84Lw)]⅔ ·
        ΔPtray = ΔPdry + ρL g(hw + how)
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Vapor Volumetric Flow"
          symbol="QV"
          value={vaporFlow}
          unit="m³/s"
          onChange={setVaporFlow}
        />

        <NumericInput
          label="Liquid Volumetric Flow"
          symbol="QL"
          value={liquidFlow}
          unit="m³/s"
          onChange={setLiquidFlow}
        />

        <NumericInput
          label="Column Diameter"
          symbol="D"
          value={columnDiameter}
          unit="m"
          onChange={setColumnDiameter}
        />

        <NumericInput
          label="Active Tray Area"
          symbol="Aa/Ag"
          value={activeAreaPercent}
          unit="%"
          onChange={setActiveAreaPercent}
        />

        <NumericInput
          label="Hole Area of Active Area"
          symbol="Ah/Aa"
          value={holeAreaPercent}
          unit="%"
          onChange={setHoleAreaPercent}
        />

        <NumericInput
          label="Hole Discharge Coefficient"
          symbol="C₀"
          value={dischargeCoefficient}
          unit="—"
          onChange={
            setDischargeCoefficient
          }
        />

        <NumericInput
          label="Vapor Density"
          symbol="ρV"
          value={vaporDensity}
          unit="kg/m³"
          onChange={setVaporDensity}
        />

        <NumericInput
          label="Liquid Density"
          symbol="ρL"
          value={liquidDensity}
          unit="kg/m³"
          onChange={setLiquidDensity}
        />

        <NumericInput
          label="Outlet Weir Length"
          symbol="Lw"
          value={weirLength}
          unit="m"
          onChange={setWeirLength}
        />

        <NumericInput
          label="Outlet Weir Height"
          symbol="hw"
          value={weirHeight}
          unit="m"
          onChange={setWeirHeight}
        />

        <NumericInput
          label="Capacity Factor"
          symbol="K"
          value={capacityFactor}
          unit="m/s"
          onChange={setCapacityFactor}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Check tray hydraulics"
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
            headlineLabel="Total pressure drop per tray"
            headlineValue={`${
              formatEngineeringNumber(
                result
                  .selectedScenario
                  .totalTrayPressureDrop /
                1000,
              )
            } kPa`}
            modelName={result.modelName}
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Hydraulic Status"
              value={statusLabel(
                result
                  .selectedScenario
                  .status,
              )}
              unit=""
            />

            <ResultItem
              label="Gross Column Area"
              value={formatEngineeringNumber(
                result.grossColumnArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Active Tray Area"
              value={formatEngineeringNumber(
                result.activeTrayArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Total Hole Area"
              value={formatEngineeringNumber(
                result.holeArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Superficial Vapor Velocity"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .superficialVaporVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Hole Velocity"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .holeVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Weir Overflow Height"
              value={formatEngineeringNumber(
                result.weirOverflowHeight,
              )}
              unit="m"
            />

            <ResultItem
              label="Clear Liquid Head"
              value={formatEngineeringNumber(
                result.clearLiquidHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Dry Tray Pressure Drop"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .dryTrayPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Liquid-Head Pressure Drop"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .liquidHeadPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Minimum Hole Velocity"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .minimumHoleVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Weeping Velocity Ratio"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .weepingVelocityRatio,
              )}
              unit="uh/umin"
            />

            <ResultItem
              label="Flooding Velocity"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .floodingVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Flooding Level"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .floodFraction *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Capacity Margin"
              value={formatEngineeringNumber(
                result
                  .selectedScenario
                  .capacityMarginPercent,
              )}
              unit="%"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Vapor-load operating window
                </p>

                <strong>
                  Weeping to flooding sensitivity
                </strong>
              </div>

              <span>
                Low vapor loading can cause
                weeping; high loading reduces
                flooding margin
              </span>
            </div>

            <ol className="native-stage-list">
              {result.scenarios.map(
                (scenario) => (
                  <li
                    key={
                      scenario
                        .vaporFlowMultiplier
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario
                            .vaporFlowMultiplier *
                          100,
                        )
                      }% vapor load
                    </strong>
                    {' — '}
                    ΔP = {
                      formatEngineeringNumber(
                        scenario
                          .totalTrayPressureDrop /
                        1000,
                      )
                    } kPa, weeping ratio = {
                      formatEngineeringNumber(
                        scenario
                          .weepingVelocityRatio,
                      )
                    }, flood = {
                      formatEngineeringNumber(
                        scenario
                          .floodFraction *
                        100,
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
