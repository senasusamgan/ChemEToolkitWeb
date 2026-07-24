import { useState } from 'react'
import {
  CrystallizationYieldMotherLiquorCalculationError,
  calculateCrystallizationYieldMotherLiquor,
} from './engine'
import type { CrystallizationYieldMotherLiquorResult } from './types'
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
  feedSolutionMass: '1000',
  feedSoluteMassFraction: '0.3',
  evaporatedSolventMass: '100',
  finalSolubilityRatio: '0.25',
  crystalSoluteMassFraction: '1',
}

const stateTitles = {
  undersaturated: 'Unsaturated solution',
  saturated: 'Saturated solution',
  crystalsFormed: 'Crystals formed',
}

export function CrystallizationYieldMotherLiquorCalculator() {
  const [feedSolutionMass, setFeedSolutionMass] = useState(EXAMPLE.feedSolutionMass)
  const [feedSoluteMassFraction, setFeedSoluteMassFraction] = useState(EXAMPLE.feedSoluteMassFraction)
  const [evaporatedSolventMass, setEvaporatedSolventMass] = useState(EXAMPLE.evaporatedSolventMass)
  const [finalSolubilityRatio, setFinalSolubilityRatio] = useState(EXAMPLE.finalSolubilityRatio)
  const [crystalSoluteMassFraction, setCrystalSoluteMassFraction] = useState(EXAMPLE.crystalSoluteMassFraction)
  const [result, setResult] = useState<CrystallizationYieldMotherLiquorResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCrystallizationYieldMotherLiquor({
          feedSolutionMass: Number(feedSolutionMass),
          feedSoluteMassFraction: Number(feedSoluteMassFraction),
          evaporatedSolventMass: Number(evaporatedSolventMass),
          finalSolubilityRatio: Number(finalSolubilityRatio),
          crystalSoluteMassFraction: Number(crystalSoluteMassFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof CrystallizationYieldMotherLiquorCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedSolutionMass(EXAMPLE.feedSolutionMass)
    setFeedSoluteMassFraction(EXAMPLE.feedSoluteMassFraction)
    setEvaporatedSolventMass(EXAMPLE.evaporatedSolventMass)
    setFinalSolubilityRatio(EXAMPLE.finalSolubilityRatio)
    setCrystalSoluteMassFraction(EXAMPLE.crystalSoluteMassFraction)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedSolutionMass('')
    setFeedSoluteMassFraction('')
    setEvaporatedSolventMass('')
    setFinalSolubilityRatio('')
    setCrystalSoluteMassFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–33"
        icon="❄"
        title="Crystallization Yield & Mother Liquor"
        subtitle="Crystal recovery, hydrate solvent and saturated mother-liquor losses"
      />
      <ReferenceBasis>Solute–solvent balance at the final solubility limit</ReferenceBasis>
      <div className="native-formula">
        A₀ = pC + XₛWₘₗ · W₀ − E = (1 − p)C + Wₘₗ
      </div>
      <div className="native-input-grid">
        <NumericInput label="Feed Solution Mass" symbol="M₀" value={feedSolutionMass} unit="kg" onChange={setFeedSolutionMass} />
        <NumericInput label="Feed Solute Mass Fraction" symbol="w₀" value={feedSoluteMassFraction} unit="—" onChange={setFeedSoluteMassFraction} />
        <NumericInput label="Evaporated Solvent Mass" symbol="E" value={evaporatedSolventMass} unit="kg" onChange={setEvaporatedSolventMass} />
        <NumericInput label="Final Solubility Ratio" symbol="Xₛ" value={finalSolubilityRatio} unit="kg solute/kg solvent" onChange={setFinalSolubilityRatio} />
        <NumericInput label="Crystal Solute Mass Fraction" symbol="p" value={crystalSoluteMassFraction} unit="—" onChange={setCrystalSoluteMassFraction} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Calculate crystallization" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel={stateTitles[result.phaseState]}
          headlineValue={`${formatEngineeringNumber(result.crystalMass)} kg crystals`}
          modelName={result.modelName}
          note={result.stateDescription}
        >
          <ResultItem label="Supersaturation Ratio" value={formatEngineeringNumber(result.supersaturationRatio)} unit="—" />
          <ResultItem label="Crystal Solute Mass" value={formatEngineeringNumber(result.crystalSoluteMass)} unit="kg" />
          <ResultItem label="Crystal Solvent Mass" value={formatEngineeringNumber(result.crystalSolventMass)} unit="kg" />
          <ResultItem label="Mother-Liquor Total Mass" value={formatEngineeringNumber(result.motherLiquorTotalMass)} unit="kg" />
          <ResultItem label="Mother-Liquor Solute Mass" value={formatEngineeringNumber(result.motherLiquorSoluteMass)} unit="kg" />
          <ResultItem label="Mother-Liquor Solvent Mass" value={formatEngineeringNumber(result.motherLiquorSolventMass)} unit="kg" />
          <ResultItem label="Solute Recovery" value={formatEngineeringNumber(100 * result.soluteRecoveryFraction)} unit="%" />
          <ResultItem label="Crystal Yield on Feed" value={formatEngineeringNumber(100 * result.crystalYieldOnFeed)} unit="%" />
          <ResultItem label="Mass-Balance Residual" value={formatEngineeringNumber(result.totalMassBalanceResidual)} unit="kg" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
