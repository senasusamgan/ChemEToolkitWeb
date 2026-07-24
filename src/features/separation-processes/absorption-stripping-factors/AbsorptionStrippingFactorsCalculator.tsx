import { useState } from 'react'
import {
  AbsorptionStrippingFactorsCalculationError,
  calculateAbsorptionStrippingFactors,
} from './engine'
import type { AbsorptionStrippingFactorsResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

const example = {
  liquidMolarFlowRate: '120',
  gasMolarFlowRate: '80',
  equilibriumSlope: '1.2',
}

export function AbsorptionStrippingFactorsCalculator() {
  const [liquidMolarFlowRate, setLiquidMolarFlowRate] =
    useState(example.liquidMolarFlowRate)
  const [gasMolarFlowRate, setGasMolarFlowRate] =
    useState(example.gasMolarFlowRate)
  const [equilibriumSlope, setEquilibriumSlope] =
    useState(example.equilibriumSlope)

  const [result, setResult] =
    useState<AbsorptionStrippingFactorsResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateAbsorptionStrippingFactors({
          liquidMolarFlowRate:
            Number(liquidMolarFlowRate),
          gasMolarFlowRate:
            Number(gasMolarFlowRate),
          equilibriumSlope:
            Number(equilibriumSlope),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          AbsorptionStrippingFactorsCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLiquidMolarFlowRate(example.liquidMolarFlowRate)
    setGasMolarFlowRate(example.gasMolarFlowRate)
    setEquilibriumSlope(example.equilibriumSlope)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLiquidMolarFlowRate('')
    setGasMolarFlowRate('')
    setEquilibriumSlope('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–24"
        icon="⇅"
        title="Absorption & Stripping Factors"
        subtitle="Flow-to-equilibrium ratios for dilute gas–liquid separations"
      />

      <ReferenceBasis>
        Linear equilibrium relation y* = mx
      </ReferenceBasis>

      <div className="native-formula">
        A = L/(mV) · S = mV/L = 1/A
      </div>

      <div className="native-input-grid">
        <NumericInput label="Liquid Molar Flow" symbol="L" value={liquidMolarFlowRate} unit="kmol/h" onChange={setLiquidMolarFlowRate} />
        <NumericInput label="Gas Molar Flow" symbol="V" value={gasMolarFlowRate} unit="kmol/h" onChange={setGasMolarFlowRate} />
        <NumericInput label="Equilibrium Slope" symbol="m" value={equilibriumSlope} unit="—" onChange={setEquilibriumSlope} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate factors"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Absorption factor"
          headlineValue={formatEngineeringNumber(result.absorptionFactor)}
          modelName={result.modelName}
          note={`${result.absorptionAssessment} ${result.strippingAssessment} ${result.limitationDescription}`}
        >
          <ResultItem label="Stripping Factor" value={formatEngineeringNumber(result.strippingFactor)} unit="—" />
          <ResultItem label="Liquid / Gas Ratio" value={formatEngineeringNumber(result.liquidToGasRatio)} unit="—" />
          <ResultItem label="Gas / Liquid Ratio" value={formatEngineeringNumber(result.gasToLiquidRatio)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
