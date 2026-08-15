import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelGvfProfileError,
  calculatePartiallyFullCircularChannelGvfProfile,
  createPartiallyFullCircularChannelGvfProfileCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelGvfProfileInput,
  PartiallyFullCircularChannelGvfProfileResult,
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
    '0.6',

  manningRoughness:
    '0.013',

  channelSlope:
    '0.001',

  initialFlowDepth:
    '0.6',

  integrationDistance:
    '100',

  maximumStepLength:
    '2',
}


type FormField =
  keyof typeof exampleForm


const fields:
  Array<{
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
      'channelSlope',

    label:
      'Channel Bed Slope',

    symbol:
      'S₀',

    unit:
      'm/m',
  },
  {
    key:
      'initialFlowDepth',

    label:
      'Initial Flow Depth',

    symbol:
      'y₀',

    unit:
      'm',
  },
  {
    key:
      'integrationDistance',

    label:
      'Signed Integration Distance',

    symbol:
      'Δx',

    unit:
      'm',
  },
  {
    key:
      'maximumStepLength',

    label:
      'Maximum RK4 Step Length',

    symbol:
      'hmax',

    unit:
      'm',
  },
]


export function PartiallyFullCircularChannelGvfProfileCalculator() {
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
      PartiallyFullCircularChannelGvfProfileResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelGvfProfileInput | null
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
    PartiallyFullCircularChannelGvfProfileInput {
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

      channelSlope:
        Number(
          form.channelSlope,
        ),

      initialFlowDepth:
        Number(
          form.initialFlowDepth,
        ),

      integrationDistance:
        Number(
          form.integrationDistance,
        ),

      maximumStepLength:
        Number(
          form.maximumStepLength,
        ),
    }
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelGvfProfile(
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
          PartiallyFullCircularChannelGvfProfileError
          ? error.message
          : 'Circular-channel RK4 GVF profile could not be integrated.',
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
      createPartiallyFullCircularChannelGvfProfileCsv(
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
      'partially-full-circular-channel-gvf-profile-rk4.csv'

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
        code="FM–80"
        icon="∿"
        title="Partially Full Circular Channel GVF Profile — RK4"
        subtitle="Integrate a longitudinal gradually varied flow depth profile in a partially full circular channel"
      />

      <ReferenceBasis>
        Calculator 463 integrates the local
        differential relation from Calculator 462
        using the classical fourth-order Runge–Kutta
        method. Positive distance integrates
        downstream and negative distance integrates
        upstream. The profile is stopped if it reaches
        critical flow or leaves the partially full
        circular-flow domain.
      </ReferenceBasis>

      <div className="native-formula">
        dy/dx =
        (S₀ − Sf) /
        (1 − Fr²)
        {'   '}
        integrated with
        {'   '}
        RK4:
        yᵢ₊₁ =
        yᵢ +
        h(k₁ + 2k₂ + 2k₃ + k₄)/6
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
        calculateLabel="Integrate RK4 profile"
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
            headlineLabel="Final flow depth"
            headlineValue={`${formatEngineeringNumber(
              result.finalState.flowDepth,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Integration Direction"
              value={
                result.integrationDirection
              }
              unit=""
            />

            <ResultItem
              label="Flow Regime"
              value={
                result.flowRegime
              }
              unit=""
            />

            <ResultItem
              label="Integration Distance"
              value={formatEngineeringNumber(
                result.integrationDistance,
              )}
              unit="m"
            />

            <ResultItem
              label="RK4 Steps"
              value={formatEngineeringNumber(
                result.numberOfSteps,
              )}
              unit="-"
            />

            <ResultItem
              label="Actual Step Length"
              value={formatEngineeringNumber(
                result.actualStepLength,
              )}
              unit="m"
            />

            <ResultItem
              label="Initial Flow Depth"
              value={formatEngineeringNumber(
                result.initialState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Final Flow Depth"
              value={formatEngineeringNumber(
                result.finalState.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Depth Change"
              value={formatEngineeringNumber(
                result.totalDepthChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Minimum Depth"
              value={formatEngineeringNumber(
                result.minimumDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Depth"
              value={formatEngineeringNumber(
                result.maximumDepth,
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
              label="Initial Froude Number"
              value={formatEngineeringNumber(
                result.initialState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Final Froude Number"
              value={formatEngineeringNumber(
                result.finalState.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Initial dy/dx"
              value={formatEngineeringNumber(
                result.initialDepthGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Final dy/dx"
              value={formatEngineeringNumber(
                result.finalDepthGradient,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Water-Surface Elevation Change"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Friction Head Loss"
              value={formatEngineeringNumber(
                result.frictionHeadLossMagnitude,
              )}
              unit="m"
            />

            <ResultItem
              label="Total Head Change"
              value={formatEngineeringNumber(
                result.totalHeadChange,
              )}
              unit="m"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.energyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Profile Points"
              value={formatEngineeringNumber(
                result.profilePoints.length,
              )}
              unit="-"
            />
          </ResultPanel>

          <div className="native-actions">
            <button
              type="button"
              onClick={
                exportCsv
              }
            >
              Export profile CSV
            </button>
          </div>
        </>
      ) : null}
    </section>
  )
}
