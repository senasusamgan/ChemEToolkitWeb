import {
  useState,
} from 'react'

import {
  UltrasonicTransitTimeFlowMeterError,
  calculateUltrasonicTransitTimeFlowMeter,
  createUltrasonicTransitTimeFlowMeterCsv,
} from './engine'

import type {
  UltrasonicTransitTimeFlowMeterInput,
  UltrasonicTransitTimeFlowMeterResult,
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

  acousticPathLength:
    '0.20',

  acousticPathAngleDegrees:
    '45',

  downstreamTransitTimeMicroseconds:
    '134.974',

  upstreamTransitTimeMicroseconds:
    '135.297',

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
      'acousticPathLength',

    label:
      'Acoustic Path Length',

    symbol:
      'L',

    unit:
      'm',
  },
  {
    key:
      'acousticPathAngleDegrees',

    label:
      'Path Angle to Pipe Axis',

    symbol:
      'θ',

    unit:
      'deg',
  },
  {
    key:
      'downstreamTransitTimeMicroseconds',

    label:
      'Downstream Transit Time',

    symbol:
      'tdown',

    unit:
      'μs',
  },
  {
    key:
      'upstreamTransitTimeMicroseconds',

    label:
      'Upstream Transit Time',

    symbol:
      'tup',

    unit:
      'μs',
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

export function UltrasonicTransitTimeFlowMeterCalculator() {
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
      UltrasonicTransitTimeFlowMeterResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      UltrasonicTransitTimeFlowMeterInput | null
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
    UltrasonicTransitTimeFlowMeterInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      acousticPathLength:
        Number(
          form.acousticPathLength,
        ),

      acousticPathAngleDegrees:
        Number(
          form.acousticPathAngleDegrees,
        ),

      downstreamTransitTimeMicroseconds:
        Number(
          form.downstreamTransitTimeMicroseconds,
        ),

      upstreamTransitTimeMicroseconds:
        Number(
          form.upstreamTransitTimeMicroseconds,
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
        calculateUltrasonicTransitTimeFlowMeter(
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
          UltrasonicTransitTimeFlowMeterError
          ? error.message
          : 'The ultrasonic transit-time calculation could not be completed.',
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
      createUltrasonicTransitTimeFlowMeterCsv(
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
      'ultrasonic-transit-time-flow-meter.csv'

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
        code="FM–31"
        icon="≈"
        title="Ultrasonic Transit-Time Flow Meter"
        subtitle="Determine fluid velocity and flow rate from upstream and downstream ultrasonic transit times"
      />

      <ReferenceBasis>
        Calculator 414 uses the exact
        reciprocal transit-time relation for a
        single acoustic path. The difference
        between downstream and upstream
        propagation rates determines the axial
        fluid velocity, while their average
        recovers the acoustic velocity.
      </ReferenceBasis>

      <div className="native-formula">
        v =
        L/[2 cos(θ)]
        ·
        (1/tdown − 1/tup)
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
        calculateLabel="Calculate ultrasonic flow"
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
              label="Axial Fluid Velocity"
              value={formatEngineeringNumber(
                result.axialVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Acoustic-Path Velocity Component"
              value={formatEngineeringNumber(
                result.acousticPathVelocityComponent,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Recovered Acoustic Velocity"
              value={formatEngineeringNumber(
                result.acousticVelocity,
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
              label="Transit-Time Difference"
              value={formatEngineeringNumber(
                result.transitTimeDifference *
                1e6,
              )}
              unit="μs"
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
              label="Flow Mach Number"
              value={formatEngineeringNumber(
                result.flowMachNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Downstream Closure Residual"
              value={formatEngineeringNumber(
                result.downstreamClosureResidual,
              )}
              unit="s"
            />

            <ResultItem
              label="Upstream Closure Residual"
              value={formatEngineeringNumber(
                result.upstreamClosureResidual,
              )}
              unit="s"
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
