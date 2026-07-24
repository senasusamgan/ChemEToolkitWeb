import { useState } from 'react'
import {
  CoolingCrystallizerYieldCalculationError,
  calculateCoolingCrystallizerYield,
} from './engine'
import type { CoolingCrystallizerYieldResult } from './types'
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
  feedSolutionMass: '1000',
  hotSolubility: '0.5',
  coldSolubility: '0.2',
  crystalPurity: '0.98',
}

export function CoolingCrystallizerYieldCalculator() {
  const [feedSolutionMass, setFeedSolutionMass] =
    useState(example.feedSolutionMass)
  const [hotSolubility, setHotSolubility] =
    useState(example.hotSolubility)
  const [coldSolubility, setColdSolubility] =
    useState(example.coldSolubility)
  const [crystalPurity, setCrystalPurity] =
    useState(example.crystalPurity)

  const [result, setResult] =
    useState<CoolingCrystallizerYieldResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCoolingCrystallizerYield({
          feedSolutionMass:
            Number(feedSolutionMass),
          hotSolubility:
            Number(hotSolubility),
          coldSolubility:
            Number(coldSolubility),
          crystalPurity:
            Number(crystalPurity),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          CoolingCrystallizerYieldCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedSolutionMass(example.feedSolutionMass)
    setHotSolubility(example.hotSolubility)
    setColdSolubility(example.coldSolubility)
    setCrystalPurity(example.crystalPurity)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedSolutionMass('')
    setHotSolubility('')
    setColdSolubility('')
    setCrystalPurity('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–15"
        icon="✧"
        title="Cooling Crystallizer Yield"
        subtitle="Crystal production from hot and cold solubility data"
      />

      <ReferenceBasis>
        Solubility expressed as mass solute per mass solvent
      </ReferenceBasis>

      <div className="native-formula">
        mcrystal = msolvent(Shot − Scold)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Solution Mass" symbol="F" value={feedSolutionMass} unit="kg" onChange={setFeedSolutionMass} />
        <NumericInput label="Hot Solubility" symbol="Shot" value={hotSolubility} unit="kg/kg solvent" onChange={setHotSolubility} />
        <NumericInput label="Cold Solubility" symbol="Scold" value={coldSolubility} unit="kg/kg solvent" onChange={setColdSolubility} />
        <NumericInput label="Crystal Purity" symbol="P" value={crystalPurity} unit="fraction" onChange={setCrystalPurity} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate crystal yield"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Product crystal mass"
          headlineValue={`${formatEngineeringNumber(
            result.productCrystalMass,
          )} kg`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Solvent Mass" value={formatEngineeringNumber(result.solventMass)} unit="kg" />
          <ResultItem label="Initial Dissolved Solute" value={formatEngineeringNumber(result.initialDissolvedSoluteMass)} unit="kg" />
          <ResultItem label="Final Dissolved Solute" value={formatEngineeringNumber(result.finalDissolvedSoluteMass)} unit="kg" />
          <ResultItem label="Pure Crystal Mass" value={formatEngineeringNumber(result.pureCrystalMass)} unit="kg" />
          <ResultItem label="Solute Recovery" value={formatEngineeringNumber(100 * result.soluteRecoveryFraction)} unit="%" />
          <ResultItem label="Mother Liquor Mass" value={formatEngineeringNumber(result.motherLiquorMass)} unit="kg" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
