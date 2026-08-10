import {
  useState,
} from 'react'

import {
  BroadCrestedWeirFlowError,
  calculateBroadCrestedWeirFlow,
  createBroadCrestedWeirFlowCsv,
} from './engine'

import type {
  BroadCrestedWeirFlowInput,
  BroadCrestedWeirFlowResult,
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
    '1.5',

  upstreamHeadAboveCrest:
    '0.6',

  dischargeCoefficient:
    '0.98',

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
      'Effective Crest Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'upstreamHeadAboveCrest',

    label:
      'Upstream Head Above Crest',

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

export function BroadCrestedWeirFlowCalculator() {
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
      BroadCrestedWeirFlowResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      BroadCrestedWeirFlowInput | null
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
    BroadCrestedWeirFlowInput {
    return {
      crestWidth:
        Number(
          form.crestWidth,
        ),

      upstreamHeadAboveCrest:
        Number(
          form.upstreamHeadAboveCrest,
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
        calculateBroadCrestedWeirFlow(
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
          BroadCrestedWeirFlowError
          ? error.message
          : 'The broad-crested-weir calculation could not be completed.',
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
      createBroadCrestedWeirFlowCsv(
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
      'broad-crested-weir-flow.csv'

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
        code="FM–44"
        icon="≈"
        title="Broad-Crested Weir Flow Rate"
        subtitle="Calculate discharge using critical-flow control over a broad horizontal crest"
      />

      <ReferenceBasis>
        Calculator 427 models a free-flow
        broad-crested weir. The theoretical
        crest state is critical, with critical
        depth equal to two-thirds of the
        upstream specific head.
      </ReferenceBasis>

      <div className="native-formula">
        Q =
        Cd b √g
        (2H/3)
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
            headlineLabel="Corrected volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.volumetricFlowRate,
            )} m³/s`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Theoretical Critical Depth"
              value={formatEngineeringNumber(
                result.theoreticalCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Theoretical Critical Velocity"
              value={formatEngineeringNumber(
                result.theoreticalCriticalVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Theoretical Critical Froude Number"
              value={formatEngineeringNumber(
                result.theoreticalCriticalFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Ideal Unit Discharge"
              value={formatEngineeringNumber(
                result.idealUnitDischarge,
              )}
              unit="m²/s"
            />

            <ResultItem
              label="Corrected Unit Discharge"
              value={formatEngineeringNumber(
                result.correctedUnitDischarge,
              )}
              unit="m²/s"
            />

            <ResultItem
              label="Ideal Volumetric Flow Rate"
              value={formatEngineeringNumber(
                result.idealVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Corrected Flow Rate"
              value={formatEngineeringNumber(
                result.volumetricFlowRateCubicMetersPerHour,
              )}
              unit="m³/h"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Theoretical Specific Energy"
              value={formatEngineeringNumber(
                result.theoreticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Residual"
              value={formatEngineeringNumber(
                result.specificEnergyResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Recovered Upstream Head"
              value={formatEngineeringNumber(
                result.recoveredUpstreamHead,
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
