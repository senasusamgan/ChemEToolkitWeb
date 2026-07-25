import { useState } from 'react'
import {
  ReactionEngineeringBatch05CalculationError,
  calculateLevenspielPlotSizing,
  calculateMembraneReactor,
  calculateMichaelisMentenReactor,
  calculateMonodBioreactorDesign,
  calculateMultipleReactionsCSTR,
  calculateMultipleReactionsPFR,
} from './engine'
import type {
  ReactionEngineeringBatch05Mode,
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
  mode:
    ReactionEngineeringBatch05Mode
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

const definitions: Record<
  ReactionEngineeringBatch05Mode,
  Definition
> = {
  levenspielPlotSizing: {
    code: 'RE–35',
    icon: '∫',
    title:
      'Levenspiel Plot Sizing',
    subtitle:
      'Integrate tabulated reciprocal-rate data for PFR and endpoint CSTR sizing',
    basis:
      'VPFR = FA0∫dX/(−rA); VCSTR = FA0Xf/(−rA)f',
    action:
      'Calculate reactor sizes',
    headline:
      'PFR volume',
    fields: [
      { key: 'inletMolarFlowRate', label: 'Inlet Molar Flow Rate', symbol: 'FA0', unit: 'mol/s' },
      { key: 'x1', label: 'Conversion Point 1', symbol: 'X₁', unit: '—' },
      { key: 'y1', label: 'Inverse Rate Point 1', symbol: '1/(−rA)₁', unit: 'm³·s/mol' },
      { key: 'x2', label: 'Conversion Point 2', symbol: 'X₂', unit: '—' },
      { key: 'y2', label: 'Inverse Rate Point 2', symbol: '1/(−rA)₂', unit: 'm³·s/mol' },
      { key: 'x3', label: 'Conversion Point 3', symbol: 'X₃', unit: '—' },
      { key: 'y3', label: 'Inverse Rate Point 3', symbol: '1/(−rA)₃', unit: 'm³·s/mol' },
      { key: 'x4', label: 'Conversion Point 4', symbol: 'X₄', unit: '—' },
      { key: 'y4', label: 'Inverse Rate Point 4', symbol: '1/(−rA)₄', unit: 'm³·s/mol' },
      { key: 'x5', label: 'Conversion Point 5', symbol: 'X₅', unit: '—' },
      { key: 'y5', label: 'Inverse Rate Point 5', symbol: '1/(−rA)₅', unit: 'm³·s/mol' },
    ],
    example: {
      inletMolarFlowRate: '10',
      x1: '0',
      y1: '0.1',
      x2: '0.2',
      y2: '0.12',
      x3: '0.4',
      y3: '0.18',
      x4: '0.6',
      y4: '0.3',
      x5: '0.8',
      y5: '0.6',
    },
  },

  membraneReactor: {
    code: 'RE–36',
    icon: 'MR',
    title:
      'Membrane Reactor',
    subtitle:
      'Integrate reversible A-to-B reaction with selective product removal',
    basis:
      'r = kf(CA − CB/Keq); rmem = kmCB',
    action:
      'Calculate membrane reactor',
    headline:
      'Conversion of A',
    fields: [
      { key: 'inletMolarFlowRateA', label: 'Inlet Molar Flow A', symbol: 'FA0', unit: 'mol/s' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'forwardRateConstant', label: 'Forward Rate Constant', symbol: 'kf', unit: '1/s' },
      { key: 'equilibriumConstant', label: 'Equilibrium Constant', symbol: 'Keq', unit: '—' },
      { key: 'membraneRemovalRateConstant', label: 'Membrane Removal Constant', symbol: 'km', unit: '1/s' },
      { key: 'reactorVolume', label: 'Reactor Volume', symbol: 'V', unit: 'm³' },
    ],
    example: {
      inletMolarFlowRateA: '10',
      volumetricFlowRate: '1',
      forwardRateConstant: '0.4',
      equilibriumConstant: '2',
      membraneRemovalRateConstant: '0.25',
      reactorVolume: '5',
    },
  },

  michaelisMentenReactor: {
    code: 'RE–37',
    icon: 'MM',
    title:
      'Michaelis–Menten Reactor',
    subtitle:
      'Size a continuous stirred enzyme reactor at a selected substrate conversion',
    basis:
      'V = Q(S0−S)/[VmaxS/(Km+S)]',
    action:
      'Calculate enzyme CSTR',
    headline:
      'Required reactor volume',
    fields: [
      { key: 'substrateVolumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'inletSubstrateConcentration', label: 'Inlet Substrate Concentration', symbol: 'S0', unit: 'mol/m³' },
      { key: 'maximumVolumetricRate', label: 'Maximum Volumetric Rate', symbol: 'Vmax', unit: 'mol/(m³·s)' },
      { key: 'michaelisConstant', label: 'Michaelis Constant', symbol: 'Km', unit: 'mol/m³' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      substrateVolumetricFlowRate: '0.01',
      inletSubstrateConcentration: '100',
      maximumVolumetricRate: '2',
      michaelisConstant: '20',
      targetConversion: '0.8',
    },
  },

  monodBioreactorDesign: {
    code: 'RE–38',
    icon: 'μ',
    title:
      'Monod Bioreactor Design',
    subtitle:
      'Size a steady-state chemostat from target effluent substrate and biomass kinetics',
    basis:
      'μ = μmaxS/(Ks+S); D = μ−kd; V = Q/D',
    action:
      'Calculate bioreactor design',
    headline:
      'Required reactor volume',
    fields: [
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/day' },
      { key: 'feedSubstrateConcentration', label: 'Feed Substrate Concentration', symbol: 'S0', unit: 'kg/m³' },
      { key: 'targetEffluentSubstrateConcentration', label: 'Target Effluent Substrate', symbol: 'S', unit: 'kg/m³' },
      { key: 'maximumSpecificGrowthRate', label: 'Maximum Specific Growth Rate', symbol: 'μmax', unit: '1/day' },
      { key: 'monodHalfSaturationConstant', label: 'Monod Half-Saturation Constant', symbol: 'Ks', unit: 'kg/m³' },
      { key: 'biomassYieldCoefficient', label: 'Biomass Yield Coefficient', symbol: 'Y', unit: 'kgX/kgS' },
      { key: 'biomassDecayRate', label: 'Biomass Decay Rate', symbol: 'kd', unit: '1/day' },
    ],
    example: {
      volumetricFlowRate: '10',
      feedSubstrateConcentration: '20',
      targetEffluentSubstrateConcentration: '2',
      maximumSpecificGrowthRate: '0.5',
      monodHalfSaturationConstant: '1',
      biomassYieldCoefficient: '0.6',
      biomassDecayRate: '0.05',
    },
  },

  multipleReactionsCSTR: {
    code: 'RE–39',
    icon: 'CSTR',
    title:
      'Multiple Reactions in a CSTR',
    subtitle:
      'Size a CSTR for parallel first-order desired and undesired reactions',
    basis:
      'A → B with kB; A → C with kC; τ = X/[(kB+kC)(1−X)]',
    action:
      'Calculate parallel-reaction CSTR',
    headline:
      'Required reactor volume',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'desiredReactionRateConstant', label: 'Desired-Reaction Rate Constant', symbol: 'kB', unit: '1/s' },
      { key: 'undesiredReactionRateConstant', label: 'Undesired-Reaction Rate Constant', symbol: 'kC', unit: '1/s' },
      { key: 'targetConversion', label: 'Target Conversion', symbol: 'X', unit: '0–1' },
    ],
    example: {
      inletConcentrationA: '1000',
      volumetricFlowRate: '0.01',
      desiredReactionRateConstant: '0.03',
      undesiredReactionRateConstant: '0.01',
      targetConversion: '0.8',
    },
  },

  multipleReactionsPFR: {
    code: 'RE–40',
    icon: 'PFR',
    title:
      'Multiple Reactions in a PFR',
    subtitle:
      'Evaluate consecutive first-order A-to-B-to-C reactions in plug flow',
    basis:
      'A → B → C; CA = CA0e⁻ᵏ¹ᵗ; CB from consecutive first-order solution',
    action:
      'Calculate consecutive-reaction PFR',
    headline:
      'Intermediate-product yield',
    fields: [
      { key: 'inletConcentrationA', label: 'Inlet Concentration A', symbol: 'CA0', unit: 'mol/m³' },
      { key: 'volumetricFlowRate', label: 'Volumetric Flow Rate', symbol: 'Q', unit: 'm³/s' },
      { key: 'firstReactionRateConstant', label: 'A-to-B Rate Constant', symbol: 'k1', unit: '1/s' },
      { key: 'secondReactionRateConstant', label: 'B-to-C Rate Constant', symbol: 'k2', unit: '1/s' },
      { key: 'spaceTime', label: 'Space Time', symbol: 'τ', unit: 's' },
    ],
    example: {
      inletConcentrationA: '1000',
      volumetricFlowRate: '0.01',
      firstReactionRateConstant: '0.03',
      secondReactionRateConstant: '0.01',
      spaceTime: '50',
    },
  },
}

function displayValue(
  value: unknown,
): string {
  return typeof value === 'number'
    ? formatEngineeringNumber(value)
    : String(value)
}

export function ReactionEngineeringBatch05Calculator({
  mode,
}: Props) {
  const definition =
    definitions[mode]

  const [values, setValues] =
    useState<Record<string, string>>(
      definition.example,
    )

  const [result, setResult] =
    useState<unknown>(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  function number(
    key: string,
  ): number {
    return Number(values[key])
  }

  function calculate() {
    try {
      let next: unknown

      switch (mode) {
        case 'levenspielPlotSizing':
          next =
            calculateLevenspielPlotSizing({
              inletMolarFlowRate:
                number('inletMolarFlowRate'),
              conversions: [
                number('x1'),
                number('x2'),
                number('x3'),
                number('x4'),
                number('x5'),
              ],
              inverseRates: [
                number('y1'),
                number('y2'),
                number('y3'),
                number('y4'),
                number('y5'),
              ],
            })
          break

        case 'membraneReactor':
          next =
            calculateMembraneReactor({
              inletMolarFlowRateA:
                number('inletMolarFlowRateA'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              forwardRateConstant:
                number('forwardRateConstant'),
              equilibriumConstant:
                number('equilibriumConstant'),
              membraneRemovalRateConstant:
                number('membraneRemovalRateConstant'),
              reactorVolume:
                number('reactorVolume'),
            })
          break

        case 'michaelisMentenReactor':
          next =
            calculateMichaelisMentenReactor({
              substrateVolumetricFlowRate:
                number('substrateVolumetricFlowRate'),
              inletSubstrateConcentration:
                number('inletSubstrateConcentration'),
              maximumVolumetricRate:
                number('maximumVolumetricRate'),
              michaelisConstant:
                number('michaelisConstant'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'monodBioreactorDesign':
          next =
            calculateMonodBioreactorDesign({
              volumetricFlowRate:
                number('volumetricFlowRate'),
              feedSubstrateConcentration:
                number('feedSubstrateConcentration'),
              targetEffluentSubstrateConcentration:
                number('targetEffluentSubstrateConcentration'),
              maximumSpecificGrowthRate:
                number('maximumSpecificGrowthRate'),
              monodHalfSaturationConstant:
                number('monodHalfSaturationConstant'),
              biomassYieldCoefficient:
                number('biomassYieldCoefficient'),
              biomassDecayRate:
                number('biomassDecayRate'),
            })
          break

        case 'multipleReactionsCSTR':
          next =
            calculateMultipleReactionsCSTR({
              inletConcentrationA:
                number('inletConcentrationA'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              desiredReactionRateConstant:
                number('desiredReactionRateConstant'),
              undesiredReactionRateConstant:
                number('undesiredReactionRateConstant'),
              targetConversion:
                number('targetConversion'),
            })
          break

        case 'multipleReactionsPFR':
          next =
            calculateMultipleReactionsPFR({
              inletConcentrationA:
                number('inletConcentrationA'),
              volumetricFlowRate:
                number('volumetricFlowRate'),
              firstReactionRateConstant:
                number('firstReactionRateConstant'),
              secondReactionRateConstant:
                number('secondReactionRateConstant'),
              spaceTime:
                number('spaceTime'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ReactionEngineeringBatch05CalculationError
          ? error.message
          : 'The calculation could not be completed.',
      )
    }
  }

  const record =
    result &&
    typeof result === 'object'
      ? result as Record<
          string,
          unknown
        >
      : null

  function headlineValue():
    unknown {
    if (!record) {
      return ''
    }

    switch (mode) {
      case 'levenspielPlotSizing':
        return record.pfrVolume
      case 'membraneReactor':
        return Number(
          record.conversionA,
        ) *
        100
      case 'michaelisMentenReactor':
      case 'monodBioreactorDesign':
      case 'multipleReactionsCSTR':
        return record.requiredReactorVolume
      case 'multipleReactionsPFR':
        return Number(
          record.intermediateYield,
        ) *
        100
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'levenspielPlotSizing':
        return [
          ['PFR Volume', record.pfrVolume, 'm³'],
          ['Endpoint CSTR Volume', record.cstrVolumeToFinalConversion, 'm³'],
          ['Final Conversion', Number(record.finalConversion) * 100, '%'],
          ['Integrated Plot Area', record.integratedArea, 'm³·s/mol'],
          ['Endpoint Inverse Rate', record.endpointInverseRate, 'm³·s/mol'],
          ['Minimum Inverse Rate', record.minimumInverseRate, 'm³·s/mol'],
          ['Maximum Inverse Rate', record.maximumInverseRate, 'm³·s/mol'],
          ['PFR / CSTR Volume Ratio', record.pfrToCSTRVolumeRatio, '—'],
          ['Integration Segments', record.integrationSegments, '—'],
        ]

      case 'membraneReactor':
        return [
          ['Conversion of A', Number(record.conversionA) * 100, '%'],
          ['Outlet Molar Flow A', record.outletMolarFlowRateA, 'mol/s'],
          ['Outlet Molar Flow B', record.outletMolarFlowRateB, 'mol/s'],
          ['Permeated Molar Flow B', record.permeatedMolarFlowRateB, 'mol/s'],
          ['Product Recovery to Permeate', Number(record.productRecovery) * 100, '%'],
          ['Outlet B / A Ratio', record.outletSelectivityToRetainedProduct, '—'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Outlet Concentration B', record.outletConcentrationB, 'mol/m³'],
          ['Net Outlet Reaction Rate', record.netProductionRateAtOutlet, 'mol/(m³·s)'],
          ['Integration Steps', record.integrationSteps, '—'],
        ]

      case 'michaelisMentenReactor':
        return [
          ['Outlet Substrate Concentration', record.outletSubstrateConcentration, 'mol/m³'],
          ['Outlet Reaction Rate', record.outletReactionRate, 'mol/(m³·s)'],
          ['Space Time', record.spaceTime, 's'],
          ['Substrate Consumption Rate', record.substrateConsumptionRate, 'mol/s'],
          ['Inlet Saturation Fraction', Number(record.inletSaturationFraction) * 100, '%'],
          ['Outlet Saturation Fraction', Number(record.outletSaturationFraction) * 100, '%'],
          ['Volumetric Productivity', record.volumetricProductivity, 'mol/(m³·s)'],
        ]

      case 'monodBioreactorDesign':
        return [
          ['Gross Specific Growth Rate', record.grossSpecificGrowthRate, '1/day'],
          ['Net Specific Growth Rate', record.netSpecificGrowthRate, '1/day'],
          ['Dilution Rate', record.dilutionRate, '1/day'],
          ['Hydraulic Residence Time', record.hydraulicResidenceTime, 'day'],
          ['Steady-State Biomass', record.steadyStateBiomassConcentration, 'kg/m³'],
          ['Biomass Production Rate', record.biomassProductionRate, 'kg/day'],
          ['Substrate Removal Rate', record.substrateRemovalRate, 'kg/day'],
          ['Washout Dilution Rate', record.washoutDilutionRate, '1/day'],
          ['Washout Safety Margin', Number(record.washoutSafetyMargin) * 100, '%'],
        ]

      case 'multipleReactionsCSTR':
        return [
          ['Total Rate Constant', record.totalRateConstant, '1/s'],
          ['Required Space Time', record.requiredSpaceTime, 's'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Desired Product Concentration', record.outletConcentrationDesiredProduct, 'mol/m³'],
          ['Undesired Product Concentration', record.outletConcentrationUndesiredProduct, 'mol/m³'],
          ['Desired Product Yield', Number(record.desiredProductYield) * 100, '%'],
          ['Desired Product Selectivity', record.desiredProductSelectivity, '—'],
          ['Desired Product Fraction', Number(record.desiredProductFraction) * 100, '%'],
        ]

      case 'multipleReactionsPFR':
        return [
          ['Reactor Volume', record.reactorVolume, 'm³'],
          ['Outlet Concentration A', record.outletConcentrationA, 'mol/m³'],
          ['Intermediate Concentration B', record.outletConcentrationIntermediate, 'mol/m³'],
          ['Final Product Concentration C', record.outletConcentrationFinalProduct, 'mol/m³'],
          ['Conversion of A', Number(record.conversionA) * 100, '%'],
          ['Intermediate Yield', Number(record.intermediateYield) * 100, '%'],
          ['Intermediate Selectivity', record.intermediateSelectivity, '—'],
          ['Optimum Space Time for B', record.optimumSpaceTimeForIntermediate, 's'],
          ['Maximum Intermediate Concentration', record.maximumIntermediateConcentration, 'mol/m³'],
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

      <ReferenceBasis>
        {definition.basis}
      </ReferenceBasis>

      <div className="native-input-grid">
        {definition.fields.map(
          (field) => (
            <NumericInput
              key={field.key}
              label={field.label}
              symbol={field.symbol}
              value={values[field.key] ?? ''}
              unit={field.unit}
              onChange={(value) =>
                setValues(
                  (current) => ({
                    ...current,
                    [field.key]: value,
                  }),
                )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={() => {
          setValues(definition.example)
          setResult(null)
          setErrorMessage('')
        }}
        onClear={() => {
          setValues(
            Object.fromEntries(
              definition.fields.map(
                (field) => [
                  field.key,
                  '',
                ],
              ),
            ),
          )
          setResult(null)
          setErrorMessage('')
        }}
        onCalculate={calculate}
        calculateLabel={definition.action}
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {record ? (
        <ResultPanel
          headlineLabel={definition.headline}
          headlineValue={
            displayValue(
              headlineValue(),
            )
          }
          modelName={definition.title}
          note="Engineering screening model. Verify rate-data units, membrane transport basis, enzyme kinetics, microbial decay and yield assumptions, reaction network and constant-density assumptions before design use."
        >
          {rows().map(
            ([label, value, unit]) => (
              <ResultItem
                key={label}
                label={label}
                value={displayValue(value)}
                unit={unit}
              />
            ),
          )}
        </ResultPanel>
      ) : null}
    </section>
  )
}
