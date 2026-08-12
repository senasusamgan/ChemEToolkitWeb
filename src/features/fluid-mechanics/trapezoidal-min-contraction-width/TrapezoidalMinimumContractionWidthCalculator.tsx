import {
  useState,
} from 'react'

import {
  TrapezoidalMinimumContractionWidthError,
  calculateTrapezoidalMinimumContractionWidth,
  createTrapezoidalMinimumContractionWidthCsv,
} from './engine'

import type {
  TrapezoidalMinimumContractionWidthInput,
  TrapezoidalMinimumContractionWidthResult,
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

export function TrapezoidalMinimumContractionWidthCalculator() {
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
      TrapezoidalMinimumContractionWidthResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalMinimumContractionWidthInput | null
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
    TrapezoidalMinimumContractionWidthInput {
    return {
      upstreamBottomWidth:
        Number(
          form.upstreamBottomWidth,
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
        calculateTrapezoidalMinimumContractionWidth(
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
          TrapezoidalMinimumContractionWidthError
          ? error.message
          : 'The contraction-choking calculation could not be completed.',
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
      createTrapezoidalMinimumContractionWidthCsv(
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
      'trapezoidal-minimum-contraction-width.csv'

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
        code="FM–56"
        icon="≈"
        title="Minimum Contracted Width Before Choking"
        subtitle="Determine how far a subcritical trapezoidal channel can be narrowed before the contraction throat reaches critical flow"
      />

      <ReferenceBasis>
        Calculator 439 converts the available
        upstream specific energy into the
        minimum positive contracted bottom
        width that produces critical flow.
        The result represents the lossless
        lateral-contraction choking limit.
      </ReferenceBasis>

      <div className="native-formula">
        E₁ =
        y₁ +
        V₁²/(2g)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        Fr
        <sub>throat</sub>
        = 1
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
        calculateLabel="Calculate contraction limit"
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
            headlineLabel="Minimum contracted bottom width"
            headlineValue={`${formatEngineeringNumber(
              result.minimumContractedBottomWidth,
            )} m`}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Bottom-Width Reduction"
              value={formatEngineeringNumber(
                result.bottomWidthReduction,
              )}
              unit="m"
            />

            <ResultItem
              label="Bottom-Width Reduction"
              value={formatEngineeringNumber(
                result.bottomWidthReductionPercent,
              )}
              unit="%"
            />

            <ResultItem
              label="Contraction Ratio"
              value={formatEngineeringNumber(
                result.contractionRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Upstream Flow Area"
              value={formatEngineeringNumber(
                result.upstreamFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Upstream Velocity"
              value={formatEngineeringNumber(
                result.upstreamVelocity,
              )}
              unit="m/s"
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
              label="Critical Throat Depth"
              value={formatEngineeringNumber(
                result.criticalThroatDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Throat Flow Area"
              value={formatEngineeringNumber(
                result.criticalThroatFlowArea,
              )}
              unit="m²"
            />

            <ResultItem
              label="Critical Throat Top Width"
              value={formatEngineeringNumber(
                result.criticalThroatTopWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Throat Velocity"
              value={formatEngineeringNumber(
                result.criticalThroatVelocity,
              )}
              unit="m/s"
            />

            <ResultItem
              label="Critical Throat Froude Number"
              value={formatEngineeringNumber(
                result.criticalThroatFroudeNumber,
              )}
              unit="-"
            />

            <ResultItem
              label="Critical Throat Specific Energy"
              value={formatEngineeringNumber(
                result.criticalThroatSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Water-Surface Change at Choking"
              value={formatEngineeringNumber(
                result.waterSurfaceElevationChangeAtChoking,
              )}
              unit="m"
            />

            <ResultItem
              label="Triangular Zero-Width Capacity"
              value={formatEngineeringNumber(
                result.zeroBottomWidthCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Flow Margin Above Triangular Limit"
              value={formatEngineeringNumber(
                result.flowMarginAboveTriangularLimit,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Reconstructed Critical Capacity"
              value={formatEngineeringNumber(
                result.reconstructedCriticalCapacity,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Flow Closure Residual"
              value={formatEngineeringNumber(
                result.flowClosureResidual,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Energy Closure Residual"
              value={formatEngineeringNumber(
                result.energyClosureResidual,
              )}
              unit="m"
            />

            <ResultItem
              label="Critical Condition Residual"
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

            <ResultItem
              label="Width Solver Iterations"
              value={String(
                result.widthSolverIterations,
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
