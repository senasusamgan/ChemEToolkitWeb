import {
  useState,
} from 'react'

import {
  MaximumMinorLossCoefficientError,
  PipeHydraulicsCoreError,
  calculateMaximumMinorLossCoefficient,
  createMaximumMinorLossCoefficientCsv,
} from './engine'

import type {
  MaximumMinorLossCoefficientInput,
  MaximumMinorLossCoefficientResult,
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
  diameter: '0.08',
  volumetricFlowRate: '0.01',
  pipeLength: '100',

  fluidDensity: '998',
  dynamicViscosity: '0.001',

  absoluteRoughness: '0.000045',

  availablePressureDrop: '100000',
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
    key: 'diameter',
    label: 'Internal Pipe Diameter',
    symbol: 'D',
    unit: 'm',
  },
  {
    key: 'volumetricFlowRate',
    label: 'Volumetric Flow Rate',
    symbol: 'Q',
    unit: 'm³/s',
  },
  {
    key: 'pipeLength',
    label: 'Straight Pipe Length',
    symbol: 'L',
    unit: 'm',
  },
  {
    key: 'fluidDensity',
    label: 'Fluid Density',
    symbol: 'ρ',
    unit: 'kg/m³',
  },
  {
    key: 'dynamicViscosity',
    label: 'Dynamic Viscosity',
    symbol: 'μ',
    unit: 'Pa·s',
  },
  {
    key: 'absoluteRoughness',
    label: 'Absolute Roughness',
    symbol: 'ε',
    unit: 'm',
  },
  {
    key: 'availablePressureDrop',
    label: 'Available Pressure Drop',
    symbol: 'ΔPavailable',
    unit: 'Pa',
  },
]

export function MaximumMinorLossCoefficientCalculator() {
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
      MaximumMinorLossCoefficientResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MaximumMinorLossCoefficientInput | null
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
          [field]: value,
        }),
      )
    }
  }

  function currentInput():
    MaximumMinorLossCoefficientInput {
    return {
      diameter:
        Number(
          form.diameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      pipeLength:
        Number(
          form.pipeLength,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),

      dynamicViscosity:
        Number(
          form.dynamicViscosity,
        ),

      absoluteRoughness:
        Number(
          form.absoluteRoughness,
        ),

      availablePressureDrop:
        Number(
          form.availablePressureDrop,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateMaximumMinorLossCoefficient(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage(
        '',
      )
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          MaximumMinorLossCoefficientError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The maximum minor-loss coefficient could not be calculated.',
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

    setErrorMessage(
      '',
    )
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

    setErrorMessage(
      '',
    )
  }

  function exportCsv() {
    if (
      !result ||
      !calculatedInput
    ) {
      return
    }

    const csv =
      createMaximumMinorLossCoefficientCsv(
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
      'maximum-minor-loss-coefficient.csv'

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
        code="FM–21"
        icon="≈"
        title="Maximum Minor-Loss Coefficient / Fittings Budget"
        subtitle="Determine allowable total fitting and valve loss coefficient from a pipe-system pressure budget"
      />

      <ReferenceBasis>
        Calculator 404 reuses the shared
        Darcy–Weisbach hydraulic core.
        Distributed straight-pipe friction is
        calculated first. The remaining
        pressure-drop budget is converted into
        the maximum allowable lumped ΣK for
        valves, elbows, tees, entrances,
        exits and other local losses.
      </ReferenceBasis>

      <div className="native-formula">
        ΣKmax =
        ΔPavailable/(ρv²/2)
        − fL/D
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
        calculateLabel="Calculate fittings budget"
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
            headlineLabel="Maximum allowable ΣK"
            headlineValue={formatEngineeringNumber(
              result.maximumMinorLossCoefficient,
            )}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Mean Velocity"
              value={formatEngineeringNumber(
                result.velocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Reynolds Number"
              value={formatEngineeringNumber(
                result.reynoldsNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Darcy Friction Factor"
              value={formatEngineeringNumber(
                result.frictionFactor,
              )}
              unit="-"
            />

            <ResultItem
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Straight-Pipe Friction Loss"
              value={formatEngineeringNumber(
                result.frictionPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Pressure Available for Minor Losses"
              value={formatEngineeringNumber(
                result.pressureDropAvailableForMinorLosses,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Allowable Minor-Loss Pressure Drop"
              value={formatEngineeringNumber(
                result.minorPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Friction Budget"
              value={formatEngineeringNumber(
                result.frictionBudgetPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Minor-Loss Budget"
              value={formatEngineeringNumber(
                result.minorLossBudgetPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Total Pressure Drop"
              value={formatEngineeringNumber(
                result.totalPressureDrop,
              )}
              unit="Pa"
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
