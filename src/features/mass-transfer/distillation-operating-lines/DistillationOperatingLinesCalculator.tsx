import { useState } from 'react'
import {
  DistillationOperatingLinesCalculationError,
  calculateDistillationOperatingLines,
} from './engine'
import type { DistillationOperatingLinesResult } from './types'
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

export function DistillationOperatingLinesCalculator() {
  const [relativeVolatility, setRelativeVolatility] = useState(EXAMPLE.relativeVolatility)
  const [distillateLightMoleFraction, setDistillateLightMoleFraction] = useState(EXAMPLE.distillateLightMoleFraction)
  const [bottomsLightMoleFraction, setBottomsLightMoleFraction] = useState(EXAMPLE.bottomsLightMoleFraction)
  const [feedLightMoleFraction, setFeedLightMoleFraction] = useState(EXAMPLE.feedLightMoleFraction)
  const [refluxRatio, setRefluxRatio] = useState(EXAMPLE.refluxRatio)
  const [feedQuality, setFeedQuality] = useState(EXAMPLE.feedQuality)
  const [result, setResult] = useState<DistillationOperatingLinesResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateDistillationOperatingLines({
        relativeVolatility: Number(relativeVolatility),
        distillateLightMoleFraction: Number(distillateLightMoleFraction),
        bottomsLightMoleFraction: Number(bottomsLightMoleFraction),
        feedLightMoleFraction: Number(feedLightMoleFraction),
        refluxRatio: Number(refluxRatio),
        feedQuality: Number(feedQuality),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof DistillationOperatingLinesCalculationError
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
        code="MT–35"
        icon="⌁"
        title="Distillation Operating Lines"
        subtitle="Rectifying, q-line, stripping-line and minimum-reflux geometry"
      />
      <ReferenceBasis>Binary distillation with constant relative volatility and constant molar overflow</ReferenceBasis>
      <div className="native-formula">
        yR = R/(R+1)x + xD/(R+1) · yq = q/(q−1)x − zF/(q−1)
      </div>
      <div className="native-input-grid">
        <NumericInput label="Relative Volatility" symbol="α" value={relativeVolatility} unit="—" onChange={setRelativeVolatility} />
        <NumericInput label="Distillate Light Fraction" symbol="xD" value={distillateLightMoleFraction} unit="—" onChange={setDistillateLightMoleFraction} />
        <NumericInput label="Bottoms Light Fraction" symbol="xB" value={bottomsLightMoleFraction} unit="—" onChange={setBottomsLightMoleFraction} />
        <NumericInput label="Feed Light Fraction" symbol="zF" value={feedLightMoleFraction} unit="—" onChange={setFeedLightMoleFraction} />
        <NumericInput label="Reflux Ratio" symbol="R" value={refluxRatio} unit="—" onChange={setRefluxRatio} />
        <NumericInput label="Feed Quality" symbol="q" value={feedQuality} unit="—" onChange={setFeedQuality} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Calculate operating lines" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Minimum reflux ratio"
          headlineValue={formatEngineeringNumber(result.minimumRefluxRatio)}
          modelName={result.modelName}
          note={result.feedLineDescription}
        >
          <ResultItem label="Rectifying Slope" value={formatEngineeringNumber(result.rectifyingSlope)} unit="—" />
          <ResultItem label="Rectifying Intercept" value={formatEngineeringNumber(result.rectifyingIntercept)} unit="—" />
          <ResultItem label="Feed-Line Slope" value={result.feedLineSlope === null ? 'Vertical' : formatEngineeringNumber(result.feedLineSlope)} unit="—" />
          <ResultItem label="Feed Intersection x" value={formatEngineeringNumber(result.feedIntersectionLiquidMoleFraction)} unit="—" />
          <ResultItem label="Feed Intersection y" value={formatEngineeringNumber(result.feedIntersectionVaporMoleFraction)} unit="—" />
          <ResultItem label="Stripping Slope" value={formatEngineeringNumber(result.strippingSlope)} unit="—" />
          <ResultItem label="Stripping Intercept" value={formatEngineeringNumber(result.strippingIntercept)} unit="—" />
          <ResultItem label="R / Rmin" value={formatEngineeringNumber(result.actualToMinimumRefluxRatio)} unit="—" />
          <ResultItem label="Minimum-Reflux Pinch x" value={formatEngineeringNumber(result.minimumRefluxPinchLiquidMoleFraction)} unit="—" />
          <ResultItem label="Minimum-Reflux Pinch y" value={formatEngineeringNumber(result.minimumRefluxPinchVaporMoleFraction)} unit="—" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
