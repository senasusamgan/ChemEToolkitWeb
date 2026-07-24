import { useState } from 'react'
import {
  EvaporativeCrystallizerBalanceCalculationError,
  calculateEvaporativeCrystallizerBalance,
} from './engine'
import type { EvaporativeCrystallizerBalanceResult } from './types'
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
  feedMassFlowRate: '1000',
  feedSoluteMassFraction: '0.2',
  motherLiquorSoluteMassFraction: '0.35',
  solventEvaporationRate: '500',
  crystalPurity: '1',
}

export function EvaporativeCrystallizerBalanceCalculator() {
  const [feedMassFlowRate, setFeedMassFlowRate] =
    useState(example.feedMassFlowRate)
  const [
    feedSoluteMassFraction,
    setFeedSoluteMassFraction,
  ] = useState(example.feedSoluteMassFraction)
  const [
    motherLiquorSoluteMassFraction,
    setMotherLiquorSoluteMassFraction,
  ] = useState(example.motherLiquorSoluteMassFraction)
  const [
    solventEvaporationRate,
    setSolventEvaporationRate,
  ] = useState(example.solventEvaporationRate)
  const [crystalPurity, setCrystalPurity] =
    useState(example.crystalPurity)

  const [result, setResult] =
    useState<EvaporativeCrystallizerBalanceResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateEvaporativeCrystallizerBalance({
          feedMassFlowRate:
            Number(feedMassFlowRate),
          feedSoluteMassFraction:
            Number(feedSoluteMassFraction),
          motherLiquorSoluteMassFraction:
            Number(motherLiquorSoluteMassFraction),
          solventEvaporationRate:
            Number(solventEvaporationRate),
          crystalPurity:
            Number(crystalPurity),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          EvaporativeCrystallizerBalanceCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedMassFlowRate(example.feedMassFlowRate)
    setFeedSoluteMassFraction(
      example.feedSoluteMassFraction,
    )
    setMotherLiquorSoluteMassFraction(
      example.motherLiquorSoluteMassFraction,
    )
    setSolventEvaporationRate(
      example.solventEvaporationRate,
    )
    setCrystalPurity(example.crystalPurity)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedMassFlowRate('')
    setFeedSoluteMassFraction('')
    setMotherLiquorSoluteMassFraction('')
    setSolventEvaporationRate('')
    setCrystalPurity('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–16"
        icon="◇"
        title="Evaporative Crystallizer Balance"
        subtitle="Crystal and mother-liquor rates after solvent evaporation"
      />

      <ReferenceBasis>
        Steady total-mass and solute balances
      </ReferenceBasis>

      <div className="native-formula">
        F = E + L + C · FxF = LxL + PC
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Mass Flow" symbol="F" value={feedMassFlowRate} unit="kg/h" onChange={setFeedMassFlowRate} />
        <NumericInput label="Feed Solute Mass Fraction" symbol="xF" value={feedSoluteMassFraction} unit="fraction" onChange={setFeedSoluteMassFraction} />
        <NumericInput label="Mother-Liquor Solute Fraction" symbol="xL" value={motherLiquorSoluteMassFraction} unit="fraction" onChange={setMotherLiquorSoluteMassFraction} />
        <NumericInput label="Solvent Evaporation Rate" symbol="E" value={solventEvaporationRate} unit="kg/h" onChange={setSolventEvaporationRate} />
        <NumericInput label="Crystal Purity" symbol="P" value={crystalPurity} unit="fraction" onChange={setCrystalPurity} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Solve crystallizer balance"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Product crystal rate"
          headlineValue={`${formatEngineeringNumber(
            result.productCrystalRate,
          )} kg/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Pure Crystal Solute Rate" value={formatEngineeringNumber(result.pureCrystalSoluteRate)} unit="kg/h" />
          <ResultItem label="Mother Liquor Rate" value={formatEngineeringNumber(result.motherLiquorRate)} unit="kg/h" />
          <ResultItem label="Mother-Liquor Solute Rate" value={formatEngineeringNumber(result.motherLiquorSoluteRate)} unit="kg/h" />
          <ResultItem label="Solvent Evaporated / Feed Solvent" value={formatEngineeringNumber(100 * result.solventRecoveryFraction)} unit="%" />
          <ResultItem label="Solute Recovery in Crystals" value={formatEngineeringNumber(100 * result.soluteRecoveryFraction)} unit="%" />
          <ResultItem label="Total-Balance Residual" value={formatEngineeringNumber(result.totalBalanceResidual)} unit="kg/h" />
          <ResultItem label="Solute-Balance Residual" value={formatEngineeringNumber(result.soluteBalanceResidual)} unit="kg/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
