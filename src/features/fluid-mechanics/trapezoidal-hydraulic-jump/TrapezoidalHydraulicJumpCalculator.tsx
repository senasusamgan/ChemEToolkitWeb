import {
  useState,
} from 'react'

import {
  TrapezoidalHydraulicJumpError,
  calculateTrapezoidalHydraulicJump,
  createTrapezoidalHydraulicJumpCsv,
} from './engine'

import type {
  TrapezoidalHydraulicJumpInput,
  TrapezoidalHydraulicJumpResult,
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

  upstreamDepth:
    '0.4',

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

export function TrapezoidalHydraulicJumpCalculator() {
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
      TrapezoidalHydraulicJumpResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalHydraulicJumpInput | null
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
    TrapezoidalHydraulicJumpInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
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
        calculateTrapezoidalHydraulicJump(
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
          TrapezoidalHydraulicJumpError
          ? error.message
          : 'The trapezoidal hydraulic-jump calculation could not be completed.',
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
      createTrapezoidalHydraulicJumpCsv(
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
      'trapezoidal-hydraulic-jump.csv'

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
        code="FM–43"
        icon="≈"
        title="Trapezoidal Hydraulic Jump"
        subtitle="Solve conjugate depth from momentum conservation and quantify hydraulic energy dissipation"
      />

      <ReferenceBasis>
        Calculator 426 generalizes the
        rectangular hydraulic-jump model to a
        symmetric trapezoidal channel. The
        downstream conjugate depth is obtained
        numerically from equal upstream and
        downstream momentum functions.
      </ReferenceBasis>

      <div className="native-formula">
        M =
        Q²/(gA)
        + by²/2
        + zy³/3
        &nbsp;&nbsp;·&nbsp;&nbsp;
        M₁ = M₂
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
            headlineLabel="Downstream sequent depth"
            headlineValue={`${formatEngineeringNumber(
              result.downstreamDepth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Sequent Depth Ratio"
              value={formatEngineeringNumber(
                result.sequentDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
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
              label="Energy Loss"
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
              label="Upstream Momentum Function"
              value={formatEngineeringNumber(
                result.upstreamMomentumFunction,
              )}
              unit="m³"
            />

            <ResultItem
              label="Downstream Momentum Function"
              value={formatEngineeringNumber(
                result.downstreamMomentumFunction,
              )}
              unit="m³"
            />

            <ResultItem
              label="Momentum Closure Residual"
              value={formatEngineeringNumber(
                result.momentumClosureResidual,
              )}
              unit="m³"
            />

            <ResultItem
              label="Relative Momentum Residual"
              value={formatEngineeringNumber(
                result.relativeMomentumClosureResidual,
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
