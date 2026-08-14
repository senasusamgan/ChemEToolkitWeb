import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelNormalDepthError,
  calculatePartiallyFullCircularChannelNormalDepth,
  createPartiallyFullCircularChannelNormalDepthCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelNormalDepthInput,
  PartiallyFullCircularChannelNormalDepthResult,
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
    '1.2',

  manningRoughness:
    '0.013',

  channelSlope:
    '0.002',

  fluidDensity:
    '998',
}

type FormField =
  keyof typeof exampleForm

const fields: Array<{
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
      'Required Volumetric Flow Rate',

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
      'Channel Slope',

    symbol:
      'S₀',

    unit:
      '-',
  },
  {
    key:
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]


export function PartiallyFullCircularChannelNormalDepthCalculator() {
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
      PartiallyFullCircularChannelNormalDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelNormalDepthInput | null
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
    PartiallyFullCircularChannelNormalDepthInput {
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

      fluidDensity:
        Number(
          form.fluidDensity,
        ),
    }
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelNormalDepth(
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
          PartiallyFullCircularChannelNormalDepthError
          ? error.message
          : 'Circular-channel normal depth could not be solved.',
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
      createPartiallyFullCircularChannelNormalDepthCsv(
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
      'partially-full-circular-channel-normal-depth.csv'

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
        code="FM–73"
        icon="≈"
        title="Partially Full Circular Channel Normal Depth — Manning"
        subtitle="Solve one or two free-surface normal depths for a specified discharge in a circular conduit"
      />

      <ReferenceBasis>
        Calculator 456 is the inverse of
        Calculator 455. Because circular
        open-channel Manning capacity reaches
        a maximum before the conduit becomes
        completely full, some high discharges
        admit two distinct normal depths.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        AR
        <sub>h</sub>
        <sup>2/3</sup>
        √S₀ / n
        {'   → solve for y'}
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
        calculateLabel="Solve normal depth"
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
            headlineLabel="Shallow normal depth"
            headlineValue={`${formatEngineeringNumber(
              result.shallowSolution.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Solution Multiplicity"
              value={
                result.solutionMultiplicity
              }
              unit=""
            />

            <ResultItem
              label="Shallow Depth Ratio y/D"
              value={formatEngineeringNumber(
                result.shallowSolution.depthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Mean Velocity"
              value={formatEngineeringNumber(
                result.shallowSolution.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Shallow Froude Number"
              value={formatEngineeringNumber(
                result.shallowSolution.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Flow Regime"
              value={
                result.shallowSolution.flowRegime
              }
              unit=""
            />

            {result.deepSolution ? (
              <>
                <ResultItem
                  label="Deep Normal Depth"
                  value={formatEngineeringNumber(
                    result.deepSolution.flowDepth,
                  )}
                  unit="m"
                />

                <ResultItem
                  label="Deep Depth Ratio y/D"
                  value={formatEngineeringNumber(
                    result.deepSolution.depthRatio,
                  )}
                  unit="-"
                />

                <ResultItem
                  label="Deep Mean Velocity"
                  value={formatEngineeringNumber(
                    result.deepSolution.meanVelocity,
                  )}
                  unit="m/s"
                />

                <ResultItem
                  label="Deep Froude Number"
                  value={formatEngineeringNumber(
                    result.deepSolution.froudeNumber,
                  )}
                  unit="-"
                />

                <ResultItem
                  label="Deep Flow Regime"
                  value={
                    result.deepSolution.flowRegime
                  }
                  unit=""
                />
              </>
            ) : null}

            <ResultItem
              label="Full-Flow Manning Capacity"
              value={formatEngineeringNumber(
                result.fullFlowCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Maximum Partial-Flow Capacity"
              value={formatEngineeringNumber(
                result.maximumPartialFlowCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Maximum-Capacity Depth"
              value={formatEngineeringNumber(
                result.maximumCapacityDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum-Capacity y/D"
              value={formatEngineeringNumber(
                result.maximumCapacityDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Qmax / Qfull"
              value={formatEngineeringNumber(
                result.maximumCapacityRatioToFull,
              )}
              unit="-"
            />

            <ResultItem
              label="Requested Q / Qfull"
              value={formatEngineeringNumber(
                result.requestedFlowToFullCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Requested Q / Qmax"
              value={formatEngineeringNumber(
                result.requestedFlowToMaximumCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Remaining Capacity Margin"
              value={formatEngineeringNumber(
                result.maximumCapacityMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
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
