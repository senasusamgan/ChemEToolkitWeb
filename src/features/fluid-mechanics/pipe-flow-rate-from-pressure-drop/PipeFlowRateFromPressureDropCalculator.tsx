import {
  useState,
} from 'react'

import {
  PipeFlowRateFromPressureDropError,
  PipeHydraulicsCoreError,
  calculatePipeFlowRateFromPressureDrop,
  createPipeFlowRateFromPressureDropCsv,
} from './engine'

import type {
  PipeFlowRateFromPressureDropInput,
  PipeFlowRateFromPressureDropResult,
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
  pipeLength: '100',

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
    key: 'pipeLength',
    label: 'Pipe Length',
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

export function PipeFlowRateFromPressureDropCalculator() {
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
      PipeFlowRateFromPressureDropResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PipeFlowRateFromPressureDropInput | null
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
    PipeFlowRateFromPressureDropInput {
    return {
      diameter:
        Number(
          form.diameter,
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
        calculatePipeFlowRateFromPressureDrop(
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
          PipeFlowRateFromPressureDropError ||
        error instanceof
          PipeHydraulicsCoreError
          ? error.message
          : 'The available pipe flow rate could not be solved.',
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
      createPipeFlowRateFromPressureDropCsv(
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
      'pipe-flow-rate-from-pressure-drop.csv'

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
        code="FM–19"
        icon="≈"
        title="Pipe Flow Rate from Available Pressure Drop"
        subtitle="Solve maximum steady flow through a specified pipe from the available pressure-drop budget"
      />

      <ReferenceBasis>
        Calculator 402 uses the shared
        Darcy–Weisbach pipe-hydraulics core
        introduced with Calculator 401.
        Flow rate is varied until calculated
        major plus minor pressure loss matches
        the specified available pressure drop.
      </ReferenceBasis>

      <div className="native-formula">
        Solve Q such that
        ΔPavailable =
        (f L/D + ΣK) ρv²/2
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
        calculateLabel="Solve available flow rate"
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
            headlineLabel="Available volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRateCubicMetersPerHour,
            )} m³/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Volumetric Flow Rate"
              value={formatEngineeringNumber(
                result.volumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Volumetric Flow Rate"
              value={formatEngineeringNumber(
                result.volumetricFlowRateLitersPerSecond,
              )}
              unit="L/s"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

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
              label="Friction Pressure Drop"
              value={formatEngineeringNumber(
                result.frictionPressureDrop,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Minor-Loss Pressure Drop"
              value={formatEngineeringNumber(
                result.minorPressureDrop,
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
