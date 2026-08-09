import {
  useState,
} from 'react'

import {
  PitotTubeVelocityFlowError,
  calculatePitotTubeVelocityFlow,
  createPitotTubeVelocityFlowCsv,
} from './engine'

import type {
  PitotTubeVelocityFlowInput,
  PitotTubeVelocityFlowResult,
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
  pipeDiameter:
    '0.10',

  differentialPressure:
    '5000',

  fluidDensity:
    '998',

  dynamicViscosity:
    '0.001',

  pitotCoefficient:
    '0.98',
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
      'pipeDiameter',

    label:
      'Internal Pipe Diameter',

    symbol:
      'D',

    unit:
      'm',
  },
  {
    key:
      'differentialPressure',

    label:
      'Stagnation–Static Pressure Difference',

    symbol:
      'ΔP',

    unit:
      'Pa',
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
  {
    key:
      'dynamicViscosity',

    label:
      'Dynamic Viscosity',

    symbol:
      'μ',

    unit:
      'Pa·s',
  },
  {
    key:
      'pitotCoefficient',

    label:
      'Pitot Coefficient',

    symbol:
      'Cp',

    unit:
      '-',
  },
]

export function PitotTubeVelocityFlowCalculator() {
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
      PitotTubeVelocityFlowResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PitotTubeVelocityFlowInput | null
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
    PitotTubeVelocityFlowInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      differentialPressure:
        Number(
          form.differentialPressure,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),

      dynamicViscosity:
        Number(
          form.dynamicViscosity,
        ),

      pitotCoefficient:
        Number(
          form.pitotCoefficient,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePitotTubeVelocityFlow(
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
          PitotTubeVelocityFlowError
          ? error.message
          : 'The Pitot-tube calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setForm(
      exampleForm,
    )

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
      createPitotTubeVelocityFlowCsv(
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
      'pitot-tube-velocity-flow.csv'

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
        code="FM–27"
        icon="≈"
        title="Pitot Tube Velocity & Volumetric Flow"
        subtitle="Convert stagnation-to-static pressure difference into fluid velocity and pipe flow rate"
      />

      <ReferenceBasis>
        Calculator 410 applies the
        incompressible Pitot/Bernoulli relation.
        The measured stagnation-to-static
        pressure difference gives ideal local
        velocity, which is corrected using the
        supplied Pitot coefficient and converted
        to volumetric and mass flow rates.
      </ReferenceBasis>

      <div className="native-formula">
        v = Cp √(2ΔP/ρ)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q = (πD²/4)v
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
        calculateLabel="Calculate Pitot flow"
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
            headlineLabel="Corrected fluid velocity"
            headlineValue={`${formatEngineeringNumber(
              result.correctedVelocity,
            )} m/s`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Ideal Pitot Velocity"
              value={formatEngineeringNumber(
                result.idealVelocity,
              )}
              unit="m/s"
            />

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
                result.volumetricFlowRateCubicMetersPerHour,
              )}
              unit="m³/h"
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
              label="Reynolds Number"
              value={formatEngineeringNumber(
                result.reynoldsNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Measured Velocity Head"
              value={formatEngineeringNumber(
                result.measuredVelocityHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Corrected Dynamic Pressure"
              value={formatEngineeringNumber(
                result.correctedDynamicPressure,
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
