import { useState } from 'react'
import {
  ReactionEngineeringBatch04CalculationError,
  calculateEquilibriumConversion,
  calculateFCurveGenerator,
  calculateHeatExchangeBatchReactor,
  calculateHeatExchangeCSTR,
  calculateHeatExchangePFR,
  calculateImmobilizedEnzymeReactor,
} from './engine'
import type { ReactionEngineeringBatch04Mode } from './types'
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
  mode: ReactionEngineeringBatch04Mode
}
interface Field {
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
  fields: Field[]
  example: Record<string, string>
}

const definitions: Record<ReactionEngineeringBatch04Mode, Definition> = {
  equilibriumConversion: {
    code: 'RE–29',
    icon: 'Keq',
    title: 'Equilibrium Conversion',
    subtitle: 'Solve A + B ⇌ product equilibrium from initial concentrations',
    basis: 'Keq = Ceq,product / (Ceq,A · Ceq,B)',
    action: 'Calculate equilibrium conversion',
    headline: 'Conversion of reactant A',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'initialConcentrationB', label: 'Initial Concentration B', symbol: 'CB0', unit: 'mol/m³' },
      { key: 'equilibriumConstant', label: 'Equilibrium Constant', symbol: 'Keq', unit: 'concentration⁻¹' },
    ],
    example: {
      initialConcentrationA: '1',
      initialConcentrationB: '1',
      equilibriumConstant: '4',
    },
  },
  fCurveGenerator: {
    code: 'RE–30',
    icon: 'F(t)',
    title: 'F-Curve Generator',
    subtitle: 'Normalize discrete E-curve data and integrate its cumulative F response',
    basis: 'F(t) = ∫₀ᵗ E(τ)dτ',
    action: 'Generate F-curve',
    headline: 'F at evaluation time',
    fields: [
      { key: 't1', label: 'Time 1', symbol: 't₁', unit: 's' },
      { key: 'e1', label: 'E Value 1', symbol: 'E₁', unit: '1/s' },
      { key: 't2', label: 'Time 2', symbol: 't₂', unit: 's' },
      { key: 'e2', label: 'E Value 2', symbol: 'E₂', unit: '1/s' },
      { key: 't3', label: 'Time 3', symbol: 't₃', unit: 's' },
      { key: 'e3', label: 'E Value 3', symbol: 'E₃', unit: '1/s' },
      { key: 't4', label: 'Time 4', symbol: 't₄', unit: 's' },
      { key: 'e4', label: 'E Value 4', symbol: 'E₄', unit: '1/s' },
      { key: 't5', label: 'Time 5', symbol: 't₅', unit: 's' },
      { key: 'e5', label: 'E Value 5', symbol: 'E₅', unit: '1/s' },
      { key: 'evaluationTime', label: 'Evaluation Time', symbol: 'teval', unit: 's' },
    ],
    example: {
      t1: '0', e1: '0',
      t2: '50', e2: '0.006',
      t3: '100', e3: '0.012',
      t4: '150', e4: '0.002',
      t5: '200', e5: '0',
      evaluationTime: '100',
    },
  },
  heatExchangeBatchReactor: {
    code: 'RE–31',
    icon: 'HX-B',
    title: 'Heat-Exchange Batch Reactor',
    subtitle: 'Integrate conversion and temperature with Arrhenius kinetics and cooling',
    basis: 'dX/dt = k(T)(1−X); dT/dt = ΔTad·dX/dt − h(T−Tc)',
    action: 'Calculate cooled batch',
    headline: 'Required batch time',
    fields: [
      { key: 'initialConcentrationA', label: 'Initial Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'initialTemperature', label: 'Initial Temperature', symbol: 'T0', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Adiabatic Temperature Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'coolantTemperature', label: 'Coolant Temperature', symbol: 'Tc', unit: 'K' },
      { key: 'heatRemovalCoefficient', label: 'Heat-Removal Coefficient', symbol: 'h', unit: '1/s' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
      { key: 'maximumTime', label: 'Maximum Integration Time', symbol: 'tmax', unit: 's' },
    ],
    example: {
      initialConcentrationA: '1000',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      initialTemperature: '350',
      adiabaticTemperatureRise: '100',
      coolantTemperature: '330',
      heatRemovalCoefficient: '0.001',
      targetConversion: '0.8',
      maximumTime: '10000',
    },
  },
  heatExchangeCSTR: {
    code: 'RE–32',
    icon: 'HX-C',
    title: 'Heat-Exchange CSTR',
    subtitle: 'Size a cooled first-order CSTR at a selected conversion',
    basis: 'Tout = [Tin + ΔTadX + H·Tc]/(1+H); V = FA0X/[k(Tout)CA]',
    action: 'Calculate cooled CSTR',
    headline: 'Required reactor volume',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'inletTemperature', label: 'Inlet Temperature', symbol: 'Tin', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Adiabatic Temperature Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'coolantTemperature', label: 'Coolant Temperature', symbol: 'Tc', unit: 'K' },
      { key: 'heatRemovalNumber', label: 'Heat-Removal Number', symbol: 'H', unit: '—' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentrationA: '1000',
      volumetricFlowRate: '0.01',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      inletTemperature: '350',
      adiabaticTemperatureRise: '100',
      coolantTemperature: '330',
      heatRemovalNumber: '1.5',
      targetConversion: '0.8',
    },
  },
  heatExchangePFR: {
    code: 'RE–33',
    icon: 'HX-P',
    title: 'Heat-Exchange PFR',
    subtitle: 'Integrate cooled first-order plug-flow volume with variable temperature',
    basis: 'dT/dX = ΔTad − H(T−Tc); V = Q∫dX/[k(T)(1−X)]',
    action: 'Calculate cooled PFR',
    headline: 'Required reactor volume',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'preExponentialFactor', label: 'Pre-Exponential Factor', symbol: 'A', unit: '1/s' },
      { key: 'activationEnergy', label: 'Activation Energy', symbol: 'Ea', unit: 'J/mol' },
      { key: 'inletTemperature', label: 'Inlet Temperature', symbol: 'Tin', unit: 'K' },
      { key: 'adiabaticTemperatureRise', label: 'Adiabatic Temperature Rise', symbol: 'ΔTad', unit: 'K' },
      { key: 'coolantTemperature', label: 'Coolant Temperature', symbol: 'Tc', unit: 'K' },
      { key: 'heatRemovalNumberPerConversion', label: 'Heat Removal per Conversion', symbol: 'H', unit: '—' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentrationA: '1000',
      volumetricFlowRate: '0.01',
      preExponentialFactor: '1000000',
      activationEnergy: '50000',
      inletTemperature: '350',
      adiabaticTemperatureRise: '100',
      coolantTemperature: '330',
      heatRemovalNumberPerConversion: '2',
      targetConversion: '0.8',
    },
  },
  immobilizedEnzymeReactor: {
    code: 'RE–34',
    icon: 'η',
    title: 'Immobilized Enzyme Reactor',
    subtitle: 'Estimate spherical-pellet diffusion limitation and observed enzyme rate',
    basis: 'φ = Rp√(k1/De); η = 3/φ[coth(φ)−1/φ]',
    action: 'Calculate immobilized enzyme rate',
    headline: 'Total observed molar rate',
    fields: [
      { key: 'sphericalPelletRadius', label: 'Spherical Pellet Radius', symbol: 'Rp', unit: 'm' },
      { key: 'effectiveDiffusivity', label: 'Effective Diffusivity', symbol: 'De', unit: 'm²/s' },
      { key: 'maximumVolumetricRate', label: 'Maximum Volumetric Rate', symbol: 'Vmax', unit: 'mol/(m³·s)' },
      { key: 'michaelisConstant', label: 'Michaelis Constant', symbol: 'Km', unit: 'mol/m³' },
      { key: 'bulkSubstrateConcentration', label: 'Bulk Substrate Concentration', symbol: 'Sb', unit: 'mol/m³' },
      { key: 'totalPelletVolume', label: 'Total Pellet Volume', symbol: 'Vp', unit: 'm³' },
    ],
    example: {
      sphericalPelletRadius: '0.001',
      effectiveDiffusivity: '0.000000001',
      maximumVolumetricRate: '2',
      michaelisConstant: '20',
      bulkSubstrateConcentration: '100',
      totalPelletVolume: '0.1',
    },
  },
}

const display = (value: unknown) =>
  typeof value === 'number' ? formatEngineeringNumber(value) : String(value)

export function ReactionEngineeringBatch04Calculator({ mode }: Props) {
  const definition = definitions[mode]
  const [values, setValues] =
    useState<Record<string, string>>(definition.example)
  const [result, setResult] = useState<unknown>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const number = (key: string) => Number(values[key])

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'equilibriumConversion':
          next = calculateEquilibriumConversion({
            initialConcentrationA: number('initialConcentrationA'),
            initialConcentrationB: number('initialConcentrationB'),
            equilibriumConstant: number('equilibriumConstant'),
          })
          break
        case 'fCurveGenerator':
          next = calculateFCurveGenerator({
            times: [
              number('t1'), number('t2'), number('t3'),
              number('t4'), number('t5'),
            ],
            eValues: [
              number('e1'), number('e2'), number('e3'),
              number('e4'), number('e5'),
            ],
            evaluationTime: number('evaluationTime'),
          })
          break
        case 'heatExchangeBatchReactor':
          next = calculateHeatExchangeBatchReactor({
            initialConcentrationA: number('initialConcentrationA'),
            preExponentialFactor: number('preExponentialFactor'),
            activationEnergy: number('activationEnergy'),
            initialTemperature: number('initialTemperature'),
            adiabaticTemperatureRise: number('adiabaticTemperatureRise'),
            coolantTemperature: number('coolantTemperature'),
            heatRemovalCoefficient: number('heatRemovalCoefficient'),
            targetConversion: number('targetConversion'),
            maximumTime: number('maximumTime'),
          })
          break
        case 'heatExchangeCSTR':
          next = calculateHeatExchangeCSTR({
            inletConcentrationA: number('inletConcentrationA'),
            volumetricFlowRate: number('volumetricFlowRate'),
            preExponentialFactor: number('preExponentialFactor'),
            activationEnergy: number('activationEnergy'),
            inletTemperature: number('inletTemperature'),
            adiabaticTemperatureRise: number('adiabaticTemperatureRise'),
            coolantTemperature: number('coolantTemperature'),
            heatRemovalNumber: number('heatRemovalNumber'),
            targetConversion: number('targetConversion'),
          })
          break
        case 'heatExchangePFR':
          next = calculateHeatExchangePFR({
            inletConcentrationA: number('inletConcentrationA'),
            volumetricFlowRate: number('volumetricFlowRate'),
            preExponentialFactor: number('preExponentialFactor'),
            activationEnergy: number('activationEnergy'),
            inletTemperature: number('inletTemperature'),
            adiabaticTemperatureRise: number('adiabaticTemperatureRise'),
            coolantTemperature: number('coolantTemperature'),
            heatRemovalNumberPerConversion:
              number('heatRemovalNumberPerConversion'),
            targetConversion: number('targetConversion'),
          })
          break
        case 'immobilizedEnzymeReactor':
          next = calculateImmobilizedEnzymeReactor({
            sphericalPelletRadius: number('sphericalPelletRadius'),
            effectiveDiffusivity: number('effectiveDiffusivity'),
            maximumVolumetricRate: number('maximumVolumetricRate'),
            michaelisConstant: number('michaelisConstant'),
            bulkSubstrateConcentration: number('bulkSubstrateConcentration'),
            totalPelletVolume: number('totalPelletVolume'),
          })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof ReactionEngineeringBatch04CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  const record =
    result && typeof result === 'object'
      ? result as Record<string, unknown>
      : null

  function headline(): unknown {
    if (!record) return ''
    switch (mode) {
      case 'equilibriumConversion':
        return Number(record.conversionA) * 100
      case 'fCurveGenerator':
        return Number(record.fAtEvaluationTime) * 100
      case 'heatExchangeBatchReactor':
        return record.requiredBatchTime
      case 'heatExchangeCSTR':
      case 'heatExchangePFR':
        return record.requiredReactorVolume
      case 'immobilizedEnzymeReactor':
        return record.totalObservedMolarRate
    }
  }

  function rows(): Array<[string, unknown, string]> {
    if (!record) return []
    switch (mode) {
      case 'equilibriumConversion':
        return [
          ['Equilibrium Extent', record.equilibriumExtent, 'mol/m³'],
          ['Equilibrium Concentration A', record.equilibriumConcentrationA, 'mol/m³'],
          ['Equilibrium Concentration B', record.equilibriumConcentrationB, 'mol/m³'],
          ['Product Concentration', record.equilibriumConcentrationProduct, 'mol/m³'],
          ['Conversion A', Number(record.conversionA) * 100, '%'],
          ['Conversion B', Number(record.conversionB) * 100, '%'],
          ['Limiting Reactant', record.limitingReactant, ''],
          ['Equilibrium Residual', record.equilibriumResidual, '—'],
        ]
      case 'fCurveGenerator':
        return [
          ['Raw E-Curve Area', record.rawEArea, '—'],
          ['Mean Residence Time', record.meanResidenceTime, 's'],
          ['Median Residence Time', record.medianResidenceTime, 's'],
          ['Time at 10%', record.timeAtTenPercent, 's'],
          ['Time at 90%', record.timeAtNinetyPercent, 's'],
          ['Central 80% Span', record.centralEightyPercentSpan, 's'],
          ['Normalized E Values', (record.normalizedEValues as number[]).map(display).join(', '), ''],
          ['Cumulative F Values', (record.cumulativeFValues as number[]).map(display).join(', '), ''],
        ]
      case 'heatExchangeBatchReactor':
        return [
          ['Final Temperature', record.finalTemperature, 'K'],
          ['Maximum Temperature', record.maximumTemperature, 'K'],
          ['Final Concentration A', record.finalConcentrationA, 'mol/m³'],
          ['Final Rate Constant', record.finalRateConstant, '1/s'],
          ['Final Reaction Rate', record.finalReactionRate, 'mol/(m³·s)'],
          ['Heat Removed Index', record.totalHeatRemovedIndex, 'K'],
          ['Integration Steps', record.integrationSteps, '—'],
        ]
      case 'heatExchangeCSTR':
        return [
          ['Outlet Temperature', record.outletTemperature, 'K'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Outlet Rate Constant', record.outletRateConstant, '1/s'],
          ['Outlet Reaction Rate', record.outletReactionRate, 'mol/(m³·s)'],
          ['Space Time', record.spaceTime, 's'],
          ['Heat Removed Temperature Equivalent', record.heatRemovedTemperatureEquivalent, 'K'],
          ['Heat Removal Fraction', Number(record.heatRemovalFractionOfAdiabaticRise) * 100, '%'],
        ]
      case 'heatExchangePFR':
        return [
          ['Outlet Temperature', record.outletTemperature, 'K'],
          ['Maximum Temperature', record.maximumTemperature, 'K'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Outlet Rate Constant', record.outletRateConstant, '1/s'],
          ['Space Time', record.spaceTime, 's'],
          ['Average Rate Constant', record.averageRateConstant, '1/s'],
          ['Integration Intervals', record.integrationIntervals, '—'],
        ]
      case 'immobilizedEnzymeReactor':
        return [
          ['First-Order Rate Constant', record.firstOrderRateConstant, '1/s'],
          ['Thiele Modulus', record.thieleModulus, '—'],
          ['Effectiveness Factor', record.effectivenessFactor, '—'],
          ['Intrinsic Volumetric Rate', record.intrinsicVolumetricRate, 'mol/(m³·s)'],
          ['Observed Volumetric Rate', record.observedVolumetricRate, 'mol/(m³·s)'],
          ['Internal Diffusion Loss', Number(record.internalDiffusionLossFraction) * 100, '%'],
          ['Diffusion Regime', record.diffusionRegimeDescription, ''],
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
              setValues((current) => ({ ...current, [field.key]: value }))
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
          setValues(
            Object.fromEntries(definition.fields.map((field) => [field.key, ''])),
          )
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />
      {errorMessage ? (
        <div className="native-error" role="alert">{errorMessage}</div>
      ) : null}
      {record ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={display(headline())}
          modelName={definition.title}
          note="Engineering screening model. Verify reaction stoichiometry, equilibrium basis, tracer-data normalization, heat-capacity and heat-transfer assumptions, kinetic units and pellet-diffusion model before design use."
        >
          {rows().map(([label, value, unit]) => (
            <ResultItem
              key={label}
              label={label}
              value={display(value)}
              unit={unit}
            />
          ))}
        </ResultPanel>
      ) : null}
    </section>
  )
}
