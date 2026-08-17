import type {
  ReactNode,
} from 'react'

import { AbsorberMinimumSolventRateCalculator } from '../../features/separation-processes/absorber-minimum-solvent-rate/AbsorberMinimumSolventRateCalculator'
import { AbsorptionStrippingFactorsCalculator } from '../../features/separation-processes/absorption-stripping-factors/AbsorptionStrippingFactorsCalculator'
import { AdsorbentMassRequirementCalculator } from '../../features/separation-processes/adsorbent-mass-requirement/AdsorbentMassRequirementCalculator'
import { BatchSettlingAreaEstimateCalculator } from '../../features/separation-processes/batch-settling-area-estimate/BatchSettlingAreaEstimateCalculator'
import { BetMonolayerCapacityCalculator } from '../../features/separation-processes/bet-monolayer-capacity/BetMonolayerCapacityCalculator'
import { BinaryDistillationBalanceCalculator } from '../../features/separation-processes/binary-distillation-balance/BinaryDistillationBalanceCalculator'
import { CentrifugeSigmaScaleUpCalculator } from '../../features/separation-processes/centrifuge-sigma-scale-up/CentrifugeSigmaScaleUpCalculator'
import { CombinedDryerTimeCalculator } from '../../features/separation-processes/combined-dryer-time/CombinedDryerTimeCalculator'
import { ConstantPressureFilterSizingCalculator } from '../../features/separation-processes/constant-pressure-filter-sizing/ConstantPressureFilterSizingCalculator'
import { CoolingCrystallizerYieldCalculator } from '../../features/separation-processes/cooling-crystallizer-yield/CoolingCrystallizerYieldCalculator'
import { CountercurrentExtractionStagesCalculator } from '../../features/separation-processes/countercurrent-extraction-stages/CountercurrentExtractionStagesCalculator'
import { CrosscurrentExtractionStagesCalculator } from '../../features/separation-processes/crosscurrent-extraction-stages/CrosscurrentExtractionStagesCalculator'
import { DryerThermalDutyCalculator } from '../../features/separation-processes/dryer-thermal-duty/DryerThermalDutyCalculator'
import { EvaporativeCrystallizerBalanceCalculator } from '../../features/separation-processes/evaporative-crystallizer-balance/EvaporativeCrystallizerBalanceCalculator'
import { ExtractionDistributionSelectivityCalculator } from '../../features/separation-processes/extraction-distribution-selectivity/ExtractionDistributionSelectivityCalculator'
import { ExtractionSolventRequirementCalculator } from '../../features/separation-processes/extraction-solvent-requirement/ExtractionSolventRequirementCalculator'
import { FenskeUnderwoodGillilandCalculator } from '../../features/separation-processes/fenske-underwood-gilliland-shortcut/FenskeUnderwoodGillilandCalculator'
import { FixedBedAdsorberBreakthroughCalculator } from '../../features/separation-processes/fixed-bed-adsorber-breakthrough/FixedBedAdsorberBreakthroughCalculator'
import { GasMembraneAreaRequirementCalculator } from '../../features/separation-processes/gas-membrane-area-requirement/GasMembraneAreaRequirementCalculator'
import { GillilandStageEstimateCalculator } from '../../features/separation-processes/gilliland-stage-estimate/GillilandStageEstimateCalculator'
import { HydrocycloneSeparationNumberCalculator } from '../../features/separation-processes/hydrocyclone-separation-number/HydrocycloneSeparationNumberCalculator'
import { IdealGasMembraneStageCutCalculator } from '../../features/separation-processes/ideal-gas-membrane-stage-cut/IdealGasMembraneStageCutCalculator'
import { KremserAbsorptionCalculator } from '../../features/separation-processes/kremser-absorption-factor-stages/KremserAbsorptionCalculator'
import { KremserAbsorptionStagesCalculator } from '../../features/separation-processes/kremser-absorption-stages/KremserAbsorptionStagesCalculator'
import { KremserStrippingStagesCalculator } from '../../features/separation-processes/kremser-stripping-stages/KremserStrippingStagesCalculator'
import { PackedColumnGasLoadCalculator } from '../../features/separation-processes/packed-column-gas-load-f-factor/PackedColumnGasLoadCalculator'
import { PackedColumnHtuNtuCalculator } from '../../features/separation-processes/packed-column-htu-ntu-height/PackedColumnHtuNtuCalculator'
import { PackedColumnLiquidDistributorCalculator } from '../../features/separation-processes/packed-column-liquid-distributor-irrigation/PackedColumnLiquidDistributorCalculator'
import { PackedColumnLiquidHoldupCalculator } from '../../features/separation-processes/packed-column-liquid-holdup-residence/PackedColumnLiquidHoldupCalculator'
import { PackedColumnPressureDropCalculator } from '../../features/separation-processes/packed-column-pressure-drop-flooding/PackedColumnPressureDropCalculator'
import { PackedColumnRedistributorCalculator } from '../../features/separation-processes/packed-column-redistributor-spacing/PackedColumnRedistributorCalculator'
import { PhaseNineNativeCalculator } from '../../features/native-migrations/phase-nine/PhaseNineNativeCalculator'
import { PhaseThirteenNativeCalculator } from '../../features/native-migrations/phase-thirteen/PhaseThirteenNativeCalculator'
import { PsychrometricAirStreamMixingCalculator } from '../../features/separation-processes/psychrometric-air-stream-mixing/PsychrometricAirStreamMixingCalculator'
import { RelativeHumidityHumidificationCalculator } from '../../features/separation-processes/relative-humidity-humidification/RelativeHumidityHumidificationCalculator'
import { ReverseOsmosisWaterFluxCalculator } from '../../features/separation-processes/reverse-osmosis-water-flux/ReverseOsmosisWaterFluxCalculator'
import { SingleStageGasAbsorptionCalculator } from '../../features/separation-processes/single-stage-gas-absorption/SingleStageGasAbsorptionCalculator'
import { SingleStageLeachingBalanceCalculator } from '../../features/separation-processes/single-stage-leaching-balance/SingleStageLeachingBalanceCalculator'
import { SoudersBrownColumnDiameterCalculator } from '../../features/separation-processes/souders-brown-column-diameter/SoudersBrownColumnDiameterCalculator'
import { StrippingMinimumGasRateCalculator } from '../../features/separation-processes/stripping-minimum-gas-rate/StrippingMinimumGasRateCalculator'
import { TrayDowncomerBackupCalculator } from '../../features/separation-processes/tray-downcomer-backup-residence/TrayDowncomerBackupCalculator'
import { TrayHydraulicsWeepingCalculator } from '../../features/separation-processes/tray-hydraulics-weeping-check/TrayHydraulicsWeepingCalculator'
import { UltrafiltrationResistanceSeriesCalculator } from '../../features/separation-processes/ultrafiltration-resistance-series/UltrafiltrationResistanceSeriesCalculator'

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
"binaryIsothermalFlash": () => {
    const calculatorId = "binaryIsothermalFlash" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryMinimumReflux": () => {
    const calculatorId = "binaryMinimumReflux" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryRelativeVolatilityVLE": () => {
    const calculatorId = "binaryRelativeVolatilityVLE" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"cycloneCutDiameter": () => {
    const calculatorId = "cycloneCutDiameter" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"fenskeMinimumStages": () => {
    const calculatorId = "fenskeMinimumStages" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"absorptionMinimumSolventRate": () => {
    const calculatorId = "absorptionMinimumSolventRate" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"murphreeTrayEfficiency": () => {
    const calculatorId = "murphreeTrayEfficiency" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"packedColumnHTUNTU": () => {
    const calculatorId = "packedColumnHTUNTU" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"psychrometricAirEnthalpy": () => {
    const calculatorId = "psychrometricAirEnthalpy" as const
    return (
      <PhaseThirteenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"raoultBubblePointPressure": () => {
    const calculatorId = "raoultBubblePointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"raoultDewPointPressure": () => {
    const calculatorId = "raoultDewPointPressure" as const
    return (
      <PhaseNineNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"batchSettlingAreaEstimate": () => {
    return <BatchSettlingAreaEstimateCalculator />
  },
"centrifugeSigmaScaleUp": () => {
    return <CentrifugeSigmaScaleUpCalculator />
  },
"constantPressureFilterSizing": () => {
    return <ConstantPressureFilterSizingCalculator />
  },
"coolingCrystallizerYield": () => {
    return <CoolingCrystallizerYieldCalculator />
  },
"evaporativeCrystallizerBalance": () => {
    return <EvaporativeCrystallizerBalanceCalculator />
  },
"dryerThermalDuty": () => {
    return <DryerThermalDutyCalculator />
  },
"binaryDistillationBalance": () => {
    return <BinaryDistillationBalanceCalculator />
  },
"extractionDistributionSelectivity": () => {
    return <ExtractionDistributionSelectivityCalculator />
  },
"extractionSolventRequirement": () => {
    return <ExtractionSolventRequirementCalculator />
  },
"crosscurrentExtractionStages": () => {
    return <CrosscurrentExtractionStagesCalculator />
  },
"countercurrentExtractionStages": () => {
    return <CountercurrentExtractionStagesCalculator />
  },
"gillilandStageEstimate": () => {
    return <GillilandStageEstimateCalculator />
  },
"fenskeUnderwoodGillilandShortcut": () => {
    return <FenskeUnderwoodGillilandCalculator />
  },
"soudersBrownColumnDiameter": () => {
    return <SoudersBrownColumnDiameterCalculator />
  },
"trayHydraulicsWeepingCheck": () => {
    return <TrayHydraulicsWeepingCalculator />
  },
"trayDowncomerBackupResidence": () => {
    return <TrayDowncomerBackupCalculator />
  },
"packedColumnHtuNtuHeight": () => {
    return <PackedColumnHtuNtuCalculator />
  },
"packedColumnPressureDropFlooding": () => {
    return <PackedColumnPressureDropCalculator />
  },
"packedColumnLiquidHoldupResidence": () => {
    return <PackedColumnLiquidHoldupCalculator />
  },
"packedColumnLiquidDistributorIrrigation": () => {
    return <PackedColumnLiquidDistributorCalculator />
  },
"packedColumnGasLoadFFactor": () => {
    return <PackedColumnGasLoadCalculator />
  },
"packedColumnRedistributorSpacing": () => {
    return <PackedColumnRedistributorCalculator />
  },
"kremserAbsorptionFactorStages": () => {
    return <KremserAbsorptionCalculator />
  },
"absorberMinimumSolventRate": () => {
    return <AbsorberMinimumSolventRateCalculator />
  },
"absorptionStrippingFactors": () => {
    return <AbsorptionStrippingFactorsCalculator />
  },
"adsorbentMassRequirement": () => {
    return <AdsorbentMassRequirementCalculator />
  },
"betMonolayerCapacity": () => {
    return <BetMonolayerCapacityCalculator />
  },
"kremserAbsorptionStages": () => {
    return <KremserAbsorptionStagesCalculator />
  },
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

export default function SeparationProcessesCalculatorCategory({
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
