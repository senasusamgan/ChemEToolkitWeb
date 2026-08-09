import {
  useState,
} from 'react'

import {
  FlowNozzleDifferentialPressureError,
  calculateFlowNozzleDifferentialPressure,
  createFlowNozzleDifferentialPressureCsv,
} from './engine'

import type {
  FlowNozzleDifferentialPressureInput,
  FlowNozzleDifferentialPressureResult,
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

  nozzleDiameter:
    '0.05',

  differentialPressure:
    '12000',

  fluidDensity:
    '998',

  dynamicViscosity:
    '0.001',

  dischargeCoefficient:
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
      'Upstream Pipe Diameter',

    symbol:
      'D',

    unit:
      'm',
  },
  {
    key:
      'nozzleDiameter',

    label:
      'Flow-Nozzle Throat Diameter',

    symbol:
      'd',

    unit:
      'm',
  },
  {
    key:
      'differentialPressure',

    label:
      'Measured Differential Pressure',

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
      'dischargeCoefficient',

    label:
      'Discharge Coefficient',

    symbol:
      'Cd',

    unit:
      '-',
  },
]

export function FlowNozzleDifferentialPressureCalculator() {
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
      FlowNozzleDifferentialPressureResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      FlowNozzleDifferentialPressureInput | null
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
    FlowNozzleDifferentialPressureInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      nozzleDiameter:
        Number(
          form.nozzleDiameter,
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

      dischargeCoefficient:
        Number(
          form.dischargeCoefficient,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateFlowNozzleDifferentialPressure(
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
          FlowNozzleDifferentialPressureError
          ? error.message
          : 'The flow-nozzle calculation could not be completed.',
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
      createFlowNozzleDifferentialPressureCsv(
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
      'flow-nozzle-differential-pressure.csv'

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
        code="FM–28"
        icon="≈"
        title="Flow Nozzle Differential-Pressure Meter"
        subtitle="Determine volumetric and mass flow rate from a flow-nozzle differential-pressure measurement"
      />

      <ReferenceBasis>
        Calculator 411 uses the standard
        incompressible differential-pressure
        flow-meter relation for a flow nozzle.
        The nozzle beta ratio and measured
        pressure difference determine the ideal
        flow, which is corrected using the
        supplied discharge coefficient.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        Cd At √[
        2ΔP /
        ρ(1 − β⁴)
        ]
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
        calculateLabel="Calculate nozzle flow"
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
              label="Beta Ratio"
              value={formatEngineeringNumber(
                result.betaRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Ideal Volumetric Flow"
              value={formatEngineeringNumber(
                result.idealVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Actual Volumetric Flow"
              value={formatEngineeringNumber(
                result.volumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Volumetric Flow"
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
              label="Pipe Velocity"
              value={formatEngineeringNumber(
                result.pipeVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Nozzle Velocity"
              value={formatEngineeringNumber(
                result.nozzleVelocity,
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
              label="Flow Regime"
              value={result.flowRegime}
              unit=""
            />

            <ResultItem
              label="Differential-Pressure Head"
              value={formatEngineeringNumber(
                result.differentialPressureHead,
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
