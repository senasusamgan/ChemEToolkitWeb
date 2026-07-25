import { useState } from 'react'
import {
  ReactionEngineeringBatch08CalculationError,
  calculateRTDModelComparison,
  calculateRTDMoments,
  calculateReversibleReactions,
  calculateSegregationModelConversion,
  calculateSemibatchReactor,
  calculateSeriesReactions,
} from './engine'
import type {
  ReactionEngineeringBatch08Mode,
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

interface Props {
  mode: ReactionEngineeringBatch08Mode
}

interface FieldDefinition {
  key: string
  label: string
  symbol: string
  unit: string
}

interface Definition {
  code: string
  icon: string
  title: string
  subtitle: string
  basis: string
  action: string
  headline: string
  fields: FieldDefinition[]
  example: Record<string, string>
}

const curveFields: FieldDefinition[] = [
  { key: 't1', label: 'Time Point 1', symbol: 't₁', unit: 's' },
  { key: 'c1', label: 'Curve Value 1', symbol: 'y₁', unit: 'curve basis' },
  { key: 't2', label: 'Time Point 2', symbol: 't₂', unit: 's' },
  { key: 'c2', label: 'Curve Value 2', symbol: 'y₂', unit: 'curve basis' },
  { key: 't3', label: 'Time Point 3', symbol: 't₃', unit: 's' },
  { key: 'c3', label: 'Curve Value 3', symbol: 'y₃', unit: 'curve basis' },
  { key: 't4', label: 'Time Point 4', symbol: 't₄', unit: 's' },
  { key: 'c4', label: 'Curve Value 4', symbol: 'y₄', unit: 'curve basis' },
  { key: 't5', label: 'Time Point 5', symbol: 't₅', unit: 's' },
  { key: 'c5', label: 'Curve Value 5', symbol: 'y₅', unit: 'curve basis' },
]

const curveExample = {
  t1: '0',
  c1: '0',
  t2: '50',
  c2: '0.006',
  t3: '100',
  c3: '0.012',
  t4: '150',
  c4: '0.002',
  t5: '200',
  c5: '0',
}

const definitions: Record<ReactionEngineeringBatch08Mode, Definition> = {
  reversibleReactions: {
    code: 'RE–53',
    icon: '⇌',
    title: 'Reversible Reactions',
    subtitle: 'Evaluate constant-volume first-order A-to-B reversible kinetics',
    basis: 'A ⇌ B; CA(t) = CA,eq + [CA0−CA,eq]exp[−(kf+kr)t]',
    action: 'Calculate reversible reaction',
    headline: 'Conversion of A',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'initialConcentrationB', label: 'Initial Concentration B', symbol: 'CB0', unit: 'mol/m³' },
      { key: 'forwardRateConstant', label: 'Forward Rate Constant', symbol: 'kf', unit: '1/s' },
      { key: 'reverseRateConstant', label: 'Reverse Rate Constant', symbol: 'kr', unit: '1/s' },
      { key: 'reactionTime', label: 'Reaction Time', symbol: 't', unit: 's' },
    ],
    example: {
      initialConcentrationA: '1',
      initialConcentrationB: '0',
      forwardRateConstant: '0.08',
      reverseRateConstant: '0.02',
      reactionTime: '30',
    },
  },
  rtdModelComparison: {
    code: 'RE–54',
    icon: 'RTD',
    title: 'RTD Model Comparison',
    subtitle: 'Compare first-order conversion predictions from ideal and nonideal RTD models',
    basis: 'N = τ²/σ²; Pe ≈ 2τ²/σ²; compare PFR, CSTR, tanks and axial dispersion',
    action: 'Compare RTD models',
    headline: 'Tanks-in-series conversion',
    fields: [
      { key: 'meanResidenceTime', label: 'Mean Residence Time', symbol: 'τ', unit: 's' },
      { key: 'residenceTimeVariance', label: 'Residence-Time Variance', symbol: 'σ²', unit: 's²' },
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
    ],
    example: {
      meanResidenceTime: '100',
      residenceTimeVariance: '1000',
      firstOrderRateConstant: '0.02',
    },
  },
  rtdMoments: {
    code: 'RE–55',
    icon: 'μ₂',
    title: 'RTD Moments',
    subtitle: 'Normalize discrete tracer data and calculate RTD moments and percentiles',
    basis: 'E(t)=C(t)/∫Cdt; τ=∫tE dt; σ²=∫(t−τ)²E dt',
    action: 'Calculate RTD moments',
    headline: 'Mean residence time',
    fields: curveFields,
    example: curveExample,
  },
  segregationModelConversion: {
    code: 'RE–56',
    icon: 'SEG',
    title: 'Segregation Model Conversion',
    subtitle: 'Integrate first-order batch survival over a measured exit-age distribution',
    basis: 'CA/CA0 = ∫exp(−kt)E(t)dt',
    action: 'Calculate segregation conversion',
    headline: 'Segregation-model conversion',
    fields: [
      ...curveFields,
      { key: 'firstOrderRateConstant', label: 'First-Order Rate Constant', symbol: 'k', unit: '1/s' },
    ],
    example: {
      ...curveExample,
      firstOrderRateConstant: '0.02',
    },
  },
  semibatchReactor: {
    code: 'RE–57',
    icon: 'SB',
    title: 'Semibatch Reactor',
    subtitle: 'Integrate A-plus-B reaction while reactant B is fed continuously',
    basis: 'A + B → P; dNA/dt=−kCACBV; dNB/dt=FBCB,f−kCACBV; dV/dt=FB',
    action: 'Calculate semibatch reactor',
    headline: 'Conversion of initial A',
    fields: [
      { key: 'initialLiquidVolume', label: 'Initial Liquid Volume', symbol: 'V0', unit: 'm³' },
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'feedVolumetricFlowRate', label: 'B Feed Volumetric Flow', symbol: 'FB', unit: 'm³/s' },
      { key: 'feedConcentrationB', label: 'B Feed Concentration', symbol: 'CB,f', unit: 'mol/m³' },
      { key: 'secondOrderRateConstant', label: 'Second-Order Rate Constant', symbol: 'k', unit: 'm³/(mol·s)' },
      { key: 'feedDuration', label: 'Feed Duration', symbol: 'tf', unit: 's' },
    ],
    example: {
      initialLiquidVolume: '1',
      initialConcentrationA: '100',
      feedVolumetricFlowRate: '0.005',
      feedConcentrationB: '100',
      secondOrderRateConstant: '0.0005',
      feedDuration: '100',
    },
  },
  seriesReactions: {
    code: 'RE–58',
    icon: 'A→B→C',
    title: 'Series Reactions',
    subtitle: 'Evaluate consecutive first-order A-to-B-to-C reaction concentrations',
    basis: 'A → B → C with first-order k1 and k2',
    action: 'Calculate series reactions',
    headline: 'Intermediate-product yield',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'firstReactionRateConstant', label: 'A-to-B Rate Constant', symbol: 'k1', unit: '1/s' },
      { key: 'secondReactionRateConstant', label: 'B-to-C Rate Constant', symbol: 'k2', unit: '1/s' },
      { key: 'reactionTime', label: 'Reaction Time', symbol: 't', unit: 's' },
    ],
    example: {
      initialConcentrationA: '1000',
      firstReactionRateConstant: '0.03',
      secondReactionRateConstant: '0.01',
      reactionTime: '50',
    },
  },
}

function displayValue(value: unknown): string {
  return typeof value === 'number'
    ? formatEngineeringNumber(value)
    : String(value)
}

export function ReactionEngineeringBatch08Calculator({ mode }: Props) {
  const definition = definitions[mode]
  const [values, setValues] = useState<Record<string, string>>(definition.example)
  const [result, setResult] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function number(key: string): number {
    return Number(values[key])
  }

  function curveTimes(): number[] {
    return [number('t1'), number('t2'), number('t3'), number('t4'), number('t5')]
  }

  function curveValues(): number[] {
    return [number('c1'), number('c2'), number('c3'), number('c4'), number('c5')]
  }

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'reversibleReactions':
          next = calculateReversibleReactions({
            initialConcentrationA: number('initialConcentrationA'),
            initialConcentrationB: number('initialConcentrationB'),
            forwardRateConstant: number('forwardRateConstant'),
            reverseRateConstant: number('reverseRateConstant'),
            reactionTime: number('reactionTime'),
          })
          break
        case 'rtdModelComparison':
          next = calculateRTDModelComparison({
            meanResidenceTime: number('meanResidenceTime'),
            residenceTimeVariance: number('residenceTimeVariance'),
            firstOrderRateConstant: number('firstOrderRateConstant'),
          })
          break
        case 'rtdMoments':
          next = calculateRTDMoments({
            times: curveTimes(),
            tracerConcentrations: curveValues(),
          })
          break
        case 'segregationModelConversion':
          next = calculateSegregationModelConversion({
            times: curveTimes(),
            eValues: curveValues(),
            firstOrderRateConstant: number('firstOrderRateConstant'),
          })
          break
        case 'semibatchReactor':
          next = calculateSemibatchReactor({
            initialLiquidVolume: number('initialLiquidVolume'),
            initialConcentrationA: number('initialConcentrationA'),
            feedVolumetricFlowRate: number('feedVolumetricFlowRate'),
            feedConcentrationB: number('feedConcentrationB'),
            secondOrderRateConstant: number('secondOrderRateConstant'),
            feedDuration: number('feedDuration'),
          })
          break
        case 'seriesReactions':
          next = calculateSeriesReactions({
            initialConcentrationA: number('initialConcentrationA'),
            firstReactionRateConstant: number('firstReactionRateConstant'),
            secondReactionRateConstant: number('secondReactionRateConstant'),
            reactionTime: number('reactionTime'),
          })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ReactionEngineeringBatch08CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  const record = result && typeof result === 'object'
    ? result as Record<string, unknown>
    : null

  function headlineValue(): unknown {
    if (!record) {
      return ''
    }

    switch (mode) {
      case 'reversibleReactions':
        return Number(record.conversionA) * 100
      case 'rtdModelComparison':
        return Number(record.tanksInSeriesConversion) * 100
      case 'rtdMoments':
        return record.meanResidenceTime
      case 'segregationModelConversion':
        return Number(record.segregationConversion) * 100
      case 'semibatchReactor':
        return Number(record.conversionA) * 100
      case 'seriesReactions':
        return Number(record.intermediateYield) * 100
    }
  }

  function rows(): Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'reversibleReactions':
        return [
          ['Final Concentration A', record.finalConcentrationA, 'mol/m³'],
          ['Final Concentration B', record.finalConcentrationB, 'mol/m³'],
          ['Equilibrium Concentration A', record.equilibriumConcentrationA, 'mol/m³'],
          ['Equilibrium Concentration B', record.equilibriumConcentrationB, 'mol/m³'],
          ['Conversion A', Number(record.conversionA) * 100, '%'],
          ['Equilibrium Conversion A', Number(record.equilibriumConversionA) * 100, '%'],
          ['Approach to Equilibrium', Number(record.fractionOfEquilibriumApproach) * 100, '%'],
          ['Relaxation Time', record.relaxationTime, 's'],
          ['Equilibrium Constant kf/kr', record.equilibriumConstant, '—'],
        ]
      case 'rtdModelComparison':
        return [
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Equivalent Tanks in Series', record.equivalentTanksInSeries, '—'],
          ['Equivalent Peclet Number', record.equivalentPecletNumber, '—'],
          ['Damköhler Number', record.damkohlerNumber, '—'],
          ['Ideal PFR Conversion', Number(record.idealPFRConversion) * 100, '%'],
          ['Ideal CSTR Conversion', Number(record.idealCSTRConversion) * 100, '%'],
          ['Tanks-in-Series Conversion', Number(record.tanksInSeriesConversion) * 100, '%'],
          ['Axial-Dispersion Conversion', Number(record.axialDispersionConversion) * 100, '%'],
          ['Tanks Deviation from PFR', Number(record.tanksDeviationFromPFR) * 100, 'percentage points'],
          ['Dispersion Deviation from PFR', Number(record.dispersionDeviationFromPFR) * 100, 'percentage points'],
          ['Interpretation', record.modelInterpretation, ''],
        ]
      case 'rtdMoments': {
        const normalized = record.normalizedEValues as number[]
        const cumulative = record.cumulativeFValues as number[]
        return [
          ['Tracer Area', record.tracerArea, 'curve·s'],
          ['Mean Residence Time', record.meanResidenceTime, 's'],
          ['Variance', record.variance, 's²'],
          ['Standard Deviation', record.standardDeviation, 's'],
          ['Dimensionless Variance', record.dimensionlessVariance, '—'],
          ['Skewness', record.skewness, '—'],
          ['Time at 10%', record.timeAtTenPercent, 's'],
          ['Median Residence Time', record.medianResidenceTime, 's'],
          ['Time at 90%', record.timeAtNinetyPercent, 's'],
          ['Normalized E Values', normalized.map(displayValue).join(', '), ''],
          ['Cumulative F Values', cumulative.map(displayValue).join(', '), ''],
        ]
      }
      case 'segregationModelConversion':
        return [
          ['Segregation Conversion', Number(record.segregationConversion) * 100, '%'],
          ['Outlet Fraction A', Number(record.segregationOutletFractionA) * 100, '%'],
          ['Mean Residence Time', record.meanResidenceTime, 's'],
          ['Ideal PFR Conversion', Number(record.idealPFRConversionAtMeanTime) * 100, '%'],
          ['Ideal CSTR Conversion', Number(record.idealCSTRConversionAtMeanTime) * 100, '%'],
          ['Segregation / PFR Ratio', record.conversionRelativeToPFR, '—'],
          ['Segregation / CSTR Ratio', record.conversionRelativeToCSTR, '—'],
          ['Integration Segments', record.integrationSegments, '—'],
        ]
      case 'semibatchReactor':
        return [
          ['Final Liquid Volume', record.finalLiquidVolume, 'm³'],
          ['Final Moles A', record.finalMolesA, 'mol'],
          ['Final Moles B', record.finalMolesB, 'mol'],
          ['Final Moles Product', record.finalMolesProduct, 'mol'],
          ['Final Concentration A', record.finalConcentrationA, 'mol/m³'],
          ['Final Concentration B', record.finalConcentrationB, 'mol/m³'],
          ['Final Product Concentration', record.finalProductConcentration, 'mol/m³'],
          ['Conversion A', Number(record.conversionA) * 100, '%'],
          ['Fed Moles B', record.fedMolesB, 'mol'],
          ['Product Yield from A', Number(record.productYieldFromA) * 100, '%'],
          ['Integration Steps', record.integrationSteps, '—'],
        ]
      case 'seriesReactions':
        return [
          ['Concentration A', record.concentrationA, 'mol/m³'],
          ['Intermediate Concentration B', record.concentrationIntermediateB, 'mol/m³'],
          ['Final Product Concentration C', record.concentrationFinalC, 'mol/m³'],
          ['Conversion A', Number(record.conversionA) * 100, '%'],
          ['Intermediate Yield', Number(record.intermediateYield) * 100, '%'],
          ['Final Product Yield', Number(record.finalProductYield) * 100, '%'],
          ['Optimum Time for Intermediate', record.optimumTimeForIntermediate, 's'],
          ['Maximum Intermediate Concentration', record.maximumIntermediateConcentration, 'mol/m³'],
          ['Intermediate / Final Selectivity', record.intermediateSelectivityOverFinal, '—'],
          ['Mass-Balance Residual', record.massBalanceResidual, 'mol/m³'],
        ]
    }
  }

  return (
    <section className="native-calculator">
      <CalculatorHeader
        code={definition.code}
        icon={definition.icon}
        title={definition.title}
        subtitle={definition.subtitle}
      />

      <ReferenceBasis>{definition.basis}</ReferenceBasis>

      <div className="native-input-grid">
        {definition.fields.map((field) => (
          <NumericInput
            key={field.key}
            label={field.label}
            symbol={field.symbol}
            value={values[field.key] ?? ''}
            unit={field.unit}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                [field.key]: value,
              }))
            }
          />
        ))}
      </div>

      <ActionBar
        onLoadExample={() => {
          setValues(definition.example)
          setResult(null)
          setErrorMessage('')
        }}
        onClear={() => {
          setValues(Object.fromEntries(definition.fields.map((field) => [field.key, ''])))
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />

      {errorMessage ? (
        <div className="native-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {record ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={displayValue(headlineValue())}
          modelName={definition.title}
          note="Engineering screening model. Verify kinetic order, equilibrium basis, tracer normalization, RTD boundary model, feed-density assumptions and semibatch volume behavior before design use."
        >
          {rows().map(([label, value, unit]) => (
            <ResultItem
              key={label}
              label={label}
              value={displayValue(value)}
              unit={unit}
            />
          ))}
        </ResultPanel>
      ) : null}
    </section>
  )
}
