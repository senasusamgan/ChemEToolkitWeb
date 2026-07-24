import { useState } from 'react'
import {
  AdsorbentMassRequirementCalculationError,
  calculateAdsorbentMassRequirement,
} from './engine'
import type { AdsorbentMassRequirementResult } from './types'
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
  soluteMassFraction: '0.02',
  targetRemovalFraction: '0.90',
  workingAdsorptionCapacity: '0.15',
  utilizationFraction: '0.80',
}

export function AdsorbentMassRequirementCalculator() {
  const [feedMassFlowRate, setFeedMassFlowRate] =
    useState(example.feedMassFlowRate)
  const [soluteMassFraction, setSoluteMassFraction] =
    useState(example.soluteMassFraction)
  const [targetRemovalFraction, setTargetRemovalFraction] =
    useState(example.targetRemovalFraction)
  const [
    workingAdsorptionCapacity,
    setWorkingAdsorptionCapacity,
  ] = useState(example.workingAdsorptionCapacity)
  const [utilizationFraction, setUtilizationFraction] =
    useState(example.utilizationFraction)

  const [result, setResult] =
    useState<AdsorbentMassRequirementResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateAdsorbentMassRequirement({
          feedMassFlowRate:
            Number(feedMassFlowRate),
          soluteMassFraction:
            Number(soluteMassFraction),
          targetRemovalFraction:
            Number(targetRemovalFraction),
          workingAdsorptionCapacity:
            Number(workingAdsorptionCapacity),
          utilizationFraction:
            Number(utilizationFraction),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          AdsorbentMassRequirementCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setFeedMassFlowRate(example.feedMassFlowRate)
    setSoluteMassFraction(example.soluteMassFraction)
    setTargetRemovalFraction(
      example.targetRemovalFraction,
    )
    setWorkingAdsorptionCapacity(
      example.workingAdsorptionCapacity,
    )
    setUtilizationFraction(
      example.utilizationFraction,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setFeedMassFlowRate('')
    setSoluteMassFraction('')
    setTargetRemovalFraction('')
    setWorkingAdsorptionCapacity('')
    setUtilizationFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–25"
        icon="⠿"
        title="Adsorbent Mass Requirement"
        subtitle="Adsorbent consumption from solute load and usable working capacity"
      />

      <ReferenceBasis>
        Solute removed divided by effective working capacity
      </ReferenceBasis>

      <div className="native-formula">
        mads = FwR/(qwork ηu)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Feed Mass Flow" symbol="F" value={feedMassFlowRate} unit="kg/h" onChange={setFeedMassFlowRate} />
        <NumericInput label="Feed Solute Mass Fraction" symbol="w" value={soluteMassFraction} unit="fraction" onChange={setSoluteMassFraction} />
        <NumericInput label="Target Removal" symbol="R" value={targetRemovalFraction} unit="fraction" onChange={setTargetRemovalFraction} />
        <NumericInput label="Working Adsorption Capacity" symbol="qwork" value={workingAdsorptionCapacity} unit="kg solute/kg adsorbent" onChange={setWorkingAdsorptionCapacity} />
        <NumericInput label="Capacity Utilization" symbol="ηu" value={utilizationFraction} unit="fraction" onChange={setUtilizationFraction} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate adsorbent demand"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Required adsorbent rate"
          headlineValue={`${formatEngineeringNumber(
            result.requiredAdsorbentRate,
          )} kg/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Feed Solute Rate" value={formatEngineeringNumber(result.feedSoluteRate)} unit="kg/h" />
          <ResultItem label="Solute Removed Rate" value={formatEngineeringNumber(result.soluteRemovedRate)} unit="kg/h" />
          <ResultItem label="Effective Working Capacity" value={formatEngineeringNumber(result.effectiveWorkingCapacity)} unit="kg/kg" />
          <ResultItem label="Adsorbent / Feed Ratio" value={formatEngineeringNumber(result.adsorbentToFeedRatio)} unit="kg/kg" />
          <ResultItem label="Untreated Solute Rate" value={formatEngineeringNumber(result.untreatedSoluteRate)} unit="kg/h" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
