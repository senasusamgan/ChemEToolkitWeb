import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumTransitionLossCoefficientError,
  calculateTrapezoidalMaximumTransitionLossCoefficient,
  createTrapezoidalMaximumTransitionLossCoefficientCsv,
} from './engine'

import type {
  TrapezoidalMaximumTransitionLossCoefficientInput,
  TrapezoidalMaximumTransitionLossCoefficientResult,
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
  upstreamBottomWidth:
    '3',

  contractedBottomWidth:
    '2',

  sideSlopeHorizontalPerVertical:
    '1',

  volumetricFlowRate:
    '5',

  upstreamFlowDepth:
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
      'upstreamBottomWidth',

    label:
      'Upstream Bottom Width',

    symbol:
      'b₁',

    unit:
      'm',
  },
  {
    key:
      'contractedBottomWidth',

    label:
      'Contracted Bottom Width',

    symbol:
      'b₂',

    unit:
      'm',
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
      'upstreamFlowDepth',

    label:
      'Upstream Flow Depth',

    symbol:
      'y₁',

    unit:
      'm',
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

export function TrapezoidalMaximumTransitionLossCoefficientCalculator() {
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
      TrapezoidalMaximumTransitionLossCoefficientResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumTransitionLossCoefficientInput | null
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
    TrapezoidalMaximumTransitionLossCoefficientInput {
    return {
      upstreamBottomWidth:
        Number(
          form.upstreamBottomWidth,
        ),

      contractedBottomWidth:
        Number(
          form.contractedBottomWidth,
        ),

      sideSlopeHorizontalPerVertical:
        Number(
          form.sideSlopeHorizontalPerVertical,
        ),

      volumetricFlowRate:
        Number(
          form.volumetricFlowRate,
        ),

      upstreamFlowDepth:
        Number(
          form.upstreamFlowDepth,
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
        calculateTrapezoidalMaximumTransitionLossCoefficient(
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
          TrapezoidalMaximumTransitionLossCoefficientError
          ? error.message
          : 'The maximum allowable transition-loss calculation could not be completed.',
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
      createTrapezoidalMaximumTransitionLossCoefficientCsv(
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
      'trapezoidal-maximum-transition-loss-coefficient.csv'

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
        code="FM–59"
        icon="≈"
        title="Maximum Allowable Transition Loss Before Choking"
        subtitle="Determine the largest contraction loss coefficient that can be tolerated before the throat reaches its minimum-energy control state"
      />

      <ReferenceBasis>
        Calculator 442 inverses the
        transition-loss choking model from
        Calculator 441. The available
        lossless flow-capacity reserve is
        converted directly into the maximum
        admissible Kₗ.
      </ReferenceBasis>

      <div className="native-formula">
        K
        <sub>L,max</sub>
        =
        (Q
        <sub>max,0</sub>
        /Q)² − 1
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
        calculateLabel="Calculate maximum Kₗ"
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
            headlineLabel="Maximum allowable transition-loss coefficient"
            headlineValue={formatEngineeringNumber(
              result.maximumAllowableTransitionLossCoefficient,
            )}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Maximum Allowable Loss Head"
              value={formatEngineeringNumber(
                result.maximumAllowableTransitionLossHead,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Allowable Dissipation Power"
              value={formatEngineeringNumber(
                result.maximumAllowableDissipationPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Lossless Maximum Flow Rate"
              value={formatEngineeringNumber(
                result.losslessMaximumFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Lossless Flow-Capacity Margin"
              value={formatEngineeringNumber(
                result.losslessFlowCapacityMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Lossless Capacity Ratio"
              value={formatEngineeringNumber(
                result.losslessCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Froude Number"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss-Adjusted Control Depth"
              value={formatEngineeringNumber(
                result.lossAdjustedControlDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss-Adjusted Control Velocity"
              value={formatEngineeringNumber(
                result.lossAdjustedControlVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Loss-Adjusted Control Froude"
              value={formatEngineeringNumber(
                result.lossAdjustedControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Theoretical Control Froude"
              value={formatEngineeringNumber(
                result.theoreticalControlFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Control Specific Energy Without Loss"
              value={formatEngineeringNumber(
                result.controlSpecificEnergyWithoutLoss,
              )}
              unit="m"
            />

            <ResultItem
              label="Loss Head / Upstream Energy"
              value={formatEngineeringNumber(
                result.transitionLossHeadFractionOfUpstreamEnergy *
                100,
              )}
              unit="%"
            />

            <ResultItem
              label="Minimum Required Upstream Energy"
              value={formatEngineeringNumber(
                result.minimumRequiredUpstreamSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Forward Minimum Width"
              value={formatEngineeringNumber(
                result.forwardLossAdjustedMinimumWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Forward Width Closure Residual"
              value={formatEngineeringNumber(
                result.forwardWidthClosureResidual,
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
              label="Control-Condition Residual"
              value={formatEngineeringNumber(
                result.controlConditionResidual,
              )}
              unit="-"
            />

            <ResultItem
              label="Forward Threshold Status"
              value={
                result.forwardThresholdStatus
              }
              unit=""
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
