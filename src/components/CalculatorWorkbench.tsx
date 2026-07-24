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

  return (
    <LegacyWorkbench
      calculatorId={calculatorId}
      title={title}
    />
  )
}
