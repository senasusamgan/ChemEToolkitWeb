import { useState } from 'react'
import {
  SingleStageLeachingBalanceCalculationError,
  calculateSingleStageLeachingBalance,
} from './engine'
import type { SingleStageLeachingBalanceResult } from './types'
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
  dryInertSolidMass: '100',
  initialSolutionMass: '50',
  initialSolutionSoluteFraction: '0.20',
  freshSolventMass: '100',
  retainedSolutionPerDrySolid: '0.50',
}

export function SingleStageLeachingBalanceCalculator() {
  const [dryInertSolidMass, setDryInertSolidMass] =
    useState(example.dryInertSolidMass)
  const [initialSolutionMass, setInitialSolutionMass] =
    useState(example.initialSolutionMass)
  const [
    initialSolutionSoluteFraction,
    setInitialSolutionSoluteFraction,
  ] = useState(example.initialSolutionSoluteFraction)
  const [freshSolventMass, setFreshSolventMass] =
    useState(example.freshSolventMass)
  const [
    retainedSolutionPerDrySolid,
    setRetainedSolutionPerDrySolid,
  ] = useState(example.retainedSolutionPerDrySolid)

  const [result, setResult] =
    useState<SingleStageLeachingBalanceResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateSingleStageLeachingBalance({
          dryInertSolidMass:
            Number(dryInertSolidMass),
          initialSolutionMass:
            Number(initialSolutionMass),
          initialSolutionSoluteFraction:
            Number(initialSolutionSoluteFraction),
          freshSolventMass:
            Number(freshSolventMass),
          retainedSolutionPerDrySolid:
            Number(retainedSolutionPerDrySolid),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          SingleStageLeachingBalanceCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDryInertSolidMass(example.dryInertSolidMass)
    setInitialSolutionMass(example.initialSolutionMass)
    setInitialSolutionSoluteFraction(
      example.initialSolutionSoluteFraction,
    )
    setFreshSolventMass(example.freshSolventMass)
    setRetainedSolutionPerDrySolid(
      example.retainedSolutionPerDrySolid,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDryInertSolidMass('')
    setInitialSolutionMass('')
    setInitialSolutionSoluteFraction('')
    setFreshSolventMass('')
    setRetainedSolutionPerDrySolid('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–40"
        icon="◆"
        title="Single-Stage Leaching Balance"
        subtitle="Extract and underflow solution split after one ideal leaching contact"
      />

      <ReferenceBasis>
        Perfectly mixed solution with specified underflow retention
      </ReferenceBasis>

      <div className="native-formula">
        w = Msolute/(Minitial solution + Msolvent)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Dry Inert Solid Mass" symbol="B" value={dryInertSolidMass} unit="kg" onChange={setDryInertSolidMass} />
        <NumericInput label="Initial Solution Mass" symbol="L0" value={initialSolutionMass} unit="kg" onChange={setInitialSolutionMass} />
        <NumericInput label="Initial Solution Solute Fraction" symbol="w0" value={initialSolutionSoluteFraction} unit="fraction" onChange={setInitialSolutionSoluteFraction} />
        <NumericInput label="Fresh Solvent Mass" symbol="S" value={freshSolventMass} unit="kg" onChange={setFreshSolventMass} />
        <NumericInput label="Retained Solution / Dry Solid" symbol="R" value={retainedSolutionPerDrySolid} unit="kg/kg" onChange={setRetainedSolutionPerDrySolid} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve leaching balance"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Extract solution mass"
          headlineValue={`${formatEngineeringNumber(
            result.overflowExtractSolutionMass,
          )} kg`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Mixed Solution Solute Fraction" value={formatEngineeringNumber(result.mixedSolutionSoluteFraction)} unit="fraction" />
          <ResultItem label="Retained Underflow Solution" value={formatEngineeringNumber(result.retainedUnderflowSolutionMass)} unit="kg" />
          <ResultItem label="Solute in Extract" value={formatEngineeringNumber(result.soluteInExtract)} unit="kg" />
          <ResultItem label="Solute in Underflow" value={formatEngineeringNumber(result.soluteInUnderflow)} unit="kg" />
          <ResultItem label="Solvent in Extract" value={formatEngineeringNumber(result.solventInExtract)} unit="kg" />
          <ResultItem label="Solvent in Underflow" value={formatEngineeringNumber(result.solventInUnderflow)} unit="kg" />
          <ResultItem label="Solute-Balance Residual" value={formatEngineeringNumber(result.soluteBalanceResidual)} unit="kg" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
