import type {
  ReactNode,
} from 'react'

import { BinaryFlashCalculator } from '../../features/mass-transfer/binary-flash/BinaryFlashCalculator'
import { CentrifugalSettlingCalculator } from '../../features/mass-transfer/centrifugal-settling/CentrifugalSettlingCalculator'
import { ConstantPressureFiltrationCalculator } from '../../features/mass-transfer/constant-pressure-filtration/ConstantPressureFiltrationCalculator'
import { CountercurrentSolidsWashingCalculator } from '../../features/mass-transfer/countercurrent-solids-washing/CountercurrentSolidsWashingCalculator'
import { CrystallizationYieldMotherLiquorCalculator } from '../../features/mass-transfer/crystallization-yield-mother-liquor/CrystallizationYieldMotherLiquorCalculator'
import { DistillationOperatingLinesCalculator } from '../../features/mass-transfer/distillation-operating-lines/DistillationOperatingLinesCalculator'
import { DryingRateTimeCalculator } from '../../features/mass-transfer/drying-rate-time/DryingRateTimeCalculator'
import { FiniteVolumeDialysisCalculator } from '../../features/mass-transfer/finite-volume-dialysis/FiniteVolumeDialysisCalculator'
import { HumidificationPsychrometricsCalculator } from '../../features/mass-transfer/humidification-psychrometrics/HumidificationPsychrometricsCalculator'
import { IonExchangeBedSizingCalculator } from '../../features/mass-transfer/ion-exchange-bed-sizing/IonExchangeBedSizingCalculator'
import { MSMPRCrystallizerDesignCalculator } from '../../features/mass-transfer/msmpr-crystallizer-design/MSMPRCrystallizerDesignCalculator'
import { McCabeThieleMethodCalculator } from '../../features/mass-transfer/mccabe-thiele-method/McCabeThieleMethodCalculator'
import { PackedColumnHydraulicsCalculator } from '../../features/mass-transfer/packed-column-hydraulics/PackedColumnHydraulicsCalculator'
import { PhaseElevenNativeCalculator } from '../../features/native-migrations/phase-eleven/PhaseElevenNativeCalculator'
import { RelativeVolatilityBinaryVLECalculator } from '../../features/mass-transfer/relative-volatility-binary-vle/RelativeVolatilityBinaryVLECalculator'
import { SingleStageLeachingRecoveryCalculator } from '../../features/mass-transfer/single-stage-leaching-recovery/SingleStageLeachingRecoveryCalculator'
import { SingleStageLiquidLiquidExtractionCalculator } from '../../features/mass-transfer/single-stage-liquid-liquid-extraction/SingleStageLiquidLiquidExtractionCalculator'
import { UltrafiltrationConcentrationPolarizationCalculator } from '../../features/mass-transfer/ultrafiltration-concentration-polarization/UltrafiltrationConcentrationPolarizationCalculator'

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
"adsorptionIsotherms": () => {
    const calculatorId = "adsorptionIsotherms" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"batchAdsorptionDesign": () => {
    const calculatorId = "batchAdsorptionDesign" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"betIsotherm": () => {
    const calculatorId = "betIsotherm" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"chiltonColburnAnalogy": () => {
    const calculatorId = "chiltonColburnAnalogy" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"convectiveMassTransferCorrelations": () => {
    const calculatorId = "convectiveMassTransferCorrelations" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"countercurrentLiquidLiquidExtraction": () => {
    const calculatorId = "countercurrentLiquidLiquidExtraction" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"crosscurrentLiquidLiquidExtraction": () => {
    const calculatorId = "crosscurrentLiquidLiquidExtraction" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"diffusionThroughMembrane": () => {
    const calculatorId = "diffusionThroughMembrane" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"distributionCoefficientSelectivity": () => {
    const calculatorId = "distributionCoefficientSelectivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"effectiveDiffusivity": () => {
    const calculatorId = "effectiveDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"equimolarCounterDiffusion": () => {
    const calculatorId = "equimolarCounterDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"ficksFirstLaw": () => {
    const calculatorId = "ficksFirstLaw" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"ficksSecondLaw": () => {
    const calculatorId = "ficksSecondLaw" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"fixedBedAdsorptionBDST": () => {
    const calculatorId = "fixedBedAdsorptionBDST" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"gasAbsorptionStrippingFundamentals": () => {
    const calculatorId = "gasAbsorptionStrippingFundamentals" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"gasPhaseDiffusivity": () => {
    const calculatorId = "gasPhaseDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"interphaseEquilibriumDrivingForces": () => {
    const calculatorId = "interphaseEquilibriumDrivingForces" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"kremserMethod": () => {
    const calculatorId = "kremserMethod" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"liquidPhaseDiffusivity": () => {
    const calculatorId = "liquidPhaseDiffusivity" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"massTransferCoefficient": () => {
    const calculatorId = "massTransferCoefficient" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"dimensionlessMassTransfer": () => {
    const calculatorId = "dimensionlessMassTransfer" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"membraneGasSeparation": () => {
    const calculatorId = "membraneGasSeparation" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"overallMassTransferCoefficient": () => {
    const calculatorId = "overallMassTransferCoefficient" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"packedColumnHTUNTUDesign": () => {
    const calculatorId = "packedColumnHTUNTUDesign" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"reverseOsmosisPerformance": () => {
    const calculatorId = "reverseOsmosisPerformance" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"stagnantFilmDiffusion": () => {
    const calculatorId = "stagnantFilmDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"steadyStateDiffusion": () => {
    const calculatorId = "steadyStateDiffusion" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"twoFilmTheory": () => {
    const calculatorId = "twoFilmTheory" as const
    return (
      <PhaseElevenNativeCalculator
        calculatorId={calculatorId}
      />
    )
  },
"binaryFlashCalculation": () => {
    return <BinaryFlashCalculator />
  },
"centrifugalSettlingTime": () => {
    return <CentrifugalSettlingCalculator />
  },
"constantPressureFiltration": () => {
    return <ConstantPressureFiltrationCalculator />
  },
"countercurrentSolidsWashing": () => {
    return <CountercurrentSolidsWashingCalculator />
  },
"crystallizationYieldMotherLiquor": () => {
    return <CrystallizationYieldMotherLiquorCalculator />
  },
"dryingRateTime": () => {
    return <DryingRateTimeCalculator />
  },
"distillationOperatingLines": () => {
    return <DistillationOperatingLinesCalculator />
  },
"mcCabeThieleMethod": () => {
    return <McCabeThieleMethodCalculator />
  },
"humidificationPsychrometrics": () => {
    return <HumidificationPsychrometricsCalculator />
  },
"ionExchangeBedSizing": () => {
    return <IonExchangeBedSizingCalculator />
  },
"finiteVolumeDialysis": () => {
    return <FiniteVolumeDialysisCalculator />
  },
"msmprCrystallizerDesign": () => {
    return <MSMPRCrystallizerDesignCalculator />
  },
"packedColumnHydraulics": () => {
    return <PackedColumnHydraulicsCalculator />
  },
"relativeVolatilityBinaryVLE": () => {
    return <RelativeVolatilityBinaryVLECalculator />
  },
"singleStageLeachingRecovery": () => {
    return <SingleStageLeachingRecoveryCalculator />
  },
"singleStageLiquidLiquidExtraction": () => {
    return <SingleStageLiquidLiquidExtractionCalculator />
  },
"ultrafiltrationConcentrationPolarization": () => {
    return <UltrafiltrationConcentrationPolarizationCalculator />
  },
}

export default function MassTransferCalculatorCategory({
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
