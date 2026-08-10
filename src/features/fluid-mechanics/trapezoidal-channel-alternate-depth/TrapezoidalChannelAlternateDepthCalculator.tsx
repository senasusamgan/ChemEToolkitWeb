import {
  useState,
} from 'react'

import {
  TrapezoidalChannelAlternateDepthError,
  calculateTrapezoidalChannelAlternateDepth,
  createTrapezoidalChannelAlternateDepthCsv,
} from './engine'

import type {
  TrapezoidalChannelAlternateDepthInput,
  TrapezoidalChannelAlternateDepthResult,
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

  specificEnergy:
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
      'specificEnergy',

    label:
      'Specific Energy',

    symbol:
      'E',

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

export function TrapezoidalChannelAlternateDepthCalculator() {
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
      TrapezoidalChannelAlternateDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelAlternateDepthInput | null
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
    TrapezoidalChannelAlternateDepthInput {
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

      specificEnergy:
        Number(
          form.specificEnergy,
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
        calculateTrapezoidalChannelAlternateDepth(
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
          TrapezoidalChannelAlternateDepthError
          ? error.message
          : 'The trapezoidal alternate-depth calculation could not be completed.',
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
      createTrapezoidalChannelAlternateDepthCsv(
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
      'trapezoidal-channel-alternate-depth.csv'

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
        code="FM–45"
        icon="≈"
        title="Trapezoidal Channel Alternate Depths"
        subtitle="Solve the supercritical and subcritical depths corresponding to one specific-energy level"
      />

      <ReferenceBasis>
        Calculator 428 generalizes alternate
        depth analysis to a symmetric
        trapezoidal channel. The critical depth
        separates a shallow supercritical root
        from a deep subcritical root at the
        same discharge and specific energy.
      </ReferenceBasis>

      <div className="native-formula">
        E =
        y +
        Q² /
        [2gA(y)²]
        &nbsp;&nbsp;·&nbsp;&nbsp;
        A =
        y(b + zy)
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
        calculateLabel="Solve alternate depths"
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
            headlineLabel="Alternate flow depths"
            headlineValue={`${formatEngineeringNumber(
              result.shallowDepth,
            )} m / ${formatEngineeringNumber(
              result.deepDepth,
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
              label="Minimum Specific Energy"
              value={formatEngineeringNumber(
                result.minimumSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Above Minimum"
              value={formatEngineeringNumber(
                result.energyAboveMinimum,
              )}
              unit="m"
            />

            <ResultItem
              label="Alternate Depth Ratio"
              value={formatEngineeringNumber(
                result.alternateDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Flow Area"
              value={formatEngineeringNumber(
                result.shallowFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Deep Flow Area"
              value={formatEngineeringNumber(
                result.deepFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Shallow Velocity"
              value={formatEngineeringNumber(
                result.shallowVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Deep Velocity"
              value={formatEngineeringNumber(
                result.deepVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Shallow Froude Number"
              value={formatEngineeringNumber(
                result.shallowFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Deep Froude Number"
              value={formatEngineeringNumber(
                result.deepFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Shallow Energy Residual"
              value={formatEngineeringNumber(
                result.shallowEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Deep Energy Residual"
              value={formatEngineeringNumber(
                result.deepEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Shallow Momentum Function"
              value={formatEngineeringNumber(
                result.shallowMomentumFunction,
              )}
              unit="m³"
            />

            <ResultItem
              label="Deep Momentum Function"
              value={formatEngineeringNumber(
                result.deepMomentumFunction,
              )}
              unit="m³"
            />

            <ResultItem
              label="Momentum Function Difference"
              value={formatEngineeringNumber(
                result.momentumFunctionDifference,
              )}
              unit="m³"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Shallow Solver Iterations"
              value={String(
                result.shallowSolverIterations,
              )}
              unit=""
            />

            <ResultItem
              label="Deep Solver Iterations"
              value={String(
                result.deepSolverIterations,
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
