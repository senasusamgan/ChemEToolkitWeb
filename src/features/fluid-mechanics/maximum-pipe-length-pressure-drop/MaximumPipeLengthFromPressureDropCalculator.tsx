import {
  useState,
} from 'react'

import {
  MaximumPipeLengthFromPressureDropError,
  PipeHydraulicsCoreError,
  calculateMaximumPipeLengthFromPressureDrop,
  createMaximumPipeLengthFromPressureDropCsv,
} from './engine'

import type {
  MaximumPipeLengthFromPressureDropInput,
  MaximumPipeLengthFromPressureDropResult,
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

  fluidDensity: '998',
  dynamicViscosity: '0.001',

  absoluteRoughness: '0.000045',
  minorLossCoefficient: '5',

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
    key: 'minorLossCoefficient',
    label: 'Total Minor-Loss Coefficient',
    symbol: 'ΣK',
    unit: '-',
  },
  {
    key: 'availablePressureDrop',
    label: 'Available Pressure Drop',
    symbol: 'ΔPavailable',
    unit: 'Pa',
  },
]

export function MaximumPipeLengthFromPressureDropCalculator() {
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
      MaximumPipeLengthFromPressureDropResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      MaximumPipeLengthFromPressureDropInput | null
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
    MaximumPipeLengthFromPressureDropInput {
    return {
      diameter:
        Number(
          form.diameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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

      minorLossCoefficient:
        Number(
          form.minorLossCoefficient,
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
        calculateMaximumPipeLengthFromPressureDrop(
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
          MaximumPipeLengthFromPressureDropError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The maximum allowable pipe length could not be calculated.',
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
      createMaximumPipeLengthFromPressureDropCsv(
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
      'maximum-pipe-length-pressure-drop.csv'

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
        code="FM–20"
        icon="≈"
        title="Maximum Pipe Length from Pressure-Drop Budget"
        subtitle="Solve allowable straight-pipe length for a fixed diameter, flow rate and pressure-loss budget"
      />

      <ReferenceBasis>
        Calculator 403 reuses the shared
        pipe-hydraulics core from Calculators
        401 and 402. With diameter and flow
        fixed, Reynolds number and friction
        factor are independent of pipe length,
        so the maximum length is solved
        directly without an iterative root
        finder.
      </ReferenceBasis>

      <div className="native-formula">
        Lmax =
        D/f ·
        [ΔPavailable/(ρv²/2) − ΣK]
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
        calculateLabel="Calculate maximum pipe length"
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
            headlineLabel="Maximum allowable pipe length"
            headlineValue={`${formatEngineeringNumber(
              result.maximumPipeLength,
            )} m`}
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
              label="Friction Loss Gradient"
              value={formatEngineeringNumber(
                result.frictionPressureDropPerUnitLength,
              )}
              unit="Pa/m"
            />

            <ResultItem
              label="Minor-Loss Pressure Drop"
              value={formatEngineeringNumber(
                result.minorPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Pressure Available for Pipe Friction"
              value={formatEngineeringNumber(
                result.pressureAvailableForPipeFriction,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Minor-Loss Budget Fraction"
              value={formatEngineeringNumber(
                result.minorLossBudgetFraction *
                100,
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

            <ResultItem
              label="Total Head Loss"
              value={formatEngineeringNumber(
                result.totalHeadLoss,
              )}
              unit="m"
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
