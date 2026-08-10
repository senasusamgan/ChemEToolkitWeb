import {
  useState,
} from 'react'

import {
  TurbineFlowMeterError,
  calculateTurbineFlowMeter,
  createTurbineFlowMeterCsv,
} from './engine'

import type {
  TurbineFlowMeterInput,
  TurbineFlowMeterResult,
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
    '0.08',

  pulseFrequency:
    '250',

  meterKFactor:
    '50000',

  calibrationFactor:
    '1',

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
      'pulseFrequency',

    label:
      'Measured Pulse Frequency',

    symbol:
      'f',

    unit:
      'Hz',
  },
  {
    key:
      'meterKFactor',

    label:
      'Meter K-Factor',

    symbol:
      'K',

    unit:
      'pulses/m³',
  },
  {
    key:
      'calibrationFactor',

    label:
      'Calibration Correction Factor',

    symbol:
      'Ccal',

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

export function TurbineFlowMeterCalculator() {
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
      TurbineFlowMeterResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TurbineFlowMeterInput | null
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
    TurbineFlowMeterInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      pulseFrequency:
        Number(
          form.pulseFrequency,
        ),

      meterKFactor:
        Number(
          form.meterKFactor,
        ),

      calibrationFactor:
        Number(
          form.calibrationFactor,
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
        calculateTurbineFlowMeter(
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
          TurbineFlowMeterError
          ? error.message
          : 'The turbine flow-meter calculation could not be completed.',
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
      createTurbineFlowMeterCsv(
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
      'turbine-flow-meter.csv'

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
        code="FM–34"
        icon="≈"
        title="Turbine Flow Meter"
        subtitle="Convert turbine pulse frequency and meter K-factor into volumetric flow, mass flow and pipe velocity"
      />

      <ReferenceBasis>
        Calculator 417 converts the measured
        turbine pulse frequency using a
        calibrated K-factor expressed as pulses
        per unit volume. An optional correction
        factor can account for a known
        calibration bias.
      </ReferenceBasis>

      <div className="native-formula">
        Qraw = f/K
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q = Ccal Qraw
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
        calculateLabel="Calculate turbine flow"
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
            headlineLabel="Corrected volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRateCubicMetersPerHour,
            )} m³/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Raw Volumetric Flow"
              value={formatEngineeringNumber(
                result.rawVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Corrected Volumetric Flow"
              value={formatEngineeringNumber(
                result.volumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Corrected Volumetric Flow"
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
              label="Pipe Fluid Velocity"
              value={formatEngineeringNumber(
                result.fluidVelocity,
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
              label="Pulse Period"
              value={formatEngineeringNumber(
                result.pulsePeriod,
              )}
              unit="s"
            />

            <ResultItem
              label="Pulses per Minute"
              value={formatEngineeringNumber(
                result.pulsesPerMinute,
              )}
              unit="pulses/min"
            />

            <ResultItem
              label="Reconstructed Pulse Frequency"
              value={formatEngineeringNumber(
                result.reconstructedPulseFrequency,
              )}
              unit="Hz"
            />

            <ResultItem
              label="Frequency Closure Residual"
              value={formatEngineeringNumber(
                result.frequencyClosureResidual,
              )}
              unit="Hz"
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
