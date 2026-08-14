import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelCriticalDepthError,
  calculatePartiallyFullCircularChannelCriticalDepth,
  createPartiallyFullCircularChannelCriticalDepthCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelCriticalDepthInput,
  PartiallyFullCircularChannelCriticalDepthResult,
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
      'fluidDensity',

    label:
      'Fluid Density',

    symbol:
      'ρ',

    unit:
      'kg/m³',
  },
]


export function PartiallyFullCircularChannelCriticalDepthCalculator() {
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
      PartiallyFullCircularChannelCriticalDepthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelCriticalDepthInput | null
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
    PartiallyFullCircularChannelCriticalDepthInput {
    return {
      pipeDiameter:
        Number(
          form.pipeDiameter,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
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
        calculatePartiallyFullCircularChannelCriticalDepth(
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
          PartiallyFullCircularChannelCriticalDepthError
          ? error.message
          : 'Circular-channel critical depth could not be solved.',
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
      createPartiallyFullCircularChannelCriticalDepthCsv(
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
      'partially-full-circular-channel-critical-depth.csv'

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
        code="FM–74"
        icon="≈"
        title="Partially Full Circular Channel Critical Depth"
        subtitle="Solve the free-surface critical depth, minimum specific energy and wave-speed condition in a circular conduit"
      />

      <ReferenceBasis>
        Calculator 457 solves the circular
        critical-flow condition directly from
        geometry and discharge. Manning
        roughness and bed slope are not
        required because critical depth is a
        specific-energy property.
      </ReferenceBasis>

      <div className="native-formula">
        Fr² =
        Q²T / (gA³)
        {' = '}
        1
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
        calculateLabel="Solve critical depth"
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
            headlineLabel="Critical depth"
            headlineValue={`${formatEngineeringNumber(
              result.criticalDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Critical Depth Ratio y/D"
              value={formatEngineeringNumber(
                result.criticalDepthRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Central Angle"
              value={formatEngineeringNumber(
                result.centralAngleDegrees,
              )}
              unit="°"
            />

            <ResultItem
              label="Critical Flow Area"
              value={formatEngineeringNumber(
                result.criticalFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Critical Top Width"
              value={formatEngineeringNumber(
                result.criticalTopWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Wetted Perimeter"
              value={formatEngineeringNumber(
                result.criticalWettedPerimeter,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Hydraulic Radius"
              value={formatEngineeringNumber(
                result.criticalHydraulicRadius,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Hydraulic Depth"
              value={formatEngineeringNumber(
                result.criticalHydraulicDepth,
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
              label="Gravity-Wave Celerity"
              value={formatEngineeringNumber(
                result.criticalWaveCelerity,
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
              label="Minimum Specific Energy"
              value={formatEngineeringNumber(
                result.criticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Velocity Head"
              value={formatEngineeringNumber(
                result.velocityHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Discharge / Top Width"
              value={formatEngineeringNumber(
                result.dischargePerUnitTopWidth,
              )}
              unit="m²/s"
            />

            <ResultItem
              label="Critical-Condition Residual"
              value={formatEngineeringNumber(
                result.criticalConditionResidual,
              )}
              unit="-"
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
