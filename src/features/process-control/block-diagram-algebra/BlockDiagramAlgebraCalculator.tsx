import { useState } from 'react'
import {
  BlockDiagramAlgebraCalculationError,
  calculateBlockDiagramAlgebra,
} from './engine'
import type { BlockDiagramAlgebraResult } from './types'
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
  firstForwardGain: '2',
  secondForwardGain: '3',
  feedbackGain: '0.5',
  inputSignal: '4',
}

export function BlockDiagramAlgebraCalculator() {
  const [firstForwardGain, setFirstForwardGain] = useState(example.firstForwardGain)
  const [secondForwardGain, setSecondForwardGain] = useState(example.secondForwardGain)
  const [feedbackGain, setFeedbackGain] = useState(example.feedbackGain)
  const [inputSignal, setInputSignal] = useState(example.inputSignal)

  const [result, setResult] =
    useState<BlockDiagramAlgebraResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateBlockDiagramAlgebra({
            firstForwardGain: Number(firstForwardGain),
            secondForwardGain: Number(secondForwardGain),
            feedbackGain: Number(feedbackGain),
            inputSignal: Number(inputSignal),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof BlockDiagramAlgebraCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFirstForwardGain(example.firstForwardGain)
    setSecondForwardGain(example.secondForwardGain)
    setFeedbackGain(example.feedbackGain)
    setInputSignal(example.inputSignal)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFirstForwardGain('')
    setSecondForwardGain('')
    setFeedbackGain('')
    setInputSignal('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–01"
        icon="Σ"
        title="Block-Diagram Algebra"
        subtitle="Reduce series blocks and a negative-feedback loop"
      />

      <ReferenceBasis>
        Gcl = G₁G₂ / (1 + G₁G₂H)
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="First Forward Gain"
          symbol="G₁"
          value={firstForwardGain}
          unit="—"
          onChange={setFirstForwardGain}
        />
        <NumericInput
          label="Second Forward Gain"
          symbol="G₂"
          value={secondForwardGain}
          unit="—"
          onChange={setSecondForwardGain}
        />
        <NumericInput
          label="Feedback Gain"
          symbol="H"
          value={feedbackGain}
          unit="—"
          onChange={setFeedbackGain}
        />
        <NumericInput
          label="Input Signal"
          symbol="R"
          value={inputSignal}
          unit="signal"
          onChange={setInputSignal}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Reduce block diagram"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Closed-loop gain"
          headlineValue={formatEngineeringNumber(result.closedLoopGain)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Series Forward Gain"
            value={formatEngineeringNumber(result.seriesForwardGain)}
            unit="—"
          />
          <ResultItem
            label="Loop Gain"
            value={formatEngineeringNumber(result.loopGain)}
            unit="—"
          />
          <ResultItem
            label="Output Signal"
            value={formatEngineeringNumber(result.outputSignal)}
            unit="signal"
          />
          <ResultItem
            label="Error Signal"
            value={formatEngineeringNumber(result.errorSignal)}
            unit="signal"
          />
          <ResultItem
            label="Sensitivity"
            value={formatEngineeringNumber(result.sensitivity)}
            unit="—"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
