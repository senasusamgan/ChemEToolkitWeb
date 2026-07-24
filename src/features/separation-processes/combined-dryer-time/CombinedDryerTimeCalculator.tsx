import { useState } from 'react'
import {
  CombinedDryerTimeCalculationError,
  calculateCombinedDryerTime,
} from './engine'
import type { CombinedDryerTimeResult } from './types'
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
  drySolidMass: '100',
  dryingArea: '10',
  constantDryingRate: '5',
  initialMoistureContent: '0.50',
  criticalMoistureContent: '0.20',
  finalMoistureContent: '0.05',
  equilibriumMoistureContent: '0.02',
}

export function CombinedDryerTimeCalculator() {
  const [drySolidMass, setDrySolidMass] =
    useState(example.drySolidMass)
  const [dryingArea, setDryingArea] =
    useState(example.dryingArea)
  const [constantDryingRate, setConstantDryingRate] =
    useState(example.constantDryingRate)
  const [
    initialMoistureContent,
    setInitialMoistureContent,
  ] = useState(example.initialMoistureContent)
  const [
    criticalMoistureContent,
    setCriticalMoistureContent,
  ] = useState(example.criticalMoistureContent)
  const [
    finalMoistureContent,
    setFinalMoistureContent,
  ] = useState(example.finalMoistureContent)
  const [
    equilibriumMoistureContent,
    setEquilibriumMoistureContent,
  ] = useState(example.equilibriumMoistureContent)

  const [result, setResult] =
    useState<CombinedDryerTimeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCombinedDryerTime({
          drySolidMass: Number(drySolidMass),
          dryingArea: Number(dryingArea),
          constantDryingRate:
            Number(constantDryingRate),
          initialMoistureContent:
            Number(initialMoistureContent),
          criticalMoistureContent:
            Number(criticalMoistureContent),
          finalMoistureContent:
            Number(finalMoistureContent),
          equilibriumMoistureContent:
            Number(equilibriumMoistureContent),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          CombinedDryerTimeCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDrySolidMass(example.drySolidMass)
    setDryingArea(example.dryingArea)
    setConstantDryingRate(example.constantDryingRate)
    setInitialMoistureContent(
      example.initialMoistureContent,
    )
    setCriticalMoistureContent(
      example.criticalMoistureContent,
    )
    setFinalMoistureContent(
      example.finalMoistureContent,
    )
    setEquilibriumMoistureContent(
      example.equilibriumMoistureContent,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDrySolidMass('')
    setDryingArea('')
    setConstantDryingRate('')
    setInitialMoistureContent('')
    setCriticalMoistureContent('')
    setFinalMoistureContent('')
    setEquilibriumMoistureContent('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–36"
        icon="♨"
        title="Combined Dryer Time"
        subtitle="Total drying time across constant-rate and falling-rate periods"
      />

      <ReferenceBasis>
        Linear falling-rate model on a dry-solid moisture basis
      </ReferenceBasis>

      <div className="native-formula">
        t = Ms/(ARc)[Xi − Xc + (Xc − Xe) ln((Xc − Xe)/(Xf − Xe))]
      </div>

      <div className="native-input-grid">
        <NumericInput label="Dry-Solid Mass" symbol="Ms" value={drySolidMass} unit="kg dry solid" onChange={setDrySolidMass} />
        <NumericInput label="Drying Area" symbol="A" value={dryingArea} unit="m²" onChange={setDryingArea} />
        <NumericInput label="Constant Drying Rate" symbol="Rc" value={constantDryingRate} unit="kg/(m²·h)" onChange={setConstantDryingRate} />
        <NumericInput label="Initial Moisture Content" symbol="Xi" value={initialMoistureContent} unit="kg/kg dry solid" onChange={setInitialMoistureContent} />
        <NumericInput label="Critical Moisture Content" symbol="Xc" value={criticalMoistureContent} unit="kg/kg dry solid" onChange={setCriticalMoistureContent} />
        <NumericInput label="Final Moisture Content" symbol="Xf" value={finalMoistureContent} unit="kg/kg dry solid" onChange={setFinalMoistureContent} />
        <NumericInput label="Equilibrium Moisture Content" symbol="Xe" value={equilibriumMoistureContent} unit="kg/kg dry solid" onChange={setEquilibriumMoistureContent} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate combined drying time"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Total drying time"
          headlineValue={`${formatEngineeringNumber(
            result.totalDryingTime,
          )} h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Constant-Rate Time" value={formatEngineeringNumber(result.constantRateTime)} unit="h" />
          <ResultItem label="Falling-Rate Time" value={formatEngineeringNumber(result.fallingRateTime)} unit="h" />
          <ResultItem label="Constant-Rate Moisture Removed" value={formatEngineeringNumber(result.constantRateMoistureRemoved)} unit="kg" />
          <ResultItem label="Falling-Rate Moisture Removed" value={formatEngineeringNumber(result.fallingRateMoistureRemoved)} unit="kg" />
          <ResultItem label="Total Moisture Removed" value={formatEngineeringNumber(result.totalMoistureRemoved)} unit="kg" />
          <ResultItem label="Falling-Rate Share of Time" value={formatEngineeringNumber(100 * result.fallingRateTimeFraction)} unit="%" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
