import {
  useState,
} from 'react'

import {
  ElectromagneticFlowMeterError,
  calculateElectromagneticFlowMeter,
  createElectromagneticFlowMeterCsv,
} from './engine'

import type {
  ElectromagneticFlowMeterInput,
  ElectromagneticFlowMeterResult,
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

  electrodeSpacing:
    '0.10',

  magneticFluxDensity:
    '0.20',

  inducedVoltageMillivolts:
    '40',

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
      'electrodeSpacing',

    label:
      'Electrode Spacing',

    symbol:
      'L',

    unit:
      'm',
  },
  {
    key:
      'magneticFluxDensity',

    label:
      'Magnetic Flux Density',

    symbol:
      'B',

    unit:
      'T',
  },
  {
    key:
      'inducedVoltageMillivolts',

    label:
      'Measured Induced Voltage',

    symbol:
      'E',

    unit:
      'mV',
  },
  {
    key:
      'calibrationFactor',

    label:
      'Meter Calibration Factor',

    symbol:
      'K',

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

export function ElectromagneticFlowMeterCalculator() {
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
      ElectromagneticFlowMeterResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      ElectromagneticFlowMeterInput | null
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
    ElectromagneticFlowMeterInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      electrodeSpacing:
        Number(
          form.electrodeSpacing,
        ),

      magneticFluxDensity:
        Number(
          form.magneticFluxDensity,
        ),

      inducedVoltageMillivolts:
        Number(
          form.inducedVoltageMillivolts,
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
        calculateElectromagneticFlowMeter(
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
          ElectromagneticFlowMeterError
          ? error.message
          : 'The electromagnetic flow calculation could not be completed.',
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
      createElectromagneticFlowMeterCsv(
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
      'electromagnetic-flow-meter.csv'

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
        code="FM–32"
        icon="≈"
        title="Electromagnetic Flow Meter"
        subtitle="Convert Faraday-law induced voltage into fluid velocity, volumetric flow and mass flow"
      />

      <ReferenceBasis>
        Calculator 415 applies Faraday&apos;s
        law to a conductive fluid moving
        through a magnetic field. The measured
        electrode voltage is converted into
        mean velocity through the magnetic
        field strength, electrode spacing and
        meter calibration factor.
      </ReferenceBasis>

      <div className="native-formula">
        E = KBLv
        &nbsp;&nbsp;→&nbsp;&nbsp;
        v = E/(KBL)
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
        calculateLabel="Calculate magnetic flow"
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
              label="Dynamic Pressure"
              value={formatEngineeringNumber(
                result.dynamicPressure,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Reconstructed Voltage"
              value={formatEngineeringNumber(
                result.reconstructedVoltageMillivolts,
              )}
              unit="mV"
            />

            <ResultItem
              label="Voltage Closure Residual"
              value={formatEngineeringNumber(
                result.voltageClosureResidual,
              )}
              unit="V"
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
