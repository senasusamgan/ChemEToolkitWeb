import {
  useState,
} from 'react'

import {
  ShortcutDistillationCalculationError,
  calculateShortcutDistillation,
  createShortcutDistillationCsv,
} from './engine'
import type {
  ShortcutDistillationInput,
  ShortcutDistillationResult,
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
  feedLightKeyMoleFraction:
    '0.45',
  distillateLightKeyMoleFraction:
    '0.95',
  bottomsLightKeyMoleFraction:
    '0.05',
  relativeVolatility:
    '2.4',
  feedQuality:
    '1',
  refluxMultiplier:
    '1.5',
  overallStageEfficiency:
    '0.75',
}

export function FenskeUnderwoodGillilandCalculator() {
  const [
    feedLightKeyMoleFraction,
    setFeedLightKeyMoleFraction,
  ] = useState(
    example.feedLightKeyMoleFraction,
  )

  const [
    distillateLightKeyMoleFraction,
    setDistillateLightKeyMoleFraction,
  ] = useState(
    example.distillateLightKeyMoleFraction,
  )

  const [
    bottomsLightKeyMoleFraction,
    setBottomsLightKeyMoleFraction,
  ] = useState(
    example.bottomsLightKeyMoleFraction,
  )

  const [
    relativeVolatility,
    setRelativeVolatility,
  ] = useState(
    example.relativeVolatility,
  )

  const [
    feedQuality,
    setFeedQuality,
  ] = useState(
    example.feedQuality,
  )

  const [
    refluxMultiplier,
    setRefluxMultiplier,
  ] = useState(
    example.refluxMultiplier,
  )

  const [
    overallStageEfficiency,
    setOverallStageEfficiency,
  ] = useState(
    example.overallStageEfficiency,
  )

  const [
    result,
    setResult,
  ] = useState<
    ShortcutDistillationResult | null
  >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] = useState<
    ShortcutDistillationInput | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function currentInput():
    ShortcutDistillationInput {
    return {
      feedLightKeyMoleFraction:
        Number(
          feedLightKeyMoleFraction,
        ),
      distillateLightKeyMoleFraction:
        Number(
          distillateLightKeyMoleFraction,
        ),
      bottomsLightKeyMoleFraction:
        Number(
          bottomsLightKeyMoleFraction,
        ),
      relativeVolatility:
        Number(
          relativeVolatility,
        ),
      feedQuality:
        Number(
          feedQuality,
        ),
      refluxMultiplier:
        Number(
          refluxMultiplier,
        ),
      overallStageEfficiency:
        Number(
          overallStageEfficiency,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const nextResult =
        calculateShortcutDistillation(
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
          ShortcutDistillationCalculationError
          ? error.message
          : 'The shortcut distillation calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedLightKeyMoleFraction(
      example.feedLightKeyMoleFraction,
    )

    setDistillateLightKeyMoleFraction(
      example.distillateLightKeyMoleFraction,
    )

    setBottomsLightKeyMoleFraction(
      example.bottomsLightKeyMoleFraction,
    )

    setRelativeVolatility(
      example.relativeVolatility,
    )

    setFeedQuality(
      example.feedQuality,
    )

    setRefluxMultiplier(
      example.refluxMultiplier,
    )

    setOverallStageEfficiency(
      example.overallStageEfficiency,
    )

    setResult(null)
    setCalculatedInput(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedLightKeyMoleFraction('')
    setDistillateLightKeyMoleFraction('')
    setBottomsLightKeyMoleFraction('')
    setRelativeVolatility('')
    setFeedQuality('')
    setRefluxMultiplier('')
    setOverallStageEfficiency('')
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
      createShortcutDistillationCsv(
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
      'fenske-underwood-gilliland-shortcut.csv'

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
        code="SP–41"
        icon="⋈"
        title="Fenske–Underwood–Gilliland Shortcut Distillation"
        subtitle="Minimum stages, minimum reflux and operating-stage estimate for a binary key split"
      />

      <ReferenceBasis>
        Fenske total-reflux equation, binary Underwood
        minimum-reflux equations and the Eduljee analytical
        approximation to the Gilliland correlation
      </ReferenceBasis>

      <div className="native-formula">
        Nmin = ln[(xD,LK/xD,HK)(xB,HK/xB,LK)] / ln α ·
        Rmin from Underwood θ · N from Gilliland X–Y
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Feed Light-Key Mole Fraction"
          symbol="zF,LK"
          value={
            feedLightKeyMoleFraction
          }
          unit="fraction"
          onChange={
            setFeedLightKeyMoleFraction
          }
        />

        <NumericInput
          label="Distillate Light-Key Mole Fraction"
          symbol="xD,LK"
          value={
            distillateLightKeyMoleFraction
          }
          unit="fraction"
          onChange={
            setDistillateLightKeyMoleFraction
          }
        />

        <NumericInput
          label="Bottoms Light-Key Mole Fraction"
          symbol="xB,LK"
          value={
            bottomsLightKeyMoleFraction
          }
          unit="fraction"
          onChange={
            setBottomsLightKeyMoleFraction
          }
        />

        <NumericInput
          label="Relative Volatility"
          symbol="αLK/HK"
          value={
            relativeVolatility
          }
          unit="—"
          onChange={
            setRelativeVolatility
          }
        />

        <NumericInput
          label="Feed Quality"
          symbol="q"
          value={
            feedQuality
          }
          unit="fraction"
          onChange={
            setFeedQuality
          }
        />

        <NumericInput
          label="Operating Reflux Multiple"
          symbol="R/Rmin"
          value={
            refluxMultiplier
          }
          unit="×"
          onChange={
            setRefluxMultiplier
          }
        />

        <NumericInput
          label="Overall Stage Efficiency"
          symbol="ηo"
          value={
            overallStageEfficiency
          }
          unit="fraction"
          onChange={
            setOverallStageEfficiency
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
        calculateLabel="Design shortcut column"
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
            headlineLabel="Estimated required actual stages"
            headlineValue={
              String(
                result
                  .selectedScenario
                  .requiredIntegerActualStages,
              )
            }
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Fenske Minimum Stages"
              value={
                formatEngineeringNumber(
                  result.minimumStages,
                )
              }
              unit="stages"
            />

            <ResultItem
              label="Underwood Root"
              value={
                formatEngineeringNumber(
                  result.underwoodRoot,
                )
              }
              unit="θ"
            />

            <ResultItem
              label="Minimum Reflux Ratio"
              value={
                formatEngineeringNumber(
                  result.minimumRefluxRatio,
                )
              }
              unit="Rmin"
            />

            <ResultItem
              label="Operating Reflux Ratio"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .operatingRefluxRatio,
                )
              }
              unit="R"
            />

            <ResultItem
              label="Theoretical Stage Count"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .theoreticalStageCount,
                )
              }
              unit="stages"
            />

            <ResultItem
              label="Rounded Theoretical Stages"
              value={
                String(
                  result
                    .selectedScenario
                    .requiredIntegerTheoreticalStages,
                )
              }
              unit="stages"
            />

            <ResultItem
              label="Unrounded Actual Stages"
              value={
                formatEngineeringNumber(
                  result
                    .selectedScenario
                    .actualStageCount,
                )
              }
              unit="stages"
            />

            <ResultItem
              label="Underwood Residual"
              value={
                formatEngineeringNumber(
                  result.underwoodResidual,
                )
              }
              unit="—"
            />
          </ResultPanel>

          <div className="native-result-panel">
            <div className="native-result-heading">
              <div>
                <p>
                  Reflux sensitivity scenarios
                </p>

                <strong>
                  Minimum · selected · high reflux
                </strong>
              </div>

              <span>
                Higher reflux reduces stages but raises
                condenser and reboiler duties
              </span>
            </div>

            <ol className="native-stage-list">
              {result.scenarios.map(
                (
                  scenario,
                ) => (
                  <li
                    key={
                      scenario.refluxMultiplier
                    }
                  >
                    <strong>
                      {
                        formatEngineeringNumber(
                          scenario.refluxMultiplier,
                        )
                      }× Rmin
                    </strong>
                    {' — '}
                    R = {
                      formatEngineeringNumber(
                        scenario.operatingRefluxRatio,
                      )
                    }, N = {
                      formatEngineeringNumber(
                        scenario.theoreticalStageCount,
                      )
                    }, actual ≈ {
                      scenario.requiredIntegerActualStages
                    } stages
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
