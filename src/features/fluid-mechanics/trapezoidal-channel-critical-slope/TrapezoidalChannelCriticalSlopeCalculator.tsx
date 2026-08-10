import {
  useState,
} from 'react'

import {
  TrapezoidalChannelCriticalSlopeError,
  calculateTrapezoidalChannelCriticalSlope,
  createTrapezoidalChannelCriticalSlopeCsv,
} from './engine'

import type {
  TrapezoidalChannelCriticalSlopeInput,
  TrapezoidalChannelCriticalSlopeResult,
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
  bottomWidth:
    '2',

  volumetricFlowRate:
    '5',

  sideSlopeHorizontalPerVertical:
    '1',

  manningRoughness:
    '0.015',

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
      'bottomWidth',

    label:
      'Channel Bottom Width',

    symbol:
      'b',

    unit:
      'm',
  },
  {
    key:
      'volumetricFlowRate',

    label:
      'Volumetric Flow Rate',

    symbol:
      'Q',

    unit:
      'm³/s',
  },
  {
    key:
      'sideSlopeHorizontalPerVertical',

    label:
      'Side Slope Horizontal : Vertical',

    symbol:
      'z',

    unit:
      'H:V',
  },
  {
    key:
      'manningRoughness',

    label:
      'Manning Roughness Coefficient',

    symbol:
      'n',

    unit:
      's/m⅓',
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

export function TrapezoidalChannelCriticalSlopeCalculator() {
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
      TrapezoidalChannelCriticalSlopeResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalChannelCriticalSlopeInput | null
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
    TrapezoidalChannelCriticalSlopeInput {
    return {
      bottomWidth:
        Number(
          form.bottomWidth,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      manningRoughness:
        Number(
          form.manningRoughness,
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
        calculateTrapezoidalChannelCriticalSlope(
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
          TrapezoidalChannelCriticalSlopeError
          ? error.message
          : 'The critical-slope calculation could not be completed.',
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
      createTrapezoidalChannelCriticalSlopeCsv(
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
      'trapezoidal-channel-critical-slope.csv'

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
        code="FM–42"
        icon="≈"
        title="Trapezoidal Channel Critical Slope"
        subtitle="Determine the Manning slope at which normal depth equals critical depth"
      />

      <ReferenceBasis>
        Calculator 425 combines critical-flow
        geometry with the Manning equation.
        The resulting critical slope is the
        energy slope for which the channel
        carries the specified discharge at
        exactly its critical depth.
      </ReferenceBasis>

      <div className="native-formula">
        S
        <sub>c</sub>
        =
        [
        Qn /
        (A
        <sub>c</sub>
        R
        <sub>h,c</sub>
        <sup>2/3</sup>
        )
        ]²
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
        calculateLabel="Calculate critical slope"
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
            headlineLabel="Critical channel slope"
            headlineValue={`${formatEngineeringNumber(
              result.criticalSlopePercent,
            )} %`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Critical Slope"
              value={formatEngineeringNumber(
                result.criticalSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Critical Slope Angle"
              value={formatEngineeringNumber(
                result.criticalSlopeAngleDegrees,
              )}
              unit="deg"
            />

            <ResultItem
              label="Bed Drop per 100 m"
              value={formatEngineeringNumber(
                result.bedDropPer100m,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Flow Area"
              value={formatEngineeringNumber(
                result.flowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Hydraulic Radius"
              value={formatEngineeringNumber(
                result.hydraulicRadius,
              )}
              unit="m"
            />

            <ResultItem
              label="Hydraulic Depth"
              value={formatEngineeringNumber(
                result.hydraulicDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Velocity"
              value={formatEngineeringNumber(
                result.criticalVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Froude Number"
              value={formatEngineeringNumber(
                result.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Specific Energy"
              value={formatEngineeringNumber(
                result.criticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Manning Conveyance"
              value={formatEngineeringNumber(
                result.manningConveyance,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Reconstructed Flow Rate"
              value={formatEngineeringNumber(
                result.reconstructedVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Relative Discharge Residual"
              value={formatEngineeringNumber(
                result.relativeDischargeResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.boundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
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
