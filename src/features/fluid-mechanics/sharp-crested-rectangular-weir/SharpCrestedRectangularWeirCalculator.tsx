import {
  useState,
} from 'react'

import {
  SharpCrestedRectangularWeirError,
  calculateSharpCrestedRectangularWeir,
  createSharpCrestedRectangularWeirCsv,
} from './engine'

import type {
  SharpCrestedRectangularWeirInput,
  SharpCrestedRectangularWeirResult,
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
  crestWidth:
    '1.2',

  headOverCrest:
    '0.3',

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
      'crestWidth',

    label:
      'Effective Weir Crest Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'headOverCrest',

    label:
      'Head Above Weir Crest',

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

export function SharpCrestedRectangularWeirCalculator() {
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
      SharpCrestedRectangularWeirResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      SharpCrestedRectangularWeirInput | null
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
    SharpCrestedRectangularWeirInput {
    return {
      crestWidth:
        Number(
          form.crestWidth,
        ),

      headOverCrest:
        Number(
          form.headOverCrest,
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
        calculateSharpCrestedRectangularWeir(
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
          SharpCrestedRectangularWeirError
          ? error.message
          : 'The rectangular-weir flow calculation could not be completed.',
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
      createSharpCrestedRectangularWeirCsv(
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
      'sharp-crested-rectangular-weir.csv'

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
        code="FM–35"
        icon="≈"
        title="Sharp-Crested Rectangular Weir Flow Rate"
        subtitle="Calculate free-surface discharge over a rectangular sharp-crested weir"
      />

      <ReferenceBasis>
        Calculator 418 starts the
        open-channel-flow family. It uses the
        classical free-flow rectangular-weir
        relationship with an effective crest
        width, measured upstream head and
        discharge coefficient.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        (2/3) Cd b √(2g) H
        <sup>3/2</sup>
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
        calculateLabel="Calculate weir flow"
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
              label="Unit Discharge"
              value={formatEngineeringNumber(
                result.unitDischarge,
              )}
              unit="m²/s"
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
              label="Recovered Head Over Crest"
              value={formatEngineeringNumber(
                result.recoveredHeadOverCrest,
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
