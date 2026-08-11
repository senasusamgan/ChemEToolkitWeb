import {
  useState,
} from 'react'

import {
  TrapezoidalChannelDirectStepError,
  calculateTrapezoidalChannelDirectStep,
  createTrapezoidalChannelDirectStepCsv,
} from './engine'

import type {
  TrapezoidalChannelDirectStepInput,
  TrapezoidalChannelDirectStepResult,
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

  startDepth:
    '1.2',

  endDepth:
    '1.4',

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
      'startDepth',

    label:
      'Section 1 Flow Depth',

    symbol:
      'y₁',

    unit:
      'm',
  },
  {
    key:
      'endDepth',

    label:
      'Section 2 Flow Depth',

    symbol:
      'y₂',

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

export function TrapezoidalChannelDirectStepCalculator() {
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
      TrapezoidalChannelDirectStepResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelDirectStepInput | null
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
    TrapezoidalChannelDirectStepInput {
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

      endDepth:
        Number(
          form.endDepth,
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
        calculateTrapezoidalChannelDirectStep(
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
          TrapezoidalChannelDirectStepError
          ? error.message
          : 'The direct-step gradually varied flow calculation could not be completed.',
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
      createTrapezoidalChannelDirectStepCsv(
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
      'trapezoidal-channel-direct-step.csv'

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
        code="FM–48"
        icon="≈"
        title="Trapezoidal Channel Direct-Step Method"
        subtitle="Estimate gradually varied flow distance between two depths using Manning friction"
      />

      <ReferenceBasis>
        Calculator 431 evaluates a single
        gradually varied flow reach using the
        direct-step energy method. Critical
        depth, normal depth and the M/S profile
        zone are determined automatically.
      </ReferenceBasis>

      <div className="native-formula">
        Δx =
        (E₂ − E₁) /
        (S₀ − S
        <sub>f,avg</sub>
        )
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
        calculateLabel="Calculate direct-step reach"
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
            headlineLabel="Direct-step reach length"
            headlineValue={`${formatEngineeringNumber(
              result.reachLength,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Signed Distance"
              value={formatEngineeringNumber(
                result.signedDistance,
              )}
              unit="m"
            />

            <ResultItem
              label="Reach Direction"
              value={result.reachDirection}
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
              label="Channel Slope Class"
              value={result.channelSlopeClass}
              unit=""
            />

            <ResultItem
              label="GVF Profile"
              value={result.profileClassification}
              unit=""
            />

            <ResultItem
              label="Section 1 Froude Number"
              value={formatEngineeringNumber(
                result.startFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Section 2 Froude Number"
              value={formatEngineeringNumber(
                result.endFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Section 1 Specific Energy"
              value={formatEngineeringNumber(
                result.startSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Section 2 Specific Energy"
              value={formatEngineeringNumber(
                result.endSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Change"
              value={formatEngineeringNumber(
                result.specificEnergyChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Section 1 Friction Slope"
              value={formatEngineeringNumber(
                result.startFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Section 2 Friction Slope"
              value={formatEngineeringNumber(
                result.endFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="S₀ − Sf,avg"
              value={formatEngineeringNumber(
                result.slopeDifference,
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
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLoss,
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
