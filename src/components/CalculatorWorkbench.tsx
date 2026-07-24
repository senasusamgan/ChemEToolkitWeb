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
import { AbsorptionStrippingFactorsCalculator } from '../features/separation-processes/absorption-stripping-factors/AbsorptionStrippingFactorsCalculator'
import { AdsorbentMassRequirementCalculator } from '../features/separation-processes/adsorbent-mass-requirement/AdsorbentMassRequirementCalculator'
import { BetMonolayerCapacityCalculator } from '../features/separation-processes/bet-monolayer-capacity/BetMonolayerCapacityCalculator'
import { KremserAbsorptionStagesCalculator } from '../features/separation-processes/kremser-absorption-stages/KremserAbsorptionStagesCalculator'
import { KremserStrippingStagesCalculator } from '../features/separation-processes/kremser-stripping-stages/KremserStrippingStagesCalculator'
import { StrippingMinimumGasRateCalculator } from '../features/separation-processes/stripping-minimum-gas-rate/StrippingMinimumGasRateCalculator'
import { GasMembraneAreaRequirementCalculator } from '../features/separation-processes/gas-membrane-area-requirement/GasMembraneAreaRequirementCalculator'
import { IdealGasMembraneStageCutCalculator } from '../features/separation-processes/ideal-gas-membrane-stage-cut/IdealGasMembraneStageCutCalculator'
import { ReverseOsmosisWaterFluxCalculator } from '../features/separation-processes/reverse-osmosis-water-flux/ReverseOsmosisWaterFluxCalculator'
import { UltrafiltrationResistanceSeriesCalculator } from '../features/separation-processes/ultrafiltration-resistance-series/UltrafiltrationResistanceSeriesCalculator'
import { PsychrometricAirStreamMixingCalculator } from '../features/separation-processes/psychrometric-air-stream-mixing/PsychrometricAirStreamMixingCalculator'
import { RelativeHumidityHumidificationCalculator } from '../features/separation-processes/relative-humidity-humidification/RelativeHumidityHumidificationCalculator'
import { CombinedDryerTimeCalculator } from '../features/separation-processes/combined-dryer-time/CombinedDryerTimeCalculator'
import { FixedBedAdsorberBreakthroughCalculator } from '../features/separation-processes/fixed-bed-adsorber-breakthrough/FixedBedAdsorberBreakthroughCalculator'
import { HydrocycloneSeparationNumberCalculator } from '../features/separation-processes/hydrocyclone-separation-number/HydrocycloneSeparationNumberCalculator'
import { SingleStageGasAbsorptionCalculator } from '../features/separation-processes/single-stage-gas-absorption/SingleStageGasAbsorptionCalculator'
import { SingleStageLeachingBalanceCalculator } from '../features/separation-processes/single-stage-leaching-balance/SingleStageLeachingBalanceCalculator'
import { AdamsBashforthMoultonCalculator } from '../features/numerical-methods/adams-bashforth-moulton/AdamsBashforthMoultonCalculator'
import { AdaptiveRungeKutta45Calculator } from '../features/numerical-methods/adaptive-runge-kutta-45/AdaptiveRungeKutta45Calculator'
import { BroydenNonlinearSystemCalculator } from '../features/numerical-methods/broyden-nonlinear-system/BroydenNonlinearSystemCalculator'
import { CholeskyDecompositionSolverCalculator } from '../features/numerical-methods/cholesky-decomposition-solver/CholeskyDecompositionSolverCalculator'
import { ConjugateGradientSolverCalculator } from '../features/numerical-methods/conjugate-gradient-solver/ConjugateGradientSolverCalculator'
import { CoupledODESystemRK4Calculator } from '../features/numerical-methods/coupled-ode-system-rk4/CoupledODESystemRK4Calculator'
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




  if (calculatorId === 'absorptionStrippingFactors') {




    return <AbsorptionStrippingFactorsCalculator />




  }





  if (calculatorId === 'adsorbentMassRequirement') {




    return <AdsorbentMassRequirementCalculator />




  }





  if (calculatorId === 'betMonolayerCapacity') {




    return <BetMonolayerCapacityCalculator />




  }





  if (calculatorId === 'kremserAbsorptionStages') {




    return <KremserAbsorptionStagesCalculator />




  }





  if (calculatorId === 'kremserStrippingStages') {




    return <KremserStrippingStagesCalculator />




  }





  if (calculatorId === 'strippingMinimumGasRate') {




    return <StrippingMinimumGasRateCalculator />




  }





  if (calculatorId === 'gasMembraneAreaRequirement') {





    return <GasMembraneAreaRequirementCalculator />





  }






  if (calculatorId === 'idealGasMembraneStageCut') {





    return <IdealGasMembraneStageCutCalculator />





  }






  if (calculatorId === 'reverseOsmosisWaterFlux') {





    return <ReverseOsmosisWaterFluxCalculator />





  }






  if (calculatorId === 'ultrafiltrationResistanceSeries') {





    return <UltrafiltrationResistanceSeriesCalculator />





  }






  if (calculatorId === 'psychrometricAirStreamMixing') {





    return <PsychrometricAirStreamMixingCalculator />





  }






  if (calculatorId === 'relativeHumidityHumidification') {





    return <RelativeHumidityHumidificationCalculator />





  }






  if (calculatorId === 'combinedDryerTime') {






    return <CombinedDryerTimeCalculator />






  }







  if (calculatorId === 'fixedBedAdsorberBreakthrough') {






    return <FixedBedAdsorberBreakthroughCalculator />






  }







  if (calculatorId === 'hydrocycloneSeparationNumber') {






    return <HydrocycloneSeparationNumberCalculator />






  }







  if (calculatorId === 'singleStageGasAbsorption') {






    return <SingleStageGasAbsorptionCalculator />






  }







  if (calculatorId === 'singleStageLeachingBalance') {






    return <SingleStageLeachingBalanceCalculator />






  }







  if (calculatorId === 'adamsBashforthMoulton') {







    return <AdamsBashforthMoultonCalculator />







  }








  if (calculatorId === 'adaptiveRungeKutta45') {







    return <AdaptiveRungeKutta45Calculator />







  }








  if (calculatorId === 'broydenNonlinearSystem') {







    return <BroydenNonlinearSystemCalculator />







  }








  if (calculatorId === 'choleskyDecompositionSolver') {







    return <CholeskyDecompositionSolverCalculator />







  }








  if (calculatorId === 'conjugateGradientSolver') {







    return <ConjugateGradientSolverCalculator />







  }








  if (calculatorId === 'coupledODESystemRK4') {







    return <CoupledODESystemRK4Calculator />







  }








  return (
    <LegacyWorkbench
      calculatorId={calculatorId}
      title={title}
    />
  )
}
