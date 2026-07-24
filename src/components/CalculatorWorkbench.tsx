import { BinaryFlashCalculator } from '../features/mass-transfer/binary-flash/BinaryFlashCalculator'
import { CentrifugalSettlingCalculator } from '../features/mass-transfer/centrifugal-settling/CentrifugalSettlingCalculator'
import { ConstantPressureFiltrationCalculator } from '../features/mass-transfer/constant-pressure-filtration/ConstantPressureFiltrationCalculator'
import { CountercurrentSolidsWashingCalculator } from '../features/mass-transfer/countercurrent-solids-washing/CountercurrentSolidsWashingCalculator'
import { CrystallizationYieldMotherLiquorCalculator } from '../features/mass-transfer/crystallization-yield-mother-liquor/CrystallizationYieldMotherLiquorCalculator'
import { DistillationOperatingLinesCalculator } from '../features/mass-transfer/distillation-operating-lines/DistillationOperatingLinesCalculator'
import { DryingRateTimeCalculator } from '../features/mass-transfer/drying-rate-time/DryingRateTimeCalculator'
import { FiniteVolumeDialysisCalculator } from '../features/mass-transfer/finite-volume-dialysis/FiniteVolumeDialysisCalculator'
import { HumidificationPsychrometricsCalculator } from '../features/mass-transfer/humidification-psychrometrics/HumidificationPsychrometricsCalculator'
import { IonExchangeBedSizingCalculator } from '../features/mass-transfer/ion-exchange-bed-sizing/IonExchangeBedSizingCalculator'
import { McCabeThieleMethodCalculator } from '../features/mass-transfer/mccabe-thiele-method/McCabeThieleMethodCalculator'
import { MSMPRCrystallizerDesignCalculator } from '../features/mass-transfer/msmpr-crystallizer-design/MSMPRCrystallizerDesignCalculator'
import { PackedColumnHydraulicsCalculator } from '../features/mass-transfer/packed-column-hydraulics/PackedColumnHydraulicsCalculator'
import { RelativeVolatilityBinaryVLECalculator } from '../features/mass-transfer/relative-volatility-binary-vle/RelativeVolatilityBinaryVLECalculator'
import { SingleStageLeachingRecoveryCalculator } from '../features/mass-transfer/single-stage-leaching-recovery/SingleStageLeachingRecoveryCalculator'
import { SingleStageLiquidLiquidExtractionCalculator } from '../features/mass-transfer/single-stage-liquid-liquid-extraction/SingleStageLiquidLiquidExtractionCalculator'
import { UltrafiltrationConcentrationPolarizationCalculator } from '../features/mass-transfer/ultrafiltration-concentration-polarization/UltrafiltrationConcentrationPolarizationCalculator'
import { BatchSettlingAreaEstimateCalculator } from '../features/separation-processes/batch-settling-area-estimate/BatchSettlingAreaEstimateCalculator'
import { CentrifugeSigmaScaleUpCalculator } from '../features/separation-processes/centrifuge-sigma-scale-up/CentrifugeSigmaScaleUpCalculator'
import { ConstantPressureFilterSizingCalculator } from '../features/separation-processes/constant-pressure-filter-sizing/ConstantPressureFilterSizingCalculator'
import { CoolingCrystallizerYieldCalculator } from '../features/separation-processes/cooling-crystallizer-yield/CoolingCrystallizerYieldCalculator'
import { EvaporativeCrystallizerBalanceCalculator } from '../features/separation-processes/evaporative-crystallizer-balance/EvaporativeCrystallizerBalanceCalculator'
import { DryerThermalDutyCalculator } from '../features/separation-processes/dryer-thermal-duty/DryerThermalDutyCalculator'
import { BinaryDistillationBalanceCalculator } from '../features/separation-processes/binary-distillation-balance/BinaryDistillationBalanceCalculator'
import { ExtractionDistributionSelectivityCalculator } from '../features/separation-processes/extraction-distribution-selectivity/ExtractionDistributionSelectivityCalculator'
import { ExtractionSolventRequirementCalculator } from '../features/separation-processes/extraction-solvent-requirement/ExtractionSolventRequirementCalculator'
import { CrosscurrentExtractionStagesCalculator } from '../features/separation-processes/crosscurrent-extraction-stages/CrosscurrentExtractionStagesCalculator'
import { CountercurrentExtractionStagesCalculator } from '../features/separation-processes/countercurrent-extraction-stages/CountercurrentExtractionStagesCalculator'
import { GillilandStageEstimateCalculator } from '../features/separation-processes/gilliland-stage-estimate/GillilandStageEstimateCalculator'
import { LegacyWorkbench } from './LegacyWorkbench'

interface CalculatorWorkbenchProps {
  calculatorId: string
  title: string
}

export function CalculatorWorkbench({
  calculatorId,
  title,
}: CalculatorWorkbenchProps) {
  if (calculatorId === 'binaryFlashCalculation') {
    return <BinaryFlashCalculator />
  }

  if (calculatorId === 'centrifugalSettlingTime') {
    return <CentrifugalSettlingCalculator />
  }

  if (calculatorId === 'constantPressureFiltration') {
    return <ConstantPressureFiltrationCalculator />
  }

  if (calculatorId === 'countercurrentSolidsWashing') {
    return <CountercurrentSolidsWashingCalculator />
  }

  if (calculatorId === 'crystallizationYieldMotherLiquor') {
    return <CrystallizationYieldMotherLiquorCalculator />
  }

  if (calculatorId === 'dryingRateTime') {
    return <DryingRateTimeCalculator />
  }

  if (calculatorId === 'distillationOperatingLines') {
    return <DistillationOperatingLinesCalculator />
  }

  if (calculatorId === 'mcCabeThieleMethod') {
    return <McCabeThieleMethodCalculator />
  }

  if (calculatorId === 'humidificationPsychrometrics') {
    return <HumidificationPsychrometricsCalculator />
  }

  if (calculatorId === 'ionExchangeBedSizing') {
    return <IonExchangeBedSizingCalculator />
  }

  if (calculatorId === 'finiteVolumeDialysis') {
    return <FiniteVolumeDialysisCalculator />
  }

  if (calculatorId === 'msmprCrystallizerDesign') {
    return <MSMPRCrystallizerDesignCalculator />
  }

  if (calculatorId === 'packedColumnHydraulics') {
    return <PackedColumnHydraulicsCalculator />
  }

  if (calculatorId === 'relativeVolatilityBinaryVLE') {
    return <RelativeVolatilityBinaryVLECalculator />
  }

  if (calculatorId === 'singleStageLeachingRecovery') {

    return <SingleStageLeachingRecoveryCalculator />

  }


  if (calculatorId === 'singleStageLiquidLiquidExtraction') {

    return <SingleStageLiquidLiquidExtractionCalculator />

  }


  if (calculatorId === 'ultrafiltrationConcentrationPolarization') {

    return <UltrafiltrationConcentrationPolarizationCalculator />

  }


  if (calculatorId === 'batchSettlingAreaEstimate') {


    return <BatchSettlingAreaEstimateCalculator />


  }



  if (calculatorId === 'centrifugeSigmaScaleUp') {


    return <CentrifugeSigmaScaleUpCalculator />


  }



  if (calculatorId === 'constantPressureFilterSizing') {


    return <ConstantPressureFilterSizingCalculator />


  }



  if (calculatorId === 'coolingCrystallizerYield') {


    return <CoolingCrystallizerYieldCalculator />


  }



  if (calculatorId === 'evaporativeCrystallizerBalance') {


    return <EvaporativeCrystallizerBalanceCalculator />


  }



  if (calculatorId === 'dryerThermalDuty') {


    return <DryerThermalDutyCalculator />


  }



  if (calculatorId === 'binaryDistillationBalance') {



    return <BinaryDistillationBalanceCalculator />



  }




  if (calculatorId === 'extractionDistributionSelectivity') {



    return <ExtractionDistributionSelectivityCalculator />



  }




  if (calculatorId === 'extractionSolventRequirement') {



    return <ExtractionSolventRequirementCalculator />



  }




  if (calculatorId === 'crosscurrentExtractionStages') {



    return <CrosscurrentExtractionStagesCalculator />



  }




  if (calculatorId === 'countercurrentExtractionStages') {



    return <CountercurrentExtractionStagesCalculator />



  }




  if (calculatorId === 'gillilandStageEstimate') {



    return <GillilandStageEstimateCalculator />



  }




  return (
    <LegacyWorkbench
      calculatorId={calculatorId}
      title={title}
    />
  )
}
