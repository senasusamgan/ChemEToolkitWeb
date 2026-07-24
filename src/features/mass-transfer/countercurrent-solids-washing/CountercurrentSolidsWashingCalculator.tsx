import { useState } from 'react'
import {
  CountercurrentSolidsWashingCalculationError,
  calculateCountercurrentSolidsWashing,
} from './engine'
import type { CountercurrentSolidsWashingResult } from './types'
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
  insolubleSolidFlowRate: '100',
  retainedSolventPerInsolubleSolid: '0.5',
  freshWashSolventFlowRate: '100',
  feedUnderflowSoluteRatio: '0.2',
  freshWashSoluteRatio: '0',
  numberOfIdealStages: '3',
}

export function CountercurrentSolidsWashingCalculator() {
  const [insolubleSolidFlowRate, setInsolubleSolidFlowRate] = useState(EXAMPLE.insolubleSolidFlowRate)
  const [retainedSolventPerInsolubleSolid, setRetainedSolventPerInsolubleSolid] = useState(EXAMPLE.retainedSolventPerInsolubleSolid)
  const [freshWashSolventFlowRate, setFreshWashSolventFlowRate] = useState(EXAMPLE.freshWashSolventFlowRate)
  const [feedUnderflowSoluteRatio, setFeedUnderflowSoluteRatio] = useState(EXAMPLE.feedUnderflowSoluteRatio)
  const [freshWashSoluteRatio, setFreshWashSoluteRatio] = useState(EXAMPLE.freshWashSoluteRatio)
  const [numberOfIdealStages, setNumberOfIdealStages] = useState(EXAMPLE.numberOfIdealStages)
  const [result, setResult] = useState<CountercurrentSolidsWashingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCountercurrentSolidsWashing({
          insolubleSolidFlowRate: Number(insolubleSolidFlowRate),
          retainedSolventPerInsolubleSolid: Number(retainedSolventPerInsolubleSolid),
          freshWashSolventFlowRate: Number(freshWashSolventFlowRate),
          feedUnderflowSoluteRatio: Number(feedUnderflowSoluteRatio),
          freshWashSoluteRatio: Number(freshWashSoluteRatio),
          numberOfIdealStages: Number(numberOfIdealStages),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CountercurrentSolidsWashingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInsolubleSolidFlowRate(EXAMPLE.insolubleSolidFlowRate)
    setRetainedSolventPerInsolubleSolid(EXAMPLE.retainedSolventPerInsolubleSolid)
    setFreshWashSolventFlowRate(EXAMPLE.freshWashSolventFlowRate)
    setFeedUnderflowSoluteRatio(EXAMPLE.feedUnderflowSoluteRatio)
    setFreshWashSoluteRatio(EXAMPLE.freshWashSoluteRatio)
    setNumberOfIdealStages(EXAMPLE.numberOfIdealStages)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInsolubleSolidFlowRate('')
    setRetainedSolventPerInsolubleSolid('')
    setFreshWashSolventFlowRate('')
    setFeedUnderflowSoluteRatio('')
    setFreshWashSoluteRatio('')
    setNumberOfIdealStages('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–32"
        icon="⇄"
        title="Countercurrent Solids Washing"
        subtitle="Ideal washer-stage concentrations, recovery and final underflow loss"
      />
      <ReferenceBasis>Coupled solute balances for ideal mixing–settling stages</ReferenceBasis>
      <div className="native-formula">
        U Xᵢ₋₁ + V Xᵢ₊₁ = (U + V)Xᵢ · washing factor = V/U
      </div>
      <div className="native-input-grid">
        <NumericInput label="Insoluble-Solid Flow" symbol="B" value={insolubleSolidFlowRate} unit="kg/h" onChange={setInsolubleSolidFlowRate} />
        <NumericInput label="Retained Solvent per Solid" symbol="U/B" value={retainedSolventPerInsolubleSolid} unit="kg/kg solid" onChange={setRetainedSolventPerInsolubleSolid} />
        <NumericInput label="Fresh Wash-Solvent Flow" symbol="V" value={freshWashSolventFlowRate} unit="kg/h" onChange={setFreshWashSolventFlowRate} />
        <NumericInput label="Number of Ideal Stages" symbol="N" value={numberOfIdealStages} unit="stages" onChange={setNumberOfIdealStages} />
        <NumericInput label="Feed Underflow Solute Ratio" symbol="X₀" value={feedUnderflowSoluteRatio} unit="kg/kg solvent" onChange={setFeedUnderflowSoluteRatio} />
        <NumericInput label="Fresh Wash Solute Ratio" symbol="Xₙ₊₁" value={freshWashSoluteRatio} unit="kg/kg solvent" onChange={setFreshWashSoluteRatio} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Solve washing stages" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Solute removal"
          headlineValue={`${formatEngineeringNumber(100 * result.soluteRemovalFraction)} %`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Washing Factor" value={formatEngineeringNumber(result.washingFactor)} unit="—" />
          <ResultItem label="Product Overflow Ratio" value={formatEngineeringNumber(result.productOverflowSoluteRatio)} unit="kg/kg solvent" />
          <ResultItem label="Final Underflow Ratio" value={formatEngineeringNumber(result.finalUnderflowSoluteRatio)} unit="kg/kg solvent" />
          <ResultItem label="Recovered Solute" value={formatEngineeringNumber(result.recoveredSoluteInOverflow)} unit="kg/h" />
          <ResultItem label="Residual Solute" value={formatEngineeringNumber(result.residualSoluteWithWashedSolids)} unit="kg/h" />
          <ResultItem label="Balance Residual" value={formatEngineeringNumber(result.soluteBalanceResidual)} unit="kg/h" />
        </ResultPanel>
      ) : null}
      {result ? (
        <ol className="native-stage-list">
          {result.stageSoluteRatios.map((ratio, index) => (
            <li key={`${index}-${ratio}`}>
              Stage {index + 1}: <strong>{formatEngineeringNumber(ratio)}</strong>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
