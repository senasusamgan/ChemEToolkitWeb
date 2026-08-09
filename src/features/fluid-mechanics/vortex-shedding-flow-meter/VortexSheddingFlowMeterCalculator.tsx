import {
  useState,
} from 'react'

import {
  VortexSheddingFlowMeterError,
  calculateVortexSheddingFlowMeter,
  createVortexSheddingFlowMeterCsv,
} from './engine'

import type {
  VortexSheddingFlowMeterInput,
  VortexSheddingFlowMeterResult,
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

  bluffBodyWidth:
    '0.02',

  sheddingFrequency:
    '20',

  strouhalNumber:
    '0.20',

  fluidDensity:
    '998',

  dynamicViscosity:
    '0.001',
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
      'bluffBodyWidth',

    label:
      'Bluff-Body Characteristic Width',

    symbol:
      'd',

    unit:
      'm',
  },
  {
    key:
      'sheddingFrequency',

    label:
      'Measured Vortex Frequency',

    symbol:
      'f',

    unit:
      'Hz',
  },
  {
    key:
      'strouhalNumber',

    label:
      'Strouhal Number',

    symbol:
      'St',

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
]

export function VortexSheddingFlowMeterCalculator() {
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
      VortexSheddingFlowMeterResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      VortexSheddingFlowMeterInput | null
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
    VortexSheddingFlowMeterInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      bluffBodyWidth:
        Number(
          form.bluffBodyWidth,
        ),

      sheddingFrequency:
        Number(
          form.sheddingFrequency,
        ),

      strouhalNumber:
        Number(
          form.strouhalNumber,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),

      dynamicViscosity:
        Number(
          form.dynamicViscosity,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateVortexSheddingFlowMeter(
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
          VortexSheddingFlowMeterError
          ? error.message
          : 'The vortex-shedding flow calculation could not be completed.',
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
      createVortexSheddingFlowMeterCsv(
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
      'vortex-shedding-flow-meter.csv'

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
        code="FM–30"
        icon="≈"
        title="Vortex Shedding Flow Meter"
        subtitle="Convert measured vortex frequency into fluid velocity, volumetric flow and mass flow"
      />

      <ReferenceBasis>
        Calculator 413 uses the Strouhal
        relationship for a bluff-body vortex
        flow meter. The measured shedding
        frequency and characteristic bluff-body
        width determine velocity, which is then
        converted to pipe volumetric and mass
        flow rates.
      </ReferenceBasis>

      <div className="native-formula">
        St = fd/v
        &nbsp;&nbsp;→&nbsp;&nbsp;
        v = fd/St
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q = Av
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
        calculateLabel="Calculate vortex flow"
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
            headlineLabel="Volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRateCubicMetersPerHour,
            )} m³/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Fluid Velocity"
              value={formatEngineeringNumber(
                result.fluidVelocity,
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
              label="Vortex Shedding Period"
              value={formatEngineeringNumber(
                result.vortexSheddingPeriod,
              )}
              unit="s"
            />

            <ResultItem
              label="Vortex Spacing"
              value={formatEngineeringNumber(
                result.vortexSpacing,
              )}
              unit="m"
            />

            <ResultItem
              label="Dynamic Pressure"
              value={formatEngineeringNumber(
                result.dynamicPressure,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Recovered Strouhal Number"
              value={formatEngineeringNumber(
                result.recoveredStrouhalNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Strouhal Closure Residual"
              value={formatEngineeringNumber(
                result.strouhalResidual,
              )}
              unit="-"
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
