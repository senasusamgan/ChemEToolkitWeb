import { useState } from 'react'
import {
  HighOrderFiniteDifferenceCalculationError,
  calculateHighOrderFiniteDifference,
} from './engine'
import type { HighOrderFiniteDifferenceResult } from './types'
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
  coefficient4: '1',
  coefficient3: '-2',
  coefficient2: '3',
  coefficient1: '4',
  coefficient0: '5',
  evaluationX: '1.5',
  stepSize: '0.01',
}

export function HighOrderFiniteDifferenceCalculator() {
  const [coefficient4, setCoefficient4] = useState(example.coefficient4)
  const [coefficient3, setCoefficient3] = useState(example.coefficient3)
  const [coefficient2, setCoefficient2] = useState(example.coefficient2)
  const [coefficient1, setCoefficient1] = useState(example.coefficient1)
  const [coefficient0, setCoefficient0] = useState(example.coefficient0)
  const [evaluationX, setEvaluationX] = useState(example.evaluationX)
  const [stepSize, setStepSize] = useState(example.stepSize)

  const [result, setResult] =
    useState<HighOrderFiniteDifferenceResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateHighOrderFiniteDifference({
        coefficient4: Number(coefficient4),
        coefficient3: Number(coefficient3),
        coefficient2: Number(coefficient2),
        coefficient1: Number(coefficient1),
        coefficient0: Number(coefficient0),
        evaluationX: Number(evaluationX),
        stepSize: Number(stepSize),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof HighOrderFiniteDifferenceCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setCoefficient4(example.coefficient4)
    setCoefficient3(example.coefficient3)
    setCoefficient2(example.coefficient2)
    setCoefficient1(example.coefficient1)
    setCoefficient0(example.coefficient0)
    setEvaluationX(example.evaluationX)
    setStepSize(example.stepSize)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setCoefficient4('')
    setCoefficient3('')
    setCoefficient2('')
    setCoefficient1('')
    setCoefficient0('')
    setEvaluationX('')
    setStepSize('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–22"
        icon="Δ"
        title="High-Order Finite Difference"
        subtitle="Five-point fourth-order estimates of first and second derivatives"
      />

      <ReferenceBasis>
        Quartic test function f(x) = a₄x⁴ + a₃x³ + a₂x² + a₁x + a₀
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Quartic Coefficient" symbol="a₄" value={coefficient4} unit="—" onChange={setCoefficient4} />
        <NumericInput label="Cubic Coefficient" symbol="a₃" value={coefficient3} unit="—" onChange={setCoefficient3} />
        <NumericInput label="Quadratic Coefficient" symbol="a₂" value={coefficient2} unit="—" onChange={setCoefficient2} />
        <NumericInput label="Linear Coefficient" symbol="a₁" value={coefficient1} unit="—" onChange={setCoefficient1} />
        <NumericInput label="Constant Coefficient" symbol="a₀" value={coefficient0} unit="—" onChange={setCoefficient0} />
        <NumericInput label="Evaluation Coordinate" symbol="x" value={evaluationX} unit="—" onChange={setEvaluationX} />
        <NumericInput label="Finite-Difference Step" symbol="h" value={stepSize} unit="x" onChange={setStepSize} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Estimate derivatives" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="First derivative"
          headlineValue={formatEngineeringNumber(result.firstDerivative)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Second Derivative" value={formatEngineeringNumber(result.secondDerivative)} unit="—" />
          <ResultItem label="Exact First Derivative" value={formatEngineeringNumber(result.exactFirstDerivative)} unit="—" />
          <ResultItem label="Exact Second Derivative" value={formatEngineeringNumber(result.exactSecondDerivative)} unit="—" />
          <ResultItem label="First-Derivative Absolute Error" value={formatEngineeringNumber(result.firstDerivativeAbsoluteError)} unit="—" />
          <ResultItem label="Second-Derivative Absolute Error" value={formatEngineeringNumber(result.secondDerivativeAbsoluteError)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
