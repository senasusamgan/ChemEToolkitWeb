import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHASE_THIRTEEN_DEFINITIONS,
  PHASE_THIRTEEN_IDS,
} from '../../src/features/native-migrations/phase-thirteen/definitions.ts'

for (
  const calculatorId
  of PHASE_THIRTEEN_IDS
) {
  test(
    `${calculatorId} produces a finite verified example`,
    () => {
      const definition =
        PHASE_THIRTEEN_DEFINITIONS[
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
  'Phase Thirteen contains unique IDs',
  () => {
    assert.equal(
      new Set(
        PHASE_THIRTEEN_IDS,
      ).size,
      PHASE_THIRTEEN_IDS.length,
    )
  },
)
