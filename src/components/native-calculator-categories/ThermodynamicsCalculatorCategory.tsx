import type {
  ReactNode,
} from 'react'

import { PhaseTenThermodynamicsCalculator } from '../../features/native-migrations/phase-ten-thermodynamics/PhaseTenThermodynamicsCalculator'

interface CategoryCalculatorProps {
  calculatorId: string
  title: string
}

type CategoryRenderer = (
  title: string,
) => ReactNode

const RENDERERS: Record<
  string,
  CategoryRenderer
> = {
"adiabaticIdealGasProcess": () => {
    const calculatorId = "adiabaticIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"antoineVaporPressure": () => {
    const calculatorId = "antoineVaporPressure" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"clausiusClapeyronEstimator": () => {
    const calculatorId = "clausiusClapeyronEstimator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"closedSystemFirstLaw": () => {
    const calculatorId = "closedSystemFirstLaw" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"compressorIsentropicEfficiency": () => {
    const calculatorId = "compressorIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"daltonPartialPressure": () => {
    const calculatorId = "daltonPartialPressure" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"enthalpyChangeCalculator": () => {
    const calculatorId = "enthalpyChangeCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"idealGas": () => {
    const calculatorId = "idealGas" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"idealGasEntropyChange": () => {
    const calculatorId = "idealGasEntropyChange" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"idealGasMixtureProperties": () => {
    const calculatorId = "idealGasMixtureProperties" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"incompressibleEntropyChange": () => {
    const calculatorId = "incompressibleEntropyChange" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"internalEnergyChangeCalculator": () => {
    const calculatorId = "internalEnergyChangeCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"isobaricIdealGasProcess": () => {
    const calculatorId = "isobaricIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"isochoricIdealGasProcess": () => {
    const calculatorId = "isochoricIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"isothermalIdealGasProcess": () => {
    const calculatorId = "isothermalIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"nozzleDiffuserEnergyBalance": () => {
    const calculatorId = "nozzleDiffuserEnergyBalance" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"polytropicIdealGasProcess": () => {
    const calculatorId = "polytropicIdealGasProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"pumpIsentropicEfficiency": () => {
    const calculatorId = "pumpIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reducedPropertiesCalculator": () => {
    const calculatorId = "reducedPropertiesCalculator" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"saturatedMixtureProperty": () => {
    const calculatorId = "saturatedMixtureProperty" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"steadyFlowEnergyEquation": () => {
    const calculatorId = "steadyFlowEnergyEquation" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"thermalEfficiencyCOP": () => {
    const calculatorId = "thermalEfficiencyCOP" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"throttlingProcess": () => {
    const calculatorId = "throttlingProcess" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"turbineIsentropicEfficiency": () => {
    const calculatorId = "turbineIsentropicEfficiency" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
"vaporQualityFromEnthalpy": () => {
    const calculatorId = "vaporQualityFromEnthalpy" as const
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={calculatorId}
      />
    )
  },
}

export default function ThermodynamicsCalculatorCategory({
  calculatorId,
  title,
}: CategoryCalculatorProps) {
  const renderer =
    RENDERERS[
      calculatorId
    ]

  if (!renderer) {
    return null
  }

  return renderer(
    title,
  )
}
