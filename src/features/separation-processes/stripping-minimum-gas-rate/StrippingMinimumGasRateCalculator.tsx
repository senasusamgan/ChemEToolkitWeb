import { useState } from 'react'
import {
  StrippingMinimumGasRateCalculationError,
  calculateStrippingMinimumGasRate,
} from './engine'
import type { StrippingMinimumGasRateResult } from './types'
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
  liquidMolarFlowRate: '100',
  inletLiquidSoluteRatio: '0.08',
  outletLiquidSoluteRatio: '0.01',
  equilibriumSlope: '1.5',
  inletGasSoluteRatio: '0',
}

export function StrippingMinimumGasRateCalculator() {
  const [liquidMolarFlowRate, setLiquidMolarFlowRate] =
    useState(example.liquidMolarFlowRate)
  const [
    inletLiquidSoluteRatio,
    setInletLiquidSoluteRatio,
  ] = useState(example.inletLiquidSoluteRatio)
  const [
    outletLiquidSoluteRatio,
    setOutletLiquidSoluteRatio,
  ] = useState(example.outletLiquidSoluteRatio)
  const [equilibriumSlope, setEquilibriumSlope] =
    useState(example.equilibriumSlope)
  const [inletGasSoluteRatio, setInletGasSoluteRatio] =
    useState(example.inletGasSoluteRatio)

  const [result, setResult] =
    useState<StrippingMinimumGasRateResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateStrippingMinimumGasRate({
          liquidMolarFlowRate:
            Number(liquidMolarFlowRate),
          inletLiquidSoluteRatio:
            Number(inletLiquidSoluteRatio),
          outletLiquidSoluteRatio:
            Number(outletLiquidSoluteRatio),
          equilibriumSlope:
            Number(equilibriumSlope),
          inletGasSoluteRatio:
            Number(inletGasSoluteRatio),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          StrippingMinimumGasRateCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLiquidMolarFlowRate(example.liquidMolarFlowRate)
    setInletLiquidSoluteRatio(
      example.inletLiquidSoluteRatio,
    )
    setOutletLiquidSoluteRatio(
      example.outletLiquidSoluteRatio,
    )
    setEquilibriumSlope(example.equilibriumSlope)
    setInletGasSoluteRatio(
      example.inletGasSoluteRatio,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLiquidMolarFlowRate('')
    setInletLiquidSoluteRatio('')
    setOutletLiquidSoluteRatio('')
    setEquilibriumSlope('')
    setInletGasSoluteRatio('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–29"
        icon="↑"
        title="Minimum Gas Rate for Stripping"
        subtitle="Pinch-limited gas flow for a specified liquid solute reduction"
      />

      <ReferenceBasis>
        Top-pinch equilibrium with Yout* = mXin
      </ReferenceBasis>

      <div className="native-formula">
        Vmin = L(Xin − Xout)/(mXin − Yin)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Liquid Molar Flow" symbol="L" value={liquidMolarFlowRate} unit="kmol carrier/h" onChange={setLiquidMolarFlowRate} />
        <NumericInput label="Inlet Liquid Solute Ratio" symbol="Xin" value={inletLiquidSoluteRatio} unit="kmol/kmol carrier" onChange={setInletLiquidSoluteRatio} />
        <NumericInput label="Outlet Liquid Solute Ratio" symbol="Xout" value={outletLiquidSoluteRatio} unit="kmol/kmol carrier" onChange={setOutletLiquidSoluteRatio} />
        <NumericInput label="Equilibrium Slope" symbol="m" value={equilibriumSlope} unit="—" onChange={setEquilibriumSlope} />
        <NumericInput label="Entering Gas Solute Ratio" symbol="Yin" value={inletGasSoluteRatio} unit="kmol/kmol carrier" onChange={setInletGasSoluteRatio} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate minimum gas rate"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Minimum gas molar flow"
          headlineValue={`${formatEngineeringNumber(
            result.minimumGasMolarFlowRate,
          )} kmol/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Minimum Gas / Liquid Ratio" value={formatEngineeringNumber(result.minimumGasToLiquidRatio)} unit="—" />
          <ResultItem label="Equilibrium Outlet Gas Ratio" value={formatEngineeringNumber(result.equilibriumOutletGasRatio)} unit="kmol/kmol carrier" />
          <ResultItem label="Solute Removed Rate" value={formatEngineeringNumber(result.soluteRemovedRate)} unit="kmol/h" />
          <ResultItem label="Gas-Phase Driving Difference" value={formatEngineeringNumber(result.denominatorDrivingDifference)} unit="kmol/kmol carrier" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
