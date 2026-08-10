import {
  useState,
} from 'react'

import {
  TrapezoidalChannelNormalDepthError,
  calculateTrapezoidalChannelNormalDepth,
  createTrapezoidalChannelNormalDepthCsv,
} from './engine'

import type {
  TrapezoidalChannelNormalDepthInput,
  TrapezoidalChannelNormalDepthResult,
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

  targetVolumetricFlowRate:
    '4.60511392',

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
      'targetVolumetricFlowRate',

    label:
      'Target Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
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

export function TrapezoidalChannelNormalDepthCalculator() {
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
      TrapezoidalChannelNormalDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelNormalDepthInput | null
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
    TrapezoidalChannelNormalDepthInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      targetVolumetricFlowRate:
        Number(
          form.targetVolumetricFlowRate,
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
        calculateTrapezoidalChannelNormalDepth(
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
          TrapezoidalChannelNormalDepthError
          ? error.message
          : 'The normal-depth calculation could not be completed.',
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
      createTrapezoidalChannelNormalDepthCsv(
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
      'trapezoidal-channel-normal-depth.csv'

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
        code="FM–38"
        icon="≈"
        title="Trapezoidal Channel Normal Depth"
        subtitle="Solve the Manning equation inversely for uniform-flow depth at a specified discharge"
      />

      <ReferenceBasis>
        Calculator 421 is the inverse companion
        to the trapezoidal Manning-flow
        calculator. A safeguarded bracketing
        and bisection solver determines the
        normal depth that reproduces the target
        discharge.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        (1/n) A(y) R
        <sub>h</sub>
        (y)
        <sup>2/3</sup>
        √S
        &nbsp;&nbsp;→&nbsp;&nbsp;
        solve y
        <sub>n</sub>
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
            headlineLabel="Normal flow depth"
            headlineValue={`${formatEngineeringNumber(
              result.normalDepth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Calculated Flow Rate"
              value={formatEngineeringNumber(
                result.calculatedVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Flow Rate"
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
              label="Discharge Residual"
              value={formatEngineeringNumber(
                result.dischargeResidual,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Relative Discharge Residual"
              value={formatEngineeringNumber(
                result.relativeDischargeResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Solver Iterations"
              value={String(
                result.solverIterations,
              )}
              unit=""
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
