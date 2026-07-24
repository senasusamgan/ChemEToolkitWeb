import { useState } from 'react'
import {
  SingleStageGasAbsorptionCalculationError,
  calculateSingleStageGasAbsorption,
} from './engine'
import type { SingleStageGasAbsorptionResult } from './types'
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
  gasCarrierMolarFlowRate: '100',
  liquidCarrierMolarFlowRate: '150',
  inletGasSoluteRatio: '0.08',
  inletLiquidSoluteRatio: '0.005',
  equilibriumSlope: '1.2',
}

export function SingleStageGasAbsorptionCalculator() {
  const [
    gasCarrierMolarFlowRate,
    setGasCarrierMolarFlowRate,
  ] = useState(example.gasCarrierMolarFlowRate)
  const [
    liquidCarrierMolarFlowRate,
    setLiquidCarrierMolarFlowRate,
  ] = useState(example.liquidCarrierMolarFlowRate)
  const [
    inletGasSoluteRatio,
    setInletGasSoluteRatio,
  ] = useState(example.inletGasSoluteRatio)
  const [
    inletLiquidSoluteRatio,
    setInletLiquidSoluteRatio,
  ] = useState(example.inletLiquidSoluteRatio)
  const [equilibriumSlope, setEquilibriumSlope] =
    useState(example.equilibriumSlope)

  const [result, setResult] =
    useState<SingleStageGasAbsorptionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateSingleStageGasAbsorption({
          gasCarrierMolarFlowRate:
            Number(gasCarrierMolarFlowRate),
          liquidCarrierMolarFlowRate:
            Number(liquidCarrierMolarFlowRate),
          inletGasSoluteRatio:
            Number(inletGasSoluteRatio),
          inletLiquidSoluteRatio:
            Number(inletLiquidSoluteRatio),
          equilibriumSlope:
            Number(equilibriumSlope),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          SingleStageGasAbsorptionCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setGasCarrierMolarFlowRate(
      example.gasCarrierMolarFlowRate,
    )
    setLiquidCarrierMolarFlowRate(
      example.liquidCarrierMolarFlowRate,
    )
    setInletGasSoluteRatio(
      example.inletGasSoluteRatio,
    )
    setInletLiquidSoluteRatio(
      example.inletLiquidSoluteRatio,
    )
    setEquilibriumSlope(example.equilibriumSlope)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setGasCarrierMolarFlowRate('')
    setLiquidCarrierMolarFlowRate('')
    setInletGasSoluteRatio('')
    setInletLiquidSoluteRatio('')
    setEquilibriumSlope('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–39"
        icon="⇣"
        title="Single-Stage Gas Absorption"
        subtitle="Outlet gas and liquid compositions from one ideal equilibrium contact"
      />

      <ReferenceBasis>
        Dilute solute balance with Yout = mXout
      </ReferenceBasis>

      <div className="native-formula">
        Xout = (VYin + LXin)/(L + mV)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Gas Carrier Molar Flow" symbol="V" value={gasCarrierMolarFlowRate} unit="kmol carrier/h" onChange={setGasCarrierMolarFlowRate} />
        <NumericInput label="Liquid Carrier Molar Flow" symbol="L" value={liquidCarrierMolarFlowRate} unit="kmol carrier/h" onChange={setLiquidCarrierMolarFlowRate} />
        <NumericInput label="Inlet Gas Solute Ratio" symbol="Yin" value={inletGasSoluteRatio} unit="kmol/kmol carrier" onChange={setInletGasSoluteRatio} />
        <NumericInput label="Inlet Liquid Solute Ratio" symbol="Xin" value={inletLiquidSoluteRatio} unit="kmol/kmol carrier" onChange={setInletLiquidSoluteRatio} />
        <NumericInput label="Equilibrium Slope" symbol="m" value={equilibriumSlope} unit="—" onChange={setEquilibriumSlope} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve absorption stage"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Gas solute removal"
          headlineValue={`${formatEngineeringNumber(
            100 * result.gasSoluteRemovalFraction,
          )} %`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Outlet Gas Solute Ratio" value={formatEngineeringNumber(result.outletGasSoluteRatio)} unit="kmol/kmol carrier" />
          <ResultItem label="Outlet Liquid Solute Ratio" value={formatEngineeringNumber(result.outletLiquidSoluteRatio)} unit="kmol/kmol carrier" />
          <ResultItem label="Solute Absorbed Rate" value={formatEngineeringNumber(result.soluteAbsorbedRate)} unit="kmol/h" />
          <ResultItem label="Absorption Factor" value={formatEngineeringNumber(result.absorptionFactor)} unit="—" />
          <ResultItem label="Solute-Balance Residual" value={formatEngineeringNumber(result.soluteBalanceResidual)} unit="kmol/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
