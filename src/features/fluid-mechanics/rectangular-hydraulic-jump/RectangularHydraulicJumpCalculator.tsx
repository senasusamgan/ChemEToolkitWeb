import {
  useState,
} from 'react'

import {
  RectangularHydraulicJumpError,
  calculateRectangularHydraulicJump,
  createRectangularHydraulicJumpCsv,
} from './engine'

import type {
  RectangularHydraulicJumpInput,
  RectangularHydraulicJumpResult,
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
  channelWidth:
    '2',

  upstreamDepth:
    '0.5',

  volumetricFlowRate:
    '4',

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
      'channelWidth',

    label:
      'Rectangular Channel Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'upstreamDepth',

    label:
      'Upstream Supercritical Depth',

    symbol:
      'y₁',

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
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]

export function RectangularHydraulicJumpCalculator() {
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
      RectangularHydraulicJumpResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      RectangularHydraulicJumpInput | null
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
    RectangularHydraulicJumpInput {
    return {
      channelWidth:
        Number(
          form.channelWidth,
        ),

      upstreamDepth:
        Number(
          form.upstreamDepth,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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
        calculateRectangularHydraulicJump(
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
          RectangularHydraulicJumpError
          ? error.message
          : 'The hydraulic-jump calculation could not be completed.',
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
      createRectangularHydraulicJumpCsv(
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
      'rectangular-hydraulic-jump.csv'

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
        code="FM–39"
        icon="≈"
        title="Rectangular Hydraulic Jump"
        subtitle="Calculate sequent depth, Froude transition, energy loss and dissipated power"
      />

      <ReferenceBasis>
        Calculator 422 models a classical
        hydraulic jump in a horizontal
        rectangular channel. Momentum
        conservation determines the downstream
        conjugate depth, while the specific
        energy difference quantifies hydraulic
        energy dissipation.
      </ReferenceBasis>

      <div className="native-formula">
        y₂/y₁ =
        ½[
        √(1 + 8Fr₁²)
        − 1]
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
        calculateLabel="Calculate hydraulic jump"
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
            headlineLabel="Sequent downstream depth"
            headlineValue={`${formatEngineeringNumber(
              result.downstreamDepth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Flow Regime"
              value={result.upstreamRegime}
              unit=""
            />

            <ResultItem
              label="Sequent Depth Ratio"
              value={formatEngineeringNumber(
                result.sequentDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Downstream Froude Number"
              value={formatEngineeringNumber(
                result.downstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Downstream Flow Regime"
              value={result.downstreamRegime}
              unit=""
            />

            <ResultItem
              label="Upstream Velocity"
              value={formatEngineeringNumber(
                result.upstreamVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Downstream Velocity"
              value={formatEngineeringNumber(
                result.downstreamVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Downstream Specific Energy"
              value={formatEngineeringNumber(
                result.downstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic-Jump Energy Loss"
              value={formatEngineeringNumber(
                result.energyLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Loss Percentage"
              value={formatEngineeringNumber(
                result.energyLossPercentage,
              )}
              unit="%"
            />

            <ResultItem
              label="Dissipated Hydraulic Power"
              value={formatEngineeringNumber(
                result.dissipatedPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Momentum Closure Residual"
              value={formatEngineeringNumber(
                result.momentumClosureResidual,
              )}
              unit="m²"
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
