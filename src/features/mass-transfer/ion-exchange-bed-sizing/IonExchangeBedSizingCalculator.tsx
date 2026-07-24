import { useState } from 'react'
import {
  IonExchangeBedSizingCalculationError,
  calculateIonExchangeBedSizing,
} from './engine'
import type { IonExchangeBedSizingResult } from './types'
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
  liquidVolumetricFlowRate: '2',
  influentIonConcentration: '5',
  ionChargeMagnitude: '2',
  targetRemovalFraction: '0.9',
  serviceTime: '8',
  resinCapacity: '1.8',
  capacityUtilizationFraction: '0.75',
}

export function IonExchangeBedSizingCalculator() {
  const [liquidVolumetricFlowRate, setLiquidVolumetricFlowRate] = useState(EXAMPLE.liquidVolumetricFlowRate)
  const [influentIonConcentration, setInfluentIonConcentration] = useState(EXAMPLE.influentIonConcentration)
  const [ionChargeMagnitude, setIonChargeMagnitude] = useState(EXAMPLE.ionChargeMagnitude)
  const [targetRemovalFraction, setTargetRemovalFraction] = useState(EXAMPLE.targetRemovalFraction)
  const [serviceTime, setServiceTime] = useState(EXAMPLE.serviceTime)
  const [resinCapacity, setResinCapacity] = useState(EXAMPLE.resinCapacity)
  const [capacityUtilizationFraction, setCapacityUtilizationFraction] = useState(EXAMPLE.capacityUtilizationFraction)
  const [result, setResult] = useState<IonExchangeBedSizingResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(calculateIonExchangeBedSizing({
        liquidVolumetricFlowRate: Number(liquidVolumetricFlowRate),
        influentIonConcentration: Number(influentIonConcentration),
        ionChargeMagnitude: Number(ionChargeMagnitude),
        targetRemovalFraction: Number(targetRemovalFraction),
        serviceTime: Number(serviceTime),
        resinCapacity: Number(resinCapacity),
        capacityUtilizationFraction: Number(capacityUtilizationFraction),
      }))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof IonExchangeBedSizingCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setLiquidVolumetricFlowRate(EXAMPLE.liquidVolumetricFlowRate)
    setInfluentIonConcentration(EXAMPLE.influentIonConcentration)
    setIonChargeMagnitude(EXAMPLE.ionChargeMagnitude)
    setTargetRemovalFraction(EXAMPLE.targetRemovalFraction)
    setServiceTime(EXAMPLE.serviceTime)
    setResinCapacity(EXAMPLE.resinCapacity)
    setCapacityUtilizationFraction(EXAMPLE.capacityUtilizationFraction)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setLiquidVolumetricFlowRate('')
    setInfluentIonConcentration('')
    setIonChargeMagnitude('')
    setTargetRemovalFraction('')
    setServiceTime('')
    setResinCapacity('')
    setCapacityUtilizationFraction('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="MT–38"
        icon="⇄"
        title="Ion Exchange Bed Sizing"
        subtitle="Resin volume from ionic equivalent load and usable capacity"
      />
      <ReferenceBasis>Stoichiometric equivalent-capacity balance for preliminary ion-exchange sizing</ReferenceBasis>
      <div className="native-formula">
        equivalent load = QC|z|t · Vresin = removed equivalents / usable capacity
      </div>
      <div className="native-input-grid">
        <NumericInput label="Liquid Volumetric Flow" symbol="Q" value={liquidVolumetricFlowRate} unit="m³/h" onChange={setLiquidVolumetricFlowRate} />
        <NumericInput label="Influent Ion Concentration" symbol="C" value={influentIonConcentration} unit="mol/m³" onChange={setInfluentIonConcentration} />
        <NumericInput label="Ion Charge Magnitude" symbol="|z|" value={ionChargeMagnitude} unit="integer 1–6" onChange={setIonChargeMagnitude} />
        <NumericInput label="Target Removal Fraction" symbol="f" value={targetRemovalFraction} unit="fraction" onChange={setTargetRemovalFraction} />
        <NumericInput label="Service Time" symbol="t" value={serviceTime} unit="h" onChange={setServiceTime} />
        <NumericInput label="Resin Capacity" symbol="qresin" value={resinCapacity} unit="eq/L wet resin" onChange={setResinCapacity} />
        <NumericInput label="Capacity Utilization" symbol="η" value={capacityUtilizationFraction} unit="fraction" onChange={setCapacityUtilizationFraction} />
      </div>
      <ActionBar onLoadExample={loadExample} onClear={clearInputs} onCalculate={calculate} calculateLabel="Size ion-exchange bed" />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel="Required resin volume"
          headlineValue={`${formatEngineeringNumber(result.requiredResinVolumeLiters)} L`}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem label="Ion Charge Magnitude" value={String(result.ionChargeMagnitude)} unit="—" />
          <ResultItem label="Treated Liquid Volume" value={formatEngineeringNumber(result.treatedLiquidVolume)} unit="m³" />
          <ResultItem label="Total Equivalent Load" value={formatEngineeringNumber(result.totalEquivalentLoad)} unit="eq" />
          <ResultItem label="Removed Equivalent Load" value={formatEngineeringNumber(result.removedEquivalentLoad)} unit="eq" />
          <ResultItem label="Residual Equivalent Load" value={formatEngineeringNumber(result.residualEquivalentLoad)} unit="eq" />
          <ResultItem label="Usable Resin Capacity" value={formatEngineeringNumber(result.usableResinCapacity)} unit="eq/L" />
          <ResultItem label="Required Resin Volume" value={formatEngineeringNumber(result.requiredResinVolumeCubicMeters)} unit="m³" />
          <ResultItem label="Outlet Ion Concentration" value={formatEngineeringNumber(result.outletIonConcentration)} unit="mol/m³" />
          <ResultItem label="Empty-Bed Contact Time" value={formatEngineeringNumber(result.emptyBedContactTimeMinutes)} unit="min" />
          <ResultItem label="Processed Bed Volumes" value={formatEngineeringNumber(result.processedBedVolumes)} unit="BV" />
        </ResultPanel>
      ) : null}
    </section>
  )
}
