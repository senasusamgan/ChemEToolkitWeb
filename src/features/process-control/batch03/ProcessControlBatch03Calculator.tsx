import { useEffect, useMemo, useState } from 'react'
import {
  calculateInverseLaplaceTransform,
  calculateLaplaceTransform,
  calculateLiquidControlValveSizing,
  calculateLiquidLevelDynamics,
  calculateModelPredictiveControl,
  calculateNonInteractingTankSystem,
  ProcessControlBatch03CalculationError,
} from './engine'
import type {
  Batch03CalculationResult,
  ProcessControlBatch03Id,
} from './types'
import {
  ActionBar,
  CalculatorHeader,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'

type Field = {
  key: string
  label: string
  symbol: string
  unit: string
  example: string
}

type Config = {
  code: string
  icon: string
  title: string
  subtitle: string
  basis: string
  calculateLabel: string
  fields: Field[]
  calculate: (values: Record<string, number>) => Batch03CalculationResult
}

const configs: Record<ProcessControlBatch03Id, Config> = {
  inverseLaplaceTransformHelper: {
    code: 'PC–13', icon: 'L⁻¹', title: 'Inverse Laplace Transform',
    subtitle: 'Recover a time-domain signal from common transform basis terms',
    basis: 'A/s + B/(s+a) + Cs/(s²+ω²) + D/(s²+ω²)',
    calculateLabel: 'Evaluate inverse transform',
    fields: [
      ['constantOverS','Constant-Term Numerator','A','—','2'],
      ['exponentialNumerator','Exponential Numerator','B','—','3'],
      ['exponentialPole','Exponential Pole','a','1/time','0.5'],
      ['cosineNumerator','Cosine Numerator','C','—','1.5'],
      ['sineNumerator','Sine Numerator','D','1/time','4'],
      ['angularFrequency','Angular Frequency','ω','rad/time','2'],
      ['evaluationTime','Evaluation Time','t','time','1'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateInverseLaplaceTransform(v as never),
  },
  laplaceTransformHelper: {
    code: 'PC–14', icon: 'L', title: 'Laplace Transform Helper',
    subtitle: 'Transform common process-control input functions and evaluate F(s)',
    basis: 'A + Bt + C exp(−at) + D sin(ωt) + E cos(ωt)',
    calculateLabel: 'Evaluate Laplace transform',
    fields: [
      ['constantAmplitude','Constant Amplitude','A','—','2'],
      ['rampSlope','Ramp Slope','B','1/time','1'],
      ['exponentialAmplitude','Exponential Amplitude','C','—','3'],
      ['exponentialDecayRate','Exponential Decay Rate','a','1/time','0.5'],
      ['sineAmplitude','Sine Amplitude','D','—','4'],
      ['cosineAmplitude','Cosine Amplitude','E','—','1.5'],
      ['angularFrequency','Angular Frequency','ω','rad/time','2'],
      ['evaluationS','Evaluation Value','s','1/time','1'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateLaplaceTransform(v as never),
  },
  liquidControlValveSizing: {
    code: 'PC–15', icon: '◁▷', title: 'Liquid Control Valve Sizing',
    subtitle: 'Estimate required Cv and installed valve capacity for liquid service',
    basis: 'Q = Cv sqrt(ΔP / SG)', calculateLabel: 'Size liquid control valve',
    fields: [
      ['liquidFlowRateGpm','Liquid Flow Rate','Q','US gpm','250'],
      ['liquidSpecificGravity','Liquid Specific Gravity','SG','—','0.9'],
      ['upstreamPressurePsi','Upstream Pressure','P₁','psi','80'],
      ['downstreamPressurePsi','Downstream Pressure','P₂','psi','50'],
      ['installedValveCv','Installed Valve Cv','Cv,inst','US Cv','55'],
      ['designMarginPercent','Design Margin','M','%','20'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateLiquidControlValveSizing(v as never),
  },
  liquidLevelDynamics: {
    code: 'PC–16', icon: '▤', title: 'Liquid-Level Dynamics',
    subtitle: 'Transient level response of a linear single-tank process',
    basis: 'A dh/dt = qin − h/R', calculateLabel: 'Calculate level response',
    fields: [
      ['tankArea','Tank Cross-Sectional Area','A','area','4'],
      ['outletResistance','Outlet Resistance','R','level/flow','3'],
      ['inletFlowRate','Inlet Flow Rate','qin','volume/time','2'],
      ['initialLevel','Initial Level','h₀','level','1'],
      ['evaluationTime','Evaluation Time','t','time','12'],
      ['maximumAllowableLevel','Maximum Allowable Level','hmax','level','7'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateLiquidLevelDynamics(v as never),
  },
  modelPredictiveControl: {
    code: 'PC–17', icon: 'MPC', title: 'Model Predictive Control',
    subtitle: 'Single-move predictive optimization for a first-order process',
    basis: 'Minimize predicted tracking error plus λΔu²', calculateLabel: 'Optimize control move',
    fields: [
      ['processGain','Process Gain','K','output/input','2'],
      ['processTimeConstant','Process Time Constant','τ','time','8'],
      ['sampleTime','Sample Time','Ts','time','1'],
      ['predictionHorizon','Prediction Horizon','Np','samples','12'],
      ['controlPenalty','Control-Move Penalty','λ','—','2'],
      ['currentOutput','Current Output','yk','output','2'],
      ['setpoint','Setpoint','r','output','10'],
      ['previousInput','Previous Input','uk−1','input','1'],
      ['maximumMoveMagnitude','Maximum Move Magnitude','Δumax','input','2'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateModelPredictiveControl(v as never),
  },
  nonInteractingTankSystem: {
    code: 'PC–18', icon: '▯▯', title: 'Non-Interacting Tank System',
    subtitle: 'Transient response of two freely cascading linear tanks',
    basis: 'A₁dh₁/dt = qin − h₁/R₁; A₂dh₂/dt = h₁/R₁ − h₂/R₂',
    calculateLabel: 'Simulate non-interacting tanks',
    fields: [
      ['firstTankArea','First Tank Area','A₁','area','2'],
      ['firstTankResistance','First Tank Resistance','R₁','level/flow','1.5'],
      ['secondTankArea','Second Tank Area','A₂','area','3'],
      ['secondTankResistance','Second Tank Resistance','R₂','level/flow','2'],
      ['inletFlowStep','Inlet Flow Step','qin','volume/time','1'],
      ['evaluationTime','Evaluation Time','t','time','20'],
      ['integrationSteps','Integration Steps','N','steps','2000'],
    ].map(([key,label,symbol,unit,example]) => ({key,label,symbol,unit,example})),
    calculate: (v) => calculateNonInteractingTankSystem(v as never),
  },
}

function exampleValues(config: Config): Record<string, string> {
  return Object.fromEntries(config.fields.map((field) => [field.key, field.example]))
}

function displayValue(value: number | string): string {
  return typeof value === 'number' ? formatEngineeringNumber(value) : value
}

export function ProcessControlBatch03Calculator({ calculatorId }: { calculatorId: ProcessControlBatch03Id }) {
  const config = configs[calculatorId]
  const initialValues = useMemo(() => exampleValues(config), [config])
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [result, setResult] = useState<Batch03CalculationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setValues(initialValues)
    setResult(null)
    setErrorMessage('')
  }, [initialValues])

  function calculate() {
    try {
      const numericValues = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)]))
      setResult(config.calculate(numericValues))
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(error instanceof ProcessControlBatch03CalculationError ? error.message : 'The calculation could not be completed.')
    }
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader code={config.code} icon={config.icon} title={config.title} subtitle={config.subtitle} />
      <ReferenceBasis>{config.basis}</ReferenceBasis>
      <div className="native-input-grid">
        {config.fields.map((field) => (
          <NumericInput
            key={field.key}
            label={field.label}
            symbol={field.symbol}
            value={values[field.key] ?? ''}
            unit={field.unit}
            onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
          />
        ))}
      </div>
      <ActionBar
        onLoadExample={() => { setValues(initialValues); setResult(null); setErrorMessage('') }}
        onClear={() => { setValues(Object.fromEntries(config.fields.map((field) => [field.key, '']))); setResult(null); setErrorMessage('') }}
        onCalculate={calculate}
        calculateLabel={config.calculateLabel}
      />
      {errorMessage ? <div className="native-error" role="alert">{errorMessage}</div> : null}
      {result ? (
        <ResultPanel
          headlineLabel={result.headlineLabel}
          headlineValue={displayValue(result.headlineValue)}
          modelName={result.modelName}
          note={result.limitationDescription}
        >
          {result.items.map((item) => (
            <ResultItem key={item.label} label={item.label} value={displayValue(item.value)} unit={item.unit} />
          ))}
        </ResultPanel>
      ) : null}
    </section>
  )
}
