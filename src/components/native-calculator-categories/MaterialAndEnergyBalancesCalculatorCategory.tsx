import type {
  ReactNode,
} from 'react'

import { EvaporatorRequiredVaporReuseEfficiencyCalculator } from '../../features/material-energy-balances/evaporator-required-vapor-reuse-efficiency/EvaporatorRequiredVaporReuseEfficiencyCalculator'
import { EvaporatorSteamRequirementEconomyCalculator } from '../../features/material-energy-balances/evaporator-steam-requirement-economy/EvaporatorSteamRequirementEconomyCalculator'
import { EvaporatorTargetSteamEconomyEffectCountCalculator } from '../../features/material-energy-balances/evaporator-target-steam-economy-effect-count/EvaporatorTargetSteamEconomyEffectCountCalculator'
import { FluidBedDryerAdiabaticDryAirRequirementCalculator } from '../../features/material-energy-balances/fluid-bed-dryer-adiabatic-dry-air-requirement/FluidBedDryerAdiabaticDryAirRequirementCalculator'
import { FluidBedDryerAdiabaticInletTemperatureCalculator } from '../../features/material-energy-balances/fluid-bed-dryer-adiabatic-inlet-temperature/FluidBedDryerAdiabaticInletTemperatureCalculator'
import { FluidBedDryerEnergyBalanceCalculator } from '../../features/material-energy-balances/fluid-bed-dryer-energy-balance/FluidBedDryerEnergyBalanceCalculator'
import { FluidBedDryerMassBalanceCalculator } from '../../features/material-energy-balances/fluid-bed-dryer-mass-balance/FluidBedDryerMassBalanceCalculator'
import { MultipleEffectEvaporatorSteamEconomyCalculator } from '../../features/material-energy-balances/multiple-effect-evaporator-steam-economy/MultipleEffectEvaporatorSteamEconomyCalculator'
import { PhaseNineNativeCalculator } from '../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PriorityTenNativeCalculator } from '../../features/native-migrations/priority-ten-native/PriorityTenNativeCalculator'
import { SecondFiveNativeCalculator } from '../../features/native-migrations/second-five-native/SecondFiveNativeCalculator'
import { TopFiveNativeCalculator } from '../../features/native-migrations/top-five-native/TopFiveNativeCalculator'

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
"reactiveMaterialBalance": () => {
    const calculatorId = "reactiveMaterialBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"recyclePurgeInertBalance": () => {
    const calculatorId = "recyclePurgeInertBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"solidsWashingBalance": () => {
    const calculatorId = "solidsWashingBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"soluteDilutionCalculator": () => {
    const calculatorId = "soluteDilutionCalculator" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"streamSplitterBalance": () => {
    const calculatorId = "streamSplitterBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"twoStreamMixerBalance": () => {
    const calculatorId = "twoStreamMixerBalance" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"crystallizerBalance": () => {
    const calculatorId = "crystallizerBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"filterCakeBalance": () => {
    const calculatorId = "filterCakeBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"gasAbsorberBalance": () => {
    const calculatorId = "gasAbsorberBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"humidifierWaterBalance": () => {
    const calculatorId = "humidifierWaterBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"limitingReactantExcess": () => {
    const calculatorId = "limitingReactantExcess" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"liquidLiquidExtractionBalance": () => {
    const calculatorId = "liquidLiquidExtractionBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"membraneSeparatorBalance": () => {
    const calculatorId = "membraneSeparatorBalance" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binarySeparatorBalance": () => {
    const calculatorId = "binarySeparatorBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"bypassMixingBalance": () => {
    const calculatorId = "bypassMixingBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"combustionAirRequirement": () => {
    const calculatorId = "combustionAirRequirement" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"condenserBalance": () => {
    const calculatorId = "condenserBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reactionPerformanceBalance": () => {
    const calculatorId = "reactionPerformanceBalance" as const
    return (
      <PriorityTenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"evaporatorBalance": () => {
    const calculatorId = "evaporatorBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"massBalance": () => {
    const calculatorId = "massBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"phaseChangeEnergyBalance": () => {
    const calculatorId = "phaseChangeEnergyBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"sensibleHeatBalance": () => {
    const calculatorId = "sensibleHeatBalance" as const
    return (
      <SecondFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"heatExchangerEnergyBalance": () => {
    const calculatorId = "heatExchangerEnergyBalance" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"adiabaticMixingTemperature": () => {
    const calculatorId = "adiabaticMixingTemperature" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"dryerBalance": () => {
    const calculatorId = "dryerBalance" as const
    return (
      <TopFiveNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"fluidBedDryerAdiabaticDryAirRequirement": () => {
    return <FluidBedDryerAdiabaticDryAirRequirementCalculator />
  },
"evaporatorSteamRequirementEconomy": () => {
    return <EvaporatorSteamRequirementEconomyCalculator />
  },
"multipleEffectEvaporatorSteamEconomy": () => {
    return <MultipleEffectEvaporatorSteamEconomyCalculator />
  },
"evaporatorTargetSteamEconomyEffectCount": () => {
    return <EvaporatorTargetSteamEconomyEffectCountCalculator />
  },
"evaporatorRequiredVaporReuseEfficiency": () => {
    return <EvaporatorRequiredVaporReuseEfficiencyCalculator />
  },
"fluidBedDryerAdiabaticInletTemperature": () => {
    return <FluidBedDryerAdiabaticInletTemperatureCalculator />
  },
"fluidBedDryerEnergyBalance": () => {
    return <FluidBedDryerEnergyBalanceCalculator />
  },
"fluidBedDryerMassBalance": () => {
    return <FluidBedDryerMassBalanceCalculator />
  },
}

export default function MaterialAndEnergyBalancesCalculatorCategory({
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
