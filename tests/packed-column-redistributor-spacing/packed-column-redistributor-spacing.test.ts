import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PackedColumnRedistributorError,
  calculatePackedColumnRedistributorSpacing,
  createPackedColumnRedistributorCsv,
} from '../../src/features/separation-processes/packed-column-redistributor-spacing/engine.ts'

const CALCULATOR_ID =
  'packedColumnRedistributorSpacing'

const input = {
  packedBedHeight: 12,
  columnDiameter: 2,
  maximumSectionHeight: 5,
}

function closeTo(
  actual: number,
  expected: number,
  tolerance = 1e-10,
): void {
  assert.ok(
    Math.abs(
      actual -
      expected,
    ) <= tolerance,
  )
}

test(
  'calculates packed-column section geometry',
  () => {
    assert.equal(
      CALCULATOR_ID,
      'packedColumnRedistributorSpacing',
    )

    const result =
      calculatePackedColumnRedistributorSpacing(
        input,
      )

    closeTo(
      result.columnArea,
      Math.PI,
    )

    closeTo(
      result.totalPackingVolume,
      12 * Math.PI,
    )
  },
)

test(
  'calculates required bed sections and redistributors',
  () => {
    const result =
      calculatePackedColumnRedistributorSpacing(
        input,
      )

    assert.equal(
      result.requiredBedSections,
      3,
    )

    assert.equal(
      result.requiredRedistributorCount,
      2,
    )

    closeTo(
      result.actualSectionHeight,
      4,
    )
  },
)

test(
  'calculates redistributor elevations',
  () => {
    const result =
      calculatePackedColumnRedistributorSpacing(
        input,
      )

    assert.deepEqual(
      result.redistributorElevations,
      [
        4,
        8,
      ],
    )
  },
)

test(
  'requires no redistributor for a short bed',
  () => {
    const result =
      calculatePackedColumnRedistributorSpacing({
        ...input,
        packedBedHeight: 4,
      })

    assert.equal(
      result.requiredBedSections,
      1,
    )

    assert.equal(
      result.requiredRedistributorCount,
      0,
    )

    assert.deepEqual(
      result.redistributorElevations,
      [],
    )
  },
)

test(
  'rejects invalid maximum section height',
  () => {
    assert.throws(
      () =>
        calculatePackedColumnRedistributorSpacing({
          ...input,
          maximumSectionHeight: 0,
        }),
      (
        error: unknown,
      ) =>
        error instanceof
          PackedColumnRedistributorError &&
        error.code ===
          'INVALID_MAXIMUM_SECTION_HEIGHT',
    )
  },
)

test(
  'exports redistributor layout as CSV',
  () => {
    const result =
      calculatePackedColumnRedistributorSpacing(
        input,
      )

    const csv =
      createPackedColumnRedistributorCsv(
        input,
        result,
      )

    assert.match(
      csv,
      /Packed Column Redistributor Spacing & Count/,
    )

    assert.match(
      csv,
      /Required redistributors/,
    )

    assert.match(
      csv,
      /Elevation from bed bottom/,
    )
  },
)
