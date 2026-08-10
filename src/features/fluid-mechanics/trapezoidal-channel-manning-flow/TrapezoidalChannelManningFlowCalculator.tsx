import {
  useState,
} from 'react'

import {
  TrapezoidalChannelManningFlowError,
  calculateTrapezoidalChannelManningFlow,
  createTrapezoidalChannelManningFlowCsv,
} from './engine'

import type {
  TrapezoidalChannelManningFlowInput,
  TrapezoidalChannelManningFlowResult,
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
  bottomWidth:
    '2',

  flowDepth:
    '1',

  sideSlopeHorizontalPerVertical:
    '1',

  channelSlope:
    '0.001',

  manningRoughness:
    '0.015',

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
      'bottomWidth',

    label:
      'Channel Bottom Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'flowDepth',

    label:
      'Normal Flow Depth',

    symbol:
      'y',

    unit:
      'm',
  },
  {
    key:
      'sideSlopeHorizontalPerVertical',

    label:
      'Side Slope Horizontal : Vertical',

    symbol:
      'z',

    unit:
      'H:V',
  },
  {
    key:
      'channelSlope',

    label:
      'Channel / Energy Slope',

    symbol:
      'S',

    unit:
      'm/m',
  },
  {
    key:
      'manningRoughness',

    label:
      'Manning Roughness Coefficient',

    symbol:
      'n',

    unit:
      's/m⅓',
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

export function TrapezoidalChannelManningFlowCalculator() {
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
      TrapezoidalChannelManningFlowResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelManningFlowInput | null
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
    TrapezoidalChannelManningFlowInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      flowDepth:
        Number(
          form.flowDepth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      channelSlope:
        Number(
          form.channelSlope,
        ),

      manningRoughness:
        Number(
          form.manningRoughness,
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
        calculateTrapezoidalChannelManningFlow(
          input,
        )

      setResult(next)
      setCalculatedInput(input)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setCalculatedInput(null)

      setErrorMessage(
        error instanceof
          TrapezoidalChannelManningFlowError
          ? error.message
          : 'The Manning open-channel calculation could not be completed.',
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
      createTrapezoidalChannelManningFlowCsv(
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

    link.href = url

    link.download =
      'trapezoidal-channel-manning-flow.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–37"
        icon="≈"
        title="Trapezoidal Open-Channel Flow — Manning Equation"
        subtitle="Calculate uniform open-channel discharge, velocity, hydraulic radius and Froude number"
      />

      <ReferenceBasis>
        Calculator 420 extends the
        open-channel-flow family from weir
        measurement into channel hydraulics.
        Trapezoidal geometry is combined with
        Manning roughness and energy slope to
        determine uniform-flow discharge.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        (1/n) A R
        <sub>h</sub>
        <sup>2/3</sup>
        √S
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={form[field.key]}
              unit={field.unit}
              onChange={updateField(
                field.key,
              )}
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate channel flow"
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
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Wetted Perimeter"
              value={formatEngineeringNumber(
                result.wettedPerimeter,
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
              label="Top Width"
              value={formatEngineeringNumber(
                result.topWidth,
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
              label="Volumetric Flow"
              value={formatEngineeringNumber(
                result.volumetricFlowRateCubicMetersPerHour,
              )}
              unit="m³/h"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Mean Flow Velocity"
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
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.boundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Specific Energy"
              value={formatEngineeringNumber(
                result.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Recovered Manning Roughness"
              value={formatEngineeringNumber(
                result.recoveredManningRoughness,
              )}
              unit="s/m⅓"
            />

            <ResultItem
              label="Manning Closure Residual"
              value={formatEngineeringNumber(
                result.manningClosureResidual,
              )}
              unit="s/m⅓"
            />
          </ResultPanel>

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
