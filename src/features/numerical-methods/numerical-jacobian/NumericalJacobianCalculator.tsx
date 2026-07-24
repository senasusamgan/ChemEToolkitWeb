import { useState } from 'react'
import {
  NumericalJacobianCalculationError,
  calculateNumericalJacobian,
} from './engine'
import type { NumericalJacobianResult } from './types'
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
  x: '1',
  y: '0.5',
  circleConstant: '4',
  exponentialConstant: '3',
  stepX: '0.00001',
  stepY: '0.00001',
}

export function NumericalJacobianCalculator() {
  const [x, setX] = useState(example.x)
  const [y, setY] = useState(example.y)
  const [circleConstant, setCircleConstant] = useState(example.circleConstant)
  const [exponentialConstant, setExponentialConstant] = useState(example.exponentialConstant)
  const [stepX, setStepX] = useState(example.stepX)
  const [stepY, setStepY] = useState(example.stepY)

  const [result, setResult] =
    useState<NumericalJacobianResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateNumericalJacobian({
        x: Number(x),
        y: Number(y),
        circleConstant: Number(circleConstant),
        exponentialConstant: Number(exponentialConstant),
        stepX: Number(stepX),
        stepY: Number(stepY),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof NumericalJacobianCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setX(example.x)
    setY(example.y)
    setCircleConstant(example.circleConstant)
    setExponentialConstant(example.exponentialConstant)
    setStepX(example.stepX)
    setStepY(example.stepY)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setX('')
    setY('')
    setCircleConstant('')
    setExponentialConstant('')
    setStepX('')
    setStepY('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–33"
        icon="J"
        title="Numerical Jacobian"
        subtitle="Central-difference Jacobian for a two-function system"
      />

      <ReferenceBasis>
        Jᵢⱼ ≈ [fᵢ(x + hⱼeⱼ) − fᵢ(x − hⱼeⱼ)] / 2hⱼ
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Evaluation x" symbol="x" value={x} unit="—" onChange={setX} />
        <NumericInput label="Evaluation y" symbol="y" value={y} unit="—" onChange={setY} />
        <NumericInput label="Circle Constant" symbol="c₁" value={circleConstant} unit="—" onChange={setCircleConstant} />
        <NumericInput label="Exponential Constant" symbol="c₂" value={exponentialConstant} unit="—" onChange={setExponentialConstant} />
        <NumericInput label="x Step Size" symbol="hₓ" value={stepX} unit="—" onChange={setStepX} />
        <NumericInput label="y Step Size" symbol="hᵧ" value={stepY} unit="—" onChange={setStepY} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Estimate Jacobian" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Jacobian determinant"
          headlineValue={formatEngineeringNumber(result.determinant)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="J₁₁" value={formatEngineeringNumber(result.j11)} unit="—" />
          <ResultItem label="J₁₂" value={formatEngineeringNumber(result.j12)} unit="—" />
          <ResultItem label="J₂₁" value={formatEngineeringNumber(result.j21)} unit="—" />
          <ResultItem label="J₂₂" value={formatEngineeringNumber(result.j22)} unit="—" />
          <ResultItem label="Maximum Absolute Error" value={formatEngineeringNumber(result.maximumAbsoluteError)} unit="—" />
          <ResultItem label="Condition Indicator" value={formatEngineeringNumber(result.conditionIndicator)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
