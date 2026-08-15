import {
  useState,
} from 'react'

import {
  PartiallyFullCircularChannelDirectStepError,
  calculatePartiallyFullCircularChannelDirectStep,
  createPartiallyFullCircularChannelDirectStepCsv,
} from './engine'

import type {
  PartiallyFullCircularChannelDirectStepInput,
  PartiallyFullCircularChannelDirectStepResult,
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

  state1FlowDepth:
    '0.6',

  state2FlowDepth:
    '0.5',
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
      'state1FlowDepth',

    label:
      'State 1 Flow Depth',

    symbol:
      'y₁',

    unit:
      'm',
  },
  {
    key:
      'state2FlowDepth',

    label:
      'State 2 Flow Depth',

    symbol:
      'y₂',

    unit:
      'm',
  },
]


export function PartiallyFullCircularChannelDirectStepCalculator() {
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
      PartiallyFullCircularChannelDirectStepResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      PartiallyFullCircularChannelDirectStepInput | null
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
    PartiallyFullCircularChannelDirectStepInput {
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

      state1FlowDepth:
        Number(
          form.state1FlowDepth,
        ),

      state2FlowDepth:
        Number(
          form.state2FlowDepth,
        ),
    }
  }


  function calculate() {
    try {
      const input =
        currentInput()

      const next =
        calculatePartiallyFullCircularChannelDirectStep(
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
          PartiallyFullCircularChannelDirectStepError
          ? error.message
          : 'Circular-channel direct-step reach could not be solved.',
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
      createPartiallyFullCircularChannelDirectStepCsv(
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
      'partially-full-circular-channel-direct-step-gvf.csv'

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
        code="FM–78"
        icon="∿"
        title="Partially Full Circular Channel Direct-Step Method — GVF"
        subtitle="Estimate the longitudinal distance between two gradually varied flow depths using the direct-step energy method"
      />

      <ReferenceBasis>
        Calculator 461 applies the direct-step
        gradually varied flow energy equation
        to a partially full circular section.
        Calculator 457 supplies the critical
        depth used to prevent a single step from
        crossing the critical-flow control.
      </ReferenceBasis>

      <div className="native-formula">
        Δx =
        (E₂ − E₁) /
        (S₀ − S̄f)
        {'   '}
        with
        {'   '}
        Sf =
        [nQ/(AR^(2/3))]²
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
        calculateLabel="Solve direct-step reach"
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
            headlineLabel="Direct-step reach length"
            headlineValue={`${formatEngineeringNumber(
              result.reachLength,
            )} m`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Signed Distance"
              value={formatEngineeringNumber(
                result.signedDistance,
              )}
              unit="m"
            />

            <ResultItem
              label="Profile Direction"
              value={
                result.profileDirection
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
              label="Critical Depth"
              value={formatEngineeringNumber(
                result.criticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="State 1 Depth"
              value={formatEngineeringNumber(
                result.state1.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="State 2 Depth"
              value={formatEngineeringNumber(
                result.state2.flowDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="State 1 Velocity"
              value={formatEngineeringNumber(
                result.state1.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="State 2 Velocity"
              value={formatEngineeringNumber(
                result.state2.meanVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="State 1 Froude Number"
              value={formatEngineeringNumber(
                result.state1.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="State 2 Froude Number"
              value={formatEngineeringNumber(
                result.state2.froudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="State 1 Specific Energy"
              value={formatEngineeringNumber(
                result.state1.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="State 2 Specific Energy"
              value={formatEngineeringNumber(
                result.state2.specificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Specific Energy Change"
              value={formatEngineeringNumber(
                result.specificEnergyChange,
              )}
              unit="m"
            />

            <ResultItem
              label="State 1 Friction Slope"
              value={formatEngineeringNumber(
                result.state1.frictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="State 2 Friction Slope"
              value={formatEngineeringNumber(
                result.state2.frictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Average Friction Slope"
              value={formatEngineeringNumber(
                result.averageFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="S₀ − Average Sf"
              value={formatEngineeringNumber(
                result.bedSlopeMinusAverageFrictionSlope,
              )}
              unit="m/m"
            />

            <ResultItem
              label="Bed Elevation Change"
              value={formatEngineeringNumber(
                result.bedElevationChange,
              )}
              unit="m"
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
