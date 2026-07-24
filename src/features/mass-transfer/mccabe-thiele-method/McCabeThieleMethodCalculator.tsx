import { useState } from 'react'
import {
  DistillationOperatingLinesCalculationError,
  McCabeThieleMethodCalculationError,
  calculateMcCabeThieleMethod,
} from './engine'
import type { McCabeThieleMethodResult } from './types'
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
  relativeVolatility: '2.5',
  distillateLightMoleFraction: '0.95',
  bottomsLightMoleFraction: '0.05',
  feedLightMoleFraction: '0.5',
  refluxRatio: '2.5',
  feedQuality: '1',
}

export function McCabeThieleMethodCalculator() {
  const [relativeVolatility, setRelativeVolatility] = useState(EXAMPLE.relativeVolatility)
  const [distillateLightMoleFraction, setDistillateLightMoleFraction] = useState(EXAMPLE.distillateLightMoleFraction)
  const [bottomsLightMoleFraction, setBottomsLightMoleFraction] = useState(EXAMPLE.bottomsLightMoleFraction)
  const [feedLightMoleFraction, setFeedLightMoleFraction] = useState(EXAMPLE.feedLightMoleFraction)
  const [refluxRatio, setRefluxRatio] = useState(EXAMPLE.refluxRatio)
  const [feedQuality, setFeedQuality] = useState(EXAMPLE.feedQuality)
  const [result, setResult] = useState<McCabeThieleMethodResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function input() {
    return {
      relativeVolatility: Number(relativeVolatility),
      distillateLightMoleFraction: Number(distillateLightMoleFraction),
      bottomsLightMoleFraction: Number(bottomsLightMoleFraction),
      feedLightMoleFraction: Number(feedLightMoleFraction),
      refluxRatio: Number(refluxRatio),
      feedQuality: Number(feedQuality),
    }
  }

  function calculate() {
    try {
      setResult(calculateMcCabeThieleMethod(input()))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof DistillationOperatingLinesCalculationError ||
        error instanceof McCabeThieleMethodCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setRelativeVolatility(EXAMPLE.relativeVolatility)
    setDistillateLightMoleFraction(EXAMPLE.distillateLightMoleFraction)
    setBottomsLightMoleFraction(EXAMPLE.bottomsLightMoleFraction)
    setFeedLightMoleFraction(EXAMPLE.feedLightMoleFraction)
    setRefluxRatio(EXAMPLE.refluxRatio)
    setFeedQuality(EXAMPLE.feedQuality)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setRelativeVolatility('')
    setDistillateLightMoleFraction('')
    setBottomsLightMoleFraction('')
    setFeedLightMoleFraction('')
    setRefluxRatio('')
    setFeedQuality('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–36"
        icon="▰"
        title="McCabe–Thiele Method"
        subtitle="Theoretical stages, feed stage and minimum reflux for binary distillation"
      />
      <ReferenceBasis>Graphical stage stepping represented numerically with constant α and constant molar overflow</ReferenceBasis>
      <div className="native-formula">
        equilibrium step: x = y/[α − (α−1)y] · operating step: y = mx + b
      </div>
      <div className="native-input-grid">
        <NumericInput label="Relative Volatility" symbol="α" value={relativeVolatility} unit="—" onChange={setRelativeVolatility} />
        <NumericInput label="Distillate Light Fraction" symbol="xD" value={distillateLightMoleFraction} unit="—" onChange={setDistillateLightMoleFraction} />
        <NumericInput label="Bottoms Light Fraction" symbol="xB" value={bottomsLightMoleFraction} unit="—" onChange={setBottomsLightMoleFraction} />
        <NumericInput label="Feed Light Fraction" symbol="zF" value={feedLightMoleFraction} unit="—" onChange={setFeedLightMoleFraction} />
        <NumericInput label="Reflux Ratio" symbol="R" value={refluxRatio} unit="—" onChange={setRefluxRatio} />
        <NumericInput label="Feed Quality" symbol="q" value={feedQuality} unit="—" onChange={setFeedQuality} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Step theoretical stages" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Required whole stages"
          headlineValue={String(result.requiredWholeStageCount)}
          modelName={result.modelName}
          note={`${result.countingConvention} ${result.stageLiquidCompositions.length} equilibrium contacts were generated.`}
        >
          <ResultItem label="Continuous Stage Count" value={formatEngineeringNumber(result.continuousTheoreticalStageCount)} unit="stages" />
          <ResultItem label="Feed Stage" value={String(result.feedStageNumber)} unit="from top" />
          <ResultItem label="Final Stage Fraction" value={formatEngineeringNumber(result.finalStageFraction)} unit="—" />
          <ResultItem label="Minimum Reflux Ratio" value={formatEngineeringNumber(result.minimumRefluxRatio)} unit="—" />
          <ResultItem label="R / Rmin" value={formatEngineeringNumber(result.actualToMinimumRefluxRatio)} unit="—" />
          <ResultItem label="Rectifying Slope" value={formatEngineeringNumber(result.rectifyingSlope)} unit="—" />
          <ResultItem label="Stripping Slope" value={formatEngineeringNumber(result.strippingSlope)} unit="—" />
          <ResultItem label="Feed Intersection x" value={formatEngineeringNumber(result.feedIntersectionLiquidMoleFraction)} unit="—" />
          <ResultItem label="Feed Intersection y" value={formatEngineeringNumber(result.feedIntersectionVaporMoleFraction)} unit="—" />
        </ResultPanel>
      ) : null}
      {result ? (
        <ol className="native-stage-list">
          {result.stageLiquidCompositions.map((composition, index) => (
            <li key={`${index}-${composition}`}>
              Stage {index + 1}: <strong>x = {formatEngineeringNumber(composition)}</strong>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
