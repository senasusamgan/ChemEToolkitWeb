import type {
  ReactNode,
} from 'react'

import { AbsorberMinimumSolventRateCalculator } from '../../../features/separation-processes/absorber-minimum-solvent-rate/AbsorberMinimumSolventRateCalculator'
import { AbsorptionStrippingFactorsCalculator } from '../../../features/separation-processes/absorption-stripping-factors/AbsorptionStrippingFactorsCalculator'
import { AdsorbentMassRequirementCalculator } from '../../../features/separation-processes/adsorbent-mass-requirement/AdsorbentMassRequirementCalculator'
import { BetMonolayerCapacityCalculator } from '../../../features/separation-processes/bet-monolayer-capacity/BetMonolayerCapacityCalculator'
import { KremserAbsorptionCalculator } from '../../../features/separation-processes/kremser-absorption-factor-stages/KremserAbsorptionCalculator'
import { KremserAbsorptionStagesCalculator } from '../../../features/separation-processes/kremser-absorption-stages/KremserAbsorptionStagesCalculator'
import { PackedColumnGasLoadCalculator } from '../../../features/separation-processes/packed-column-gas-load-f-factor/PackedColumnGasLoadCalculator'
import { PackedColumnHtuNtuCalculator } from '../../../features/separation-processes/packed-column-htu-ntu-height/PackedColumnHtuNtuCalculator'
import { PackedColumnLiquidDistributorCalculator } from '../../../features/separation-processes/packed-column-liquid-distributor-irrigation/PackedColumnLiquidDistributorCalculator'
import { PackedColumnLiquidHoldupCalculator } from '../../../features/separation-processes/packed-column-liquid-holdup-residence/PackedColumnLiquidHoldupCalculator'
import { PackedColumnPressureDropCalculator } from '../../../features/separation-processes/packed-column-pressure-drop-flooding/PackedColumnPressureDropCalculator'
import { PackedColumnRedistributorCalculator } from '../../../features/separation-processes/packed-column-redistributor-spacing/PackedColumnRedistributorCalculator'
import { TrayDowncomerBackupCalculator } from '../../../features/separation-processes/tray-downcomer-backup-residence/TrayDowncomerBackupCalculator'

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
}

export default function SeparationProcessesShard03({
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
