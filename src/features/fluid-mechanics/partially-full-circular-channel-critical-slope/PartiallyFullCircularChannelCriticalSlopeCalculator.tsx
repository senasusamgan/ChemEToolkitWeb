import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelCriticalSlopeError,
  calculatePartiallyFullCircularChannelCriticalSlope,
  createPartiallyFullCircularChannelCriticalSlopeCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelCriticalSlopeInput,
  PartiallyFullCircularChannelCriticalSlopeResult,
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
    '1.2',

  volumetricFlowRate:
    '1.2',

  manningRoughness:
    '0.013',

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
      'pipeDiameter',

    label:
      'Circular Channel Diameter',

    symbol:
      'D',

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
      'manningRoughness',

    label:
      'Manning Roughness',

    symbol:
      'n',

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


export function PartiallyFullCircularChannelCriticalSlopeCalculator() {
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
      PartiallyFullCircularChannelCriticalSlopeResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelCriticalSlopeInput | null
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
    PartiallyFullCircularChannelCriticalSlopeInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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
        calculatePartiallyFullCircularChannelCriticalSlope(
          input,
        )

      setResult(
        next,
      )

      setCalculatedInput(
        input,
      )

      setErrorMessage('')
    } catch (error) {
      setResult(
        null,
      )

      setCalculatedInput(
        null,
      )

      setErrorMessage(
        error instanceof
          PartiallyFullCircularChannelCriticalSlopeError
          ? error.message
          : 'Circular-channel critical slope could not be solved.',
      )
    }
  }


  function loadExample() {
    setForm(
      exampleForm,
    )

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

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

    setResult(
      null,
    )

    setCalculatedInput(
      null,
    )

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
      createPartiallyFullCircularChannelCriticalSlopeCsv(
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

    link.href =
      url

    link.download =
      'partially-full-circular-channel-critical-slope.csv'

    document.body.appendChild(
      link,
    )

    link.click()
    link.remove()

    URL.revokeObjectURL(
      url,
    )
  }


  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="FM–76"
        icon="≈"
        title="Partially Full Circular Channel Critical Slope — Manning"
        subtitle="Calculate the bed slope at which circular-channel normal depth becomes equal to critical depth"
      />

      <ReferenceBasis>
        Calculator 459 combines the critical
        geometry from Calculator 457 with
        Manning conveyance. At the resulting
        slope, Calculator 456 normal depth
        equals the critical depth.
      </ReferenceBasis>

      <div className="native-formula">
        S
        <sub>c</sub>
        =
        [Qn /
        (A
        <sub>c</sub>
        R
        <sub>h,c</sub>
        <sup>2/3</sup>
        )]²
      </div>

      <div className="native-input-grid">
        {fields.map(
          field => (
            <NumericInput
              key={
                field.key
              }
              label={
                field.label
              }
              symbol={
                field.symbol
              }
              value={
                form[
                  field.key
                ]
              }
              unit={
                field.unit
              }
              onChange={
                updateField(
                  field.key,
                )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
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
            headlineValue={formatEngineeringNumber(
              result.criticalSlope,
            )}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Critical Slope"
              value={formatEngineeringNumber(
                result.criticalSlopePercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Critical Slope"
              value={formatEngineeringNumber(
                result.criticalSlopePerMille,
              )}
              unit="‰"
            />

            <ResultItem
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Depth Ratio y/D"
              value={formatEngineeringNumber(
                result.criticalDepthRatio,
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
              label="Critical Flow Area"
              value={formatEngineeringNumber(
                result.criticalFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Critical Hydraulic Radius"
              value={formatEngineeringNumber(
                result.criticalHydraulicRadius,
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
              label="Critical Froude Number"
              value={formatEngineeringNumber(
                result.criticalFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Manning Conveyance"
              value={formatEngineeringNumber(
                result.manningConveyance,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Full-Flow Capacity at Critical Slope"
              value={formatEngineeringNumber(
                result.fullFlowCapacityAtCriticalSlope,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Q / Qfull"
              value={formatEngineeringNumber(
                result.flowToFullCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Average Boundary Shear Stress"
              value={formatEngineeringNumber(
                result.averageBoundaryShearStress,
              )}
              unit="Pa"
            />

            <ResultItem
              label="Hydraulic Power Dissipation / Length"
              value={formatEngineeringNumber(
                result.hydraulicPowerDissipationPerUnitLength,
              )}
              unit="W/m"
            />

            <ResultItem
              label="Mass Flow Rate"
              value={formatEngineeringNumber(
                result.massFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Slope Classification"
              value={
                result.slopeClassificationRule
              }
              unit=""
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export calculation CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
