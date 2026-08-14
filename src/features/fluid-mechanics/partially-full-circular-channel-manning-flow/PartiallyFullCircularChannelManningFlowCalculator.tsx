import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelManningFlowError,
  calculatePartiallyFullCircularChannelManningFlow,
  createPartiallyFullCircularChannelManningFlowCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelManningFlowInput,
  PartiallyFullCircularChannelManningFlowResult,
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

  flowDepth:
    '0.6',

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
      'flowDepth',

    label:
      'Flow Depth',

    symbol:
      'y',

    unit:
      'm',
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


export function PartiallyFullCircularChannelManningFlowCalculator() {
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
      PartiallyFullCircularChannelManningFlowResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelManningFlowInput | null
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
    PartiallyFullCircularChannelManningFlowInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      flowDepth:
        Number(
          form.flowDepth,
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
        calculatePartiallyFullCircularChannelManningFlow(
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
          PartiallyFullCircularChannelManningFlowError
          ? error.message
          : 'The partially full circular-channel calculation could not be completed.',
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
      createPartiallyFullCircularChannelManningFlowCsv(
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
      'partially-full-circular-channel-manning-flow.csv'

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
        code="FM–72"
        icon="≈"
        title="Partially Full Circular Channel Flow — Manning"
        subtitle="Calculate uniform free-surface flow, hydraulic geometry and capacity ratios in a partially full circular conduit"
      />

      <ReferenceBasis>
        Calculator 455 treats the circular
        conduit as an open channel with
        0 &lt; y &lt; D. The wetted circular
        segment geometry is calculated first,
        then Manning flow is evaluated from
        the resulting hydraulic radius.
      </ReferenceBasis>

      <div className="native-formula">
        θ = 2 cos⁻¹(1 − 2y/D)
        {'   '}·{'   '}
        A = r²(θ − sinθ)/2
        {'   '}·{'   '}
        Q = AR
        <sub>h</sub>
        <sup>2/3</sup>
        √S₀ / n
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
        calculateLabel="Calculate circular-channel flow"
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
            headlineLabel="Volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRate,
            )} m³/s`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Depth Ratio y/D"
              value={formatEngineeringNumber(
                result.depthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Central Angle"
              value={formatEngineeringNumber(
                result.centralAngleDegrees,
              )}
              unit="°"
            />

            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Area / Full Area"
              value={formatEngineeringNumber(
                result.areaRatioToFull,
              )}
              unit="-"
            />

            <ResultItem
              label="Wetted Perimeter"
              value={formatEngineeringNumber(
                result.wettedPerimeter,
              )}
              unit="m"
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
              label="Flow Regime"
              value={
                result.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Full-Flow Manning Capacity"
              value={formatEngineeringNumber(
                result.fullFlowVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Q / Qfull"
              value={formatEngineeringNumber(
                result.flowRateRatioToFull,
              )}
              unit="-"
            />

            <ResultItem
              label="V / Vfull"
              value={formatEngineeringNumber(
                result.velocityRatioToFull,
              )}
              unit="-"
            />

            <ResultItem
              label="Average Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.averageBoundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Hydraulic Power Dissipation / Length"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipationPerUnitLength,
              )}
              unit="W/m"
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
