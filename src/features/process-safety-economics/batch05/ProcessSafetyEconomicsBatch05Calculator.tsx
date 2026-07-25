import { useState } from 'react'
import {
  ProcessSafetyEconomicsBatch05CalculationError,
  calculateBLEVEFireballScreening,
  calculateEventTreeAnalysis,
  calculateGasLeakRateScreening,
  calculateGaussianPlumeDispersion,
  calculateTNTEquivalentExplosionScreening,
  calculateToxicExposureDoseScreening,
} from './engine'
import type {
  ProcessSafetyEconomicsBatch05Mode,
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
    ProcessSafetyEconomicsBatch05Mode
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
  ProcessSafetyEconomicsBatch05Mode,
  Definition
> = {
  bleveFireballScreening: {
    code: 'SE–25',
    icon: 'FB',
    title:
      'BLEVE Fireball Screening',
    subtitle:
      'Estimate fireball size, duration and point-source thermal radiation',
    basis:
      'D = 6.48M⁰·³²⁵; t = 0.852M⁰·²⁶; q″ = τχMΔHc/(4πR²t)',
    action:
      'Calculate BLEVE screening',
    headline:
      'Thermal radiation flux',
    fields: [
      { key: 'flammableMass', label: 'Flammable Mass', symbol: 'M', unit: 'kg' },
      { key: 'heatOfCombustion', label: 'Heat of Combustion', symbol: 'ΔHc', unit: 'J/kg' },
      { key: 'radiantFraction', label: 'Radiant Fraction', symbol: 'χr', unit: '0–1' },
      { key: 'atmosphericTransmissivity', label: 'Atmospheric Transmissivity', symbol: 'τa', unit: '0–1' },
      { key: 'receptorDistance', label: 'Receptor Distance', symbol: 'R', unit: 'm' },
    ],
    example: {
      flammableMass: '10000',
      heatOfCombustion: '46000000',
      radiantFraction: '0.3',
      atmosphericTransmissivity: '0.85',
      receptorDistance: '150',
    },
  },

  tntEquivalentExplosionScreening: {
    code: 'SE–26',
    icon: 'TNT',
    title:
      'TNT-Equivalent Explosion Screening',
    subtitle:
      'Convert effective combustion energy to TNT equivalent and estimate blast overpressure',
    basis:
      'WTNT = ηMΔHc / 4.68 MJ·kg⁻¹; Z = R/W⅓',
    action:
      'Calculate TNT-equivalent screening',
    headline:
      'Estimated peak overpressure',
    fields: [
      { key: 'flammableMass', label: 'Flammable Mass', symbol: 'M', unit: 'kg' },
      { key: 'heatOfCombustion', label: 'Heat of Combustion', symbol: 'ΔHc', unit: 'J/kg' },
      { key: 'explosionEfficiency', label: 'Explosion Efficiency', symbol: 'η', unit: '0–1' },
      { key: 'receptorDistance', label: 'Receptor Distance', symbol: 'R', unit: 'm' },
    ],
    example: {
      flammableMass: '1000',
      heatOfCombustion: '46000000',
      explosionEfficiency: '0.05',
      receptorDistance: '100',
    },
  },

  gasLeakRateScreening: {
    code: 'SE–27',
    icon: 'ṁg',
    title:
      'Gas Leak Rate Screening',
    subtitle:
      'Estimate choked or subcritical ideal-gas release through a circular opening',
    basis:
      'ṁ = CdA × isentropic compressible-flow mass flux',
    action:
      'Calculate gas leak rate',
    headline:
      'Mass release rate',
    fields: [
      { key: 'upstreamAbsolutePressure', label: 'Upstream Absolute Pressure', symbol: 'P₀', unit: 'Pa' },
      { key: 'downstreamAbsolutePressure', label: 'Downstream Absolute Pressure', symbol: 'Pb', unit: 'Pa' },
      { key: 'gasTemperature', label: 'Gas Temperature', symbol: 'T', unit: 'K' },
      { key: 'molecularWeight', label: 'Molecular Weight', symbol: 'MW', unit: 'kg/kmol' },
      { key: 'heatCapacityRatio', label: 'Heat-Capacity Ratio', symbol: 'k', unit: '—' },
      { key: 'dischargeCoefficient', label: 'Discharge Coefficient', symbol: 'Cd', unit: '0–1' },
      { key: 'orificeDiameter', label: 'Orifice Diameter', symbol: 'd', unit: 'm' },
    ],
    example: {
      upstreamAbsolutePressure: '1000000',
      downstreamAbsolutePressure: '101325',
      gasTemperature: '300',
      molecularWeight: '28',
      heatCapacityRatio: '1.4',
      dischargeCoefficient: '0.62',
      orificeDiameter: '0.01',
    },
  },

  gaussianPlumeDispersion: {
    code: 'SE–28',
    icon: 'GP',
    title:
      'Gaussian Plume Dispersion',
    subtitle:
      'Estimate steady continuous-release concentration with ground reflection',
    basis:
      'C = Q/(2πuσyσz) exp(−y²/2σy²)[exp(−(z−H)²/2σz²)+exp(−(z+H)²/2σz²)]',
    action:
      'Calculate plume concentration',
    headline:
      'Receptor concentration',
    fields: [
      { key: 'sourceEmissionRate', label: 'Source Emission Rate', symbol: 'Q', unit: 'mass/s' },
      { key: 'windSpeed', label: 'Wind Speed', symbol: 'u', unit: 'm/s' },
      { key: 'crosswindDistance', label: 'Crosswind Distance', symbol: 'y', unit: 'm' },
      { key: 'receptorHeight', label: 'Receptor Height', symbol: 'z', unit: 'm' },
      { key: 'effectiveReleaseHeight', label: 'Effective Release Height', symbol: 'H', unit: 'm' },
      { key: 'horizontalDispersionCoefficient', label: 'Horizontal Dispersion Coefficient', symbol: 'σy', unit: 'm' },
      { key: 'verticalDispersionCoefficient', label: 'Vertical Dispersion Coefficient', symbol: 'σz', unit: 'm' },
    ],
    example: {
      sourceEmissionRate: '1',
      windSpeed: '5',
      crosswindDistance: '0',
      receptorHeight: '1.5',
      effectiveReleaseHeight: '20',
      horizontalDispersionCoefficient: '30',
      verticalDispersionCoefficient: '15',
    },
  },

  toxicExposureDoseScreening: {
    code: 'SE–29',
    icon: 'Cⁿt',
    title:
      'Toxic Exposure Dose Screening',
    subtitle:
      'Compare a concentration-time toxic dose with a selected reference dose',
    basis:
      'Dose = Cⁿt',
    action:
      'Calculate toxic dose',
    headline:
      'Toxic dose ratio',
    fields: [
      { key: 'exposureConcentration', label: 'Exposure Concentration', symbol: 'C', unit: 'concentration' },
      { key: 'exposureDuration', label: 'Exposure Duration', symbol: 't', unit: 'time' },
      { key: 'concentrationExponent', label: 'Concentration Exponent', symbol: 'n', unit: '—' },
      { key: 'referenceDose', label: 'Reference Dose', symbol: 'Dref', unit: 'concentrationⁿ·time' },
    ],
    example: {
      exposureConcentration: '500',
      exposureDuration: '30',
      concentrationExponent: '2',
      referenceDose: '10000000',
    },
  },

  eventTreeAnalysis: {
    code: 'SE–30',
    icon: 'ET',
    title:
      'Event Tree Analysis',
    subtitle:
      'Calculate sequential barrier-failure and full-success outcome frequencies',
    basis:
      'Outcome frequency = initiating frequency × branch probabilities',
    action:
      'Calculate event tree',
    headline:
      'All-barriers-successful frequency',
    fields: [
      { key: 'initiatingEventFrequency', label: 'Initiating-Event Frequency', symbol: 'FIE', unit: '1/year' },
      { key: 'barrier1SuccessProbability', label: 'Barrier 1 Success Probability', symbol: 'P₁', unit: '0–1' },
      { key: 'barrier2SuccessProbability', label: 'Barrier 2 Success Probability', symbol: 'P₂', unit: '0–1' },
      { key: 'barrier3SuccessProbability', label: 'Barrier 3 Success Probability', symbol: 'P₃', unit: '0–1' },
    ],
    example: {
      initiatingEventFrequency: '0.1',
      barrier1SuccessProbability: '0.9',
      barrier2SuccessProbability: '0.8',
      barrier3SuccessProbability: '0.95',
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

export function ProcessSafetyEconomicsBatch05Calculator({
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
        case 'bleveFireballScreening':
          next =
            calculateBLEVEFireballScreening({
              flammableMass:
                number('flammableMass'),
              heatOfCombustion:
                number('heatOfCombustion'),
              radiantFraction:
                number('radiantFraction'),
              atmosphericTransmissivity:
                number('atmosphericTransmissivity'),
              receptorDistance:
                number('receptorDistance'),
            })
          break

        case 'tntEquivalentExplosionScreening':
          next =
            calculateTNTEquivalentExplosionScreening({
              flammableMass:
                number('flammableMass'),
              heatOfCombustion:
                number('heatOfCombustion'),
              explosionEfficiency:
                number('explosionEfficiency'),
              receptorDistance:
                number('receptorDistance'),
            })
          break

        case 'gasLeakRateScreening':
          next =
            calculateGasLeakRateScreening({
              upstreamAbsolutePressure:
                number('upstreamAbsolutePressure'),
              downstreamAbsolutePressure:
                number('downstreamAbsolutePressure'),
              gasTemperature:
                number('gasTemperature'),
              molecularWeight:
                number('molecularWeight'),
              heatCapacityRatio:
                number('heatCapacityRatio'),
              dischargeCoefficient:
                number('dischargeCoefficient'),
              orificeDiameter:
                number('orificeDiameter'),
            })
          break

        case 'gaussianPlumeDispersion':
          next =
            calculateGaussianPlumeDispersion({
              sourceEmissionRate:
                number('sourceEmissionRate'),
              windSpeed:
                number('windSpeed'),
              crosswindDistance:
                number('crosswindDistance'),
              receptorHeight:
                number('receptorHeight'),
              effectiveReleaseHeight:
                number('effectiveReleaseHeight'),
              horizontalDispersionCoefficient:
                number('horizontalDispersionCoefficient'),
              verticalDispersionCoefficient:
                number('verticalDispersionCoefficient'),
            })
          break

        case 'toxicExposureDoseScreening':
          next =
            calculateToxicExposureDoseScreening({
              exposureConcentration:
                number('exposureConcentration'),
              exposureDuration:
                number('exposureDuration'),
              concentrationExponent:
                number('concentrationExponent'),
              referenceDose:
                number('referenceDose'),
            })
          break

        case 'eventTreeAnalysis':
          next =
            calculateEventTreeAnalysis({
              initiatingEventFrequency:
                number('initiatingEventFrequency'),
              barrier1SuccessProbability:
                number('barrier1SuccessProbability'),
              barrier2SuccessProbability:
                number('barrier2SuccessProbability'),
              barrier3SuccessProbability:
                number('barrier3SuccessProbability'),
            })
          break
      }

      setResult(next)
      setErrorMessage('')
    } catch (error) {
      setResult(null)
      setErrorMessage(
        error instanceof
          ProcessSafetyEconomicsBatch05CalculationError
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
      case 'bleveFireballScreening':
        return Number(
          record.thermalRadiationFlux,
        ) / 1000
      case 'tntEquivalentExplosionScreening':
        return record.overpressureKilopascals
      case 'gasLeakRateScreening':
        return record.massReleaseRate
      case 'gaussianPlumeDispersion':
        return record.receptorConcentration
      case 'toxicExposureDoseScreening':
        return record.doseRatio
      case 'eventTreeAnalysis':
        return record.allBarriersSuccessfulFrequency
    }
  }

  function rows():
    Array<[string, unknown, string]> {
    if (!record) {
      return []
    }

    switch (mode) {
      case 'bleveFireballScreening':
        return [
          ['Fireball Diameter', record.fireballDiameter, 'm'],
          ['Fireball Duration', record.fireballDuration, 's'],
          ['Total Chemical Energy', record.totalChemicalEnergy, 'J'],
          ['Radiated Energy', record.radiatedEnergy, 'J'],
          ['Average Radiated Power', record.averageRadiatedPower, 'W'],
          ['Hazard Band', record.hazardBand, ''],
          ['Screening Description', record.screeningDescription, ''],
        ]

      case 'tntEquivalentExplosionScreening':
        return [
          ['Total Combustion Energy', record.totalCombustionEnergy, 'J'],
          ['Effective Explosion Energy', record.effectiveExplosionEnergy, 'J'],
          ['TNT-Equivalent Mass', record.tntEquivalentMass, 'kg TNT'],
          ['Scaled Distance', record.scaledDistance, 'm/kg⅓'],
          ['Peak Overpressure', record.estimatedPeakOverpressure, 'Pa'],
          ['Hazard Band', record.hazardBand, ''],
          ['Screening Description', record.screeningDescription, ''],
        ]

      case 'gasLeakRateScreening':
        return [
          ['Orifice Area', record.orificeArea, 'm²'],
          ['Specific Gas Constant', record.specificGasConstant, 'J/(kg·K)'],
          ['Upstream Gas Density', record.upstreamGasDensity, 'kg/m³'],
          ['Pressure Ratio', record.pressureRatio, '—'],
          ['Critical Pressure Ratio', record.criticalPressureRatio, '—'],
          ['Flow Choked', record.flowIsChoked ? 'Yes' : 'No', ''],
          ['Mass Flux', record.massFlux, 'kg/(m²·s)'],
          ['Upstream Volumetric Release', record.upstreamVolumetricReleaseRate, 'm³/s'],
          ['Flow Regime', record.flowRegimeDescription, ''],
        ]

      case 'gaussianPlumeDispersion':
        return [
          ['Prefactor Concentration', record.prefactorConcentration, 'mass/m³'],
          ['Crosswind Attenuation', record.crosswindAttenuationFactor, '—'],
          ['Direct Vertical Factor', record.directVerticalFactor, '—'],
          ['Reflected Vertical Factor', record.reflectedVerticalFactor, '—'],
          ['Centerline Ground Concentration', record.centerlineGroundConcentration, 'mass/m³'],
          ['Ground-Reflection Contribution', Number(record.groundReflectionContributionFraction) * 100, '%'],
          ['Plume Regime', record.plumeRegimeDescription, ''],
        ]

      case 'toxicExposureDoseScreening':
        return [
          ['Concentration Term', record.concentrationTerm, 'concentrationⁿ'],
          ['Toxic Dose', record.toxicDose, 'concentrationⁿ·time'],
          ['Dose vs Reference', record.dosePercentOfReference, '%'],
          ['Equivalent Reference Duration', record.equivalentReferenceDuration, 'time'],
          ['Hazard Band', record.hazardBand, ''],
          ['Screening Description', record.screeningDescription, ''],
        ]

      case 'eventTreeAnalysis':
        return [
          ['Initiating-Event Frequency', record.initiatingEventFrequency, '1/year'],
          ['Barrier 1 Failure Outcome', record.barrier1FailureOutcomeFrequency, '1/year'],
          ['Barrier 2 Failure Outcome', record.barrier2FailureOutcomeFrequency, '1/year'],
          ['Barrier 3 Failure Outcome', record.barrier3FailureOutcomeFrequency, '1/year'],
          ['Total Outcome Frequency', record.totalOutcomeFrequency, '1/year'],
          ['Conservation Error', record.probabilityConservationError, '1/year'],
          ['Full Success Probability', Number(record.fullSuccessProbability) * 100, '%'],
          ['Dominant Outcome', record.dominantOutcome, ''],
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
          note="Preliminary screening only. BLEVE, blast, toxic-release, dispersion and event-tree decisions require qualified process-safety review and verification against applicable CCPS/API methods, site data and governing standards."
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
