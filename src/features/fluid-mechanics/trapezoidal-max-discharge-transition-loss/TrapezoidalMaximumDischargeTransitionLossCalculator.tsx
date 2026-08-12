import {
  useState,
} from 'react'

import {
  TrapezoidalMaximumDischargeTransitionLossError,
  calculateTrapezoidalMaximumDischargeTransitionLoss,
  createTrapezoidalMaximumDischargeTransitionLossCsv,
} from './engine'

import type {
  TrapezoidalMaximumDischargeTransitionLossInput,
  TrapezoidalMaximumDischargeTransitionLossResult,
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

  upstreamFlowDepth:
    '1.2',

  transitionLossCoefficient:
    '0.1',

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
      'transitionLossCoefficient',

    label:
      'Transition Loss Coefficient',

    symbol:
      'Kₗ',

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

export function TrapezoidalMaximumDischargeTransitionLossCalculator() {
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
      TrapezoidalMaximumDischargeTransitionLossResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMaximumDischargeTransitionLossInput | null
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
    TrapezoidalMaximumDischargeTransitionLossInput {
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

      upstreamFlowDepth:
        Number(
          form.upstreamFlowDepth,
        ),

      transitionLossCoefficient:
        Number(
          form.transitionLossCoefficient,
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
        calculateTrapezoidalMaximumDischargeTransitionLoss(
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
          TrapezoidalMaximumDischargeTransitionLossError
          ? error.message
          : 'The maximum-discharge contraction calculation could not be completed.',
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
      createTrapezoidalMaximumDischargeTransitionLossCsv(
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
      'trapezoidal-maximum-discharge-transition-loss.csv'

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
        code="FM–60"
        icon="≈"
        title="Maximum Discharge Through a Contraction with Transition Loss"
        subtitle="Determine the maximum flow a trapezoidal-channel contraction can pass before the loss-adjusted choking limit is reached"
      />

      <ReferenceBasis>
        Calculator 443 solves the flow-rate
        inverse of Calculators 441–442.
        Maximum discharge occurs when the
        available upstream specific energy
        exactly equals the minimum
        loss-adjusted throat energy.
      </ReferenceBasis>

      <div className="native-formula">
        E₁(Q
        <sub>max</sub>
        ) =
        y
        <sub>c</sub>
        +
        (1 + K
        <sub>L</sub>
        )V
        <sub>c</sub>
        ²/(2g)
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
        calculateLabel="Calculate maximum discharge"
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
            headlineLabel="Maximum volumetric flow rate"
            headlineValue={`${formatEngineeringNumber(
              result.maximumVolumetricFlowRate,
            )} m³/s`}
            modelName={
              result.modelName
            }
            note={
              result.limitationDescription
            }
          >
            <ResultItem
              label="Maximum Mass Flow Rate"
              value={formatEngineeringNumber(
                result.maximumMassFlowRate,
              )}
              unit="kg/s"
            />

            <ResultItem
              label="Lossless Maximum Flow"
              value={formatEngineeringNumber(
                result.losslessMaximumVolumetricFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Transition-Loss Flow Penalty"
              value={formatEngineeringNumber(
                result.transitionLossFlowPenalty,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Transition-Loss Capacity Ratio"
              value={formatEngineeringNumber(
                result.transitionLossCapacityRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Capacity Reduction"
              value={formatEngineeringNumber(
                result.transitionLossFlowReductionPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Upstream Critical Flow Rate"
              value={formatEngineeringNumber(
                result.upstreamCriticalFlowRate,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Upstream Critical-Flow Margin"
              value={formatEngineeringNumber(
                result.upstreamCriticalFlowMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Upstream Froude at Maximum Flow"
              value={formatEngineeringNumber(
                result.upstreamFroudeNumberAtMaximumFlow,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Specific Energy"
              value={formatEngineeringNumber(
                result.upstreamSpecificEnergyAtMaximumFlow,
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
              label="Loss-Adjusted Control Area"
              value={formatEngineeringNumber(
                result.lossAdjustedControlFlowArea,
              )}
              unit="m²"
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
              label="Transition-Loss Head at Maximum Flow"
              value={formatEngineeringNumber(
                result.transitionLossHeadAtMaximumFlow,
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
              label="Maximum Dissipation Power"
              value={formatEngineeringNumber(
                result.maximumDissipationPower,
              )}
              unit="W"
            />

            <ResultItem
              label="Back-Calculated Maximum Kₗ"
              value={formatEngineeringNumber(
                result.backCalculatedMaximumTransitionLossCoefficient,
              )}
              unit="-"
            />

            <ResultItem
              label="Kₗ Closure Residual"
              value={formatEngineeringNumber(
                result.lossCoefficientClosureResidual,
              )}
              unit="-"
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
              label="Flow Solver Iterations"
              value={String(
                result.flowSolverIterations,
              )}
              unit=""
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
