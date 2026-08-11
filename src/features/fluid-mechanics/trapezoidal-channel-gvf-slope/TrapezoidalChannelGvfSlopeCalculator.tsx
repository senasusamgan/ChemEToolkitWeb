import {
  useState,
} from 'react'

import {
  TrapezoidalChannelGvfSlopeError,
  calculateTrapezoidalChannelGvfSlope,
  createTrapezoidalChannelGvfSlopeCsv,
} from './engine'

import type {
  TrapezoidalChannelGvfSlopeInput,
  TrapezoidalChannelGvfSlopeResult,
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

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  manningRoughness:
    '0.015',

  channelSlope:
    '0.0015',

  flowDepth:
    '1.2',

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
      's/m⅓',
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

export function TrapezoidalChannelGvfSlopeCalculator() {
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
      TrapezoidalChannelGvfSlopeResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelGvfSlopeInput | null
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
    TrapezoidalChannelGvfSlopeInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
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
        calculateTrapezoidalChannelGvfSlope(
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
          TrapezoidalChannelGvfSlopeError
          ? error.message
          : 'The GVF differential-slope calculation could not be completed.',
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
      createTrapezoidalChannelGvfSlopeCsv(
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
      'trapezoidal-channel-gvf-slope.csv'

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
        code="FM–49"
        icon="≈"
        title="Trapezoidal Channel GVF Differential Slope"
        subtitle="Evaluate the local gradually varied flow depth and water-surface gradients"
      />

      <ReferenceBasis>
        Calculator 432 evaluates the local
        gradually varied flow differential
        equation for a trapezoidal channel and
        identifies the associated M, S or
        critical-slope profile zone.
      </ReferenceBasis>

      <div className="native-formula">
        dy/dx =
        (S₀ − S
        <sub>f</sub>
        ) /
        (1 − Fr²)
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
        calculateLabel="Calculate GVF slope"
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
            headlineLabel="Local depth gradient dy/dx"
            headlineValue={`${formatEngineeringNumber(
              result.depthGradient,
            )} m/m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="GVF Profile"
              value={result.profileClassification}
              unit=""
            />

            <ResultItem
              label="Channel Slope Class"
              value={result.channelSlopeClass}
              unit=""
            />

            <ResultItem
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Normal Depth"
              value={formatEngineeringNumber(
                result.normalDepth,
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
              label="Friction Slope"
              value={formatEngineeringNumber(
                result.frictionSlope,
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
              label="Specific-Energy Gradient"
              value={formatEngineeringNumber(
                result.energyGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Water-Surface Elevation Gradient"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Energy-Grade-Line Gradient"
              value={formatEngineeringNumber(
                result.energyGradeLineGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Depth Change per 100 m"
              value={formatEngineeringNumber(
                result.depthChangePer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Change per 100 m"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangePer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed Elevation Change per 100 m"
              value={formatEngineeringNumber(
                result.bedElevationChangePer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Friction Head Loss per 100 m"
              value={formatEngineeringNumber(
                result.frictionHeadLossPer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Differential Equation Residual"
              value={formatEngineeringNumber(
                result.differentialEquationResidual,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.boundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Hydraulic Power Dissipation"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipationPerLength,
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

            <ResultItem
              label="Normal-Depth Solver Iterations"
              value={String(
                result.normalDepthSolverIterations,
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
