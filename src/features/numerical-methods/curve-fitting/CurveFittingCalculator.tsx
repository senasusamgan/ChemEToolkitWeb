import { useState } from 'react'
import {
  CurveFittingCalculationError,
  calculateCurveFitting,
} from './engine'
import type { CurveFittingResult } from './types'
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
  x1: '0', y1: '1',
  x2: '1', y2: '2',
  x3: '2', y3: '5',
  x4: '3', y4: '10',
  x5: '4', y5: '17',
  polynomialDegree: '2',
  predictionX: '2.5',
}

export function CurveFittingCalculator() {
  const [x1, setX1] = useState(example.x1)
  const [y1, setY1] = useState(example.y1)
  const [x2, setX2] = useState(example.x2)
  const [y2, setY2] = useState(example.y2)
  const [x3, setX3] = useState(example.x3)
  const [y3, setY3] = useState(example.y3)
  const [x4, setX4] = useState(example.x4)
  const [y4, setY4] = useState(example.y4)
  const [x5, setX5] = useState(example.x5)
  const [y5, setY5] = useState(example.y5)
  const [polynomialDegree, setPolynomialDegree] = useState(example.polynomialDegree)
  const [predictionX, setPredictionX] = useState(example.predictionX)

  const [result, setResult] =
    useState<CurveFittingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateCurveFitting({
        x1: Number(x1), y1: Number(y1),
        x2: Number(x2), y2: Number(y2),
        x3: Number(x3), y3: Number(y3),
        x4: Number(x4), y4: Number(y4),
        x5: Number(x5), y5: Number(y5),
        polynomialDegree: Number(polynomialDegree),
        predictionX: Number(predictionX),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CurveFittingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setX1(example.x1); setY1(example.y1)
    setX2(example.x2); setY2(example.y2)
    setX3(example.x3); setY3(example.y3)
    setX4(example.x4); setY4(example.y4)
    setX5(example.x5); setY5(example.y5)
    setPolynomialDegree(example.polynomialDegree)
    setPredictionX(example.predictionX)
    setResult(null); setErrorMessage('')
  }

  function clearInputs() {
    setX1(''); setY1('')
    setX2(''); setY2('')
    setX3(''); setY3('')
    setX4(''); setY4('')
    setX5(''); setY5('')
    setPolynomialDegree('')
    setPredictionX('')
    setResult(null); setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="NM–19"
        icon="⌁"
        title="Curve Fitting & Regression"
        subtitle="Linear or quadratic least-squares fitting of five data points"
      />

      <ReferenceBasis>
        Normal equations for polynomial least squares
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput label="Point 1 — x" symbol="x₁" value={x1} unit="—" onChange={setX1} />
        <NumericInput label="Point 1 — y" symbol="y₁" value={y1} unit="—" onChange={setY1} />
        <NumericInput label="Point 2 — x" symbol="x₂" value={x2} unit="—" onChange={setX2} />
        <NumericInput label="Point 2 — y" symbol="y₂" value={y2} unit="—" onChange={setY2} />
        <NumericInput label="Point 3 — x" symbol="x₃" value={x3} unit="—" onChange={setX3} />
        <NumericInput label="Point 3 — y" symbol="y₃" value={y3} unit="—" onChange={setY3} />
        <NumericInput label="Point 4 — x" symbol="x₄" value={x4} unit="—" onChange={setX4} />
        <NumericInput label="Point 4 — y" symbol="y₄" value={y4} unit="—" onChange={setY4} />
        <NumericInput label="Point 5 — x" symbol="x₅" value={x5} unit="—" onChange={setX5} />
        <NumericInput label="Point 5 — y" symbol="y₅" value={y5} unit="—" onChange={setY5} />
        <NumericInput label="Polynomial Degree" symbol="d" value={polynomialDegree} unit="1 or 2" onChange={setPolynomialDegree} />
        <NumericInput label="Prediction Coordinate" symbol="xp" value={predictionX} unit="—" onChange={setPredictionX} />
      </div>

      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Fit regression model" />

      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}

      {result ? (
        <ResultPanel
          headlineLabel="Prediction"
          headlineValue={formatEngineeringNumber(result.predictionY)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Intercept c₀" value={formatEngineeringNumber(result.coefficient0)} unit="—" />
          <ResultItem label="Linear Coefficient c₁" value={formatEngineeringNumber(result.coefficient1)} unit="—" />
          <ResultItem label="Quadratic Coefficient c₂" value={formatEngineeringNumber(result.coefficient2)} unit="—" />
          <ResultItem label="R²" value={formatEngineeringNumber(result.rSquared)} unit="—" />
          <ResultItem label="RMSE" value={formatEngineeringNumber(result.rootMeanSquareError)} unit="—" />
          <ResultItem label="Residual Sum of Squares" value={formatEngineeringNumber(result.residualSumOfSquares)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
