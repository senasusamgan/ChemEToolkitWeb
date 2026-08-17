import {
  lazy,
} from 'react'

import type {
  ComponentType,
  LazyExoticComponent,
} from 'react'

interface CategoryCalculatorProps {
  calculatorId: string
  title: string
}

type SeparationProcessesShardKey =
  | "shard-01"
  | "shard-02"
  | "shard-03"
  | "shard-04"

const SHARD_BY_CALCULATOR: Record<
  string,
  SeparationProcessesShardKey
> = {
  "binaryIsothermalFlash": "shard-01",
  "binaryMinimumReflux": "shard-01",
  "binaryRelativeVolatilityVLE": "shard-01",
  "cycloneCutDiameter": "shard-01",
  "fenskeMinimumStages": "shard-01",
  "absorptionMinimumSolventRate": "shard-01",
  "murphreeTrayEfficiency": "shard-01",
  "packedColumnHTUNTU": "shard-01",
  "psychrometricAirEnthalpy": "shard-01",
  "raoultBubblePointPressure": "shard-01",
  "raoultDewPointPressure": "shard-01",
  "batchSettlingAreaEstimate": "shard-01",
  "centrifugeSigmaScaleUp": "shard-01",
  "constantPressureFilterSizing": "shard-02",
  "coolingCrystallizerYield": "shard-02",
  "evaporativeCrystallizerBalance": "shard-02",
  "dryerThermalDuty": "shard-02",
  "binaryDistillationBalance": "shard-02",
  "extractionDistributionSelectivity": "shard-02",
  "extractionSolventRequirement": "shard-02",
  "crosscurrentExtractionStages": "shard-02",
  "countercurrentExtractionStages": "shard-02",
  "gillilandStageEstimate": "shard-02",
  "fenskeUnderwoodGillilandShortcut": "shard-02",
  "soudersBrownColumnDiameter": "shard-02",
  "trayHydraulicsWeepingCheck": "shard-02",
  "trayDowncomerBackupResidence": "shard-03",
  "packedColumnHtuNtuHeight": "shard-03",
  "packedColumnPressureDropFlooding": "shard-03",
  "packedColumnLiquidHoldupResidence": "shard-03",
  "packedColumnLiquidDistributorIrrigation": "shard-03",
  "packedColumnGasLoadFFactor": "shard-03",
  "packedColumnRedistributorSpacing": "shard-03",
  "kremserAbsorptionFactorStages": "shard-03",
  "absorberMinimumSolventRate": "shard-03",
  "absorptionStrippingFactors": "shard-03",
  "adsorbentMassRequirement": "shard-03",
  "betMonolayerCapacity": "shard-03",
  "kremserAbsorptionStages": "shard-03",
  "kremserStrippingStages": "shard-04",
  "strippingMinimumGasRate": "shard-04",
  "gasMembraneAreaRequirement": "shard-04",
  "idealGasMembraneStageCut": "shard-04",
  "reverseOsmosisWaterFlux": "shard-04",
  "ultrafiltrationResistanceSeries": "shard-04",
  "psychrometricAirStreamMixing": "shard-04",
  "relativeHumidityHumidification": "shard-04",
  "combinedDryerTime": "shard-04",
  "fixedBedAdsorberBreakthrough": "shard-04",
  "hydrocycloneSeparationNumber": "shard-04",
  "singleStageGasAbsorption": "shard-04",
  "singleStageLeachingBalance": "shard-04",
}

const LazySeparationProcessesShard01 =
  lazy(
    () =>
      import(
        './separation-processes-shards/SeparationProcessesShard01'
      ),
  )
const LazySeparationProcessesShard02 =
  lazy(
    () =>
      import(
        './separation-processes-shards/SeparationProcessesShard02'
      ),
  )
const LazySeparationProcessesShard03 =
  lazy(
    () =>
      import(
        './separation-processes-shards/SeparationProcessesShard03'
      ),
  )
const LazySeparationProcessesShard04 =
  lazy(
    () =>
      import(
        './separation-processes-shards/SeparationProcessesShard04'
      ),
  )

const SHARDS: Record<
  SeparationProcessesShardKey,
  LazyExoticComponent<
    ComponentType<
      CategoryCalculatorProps
    >
  >
> = {
  "shard-01": LazySeparationProcessesShard01,
  "shard-02": LazySeparationProcessesShard02,
  "shard-03": LazySeparationProcessesShard03,
  "shard-04": LazySeparationProcessesShard04,
}

export default function SeparationProcessesCalculatorCategory({
  calculatorId,
  title,
}: CategoryCalculatorProps) {
  const shardKey =
    SHARD_BY_CALCULATOR[
      calculatorId
    ]

  if (!shardKey) {
    return null
  }

  const Shard =
    SHARDS[
      shardKey
    ]

  return (
    <Shard
      calculatorId={calculatorId}
      title={title}
    />
  )
}
