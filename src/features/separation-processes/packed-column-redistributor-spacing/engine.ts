import type {
  PackedColumnRedistributorInput,
  PackedColumnRedistributorResult,
} from './types.ts'

export const PACKED_COLUMN_REDISTRIBUTOR_ENGINE_VERSION =
  'packed-column-redistributor-spacing-v1'

export type PackedColumnRedistributorErrorCode =
  | 'INVALID_PACKED_BED_HEIGHT'
  | 'INVALID_COLUMN_DIAMETER'
  | 'INVALID_MAXIMUM_SECTION_HEIGHT'

export class PackedColumnRedistributorError
  extends Error {
  readonly code:
    PackedColumnRedistributorErrorCode

  constructor(
    code:
      PackedColumnRedistributorErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'PackedColumnRedistributorError'

    this.code =
      code
  }
}

function requirePositive(
  value: number,
  code:
    PackedColumnRedistributorErrorCode,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new PackedColumnRedistributorError(
      code,
      `${label} must be a positive finite number.`,
    )
  }
}

export function calculatePackedColumnRedistributorSpacing(
  input:
    PackedColumnRedistributorInput,
): PackedColumnRedistributorResult {
  requirePositive(
    input.packedBedHeight,
    'INVALID_PACKED_BED_HEIGHT',
    'Packed bed height',
  )

  requirePositive(
    input.columnDiameter,
    'INVALID_COLUMN_DIAMETER',
    'Column diameter',
  )

  requirePositive(
    input.maximumSectionHeight,
    'INVALID_MAXIMUM_SECTION_HEIGHT',
    'Maximum section height',
  )

  const columnArea =
    Math.PI *
    input.columnDiameter ** 2 /
    4

  const totalPackingVolume =
    columnArea *
    input.packedBedHeight

  const requiredBedSections =
    Math.ceil(
      input.packedBedHeight /
      input.maximumSectionHeight,
    )

  const requiredRedistributorCount =
    Math.max(
      0,
      requiredBedSections - 1,
    )

  const actualSectionHeight =
    input.packedBedHeight /
    requiredBedSections

  const sectionPackingVolume =
    columnArea *
    actualSectionHeight

  const redistributorElevations =
    Array.from(
      {
        length:
          requiredRedistributorCount,
      },
      (
        _,
        index,
      ) =>
        actualSectionHeight *
        (index + 1),
    )

  const sectionHeightUtilization =
    actualSectionHeight /
    input.maximumSectionHeight

  return {
    modelName:
      'Packed Column Redistributor Spacing & Count',
    limitationDescription:
      'This calculator provides geometric screening for packed-bed section height and liquid redistributor count. Actual redistributor spacing depends on packing type, column diameter, liquid and gas loads, maldistribution sensitivity, fouling, support hardware and vendor recommendations.',
    columnArea,
    totalPackingVolume,
    requiredBedSections,
    requiredRedistributorCount,
    actualSectionHeight,
    sectionPackingVolume,
    redistributorElevations,
    sectionHeightUtilization,
  }
}

export function createPackedColumnRedistributorCsv(
  input:
    PackedColumnRedistributorInput,
  result:
    PackedColumnRedistributorResult,
): string {
  const rows = [
    [
      'Packed Column Redistributor Spacing & Count',
    ],
    [],
    [
      'Input',
      'Value',
      'Unit',
    ],
    [
      'Packed bed height',
      input.packedBedHeight,
      'm',
    ],
    [
      'Column diameter',
      input.columnDiameter,
      'm',
    ],
    [
      'Maximum section height',
      input.maximumSectionHeight,
      'm',
    ],
    [],
    [
      'Result',
      'Value',
      'Unit',
    ],
    [
      'Column area',
      result.columnArea,
      'm2',
    ],
    [
      'Total packing volume',
      result.totalPackingVolume,
      'm3',
    ],
    [
      'Required bed sections',
      result.requiredBedSections,
      'sections',
    ],
    [
      'Required redistributors',
      result.requiredRedistributorCount,
      'redistributors',
    ],
    [
      'Actual section height',
      result.actualSectionHeight,
      'm',
    ],
    [
      'Section packing volume',
      result.sectionPackingVolume,
      'm3',
    ],
    [
      'Section height utilization',
      result.sectionHeightUtilization,
      'fraction',
    ],
    [],
    [
      'Redistributor',
      'Elevation from bed bottom (m)',
    ],
  ]

  result.redistributorElevations.forEach(
    (
      elevation,
      index,
    ) => {
      rows.push([
        index + 1,
        elevation,
      ])
    },
  )

  return rows
    .map(
      row =>
        row.join(','),
    )
    .join('\n')
}
