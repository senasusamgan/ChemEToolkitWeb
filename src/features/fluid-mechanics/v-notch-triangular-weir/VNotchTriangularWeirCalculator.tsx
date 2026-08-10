import {
  useState,
} from 'react'

import {
  VNotchTriangularWeirError,
  calculateVNotchTriangularWeir,
  createVNotchTriangularWeirCsv,
} from './engine'

import type {
  VNotchTriangularWeirInput,
  VNotchTriangularWeirResult,
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
  notchAngleDegrees:
    '90',

  headOverVertex:
    '0.25',

  dischargeCoefficient:
    '0.62',

  fluidDensity:
    '998',
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
      'notchAngleDegrees',

    label:
      'V-Notch Included Angle',

    symbol:
      'θ',

    unit:
      'deg',
  },
  {
    key:
      'headOverVertex',

    label:
      'Head Above Notch Vertex',

    symbol:
      'H',

    unit:
      'm',
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
]

export function VNotchTriangularWeirCalculator() {
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
      VNotchTriangularWeirResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      VNotchTriangularWeirInput | null
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
    VNotchTriangularWeirInput {
    return {
      notchAngleDegrees:
        Number(
          form.notchAngleDegrees,
        ),

      headOverVertex:
        Number(
          form.headOverVertex,
        ),

      dischargeCoefficient:
        Number(
          form.dischargeCoefficient,
        ),

      fluidDensity:
        Number(
          form.fluidDensity,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateVNotchTriangularWeir(
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
          VNotchTriangularWeirError
          ? error.message
          : 'The V-notch weir calculation could not be completed.',
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
      createVNotchTriangularWeirCsv(
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
      'v-notch-triangular-weir.csv'

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
        code="FM–36"
        icon="≈"
        title="V-Notch / Triangular Weir Flow Rate"
        subtitle="Calculate open-channel discharge from V-notch angle and upstream head"
      />

      <ReferenceBasis>
        Calculator 419 extends the
        open-channel-flow family with a
        triangular sharp-crested weir.
        V-notch meters provide strong
        head sensitivity at lower flow rates
        because discharge varies with H to the
        five-halves power.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        (8/15) Cd tan(θ/2)
        √(2g) H
        <sup>5/2</sup>
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
        calculateLabel="Calculate V-notch flow"
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
              label="Top Width at Head"
              value={formatEngineeringNumber(
                result.topWidthAtHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Wetted Triangular Area"
              value={formatEngineeringNumber(
                result.wettedTriangularArea,
              )}
              unit="m²"
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
              label="Equivalent Mean Velocity"
              value={formatEngineeringNumber(
                result.equivalentMeanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Equivalent Velocity Head"
              value={formatEngineeringNumber(
                result.equivalentVelocityHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Recovered Head Over Vertex"
              value={formatEngineeringNumber(
                result.recoveredHeadOverVertex,
              )}
              unit="m"
            />

            <ResultItem
              label="Head Closure Residual"
              value={formatEngineeringNumber(
                result.headClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Actual / Ideal Discharge"
              value={formatEngineeringNumber(
                result.dischargeRatio,
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
