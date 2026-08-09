import {
  useState,
} from 'react'

import {
  PositiveDisplacementFlowMeterError,
  calculatePositiveDisplacementFlowMeter,
  createPositiveDisplacementFlowMeterCsv,
} from './engine'

import type {
  PositiveDisplacementFlowMeterInput,
  PositiveDisplacementFlowMeterResult,
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
    '0.05',

  displacementPerCycle:
    '0.000025',

  rotationalSpeedRpm:
    '1200',

  volumetricEfficiency:
    '0.98',

  fluidDensity:
    '850',

  dynamicViscosity:
    '0.01',
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
      'displacementPerCycle',

    label:
      'Meter Displacement per Cycle',

    symbol:
      'Vd',

    unit:
      'm³/cycle',
  },
  {
    key:
      'rotationalSpeedRpm',

    label:
      'Meter Rotational Speed',

    symbol:
      'N',

    unit:
      'rpm',
  },
  {
    key:
      'volumetricEfficiency',

    label:
      'Volumetric Efficiency',

    symbol:
      'ηv',

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

export function PositiveDisplacementFlowMeterCalculator() {
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
      PositiveDisplacementFlowMeterResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PositiveDisplacementFlowMeterInput | null
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
    PositiveDisplacementFlowMeterInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      displacementPerCycle:
        Number(
          form.displacementPerCycle,
        ),

      rotationalSpeedRpm:
        Number(
          form.rotationalSpeedRpm,
        ),

      volumetricEfficiency:
        Number(
          form.volumetricEfficiency,
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
        calculatePositiveDisplacementFlowMeter(
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
          PositiveDisplacementFlowMeterError
          ? error.message
          : 'The positive-displacement flow calculation could not be completed.',
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
      createPositiveDisplacementFlowMeterCsv(
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
      'positive-displacement-flow-meter.csv'

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
        code="FM–33"
        icon="≈"
        title="Positive-Displacement Flow Meter"
        subtitle="Calculate actual volumetric flow, meter slip and mass flow from displacement per cycle and meter speed"
      />

      <ReferenceBasis>
        Calculator 416 models a
        positive-displacement meter from its
        calibrated volume per complete cycle.
        Ideal flow is corrected by volumetric
        efficiency to account for internal slip,
        then converted to mass flow and pipe
        velocity.
      </ReferenceBasis>

      <div className="native-formula">
        Qideal = Vd N/60
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q = ηv Qideal
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
        calculateLabel="Calculate meter flow"
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
            headlineLabel="Actual volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRateCubicMetersPerHour,
            )} m³/h`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Cycle Frequency"
              value={formatEngineeringNumber(
                result.cycleFrequency,
              )}
              unit="1/s"
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
              label="Actual Volumetric Flow"
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
              label="Slip Flow Rate"
              value={formatEngineeringNumber(
                result.slipVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Slip Percentage"
              value={formatEngineeringNumber(
                result.slipPercentage,
              )}
              unit="%"
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
              label="Recovered Displacement"
              value={formatEngineeringNumber(
                result.recoveredDisplacementPerCycle,
              )}
              unit="m³/cycle"
            />

            <ResultItem
              label="Displacement Closure Residual"
              value={formatEngineeringNumber(
                result.displacementClosureResidual,
              )}
              unit="m³/cycle"
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
