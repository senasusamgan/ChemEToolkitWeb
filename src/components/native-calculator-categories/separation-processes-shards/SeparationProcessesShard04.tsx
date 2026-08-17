import type {
  ReactNode,
} from 'react'

import { CombinedDryerTimeCalculator } from '../../../features/separation-processes/combined-dryer-time/CombinedDryerTimeCalculator'
import { FixedBedAdsorberBreakthroughCalculator } from '../../../features/separation-processes/fixed-bed-adsorber-breakthrough/FixedBedAdsorberBreakthroughCalculator'
import { GasMembraneAreaRequirementCalculator } from '../../../features/separation-processes/gas-membrane-area-requirement/GasMembraneAreaRequirementCalculator'
import { HydrocycloneSeparationNumberCalculator } from '../../../features/separation-processes/hydrocyclone-separation-number/HydrocycloneSeparationNumberCalculator'
import { IdealGasMembraneStageCutCalculator } from '../../../features/separation-processes/ideal-gas-membrane-stage-cut/IdealGasMembraneStageCutCalculator'
import { KremserStrippingStagesCalculator } from '../../../features/separation-processes/kremser-stripping-stages/KremserStrippingStagesCalculator'
import { PsychrometricAirStreamMixingCalculator } from '../../../features/separation-processes/psychrometric-air-stream-mixing/PsychrometricAirStreamMixingCalculator'
import { RelativeHumidityHumidificationCalculator } from '../../../features/separation-processes/relative-humidity-humidification/RelativeHumidityHumidificationCalculator'
import { ReverseOsmosisWaterFluxCalculator } from '../../../features/separation-processes/reverse-osmosis-water-flux/ReverseOsmosisWaterFluxCalculator'
import { SingleStageGasAbsorptionCalculator } from '../../../features/separation-processes/single-stage-gas-absorption/SingleStageGasAbsorptionCalculator'
import { SingleStageLeachingBalanceCalculator } from '../../../features/separation-processes/single-stage-leaching-balance/SingleStageLeachingBalanceCalculator'
import { StrippingMinimumGasRateCalculator } from '../../../features/separation-processes/stripping-minimum-gas-rate/StrippingMinimumGasRateCalculator'
import { UltrafiltrationResistanceSeriesCalculator } from '../../../features/separation-processes/ultrafiltration-resistance-series/UltrafiltrationResistanceSeriesCalculator'


interface SeparationProcessesShardProps {
  calculatorId: string
  title: string
}

type ShardRenderer = (
  title: string,
) => ReactNode

const RENDERERS: Record<
  string,
  ShardRenderer
> = {
"kremserStrippingStages": () => {
    return <KremserStrippingStagesCalculator />
  },
"strippingMinimumGasRate": () => {
    return <StrippingMinimumGasRateCalculator />
  },
"gasMembraneAreaRequirement": () => {
    return <GasMembraneAreaRequirementCalculator />
  },
"idealGasMembraneStageCut": () => {
    return <IdealGasMembraneStageCutCalculator />
  },
"reverseOsmosisWaterFlux": () => {
    return <ReverseOsmosisWaterFluxCalculator />
  },
"ultrafiltrationResistanceSeries": () => {
    return <UltrafiltrationResistanceSeriesCalculator />
  },
"psychrometricAirStreamMixing": () => {
    return <PsychrometricAirStreamMixingCalculator />
  },
"relativeHumidityHumidification": () => {
    return <RelativeHumidityHumidificationCalculator />
  },
"combinedDryerTime": () => {
    return <CombinedDryerTimeCalculator />
  },
"fixedBedAdsorberBreakthrough": () => {
    return <FixedBedAdsorberBreakthroughCalculator />
  },
"hydrocycloneSeparationNumber": () => {
    return <HydrocycloneSeparationNumberCalculator />
  },
"singleStageGasAbsorption": () => {
    return <SingleStageGasAbsorptionCalculator />
  },
"singleStageLeachingBalance": () => {
    return <SingleStageLeachingBalanceCalculator />
  },
}

export default function SeparationProcessesShard04({
  calculatorId,
  title,
}: SeparationProcessesShardProps) {
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
