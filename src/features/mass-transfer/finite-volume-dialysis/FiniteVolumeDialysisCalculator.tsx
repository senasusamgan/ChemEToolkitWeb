import { useState } from 'react'
import {
  FiniteVolumeDialysisCalculationError,
  calculateFiniteVolumeDialysis,
} from './engine'
import type { FiniteVolumeDialysisResult } from './types'
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
  donorVolume: '1',
  receiverVolume: '2',
  membraneArea: '5',
  overallMassTransferCoefficient: '0.00001',
  contactTime: '3600',
  donorInitialConcentration: '10',
  receiverInitialConcentration: '0',
}

export function FiniteVolumeDialysisCalculator() {
  const [donorVolume, setDonorVolume] = useState(EXAMPLE.donorVolume)
  const [receiverVolume, setReceiverVolume] = useState(EXAMPLE.receiverVolume)
  const [membraneArea, setMembraneArea] = useState(EXAMPLE.membraneArea)
  const [overallMassTransferCoefficient, setOverallMassTransferCoefficient] =
    useState(EXAMPLE.overallMassTransferCoefficient)
  const [contactTime, setContactTime] = useState(EXAMPLE.contactTime)
  const [donorInitialConcentration, setDonorInitialConcentration] =
    useState(EXAMPLE.donorInitialConcentration)
  const [receiverInitialConcentration, setReceiverInitialConcentration] =
    useState(EXAMPLE.receiverInitialConcentration)
  const [result, setResult] =
    useState<FiniteVolumeDialysisResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculateFiniteVolumeDialysis({
          donorVolume: Number(donorVolume),
          receiverVolume: Number(receiverVolume),
          membraneArea: Number(membraneArea),
          overallMassTransferCoefficient:
            Number(overallMassTransferCoefficient),
          contactTime: Number(contactTime),
          donorInitialConcentration:
            Number(donorInitialConcentration),
          receiverInitialConcentration:
            Number(receiverInitialConcentration),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof FiniteVolumeDialysisCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setDonorVolume(EXAMPLE.donorVolume)
    setReceiverVolume(EXAMPLE.receiverVolume)
    setMembraneArea(EXAMPLE.membraneArea)
    setOverallMassTransferCoefficient(
      EXAMPLE.overallMassTransferCoefficient,
    )
    setContactTime(EXAMPLE.contactTime)
    setDonorInitialConcentration(
      EXAMPLE.donorInitialConcentration,
    )
    setReceiverInitialConcentration(
      EXAMPLE.receiverInitialConcentration,
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setDonorVolume('')
    setReceiverVolume('')
    setMembraneArea('')
    setOverallMassTransferCoefficient('')
    setContactTime('')
    setDonorInitialConcentration('')
    setReceiverInitialConcentration('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–39"
        icon="▥"
        title="Finite-Volume Dialysis"
        subtitle="Transient membrane transfer between two finite well-mixed compartments"
      />
      <ReferenceBasis>
        Two-compartment transient mass balance with constant overall membrane coefficient
      </ReferenceBasis>
      <div className="native-formula">
        ΔC(t) = ΔC₀e⁻ᵏᵗ · k = KA(1/Vd + 1/Vr)
      </div>
      <div className="native-input-grid">
        <NumericInput label="Donor Volume" symbol="Vd" value={donorVolume} unit="m³" onChange={setDonorVolume} />
        <NumericInput label="Receiver Volume" symbol="Vr" value={receiverVolume} unit="m³" onChange={setReceiverVolume} />
        <NumericInput label="Membrane Area" symbol="A" value={membraneArea} unit="m²" onChange={setMembraneArea} />
        <NumericInput label="Overall Mass-Transfer Coefficient" symbol="K" value={overallMassTransferCoefficient} unit="m/s" onChange={setOverallMassTransferCoefficient} />
        <NumericInput label="Contact Time" symbol="t" value={contactTime} unit="s" onChange={setContactTime} />
        <NumericInput label="Donor Initial Concentration" symbol="Cd,0" value={donorInitialConcentration} unit="mol/m³" onChange={setDonorInitialConcentration} />
        <NumericInput label="Receiver Initial Concentration" symbol="Cr,0" value={receiverInitialConcentration} unit="mol/m³" onChange={setReceiverInitialConcentration} />
      </div>
      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate dialysis transfer"
      />
      {errorMessage ? (
        <div className="native-error" role="alert">{errorMessage}</div>
      ) : null}
      {result ? (
        <ResultPanel
          headlineLabel="Donor final concentration"
          headlineValue={`${formatEngineeringNumber(result.donorFinalConcentration)} mol/m³`}
          modelName={result.modelName}
          note={result.directionDescription}
        >
          <ResultItem label="Equilibrium Concentration" value={formatEngineeringNumber(result.equilibriumConcentration)} unit="mol/m³" />
          <ResultItem label="Difference Decay Factor" value={formatEngineeringNumber(result.concentrationDifferenceDecayFactor)} unit="—" />
          <ResultItem label="Equilibrium Approach" value={formatEngineeringNumber(result.fractionOfEquilibriumApproach)} unit="fraction" />
          <ResultItem label="Receiver Final Concentration" value={formatEngineeringNumber(result.receiverFinalConcentration)} unit="mol/m³" />
          <ResultItem label="Transferred Amount Magnitude" value={formatEngineeringNumber(result.transferMagnitude)} unit="mol" />
          <ResultItem label="Initial Signed Flux" value={formatEngineeringNumber(result.initialSignedFlux)} unit="mol/(m²·s)" />
          <ResultItem label="Final Signed Flux" value={formatEngineeringNumber(result.finalSignedFlux)} unit="mol/(m²·s)" />
          <ResultItem label="System Rate Constant" value={formatEngineeringNumber(result.systemRateConstant)} unit="1/s" />
          <ResultItem label="Difference Half-Time" value={formatEngineeringNumber(result.concentrationDifferenceHalfTime)} unit="s" />
          <ResultItem label="Amount-Balance Residual" value={formatEngineeringNumber(result.totalAmountBalanceResidual)} unit="mol" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
