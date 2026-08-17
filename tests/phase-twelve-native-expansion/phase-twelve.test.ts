import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHASE_TWELVE_DEFINITIONS,
  PHASE_TWELVE_IDS,
} from '../../src/features/native-migrations/phase-twelve/definitions.ts'

for (
  const calculatorId
  of PHASE_TWELVE_IDS
) {
  test(
    `${calculatorId} produces a finite verified example`,
    () => {
      const definition =
        PHASE_TWELVE_DEFINITIONS[
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
        `${calculatorId}: ${result}`,
      )
    },
  )
}

test(
  'Phase Twelve IDs are unique',
  () => {
    assert.equal(
      new Set(
        PHASE_TWELVE_IDS,
      ).size,
      PHASE_TWELVE_IDS.length,
    )
  },
)
