import {
  useState,
} from 'react'

import {
  TrapezoidalChannelGvfProfileRk4Error,
  calculateTrapezoidalChannelGvfProfileRk4,
  createTrapezoidalChannelGvfProfileRk4Csv,
} from './engine'

import type {
  TrapezoidalChannelGvfProfileRk4Input,
  TrapezoidalChannelGvfProfileRk4Result,
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

  initialFlowDepth:
    '1.2',

  downstreamReachLength:
    '100',

  integrationSteps:
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
      'initialFlowDepth',

    label:
      'Initial Flow Depth',

    symbol:
      'y₀',

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
      'integrationSteps',

    label:
      'RK4 Integration Steps',

    symbol:
      'N',

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

export function TrapezoidalChannelGvfProfileRk4Calculator() {
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
      TrapezoidalChannelGvfProfileRk4Result | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelGvfProfileRk4Input | null
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
    TrapezoidalChannelGvfProfileRk4Input {
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

      initialFlowDepth:
        Number(
          form.initialFlowDepth,
        ),

      downstreamReachLength:
        Number(
          form.downstreamReachLength,
        ),

      integrationSteps:
        Number(
          form.integrationSteps,
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
        calculateTrapezoidalChannelGvfProfileRk4(
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
          TrapezoidalChannelGvfProfileRk4Error
          ? error.message
          : 'The RK4 gradually varied flow profile calculation could not be completed.',
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
      createTrapezoidalChannelGvfProfileRk4Csv(
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
      'trapezoidal-channel-gvf-profile-rk4.csv'

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
        code="FM–50"
        icon="≈"
        title="Trapezoidal Channel GVF Profile — RK4"
        subtitle="Integrate a gradually varied water-surface profile over a finite downstream reach"
      />

      <ReferenceBasis>
        Calculator 433 integrates the GVF
        differential equation using classical
        fourth-order Runge–Kutta stepping.
        Critical depth, normal depth and the
        applicable M/S profile zone are checked
        throughout the reach.
      </ReferenceBasis>

      <div className="native-formula">
        dy/dx =
        (S₀ − S
        <sub>f</sub>
        ) /
        (1 − Fr²)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        RK4
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
        calculateLabel="Integrate GVF profile"
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
            headlineLabel="Final downstream flow depth"
            headlineValue={`${formatEngineeringNumber(
              result.finalFlowDepth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Depth Change"
              value={formatEngineeringNumber(
                result.depthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Start GVF Profile"
              value={result.startProfileClassification}
              unit=""
            />

            <ResultItem
              label="End GVF Profile"
              value={result.endProfileClassification}
              unit=""
            />

            <ResultItem
              label="Channel Slope Class"
              value={result.channelSlopeClass}
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
              label="Integration Step Length"
              value={formatEngineeringNumber(
                result.integrationStepLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Start Froude Number"
              value={formatEngineeringNumber(
                result.startFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Final Froude Number"
              value={formatEngineeringNumber(
                result.finalFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Start Friction Slope"
              value={formatEngineeringNumber(
                result.startFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Final Friction Slope"
              value={formatEngineeringNumber(
                result.finalFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Integrated Friction Head Loss"
              value={formatEngineeringNumber(
                result.integratedFrictionHeadLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="m/m"
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
              label="Energy-Grade-Line Change"
              value={formatEngineeringNumber(
                result.energyGradeLineChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.energyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Flow Depth"
              value={formatEngineeringNumber(
                result.minimumFlowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Flow Depth"
              value={formatEngineeringNumber(
                result.maximumFlowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum |dy/dx|"
              value={formatEngineeringNumber(
                result.maximumAbsoluteDepthGradient,
              )}
              unit="m/m"
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
              label="Stored Profile Points"
              value={String(
                result.profilePoints.length,
              )}
              unit=""
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={exportCsv}
            >
              Export full profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
