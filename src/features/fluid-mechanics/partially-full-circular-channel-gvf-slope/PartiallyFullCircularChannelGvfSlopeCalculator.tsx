import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelGvfSlopeError,
  calculatePartiallyFullCircularChannelGvfSlope,
  createPartiallyFullCircularChannelGvfSlopeCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelGvfSlopeInput,
  PartiallyFullCircularChannelGvfSlopeResult,
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
  pipeDiameter:
    '1.2',

  volumetricFlowRate:
    '0.6',

  manningRoughness:
    '0.013',

  channelSlope:
    '0.001',

  flowDepth:
    '0.5',
}


type FormField =
  keyof typeof exampleForm


const fields:
  Array<{
    key: FormField
    label: string
    symbol: string
    unit: string
  }> = [
  {
    key:
      'pipeDiameter',

    label:
      'Circular Channel Diameter',

    symbol:
      'D',

    unit:
      'm',
  },
  {
    key:
      'volumetricFlowRate',

    label:
      'Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'manningRoughness',

    label:
      'Manning Roughness',

    symbol:
      'n',

    unit:
      '-',
  },
  {
    key:
      'channelSlope',

    label:
      'Channel Bed Slope',

    symbol:
      'S₀',

    unit:
      'm/m',
  },
  {
    key:
      'flowDepth',

    label:
      'Local Flow Depth',

    symbol:
      'y',

    unit:
      'm',
  },
]


export function PartiallyFullCircularChannelGvfSlopeCalculator() {
  const [
    form,
    setForm,
  ] =
    useState(
      exampleForm,
    )

  const [
    result,
    setResult,
  ] =
    useState<
      PartiallyFullCircularChannelGvfSlopeResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelGvfSlopeInput | null
    >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState('')


  function updateField(
    field: FormField,
  ) {
    return (
      value: string,
    ) => {
      setForm(
        current => ({
          ...current,

          [field]:
            value,
        }),
      )
    }
  }


  function currentInput():
    PartiallyFullCircularChannelGvfSlopeInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      manningRoughness:
        Number(
          form.manningRoughness,
        ),

      channelSlope:
        Number(
          form.channelSlope,
        ),

      flowDepth:
        Number(
          form.flowDepth,
        ),
    }
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelGvfSlope(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          PartiallyFullCircularChannelGvfSlopeError
          ? error.message
          : 'Circular-channel GVF differential slope could not be evaluated.',
      )
    }
  }


  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

    setErrorMessage('')
  }


  function clearInputs() {
    setForm(
      Object.fromEntries(
        Object.keys(
          exampleForm,
        ).map(
          key => [
            key,
            '',
          ],
        ),
      ) as typeof exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

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
      createPartiallyFullCircularChannelGvfSlopeCsv(
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
      'partially-full-circular-channel-gvf-slope.csv'

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
        code="FM–79"
        icon="∿"
        title="Partially Full Circular Channel GVF Differential Slope"
        subtitle="Evaluate the local water-depth gradient for gradually varied flow in a partially full circular channel"
      />

      <ReferenceBasis>
        Calculator 462 evaluates the local
        gradually varied flow differential
        equation. Circular-section geometry and
        Manning friction determine Sf and Fr,
        while Calculator 457 supplies the critical
        depth used to identify the singular
        critical-flow condition.
      </ReferenceBasis>

      <div className="native-formula">
        dy/dx =
        (S₀ − Sf) /
        (1 − Fr²)
        {'   '}
        with
        {'   '}
        Sf =
        [nQ/(AR^(2/3))]²
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={
                field.key
              }
              label={
                field.label
              }
              symbol={
                field.symbol
              }
              value={
                form[
                  field.key
                ]
              }
              unit={
                field.unit
              }
              onChange={
                updateField(
                  field.key,
                )
              }
            />
          ),
        )}
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
        calculateLabel="Evaluate GVF slope"
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
            headlineLabel="Local depth gradient"
            headlineValue={`${formatEngineeringNumber(
              result.depthGradient,
            )} m/m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Local Profile Trend"
              value={
                result.localProfileTrend
              }
              unit=""
            />

            <ResultItem
              label="Flow Regime"
              value={
                result.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Depth Change per 100 m"
              value={formatEngineeringNumber(
                result.depthChangePer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Flow Depth"
              value={formatEngineeringNumber(
                result.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Depth Ratio"
              value={formatEngineeringNumber(
                result.depthRatio,
              )}
              unit="y/D"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Depth above/below Critical"
              value={formatEngineeringNumber(
                result.criticalDepthDifference,
              )}
              unit="m"
            />

            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Top Width"
              value={formatEngineeringNumber(
                result.topWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Radius"
              value={formatEngineeringNumber(
                result.hydraulicRadius,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Depth"
              value={formatEngineeringNumber(
                result.hydraulicDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Mean Velocity"
              value={formatEngineeringNumber(
                result.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Froude Number"
              value={formatEngineeringNumber(
                result.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Specific Energy"
              value={formatEngineeringNumber(
                result.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed Slope"
              value={formatEngineeringNumber(
                result.channelSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Friction Slope"
              value={formatEngineeringNumber(
                result.frictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="S₀ − Sf"
              value={formatEngineeringNumber(
                result.slopeNumerator,
              )}
              unit="m/m"
            />

            <ResultItem
              label="1 − Fr²"
              value={formatEngineeringNumber(
                result.froudeDenominator,
              )}
              unit="-"
            />

            <ResultItem
              label="Slope Balance"
              value={
                result.slopeBalance
              }
              unit=""
            />
          </ResultPanel>

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
