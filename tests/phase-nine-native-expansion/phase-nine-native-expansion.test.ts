import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHASE_NINE_CALCULATOR_IDS,
  PHASE_NINE_DEFINITIONS,
} from '../../src/features/native-migrations/phase-nine/definitions.ts'

for (
  const calculatorId
  of PHASE_NINE_CALCULATOR_IDS
) {
  test(
    `${calculatorId} produces a finite result from its verified legacy example`,
    () => {
      const definition =
        PHASE_NINE_DEFINITIONS[
          calculatorId
        ]

      const values =
        Object.fromEntries(
          definition.fields.map(
            (field) => [
              field.key,
              Number(
                field.initial,
              ),
            ],
          ),
        )

      for (
        const value
        of Object.values(
          values,
        )
      ) {
        assert.ok(
          Number.isFinite(
            value,
          ),
        )
      }

      const result =
        definition.calculate(
          values,
        )

      assert.equal(
        typeof result,
        'number',
      )

      assert.ok(
        Number.isFinite(
          result,
        ),
        `${calculatorId} returned ${result}`,
      )
    },
  )
}

test(
  'Phase 9 migration contains exactly twenty calculators',
  () => {
    assert.equal(
      PHASE_NINE_CALCULATOR_IDS.length,
      20,
    )

    assert.equal(
      new Set(
        PHASE_NINE_CALCULATOR_IDS,
      ).size,
      20,
    )
  },
)
