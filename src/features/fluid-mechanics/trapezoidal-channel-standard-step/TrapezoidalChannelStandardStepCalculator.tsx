import {
  useState,
} from 'react'

import {
  TrapezoidalChannelStandardStepError,
  calculateTrapezoidalChannelStandardStep,
  createTrapezoidalChannelStandardStepCsv,
} from './engine'

import type {
  TrapezoidalChannelStandardStepInput,
  TrapezoidalChannelStandardStepResult,
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
    '3',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  manningRoughness:
    '0.03',

  channelSlope:
    '0.001',

  startDepth:
    '1.5',

  downstreamReachLength:
    '100',

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
      'Bottom Width',

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
      '-',
  },
  {
    key:
      'startDepth',

    label:
      'Starting Flow Depth',

    symbol:
      'y₁',

    unit:
      'm',
  },
  {
    key:
      'downstreamReachLength',

    label:
      'Downstream Reach Length',

    symbol:
      'L',

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

export function TrapezoidalChannelStandardStepCalculator() {
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
      TrapezoidalChannelStandardStepResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelStandardStepInput | null
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
    TrapezoidalChannelStandardStepInput {
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

      startDepth:
        Number(
          form.startDepth,
        ),

      downstreamReachLength:
        Number(
          form.downstreamReachLength,
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
        calculateTrapezoidalChannelStandardStep(
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
          TrapezoidalChannelStandardStepError
          ? error.message
          : 'The trapezoidal-channel standard-step calculation could not be completed.',
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
      createTrapezoidalChannelStandardStepCsv(
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
      'trapezoidal-channel-standard-step-gvf.csv'

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
        code="FM–67"
        icon="≈"
        title="Trapezoidal Channel Standard-Step Method — GVF"
        subtitle="Solve the downstream flow depth over a specified reach using the standard-step gradually varied flow energy equation"
      />

      <ReferenceBasis>
        Calculator 450 solves the implicit
        standard-step equation for the
        downstream depth. It complements
        the Direct-Step and RK4 GVF tools:
        reach length is specified and the
        unknown downstream depth is solved
        within the same profile zone.
      </ReferenceBasis>

      <div className="native-formula">
        E₂ − E₁ =
        [S₀ −
        (S
        <sub>f1</sub>
        + S
        <sub>f2</sub>
        )/2] L
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
        calculateLabel="Solve downstream depth"
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
            headlineLabel="Downstream flow depth"
            headlineValue={`${formatEngineeringNumber(
              result.endDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="GVF Profile"
              value={
                result.profileClassification
              }
              unit=""
            />

            <ResultItem
              label="Channel Slope Class"
              value={
                result.channelSlopeClass
              }
              unit=""
            />

            <ResultItem
              label="Profile Trend"
              value={
                result.profileTrend
              }
              unit=""
            />

            <ResultItem
              label="Starting Depth"
              value={formatEngineeringNumber(
                result.startDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Depth Change"
              value={formatEngineeringNumber(
                result.depthChange,
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
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Starting Velocity"
              value={formatEngineeringNumber(
                result.startVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Ending Velocity"
              value={formatEngineeringNumber(
                result.endVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Starting Froude Number"
              value={formatEngineeringNumber(
                result.startFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Ending Froude Number"
              value={formatEngineeringNumber(
                result.endFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Starting Specific Energy"
              value={formatEngineeringNumber(
                result.startSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Ending Specific Energy"
              value={formatEngineeringNumber(
                result.endSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Starting Friction Slope"
              value={formatEngineeringNumber(
                result.startFrictionSlope,
              )}
              unit="-"
            />

            <ResultItem
              label="Ending Friction Slope"
              value={formatEngineeringNumber(
                result.endFrictionSlope,
              )}
              unit="-"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="-"
            />

            <ResultItem
              label="Local dy/dx at Start"
              value={formatEngineeringNumber(
                result.localGvfDepthGradientAtStart,
              )}
              unit="-"
            />

            <ResultItem
              label="Local dy/dx at End"
              value={formatEngineeringNumber(
                result.localGvfDepthGradientAtEnd,
              )}
              unit="-"
            />

            <ResultItem
              label="Specified Reach Length"
              value={formatEngineeringNumber(
                result.downstreamReachLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Equivalent Direct-Step Distance"
              value={formatEngineeringNumber(
                result.equivalentDirectStepDistance,
              )}
              unit="m"
            />

            <ResultItem
              label="Distance Closure Residual"
              value={formatEngineeringNumber(
                result.distanceClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Bed Elevation Change"
              value={formatEngineeringNumber(
                result.bedElevationChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.standardStepEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Power Dissipated"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipated,
              )}
              unit="W"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Depth Solver Iterations"
              value={String(
                result.depthSolverIterations,
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
