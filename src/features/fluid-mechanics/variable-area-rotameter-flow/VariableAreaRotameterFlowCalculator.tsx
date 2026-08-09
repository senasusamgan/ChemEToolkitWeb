import {
  useState,
} from 'react'

import {
  VariableAreaRotameterFlowError,
  calculateVariableAreaRotameterFlow,
  createVariableAreaRotameterFlowCsv,
} from './engine'

import type {
  VariableAreaRotameterFlowInput,
  VariableAreaRotameterFlowResult,
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
  fluidDensity:
    '998',

  floatDensity:
    '7800',

  floatVolume:
    '0.000012',

  floatProjectedArea:
    '0.0003',

  annularFlowArea:
    '0.0005',

  dragCoefficient:
    '0.9',
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
      'floatDensity',

    label:
      'Float Density',

    symbol:
      'ρf',

    unit:
      'kg/m³',
  },
  {
    key:
      'floatVolume',

    label:
      'Float Volume',

    symbol:
      'Vf',

    unit:
      'm³',
  },
  {
    key:
      'floatProjectedArea',

    label:
      'Float Projected Area',

    symbol:
      'Af',

    unit:
      'm²',
  },
  {
    key:
      'annularFlowArea',

    label:
      'Annular Flow Area at Reading',

    symbol:
      'Aa',

    unit:
      'm²',
  },
  {
    key:
      'dragCoefficient',

    label:
      'Float Drag Coefficient',

    symbol:
      'Cd',

    unit:
      '-',
  },
]

export function VariableAreaRotameterFlowCalculator() {
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
      VariableAreaRotameterFlowResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      VariableAreaRotameterFlowInput | null
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
    VariableAreaRotameterFlowInput {
    return {
      fluidDensity:
        Number(
          form.fluidDensity,
        ),

      floatDensity:
        Number(
          form.floatDensity,
        ),

      floatVolume:
        Number(
          form.floatVolume,
        ),

      floatProjectedArea:
        Number(
          form.floatProjectedArea,
        ),

      annularFlowArea:
        Number(
          form.annularFlowArea,
        ),

      dragCoefficient:
        Number(
          form.dragCoefficient,
        ),
    }
  }

  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculateVariableAreaRotameterFlow(
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
          VariableAreaRotameterFlowError
          ? error.message
          : 'The rotameter flow calculation could not be completed.',
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
      createVariableAreaRotameterFlowCsv(
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
      'variable-area-rotameter-flow.csv'

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
        code="FM–29"
        icon="≈"
        title="Variable-Area Rotameter Flow Rate"
        subtitle="Estimate flow from the force balance on a suspended rotameter float"
      />

      <ReferenceBasis>
        Calculator 412 models a steady
        variable-area rotameter using the
        force balance on its float. The
        buoyancy-corrected float weight is
        balanced against quadratic fluid drag.
        The resulting annular velocity is
        multiplied by the available flow area
        at the float reading position.
      </ReferenceBasis>

      <div className="native-formula">
        (ρf − ρ)Vf g
        =
        ½ Cd ρ v² Af
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Q = Aa v
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
        calculateLabel="Calculate rotameter flow"
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
              label="Equilibrium Annular Velocity"
              value={formatEngineeringNumber(
                result.equilibriumVelocity,
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
              label="Float Weight"
              value={formatEngineeringNumber(
                result.floatWeight,
              )}
              unit="N"
            />

            <ResultItem
              label="Buoyancy Force"
              value={formatEngineeringNumber(
                result.buoyancyForce,
              )}
              unit="N"
            />

            <ResultItem
              label="Effective Float Weight"
              value={formatEngineeringNumber(
                result.effectiveFloatWeight,
              )}
              unit="N"
            />

            <ResultItem
              label="Fluid Dynamic Pressure"
              value={formatEngineeringNumber(
                result.fluidDynamicPressure,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Drag Force"
              value={formatEngineeringNumber(
                result.dragForce,
              )}
              unit="N"
            />

            <ResultItem
              label="Force-Balance Residual"
              value={formatEngineeringNumber(
                result.forceBalanceResidual,
              )}
              unit="N"
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
