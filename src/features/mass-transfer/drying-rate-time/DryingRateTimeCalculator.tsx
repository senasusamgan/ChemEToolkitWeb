import { useState } from 'react'
import {
  DryingRateTimeCalculationError,
  calculateDryingRateTime,
} from './engine'
import type { DryingRateTimeResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const EXAMPLE = {
  drySolidMass: '100',
  dryingArea: '10',
  constantDryingFlux: '2',
  initialMoistureContent: '0.5',
  criticalMoistureContent: '0.2',
  equilibriumMoistureContent: '0.05',
  finalMoistureContent: '0.1',
}

export function DryingRateTimeCalculator() {
  const [drySolidMass, setDrySolidMass] = useState(EXAMPLE.drySolidMass)
  const [dryingArea, setDryingArea] = useState(EXAMPLE.dryingArea)
  const [constantDryingFlux, setConstantDryingFlux] = useState(EXAMPLE.constantDryingFlux)
  const [initialMoistureContent, setInitialMoistureContent] = useState(EXAMPLE.initialMoistureContent)
  const [criticalMoistureContent, setCriticalMoistureContent] = useState(EXAMPLE.criticalMoistureContent)
  const [equilibriumMoistureContent, setEquilibriumMoistureContent] = useState(EXAMPLE.equilibriumMoistureContent)
  const [finalMoistureContent, setFinalMoistureContent] = useState(EXAMPLE.finalMoistureContent)
  const [result, setResult] = useState<DryingRateTimeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateDryingRateTime({
          drySolidMass: Number(drySolidMass),
          dryingArea: Number(dryingArea),
          constantDryingFlux: Number(constantDryingFlux),
          initialMoistureContent: Number(initialMoistureContent),
          criticalMoistureContent: Number(criticalMoistureContent),
          equilibriumMoistureContent: Number(equilibriumMoistureContent),
          finalMoistureContent: Number(finalMoistureContent),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof DryingRateTimeCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDrySolidMass(EXAMPLE.drySolidMass)
    setDryingArea(EXAMPLE.dryingArea)
    setConstantDryingFlux(EXAMPLE.constantDryingFlux)
    setInitialMoistureContent(EXAMPLE.initialMoistureContent)
    setCriticalMoistureContent(EXAMPLE.criticalMoistureContent)
    setEquilibriumMoistureContent(EXAMPLE.equilibriumMoistureContent)
    setFinalMoistureContent(EXAMPLE.finalMoistureContent)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDrySolidMass('')
    setDryingArea('')
    setConstantDryingFlux('')
    setInitialMoistureContent('')
    setCriticalMoistureContent('')
    setEquilibriumMoistureContent('')
    setFinalMoistureContent('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–34"
        icon="≈"
        title="Drying Rate & Time"
        subtitle="Constant-rate and linear falling-rate drying periods"
      />
      <ReferenceBasis>Dry-solid moisture basis with a linear falling-rate curve</ReferenceBasis>
      <div className="native-formula">
        t𝚌 = Mₛ(Xᵢ − X𝚌)/(AR𝚌) · t𝒇 = Mₛ(X𝚌 − Xₑ)/(AR𝚌) ln[(X𝚌 − Xₑ)/(X𝒇 − Xₑ)]
      </div>
      <div className="native-input-grid">
        <NumericInput label="Dry-Solid Mass" symbol="Mₛ" value={drySolidMass} unit="kg dry solid" onChange={setDrySolidMass} />
        <NumericInput label="Drying Area" symbol="A" value={dryingArea} unit="m²" onChange={setDryingArea} />
        <NumericInput label="Constant Drying Flux" symbol="R𝚌" value={constantDryingFlux} unit="kg/(m²·h)" onChange={setConstantDryingFlux} />
        <NumericInput label="Initial Moisture" symbol="Xᵢ" value={initialMoistureContent} unit="kg/kg dry" onChange={setInitialMoistureContent} />
        <NumericInput label="Critical Moisture" symbol="X𝚌" value={criticalMoistureContent} unit="kg/kg dry" onChange={setCriticalMoistureContent} />
        <NumericInput label="Equilibrium Moisture" symbol="Xₑ" value={equilibriumMoistureContent} unit="kg/kg dry" onChange={setEquilibriumMoistureContent} />
        <NumericInput label="Final Moisture" symbol="X𝒇" value={finalMoistureContent} unit="kg/kg dry" onChange={setFinalMoistureContent} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Calculate drying time" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Total drying time"
          headlineValue={`${formatEngineeringNumber(result.totalDryingTime)} h`}
          modelName={result.modelName}
          note={result.periodDescription}
        >
          <ResultItem label="Constant-Rate Time" value={formatEngineeringNumber(result.constantRateTime)} unit="h" />
          <ResultItem label="Falling-Rate Time" value={formatEngineeringNumber(result.fallingRateTime)} unit="h" />
          <ResultItem label="Removed Moisture" value={formatEngineeringNumber(result.removedMoistureMass)} unit="kg" />
          <ResultItem label="Average Drying Flux" value={formatEngineeringNumber(result.averageDryingFlux)} unit="kg/(m²·h)" />
          <ResultItem label="Final Drying Flux" value={formatEngineeringNumber(result.finalDryingFlux)} unit="kg/(m²·h)" />
          <ResultItem label="Constant-Rate Moisture Removed" value={formatEngineeringNumber(result.constantRateMoistureRemoved)} unit="kg/kg dry" />
          <ResultItem label="Falling-Rate Moisture Removed" value={formatEngineeringNumber(result.fallingRateMoistureRemoved)} unit="kg/kg dry" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
