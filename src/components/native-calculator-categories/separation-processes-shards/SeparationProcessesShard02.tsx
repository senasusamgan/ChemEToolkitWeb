import type {
  ReactNode,
} from 'react'

import { BinaryDistillationBalanceCalculator } from '../../../features/separation-processes/binary-distillation-balance/BinaryDistillationBalanceCalculator'
import { ConstantPressureFilterSizingCalculator } from '../../../features/separation-processes/constant-pressure-filter-sizing/ConstantPressureFilterSizingCalculator'
import { CoolingCrystallizerYieldCalculator } from '../../../features/separation-processes/cooling-crystallizer-yield/CoolingCrystallizerYieldCalculator'
import { CountercurrentExtractionStagesCalculator } from '../../../features/separation-processes/countercurrent-extraction-stages/CountercurrentExtractionStagesCalculator'
import { CrosscurrentExtractionStagesCalculator } from '../../../features/separation-processes/crosscurrent-extraction-stages/CrosscurrentExtractionStagesCalculator'
import { DryerThermalDutyCalculator } from '../../../features/separation-processes/dryer-thermal-duty/DryerThermalDutyCalculator'
import { EvaporativeCrystallizerBalanceCalculator } from '../../../features/separation-processes/evaporative-crystallizer-balance/EvaporativeCrystallizerBalanceCalculator'
import { ExtractionDistributionSelectivityCalculator } from '../../../features/separation-processes/extraction-distribution-selectivity/ExtractionDistributionSelectivityCalculator'
import { ExtractionSolventRequirementCalculator } from '../../../features/separation-processes/extraction-solvent-requirement/ExtractionSolventRequirementCalculator'
import { FenskeUnderwoodGillilandCalculator } from '../../../features/separation-processes/fenske-underwood-gilliland-shortcut/FenskeUnderwoodGillilandCalculator'
import { GillilandStageEstimateCalculator } from '../../../features/separation-processes/gilliland-stage-estimate/GillilandStageEstimateCalculator'
import { SoudersBrownColumnDiameterCalculator } from '../../../features/separation-processes/souders-brown-column-diameter/SoudersBrownColumnDiameterCalculator'
import { TrayHydraulicsWeepingCalculator } from '../../../features/separation-processes/tray-hydraulics-weeping-check/TrayHydraulicsWeepingCalculator'

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
}

export default function SeparationProcessesShard02({
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
