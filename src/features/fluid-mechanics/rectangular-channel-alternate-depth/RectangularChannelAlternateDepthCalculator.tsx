import {
  useState,
} from 'react'

import {
  RectangularChannelAlternateDepthError,
  calculateRectangularChannelAlternateDepth,
  createRectangularChannelAlternateDepthCsv,
} from './engine'

import type {
  RectangularChannelAlternateDepthInput,
  RectangularChannelAlternateDepthResult,
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

  volumetricFlowRate:
    '4',

  specificEnergy:
    '1.5',

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

export function RectangularChannelAlternateDepthCalculator() {
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
      RectangularChannelAlternateDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      RectangularChannelAlternateDepthInput | null
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
    RectangularChannelAlternateDepthInput {
    return {
      channelWidth:
        Number(
          form.channelWidth,
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
        calculateRectangularChannelAlternateDepth(
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
          RectangularChannelAlternateDepthError
          ? error.message
          : 'The alternate-depth calculation could not be completed.',
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
      createRectangularChannelAlternateDepthCsv(
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
      'rectangular-channel-alternate-depth.csv'

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
        code="FM–41"
        icon="≈"
        title="Rectangular Channel Alternate Depths"
        subtitle="Solve the shallow supercritical and deep subcritical depths corresponding to one specific-energy level"
      />

      <ReferenceBasis>
        Calculator 424 solves the rectangular
        open-channel specific-energy equation
        on both sides of the critical depth.
        When E exceeds Emin, two distinct
        depths carry the same discharge at the
        same specific energy.
      </ReferenceBasis>

      <div className="native-formula">
        E =
        y +
        q²/(2gy²)
        &nbsp;&nbsp;→&nbsp;&nbsp;
        y
        <sub>shallow</sub>
        ,
        y
        <sub>deep</sub>
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
            headlineLabel="Alternate depths"
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
              label="Shallow Alternate Depth"
              value={formatEngineeringNumber(
                result.shallowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Deep Alternate Depth"
              value={formatEngineeringNumber(
                result.deepDepth,
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
              label="Momentum Function Difference"
              value={formatEngineeringNumber(
                result.momentumFunctionDifference,
              )}
              unit="m²"
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
