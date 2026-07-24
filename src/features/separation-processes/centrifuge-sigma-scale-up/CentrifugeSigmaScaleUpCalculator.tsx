import { useState } from 'react'
import {
  CentrifugeSigmaScaleUpCalculationError,
  calculateCentrifugeSigmaScaleUp,
} from './engine'
import type { CentrifugeSigmaScaleUpResult } from './types'
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
  laboratoryThroughput: '0.5',
  laboratorySigma: '100',
  industrialSigma: '5000',
  laboratoryEfficiency: '0.9',
  industrialEfficiency: '0.75',
}

export function CentrifugeSigmaScaleUpCalculator() {
  const [laboratoryThroughput, setLaboratoryThroughput] =
    useState(example.laboratoryThroughput)
  const [laboratorySigma, setLaboratorySigma] =
    useState(example.laboratorySigma)
  const [industrialSigma, setIndustrialSigma] =
    useState(example.industrialSigma)
  const [laboratoryEfficiency, setLaboratoryEfficiency] =
    useState(example.laboratoryEfficiency)
  const [industrialEfficiency, setIndustrialEfficiency] =
    useState(example.industrialEfficiency)

  const [result, setResult] =
    useState<CentrifugeSigmaScaleUpResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateCentrifugeSigmaScaleUp({
          laboratoryThroughput:
            Number(laboratoryThroughput),
          laboratorySigma:
            Number(laboratorySigma),
          industrialSigma:
            Number(industrialSigma),
          laboratoryEfficiency:
            Number(laboratoryEfficiency),
          industrialEfficiency:
            Number(industrialEfficiency),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          CentrifugeSigmaScaleUpCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLaboratoryThroughput(
      example.laboratoryThroughput,
    )
    setLaboratorySigma(example.laboratorySigma)
    setIndustrialSigma(example.industrialSigma)
    setLaboratoryEfficiency(
      example.laboratoryEfficiency,
    )
    setIndustrialEfficiency(
      example.industrialEfficiency,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLaboratoryThroughput('')
    setLaboratorySigma('')
    setIndustrialSigma('')
    setLaboratoryEfficiency('')
    setIndustrialEfficiency('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="SP–13"
        icon="◎"
        title="Centrifuge Sigma Scale-Up"
        subtitle="Predict industrial throughput from equivalent settling area"
      />

      <ReferenceBasis>
        Throughput proportional to effective sigma area
      </ReferenceBasis>

      <div className="native-formula">
        Q₂ = Q₁(Σ₂/Σ₁)(η₂/η₁)
      </div>

      <div className="native-input-grid">
        <NumericInput label="Laboratory Throughput" symbol="Q₁" value={laboratoryThroughput} unit="m³/h" onChange={setLaboratoryThroughput} />
        <NumericInput label="Laboratory Sigma" symbol="Σ₁" value={laboratorySigma} unit="m²" onChange={setLaboratorySigma} />
        <NumericInput label="Industrial Sigma" symbol="Σ₂" value={industrialSigma} unit="m²" onChange={setIndustrialSigma} />
        <NumericInput label="Laboratory Efficiency" symbol="η₁" value={laboratoryEfficiency} unit="fraction" onChange={setLaboratoryEfficiency} />
        <NumericInput label="Industrial Efficiency" symbol="η₂" value={industrialEfficiency} unit="fraction" onChange={setIndustrialEfficiency} />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Scale centrifuge throughput"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Predicted industrial throughput"
          headlineValue={`${formatEngineeringNumber(
            result.predictedIndustrialThroughput,
          )} m³/h`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Sigma Ratio" value={formatEngineeringNumber(result.sigmaRatio)} unit="—" />
          <ResultItem label="Efficiency Ratio" value={formatEngineeringNumber(result.efficiencyRatio)} unit="—" />
          <ResultItem label="Equivalent Clarification Velocity" value={formatEngineeringNumber(result.equivalentClarificationVelocity)} unit="m/h" />
          <ResultItem label="Sigma Needed at Lab Throughput" value={formatEngineeringNumber(result.requiredSigmaForTargetThroughput)} unit="m²" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
