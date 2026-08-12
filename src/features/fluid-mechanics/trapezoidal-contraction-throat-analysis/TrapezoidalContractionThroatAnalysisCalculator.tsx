import {
  useState,
} from 'react'

import {
  TrapezoidalContractionThroatAnalysisError,
  calculateTrapezoidalContractionThroatAnalysis,
  createTrapezoidalContractionThroatAnalysisCsv,
} from './engine'

import type {
  TrapezoidalContractionThroatAnalysisInput,
  TrapezoidalContractionThroatAnalysisResult,
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

export function TrapezoidalContractionThroatAnalysisCalculator() {
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
      TrapezoidalContractionThroatAnalysisResult | null
    >(null)

  const [
    calculatedInput,
    setCalculatedInput,
  ] =
    useState<
      TrapezoidalContractionThroatAnalysisInput | null
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
    TrapezoidalContractionThroatAnalysisInput {
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
        calculateTrapezoidalContractionThroatAnalysis(
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
          TrapezoidalContractionThroatAnalysisError
          ? error.message
          : 'The specified contraction analysis could not be completed.',
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
      createTrapezoidalContractionThroatAnalysisCsv(
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
      'trapezoidal-contraction-throat-analysis.csv'

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
        code="FM–57"
        icon="≈"
        title="Trapezoidal Contraction Throat & Choking Analysis"
        subtitle="Evaluate a specified lateral contraction and solve the available-energy throat flow state"
      />

      <ReferenceBasis>
        Calculator 440 compares the specified
        contracted width with the critical
        contraction limit from Calculator 439.
        An unchoked contraction has both
        subcritical and supercritical
        specific-energy roots.
      </ReferenceBasis>

      <div className="native-formula">
        E₁ =
        y₁ +
        V₁²/(2g)
        &nbsp;&nbsp;·&nbsp;&nbsp;
        E
        <sub>throat</sub>
        =
        y +
        V²/(2g)
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
        calculateLabel="Analyze contraction"
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
            headlineLabel="Throat status"
            headlineValue={result.throatStatus}
            modelName={result.modelName}
            note={result.limitationDescription}
          >
            <ResultItem
              label="Minimum Contracted Width"
              value={formatEngineeringNumber(
                result.minimumContractedBottomWidth,
              )}
              unit="m"
            />

            <ResultItem
              label="Remaining Width Margin"
              value={formatEngineeringNumber(
                result.remainingWidthMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Contraction Ratio"
              value={formatEngineeringNumber(
                result.contractionRatio,
              )}
              unit="-"
            />

            <ResultItem
              label="Width Limit Utilization"
              value={formatEngineeringNumber(
                result.widthLimitUtilizationPercent,
              )}
              unit="%"
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
              label="Throat Critical Depth"
              value={formatEngineeringNumber(
                result.throatCriticalDepth,
              )}
              unit="m"
            />

            <ResultItem
              label="Throat Critical Specific Energy"
              value={formatEngineeringNumber(
                result.throatCriticalSpecificEnergy,
              )}
              unit="m"
            />

            <ResultItem
              label="Available Specific-Energy Margin"
              value={formatEngineeringNumber(
                result.availableSpecificEnergyMargin,
              )}
              unit="m"
            />

            <ResultItem
              label="Maximum Passable Flow"
              value={formatEngineeringNumber(
                result.maximumPassableFlowAtAvailableEnergy,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Flow Capacity Margin"
              value={formatEngineeringNumber(
                result.flowCapacityMargin,
              )}
              unit="m³/s"
            />

            <ResultItem
              label="Additional Specific Energy Required"
              value={formatEngineeringNumber(
                result.additionalSpecificEnergyRequired,
              )}
              unit="m"
            />

            {result.subcriticalThroatDepth !== null ? (
              <ResultItem
                label="Subcritical Throat Depth"
                value={formatEngineeringNumber(
                  result.subcriticalThroatDepth,
                )}
                unit="m"
              />
            ) : null}

            {result.subcriticalThroatVelocity !== null ? (
              <ResultItem
                label="Subcritical Throat Velocity"
                value={formatEngineeringNumber(
                  result.subcriticalThroatVelocity,
                )}
                unit="m/s"
              />
            ) : null}

            {result.subcriticalThroatFroudeNumber !== null ? (
              <ResultItem
                label="Subcritical Throat Froude Number"
                value={formatEngineeringNumber(
                  result.subcriticalThroatFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.supercriticalAlternateDepth !== null ? (
              <ResultItem
                label="Supercritical Alternate Depth"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateDepth,
                )}
                unit="m"
              />
            ) : null}

            {result.supercriticalAlternateFroudeNumber !== null ? (
              <ResultItem
                label="Supercritical Alternate Froude Number"
                value={formatEngineeringNumber(
                  result.supercriticalAlternateFroudeNumber,
                )}
                unit="-"
              />
            ) : null}

            {result.waterSurfaceElevationChange !== null ? (
              <ResultItem
                label="Water-Surface Elevation Change"
                value={formatEngineeringNumber(
                  result.waterSurfaceElevationChange,
                )}
                unit="m"
              />
            ) : null}

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
