import { useState } from 'react'
import {
  InteractingTankSystemCalculationError,
  calculateInteractingTankSystem,
} from './engine'
import type { InteractingTankSystemResult } from './types'
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
  firstTankArea: '2',
  secondTankArea: '3',
  interTankResistance: '1.5',
  outletResistance: '2',
  inletFlowStep: '1',
  evaluationTime: '20',
  integrationSteps: '2000',
}

export function InteractingTankSystemCalculator() {
  const [firstTankArea, setFirstTankArea] = useState(example.firstTankArea)
  const [secondTankArea, setSecondTankArea] = useState(example.secondTankArea)
  const [interTankResistance, setInterTankResistance] = useState(example.interTankResistance)
  const [outletResistance, setOutletResistance] = useState(example.outletResistance)
  const [inletFlowStep, setInletFlowStep] = useState(example.inletFlowStep)
  const [evaluationTime, setEvaluationTime] = useState(example.evaluationTime)
  const [integrationSteps, setIntegrationSteps] = useState(example.integrationSteps)

  const [result, setResult] =
    useState<InteractingTankSystemResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateInteractingTankSystem({
            firstTankArea: Number(firstTankArea),
            secondTankArea: Number(secondTankArea),
            interTankResistance: Number(interTankResistance),
            outletResistance: Number(outletResistance),
            inletFlowStep: Number(inletFlowStep),
            evaluationTime: Number(evaluationTime),
            integrationSteps: Number(integrationSteps),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof InteractingTankSystemCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFirstTankArea(example.firstTankArea)
    setSecondTankArea(example.secondTankArea)
    setInterTankResistance(example.interTankResistance)
    setOutletResistance(example.outletResistance)
    setInletFlowStep(example.inletFlowStep)
    setEvaluationTime(example.evaluationTime)
    setIntegrationSteps(example.integrationSteps)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFirstTankArea('')
    setSecondTankArea('')
    setInterTankResistance('')
    setOutletResistance('')
    setInletFlowStep('')
    setEvaluationTime('')
    setIntegrationSteps('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–11"
        icon="▥"
        title="Interacting Tank System"
        subtitle="Transient levels and flows for two hydraulically interacting tanks"
      />

      <ReferenceBasis>
        A₁dh₁/dt = qin − (h₁ − h₂)/R₁
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="First Tank Area"
          symbol="A₁"
          value={firstTankArea}
          unit="area"
          onChange={setFirstTankArea}
        />
        <NumericInput
          label="Second Tank Area"
          symbol="A₂"
          value={secondTankArea}
          unit="area"
          onChange={setSecondTankArea}
        />
        <NumericInput
          label="Inter-Tank Resistance"
          symbol="R₁"
          value={interTankResistance}
          unit="level/flow"
          onChange={setInterTankResistance}
        />
        <NumericInput
          label="Outlet Resistance"
          symbol="R₂"
          value={outletResistance}
          unit="level/flow"
          onChange={setOutletResistance}
        />
        <NumericInput
          label="Inlet Flow Step"
          symbol="qin"
          value={inletFlowStep}
          unit="volume/time"
          onChange={setInletFlowStep}
        />
        <NumericInput
          label="Evaluation Time"
          symbol="t"
          value={evaluationTime}
          unit="time"
          onChange={setEvaluationTime}
        />
        <NumericInput
          label="Integration Steps"
          symbol="N"
          value={integrationSteps}
          unit="steps"
          onChange={setIntegrationSteps}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Simulate tank response"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Second tank level"
          headlineValue={formatEngineeringNumber(result.secondTankLevel)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="First Tank Level"
            value={formatEngineeringNumber(result.firstTankLevel)}
            unit="level"
          />
          <ResultItem
            label="Inter-Tank Flow"
            value={formatEngineeringNumber(result.interTankFlow)}
            unit="volume/time"
          />
          <ResultItem
            label="Outlet Flow"
            value={formatEngineeringNumber(result.outletFlow)}
            unit="volume/time"
          />
          <ResultItem
            label="Total Stored Volume"
            value={formatEngineeringNumber(result.totalStoredVolume)}
            unit="volume"
          />
          <ResultItem
            label="Cumulative Outlet Volume"
            value={formatEngineeringNumber(result.cumulativeOutletVolume)}
            unit="volume"
          />
          <ResultItem
            label="Volume-Balance Residual"
            value={formatEngineeringNumber(result.volumeBalanceResidual)}
            unit="volume"
          />
          <ResultItem
            label="First Steady-State Level"
            value={formatEngineeringNumber(result.firstSteadyStateLevel)}
            unit="level"
          />
          <ResultItem
            label="Second Steady-State Level"
            value={formatEngineeringNumber(result.secondSteadyStateLevel)}
            unit="level"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
