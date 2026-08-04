import {
  useState,
} from 'react'

import {
  TrayDowncomerCalculationError,
  calculateTrayDowncomerBackup,
  createTrayDowncomerCsv,
} from './engine'
import type {
  TrayDowncomerInput,
  TrayDowncomerResult,
  TrayDowncomerStatus,
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
  liquidFlow:
    '0.02',
  columnDiameter:
    '1.5',
  downcomerAreaPercent:
    '15',
  traySpacing:
    '0.6',
  weirLength:
    '1.2',
  weirHeight:
    '0.05',
  trayPressureDrop:
    '1000',
  liquidDensity:
    '800',
  lossCoefficient:
    '1.5',
  allowableBackupPercent:
    '50',
  minimumResidenceTime:
    '3',
}

function statusLabel(
  status: TrayDowncomerStatus,
): string {
  const labels: Record<
    TrayDowncomerStatus,
    string
  > = {
    acceptable:
      'Acceptable hydraulic window',
    marginal:
      'Marginal hydraulic margin',
    shortResidence:
      'Residence time too short',
    highBackup:
      'Downcomer backup too high',
    flooded:
      'Downcomer flooding predicted',
  }

  return labels[status]
}

export function TrayDowncomerBackupCalculator() {
  const [
    liquidFlow,
    setLiquidFlow,
  ] = useState(
    example.liquidFlow,
  )

  const [
    columnDiameter,
    setColumnDiameter,
  ] = useState(
    example.columnDiameter,
  )

  const [
    downcomerAreaPercent,
    setDowncomerAreaPercent,
  ] = useState(
    example.downcomerAreaPercent,
  )

  const [
    traySpacing,
    setTraySpacing,
  ] = useState(
    example.traySpacing,
  )

  const [
    weirLength,
    setWeirLength,
  ] = useState(
    example.weirLength,
  )

  const [
    weirHeight,
    setWeirHeight,
  ] = useState(
    example.weirHeight,
  )

  const [
    trayPressureDrop,
    setTrayPressureDrop,
  ] = useState(
    example.trayPressureDrop,
  )

  const [
    liquidDensity,
    setLiquidDensity,
  ] = useState(
    example.liquidDensity,
  )

  const [
    lossCoefficient,
    setLossCoefficient,
  ] = useState(
    example.lossCoefficient,
  )

  const [
    allowableBackupPercent,
    setAllowableBackupPercent,
  ] = useState(
    example.allowableBackupPercent,
  )

  const [
    minimumResidenceTime,
    setMinimumResidenceTime,
  ] = useState(
    example.minimumResidenceTime,
  )

  const [
    result,
    setResult,
  ] = useState<
    TrayDowncomerResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    TrayDowncomerInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function currentInput():
    TrayDowncomerInput {
    return {
      liquidVolumetricFlowRate:
        Number(
          liquidFlow,
        ),
      columnDiameter:
        Number(
          columnDiameter,
        ),
      downcomerAreaFraction:
        Number(
          downcomerAreaPercent,
        ) /
        100,
      traySpacing:
        Number(
          traySpacing,
        ),
      weirLength:
        Number(
          weirLength,
        ),
      weirHeight:
        Number(
          weirHeight,
        ),
      trayPressureDrop:
        Number(
          trayPressureDrop,
        ),
      liquidDensity:
        Number(
          liquidDensity,
        ),
      downcomerLossCoefficient:
        Number(
          lossCoefficient,
        ),
      allowableBackupFraction:
        Number(
          allowableBackupPercent,
        ) /
        100,
      minimumResidenceTime:
        Number(
          minimumResidenceTime,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateTrayDowncomerBackup(
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
          TrayDowncomerCalculationError
          ? error.message
          : 'The tray-downcomer calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLiquidFlow(
      example.liquidFlow,
    )

    setColumnDiameter(
      example.columnDiameter,
    )

    setDowncomerAreaPercent(
      example.downcomerAreaPercent,
    )

    setTraySpacing(
      example.traySpacing,
    )

    setWeirLength(
      example.weirLength,
    )

    setWeirHeight(
      example.weirHeight,
    )

    setTrayPressureDrop(
      example.trayPressureDrop,
    )

    setLiquidDensity(
      example.liquidDensity,
    )

    setLossCoefficient(
      example.lossCoefficient,
    )

    setAllowableBackupPercent(
      example.allowableBackupPercent,
    )

    setMinimumResidenceTime(
      example.minimumResidenceTime,
    )

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLiquidFlow('')
    setColumnDiameter('')
    setDowncomerAreaPercent('')
    setTraySpacing('')
    setWeirLength('')
    setWeirHeight('')
    setTrayPressureDrop('')
    setLiquidDensity('')
    setLossCoefficient('')
    setAllowableBackupPercent('')
    setMinimumResidenceTime('')
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
          createTrayDowncomerCsv(
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
      'tray-downcomer-backup-residence.csv'

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
        code="SP–44"
        icon="⇣"
        title="Tray Downcomer Backup & Residence Time"
        subtitle="Liquid velocity, downcomer backup, residence time and hydraulic capacity"
      />

      <ReferenceBasis>
        Francis rectangular-weir overflow,
        tray-pressure-drop liquid head,
        downcomer velocity-head loss and
        liquid-holdup residence-time screening
      </ReferenceBasis>

      <div className="native-formula">
        hbackup = hw + how + ΔPtray/(ρLg)
        + Kdc vdc²/(2g) ·
        tres = Adc Stray/QL
      </div>

      <div className="native-input-grid">
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
          label="Downcomer Area Fraction"
          symbol="Adc/Ag"
          value={downcomerAreaPercent}
          unit="%"
          onChange={
            setDowncomerAreaPercent
          }
        />

        <NumericInput
          label="Tray Spacing"
          symbol="Stray"
          value={traySpacing}
          unit="m"
          onChange={setTraySpacing}
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
          label="Total Tray Pressure Drop"
          symbol="ΔPtray"
          value={trayPressureDrop}
          unit="Pa"
          onChange={setTrayPressureDrop}
        />

        <NumericInput
          label="Liquid Density"
          symbol="ρL"
          value={liquidDensity}
          unit="kg/m³"
          onChange={setLiquidDensity}
        />

        <NumericInput
          label="Downcomer Loss Coefficient"
          symbol="Kdc"
          value={lossCoefficient}
          unit="—"
          onChange={setLossCoefficient}
        />

        <NumericInput
          label="Allowable Backup Height"
          symbol="hallow/Stray"
          value={allowableBackupPercent}
          unit="%"
          onChange={
            setAllowableBackupPercent
          }
        />

        <NumericInput
          label="Minimum Residence Time"
          symbol="tmin"
          value={minimumResidenceTime}
          unit="s"
          onChange={
            setMinimumResidenceTime
          }
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Check downcomer capacity"
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
            headlineLabel="Governing maximum liquid flow"
            headlineValue={`${
              formatEngineeringNumber(
                result
                  .governingMaximumLiquidFlow,
              )
            } m³/s`}
            modelName={result.modelName}
            note={
              result.limitationDescription
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
              label="Governing Constraint"
              value={
                result.governingConstraint ===
                'backup'
                  ? 'Downcomer backup'
                  : 'Minimum residence time'
              }
              unit=""
            />

            <ResultItem
              label="Current Capacity Usage"
              value={
                formatEngineeringNumber(
                  result
                    .currentCapacityFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Gross Column Area"
              value={
                formatEngineeringNumber(
                  result.grossColumnArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Downcomer Area"
              value={
                formatEngineeringNumber(
                  result.downcomerArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Minimum Downcomer Area"
              value={
                formatEngineeringNumber(
                  result.minimumDowncomerArea,
                )
              }
              unit="m²"
            />

            <ResultItem
              label="Minimum Area Fraction"
              value={
                formatEngineeringNumber(
                  result
                    .minimumDowncomerAreaFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Downcomer Liquid Velocity"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .downcomerVelocity,
                )
              }
              unit="m/s"
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
              label="Weir Overflow Height"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .weirOverflowHeight,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Tray Pressure-Drop Head"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .pressureDropHead,
                )
              }
              unit="m liquid"
            />

            <ResultItem
              label="Downcomer Velocity Head"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .velocityHeadLoss,
                )
              }
              unit="m liquid"
            />

            <ResultItem
              label="Total Backup Height"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .backupHeight,
                )
              }
              unit="m"
            />

            <ResultItem
              label="Tray-Spacing Backup"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .backupFraction *
                  100,
                )
              }
              unit="%"
            />

            <ResultItem
              label="Backup Margin"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .backupMarginPercent,
                )
              }
              unit="%"
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
              label="Maximum Flow by Backup"
              value={
                formatEngineeringNumber(
                  result
                    .maximumLiquidFlowByBackup,
                )
              }
              unit="m³/s"
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
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Liquid-load operating window
                </p>

                <strong>
                  Backup and residence-time sensitivity
                </strong>
              </div>

              <span>
                Increasing liquid flow raises
                downcomer backup and reduces
                disengagement residence time
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
                    hbackup = {
                      formatEngineeringNumber(
                        scenario.backupHeight,
                      )
                    } m, tres = {
                      formatEngineeringNumber(
                        scenario.residenceTime,
                      )
                    } s, margin = {
                      formatEngineeringNumber(
                        scenario
                          .backupMarginPercent,
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
