import { useState } from 'react'
import {
  PressureProcessDynamicsCalculationError,
  calculatePressureProcessDynamics,
} from './engine'
import type { PressureProcessDynamicsResult } from './types'
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
  vesselVolume: '10',
  gasTemperature: '350',
  gasConstant: '8.314',
  molarInflowRate: '2',
  outletPressure: '100',
  pressureFlowResistance: '30',
  initialPressure: '100',
  evaluationTime: '0.5',
  maximumAllowablePressure: '175',
}

export function PressureProcessDynamicsCalculator() {
  const [vesselVolume, setVesselVolume] = useState(example.vesselVolume)
  const [gasTemperature, setGasTemperature] = useState(example.gasTemperature)
  const [gasConstant, setGasConstant] = useState(example.gasConstant)
  const [molarInflowRate, setMolarInflowRate] = useState(example.molarInflowRate)
  const [outletPressure, setOutletPressure] = useState(example.outletPressure)
  const [pressureFlowResistance, setPressureFlowResistance] = useState(example.pressureFlowResistance)
  const [initialPressure, setInitialPressure] = useState(example.initialPressure)
  const [evaluationTime, setEvaluationTime] = useState(example.evaluationTime)
  const [maximumAllowablePressure, setMaximumAllowablePressure] = useState(example.maximumAllowablePressure)

  const [result, setResult] =
    useState<PressureProcessDynamicsResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function calculate() {
    try {
      setResult(
        calculatePressureProcessDynamics({
            vesselVolume: Number(vesselVolume),
            gasTemperature: Number(gasTemperature),
            gasConstant: Number(gasConstant),
            molarInflowRate: Number(molarInflowRate),
            outletPressure: Number(outletPressure),
            pressureFlowResistance: Number(pressureFlowResistance),
            initialPressure: Number(initialPressure),
            evaluationTime: Number(evaluationTime),
            maximumAllowablePressure: Number(maximumAllowablePressure),
        }),
      )
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof PressureProcessDynamicsCalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  function loadExample() {
    setVesselVolume(example.vesselVolume)
    setGasTemperature(example.gasTemperature)
    setGasConstant(example.gasConstant)
    setMolarInflowRate(example.molarInflowRate)
    setOutletPressure(example.outletPressure)
    setPressureFlowResistance(example.pressureFlowResistance)
    setInitialPressure(example.initialPressure)
    setEvaluationTime(example.evaluationTime)
    setMaximumAllowablePressure(example.maximumAllowablePressure)
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setVesselVolume('')
    setGasTemperature('')
    setGasConstant('')
    setMolarInflowRate('')
    setOutletPressure('')
    setPressureFlowResistance('')
    setInitialPressure('')
    setEvaluationTime('')
    setMaximumAllowablePressure('')
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code="PC–23"
        icon="P"
        title="Pressure-Process Dynamics"
        subtitle="Isothermal gas-vessel pressure response with linear outflow"
      />

      <ReferenceBasis>
        V/(RT)·dP/dt = ṅin − (P−Pout)/R
      </ReferenceBasis>

      <div className="native-input-grid">
        <NumericInput
          label="Vessel Volume"
          symbol="V"
          value={vesselVolume}
          unit="volume"
          onChange={setVesselVolume}
        />
        <NumericInput
          label="Gas Temperature"
          symbol="T"
          value={gasTemperature}
          unit="K"
          onChange={setGasTemperature}
        />
        <NumericInput
          label="Gas Constant"
          symbol="Rgas"
          value={gasConstant}
          unit="pressure·volume/(mol·K)"
          onChange={setGasConstant}
        />
        <NumericInput
          label="Molar Inflow Rate"
          symbol="ṅin"
          value={molarInflowRate}
          unit="mol/time"
          onChange={setMolarInflowRate}
        />
        <NumericInput
          label="Outlet Pressure"
          symbol="Pout"
          value={outletPressure}
          unit="pressure"
          onChange={setOutletPressure}
        />
        <NumericInput
          label="Pressure-Flow Resistance"
          symbol="Rf"
          value={pressureFlowResistance}
          unit="pressure·time/mol"
          onChange={setPressureFlowResistance}
        />
        <NumericInput
          label="Initial Pressure"
          symbol="P₀"
          value={initialPressure}
          unit="pressure"
          onChange={setInitialPressure}
        />
        <NumericInput
          label="Evaluation Time"
          symbol="t"
          value={evaluationTime}
          unit="time"
          onChange={setEvaluationTime}
        />
        <NumericInput
          label="Maximum Allowable Pressure"
          symbol="Pmax"
          value={maximumAllowablePressure}
          unit="pressure"
          onChange={setMaximumAllowablePressure}
        />
      </div>

      <ActionBar
        onLoadExample={loadExample}
        onClear={clearInputs}
        onCalculate={calculate}
        calculateLabel="Calculate pressure response"
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          headlineLabel="Pressure at evaluation time"
          headlineValue={formatEngineeringNumber(result.pressureAtEvaluationTime)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          <ResultItem
            label="Process Time Constant"
            value={formatEngineeringNumber(result.processTimeConstant)}
            unit="time"
          />
          <ResultItem
            label="Steady-State Pressure"
            value={formatEngineeringNumber(result.steadyStatePressure)}
            unit="pressure"
          />
          <ResultItem
            label="Molar Outflow"
            value={formatEngineeringNumber(result.molarOutflowAtEvaluationTime)}
            unit="mol/time"
          />
          <ResultItem
            label="Response Fraction"
            value={formatEngineeringNumber(result.responseFraction)}
            unit="—"
          />
          <ResultItem
            label="Pressure Margin"
            value={formatEngineeringNumber(result.pressureMargin)}
            unit="pressure"
          />
          <ResultItem
            label="Overpressure Risk"
            value={result.overpressureRisk ? 'Yes' : 'No'}
            unit=""
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
