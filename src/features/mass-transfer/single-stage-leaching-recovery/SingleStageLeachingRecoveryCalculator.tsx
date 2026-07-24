import { useState } from 'react'
import {
  SingleStageLeachingRecoveryCalculationError,
  calculateSingleStageLeachingRecovery,
} from './engine'
import type { SingleStageLeachingRecoveryResult } from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../shared/NativeCalculatorPrimitives'

const example = {
  insolubleSolidFlowRate: '100',
  solubleSoluteFlowRate: '20',
  pureSolventFlowRate: '100',
  retainedSolventPerInsolubleSolid: '0.4',
}

export function SingleStageLeachingRecoveryCalculator() {
  const [insolubleSolidFlowRate, setInsolubleSolidFlowRate] =
    useState(example.insolubleSolidFlowRate)
  const [solubleSoluteFlowRate, setSolubleSoluteFlowRate] =
    useState(example.solubleSoluteFlowRate)
  const [pureSolventFlowRate, setPureSolventFlowRate] =
    useState(example.pureSolventFlowRate)
  const [
    retainedSolventPerInsolubleSolid,
    setRetainedSolventPerInsolubleSolid,
  ] = useState(example.retainedSolventPerInsolubleSolid)

  const [result, setResult] =
    useState<SingleStageLeachingRecoveryResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateSingleStageLeachingRecovery({
          insolubleSolidFlowRate: Number(insolubleSolidFlowRate),
          solubleSoluteFlowRate: Number(solubleSoluteFlowRate),
          pureSolventFlowRate: Number(pureSolventFlowRate),
          retainedSolventPerInsolubleSolid: Number(
            retainedSolventPerInsolubleSolid,
          ),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof SingleStageLeachingRecoveryCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setInsolubleSolidFlowRate(example.insolubleSolidFlowRate)
    setSolubleSoluteFlowRate(example.solubleSoluteFlowRate)
    setPureSolventFlowRate(example.pureSolventFlowRate)
    setRetainedSolventPerInsolubleSolid(
      example.retainedSolventPerInsolubleSolid,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInsolubleSolidFlowRate('')
    setSolubleSoluteFlowRate('')
    setPureSolventFlowRate('')
    setRetainedSolventPerInsolubleSolid('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–43"
        icon="◈"
        title="Single-Stage Leaching & Recovery"
        subtitle="Ideal extract recovery and solute loss with retained underflow solution"
      />

      <ReferenceBasis>
        Complete dissolution with equal overflow and underflow solution composition
      </ReferenceBasis>

      <div className="native-formula">
        X = A/S · Recovered A = (S − UB)X
      </div>

      <div className="native-input-grid">
        <NumericInput
          label="Insoluble-Solid Flow"
          symbol="B"
          value={insolubleSolidFlowRate}
          unit="kg/h"
          onChange={setInsolubleSolidFlowRate}
        />
        <NumericInput
          label="Soluble-Solute Flow"
          symbol="A"
          value={solubleSoluteFlowRate}
          unit="kg/h"
          onChange={setSolubleSoluteFlowRate}
        />
        <NumericInput
          label="Pure-Solvent Flow"
          symbol="S"
          value={pureSolventFlowRate}
          unit="kg/h"
          onChange={setPureSolventFlowRate}
        />
        <NumericInput
          label="Retained Solvent per Insoluble Solid"
          symbol="U"
          value={retainedSolventPerInsolubleSolid}
          unit="kg/kg"
          onChange={setRetainedSolventPerInsolubleSolid}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate leaching recovery"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Solute recovery"
          headlineValue={`${formatEngineeringNumber(
            100 * result.soluteRecoveryFraction,
          )}%`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Equilibrium Solute Ratio"
            value={formatEngineeringNumber(
              result.equilibriumSoluteRatio,
            )}
            unit="kg/kg solvent"
          />
          <ResultItem
            label="Retained Solvent Flow"
            value={formatEngineeringNumber(
              result.retainedSolventFlowRate,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Overflow Solvent Flow"
            value={formatEngineeringNumber(
              result.overflowSolventFlowRate,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Solute Recovered in Overflow"
            value={formatEngineeringNumber(
              result.soluteRecoveredInOverflow,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Solute Retained with Underflow"
            value={formatEngineeringNumber(
              result.soluteRetainedWithUnderflow,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Overflow Solution Mass Flow"
            value={formatEngineeringNumber(
              result.overflowSolutionMassFlowRate,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Underflow Total Mass Flow"
            value={formatEngineeringNumber(
              result.underflowTotalMassFlowRate,
            )}
            unit="kg/h"
          />
          <ResultItem
            label="Solute-Balance Residual"
            value={formatEngineeringNumber(
              result.soluteBalanceResidual,
            )}
            unit="kg/h"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
