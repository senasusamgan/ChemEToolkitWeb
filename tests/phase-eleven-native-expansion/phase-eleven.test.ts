import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHASE_ELEVEN_DEFINITIONS,
  PHASE_ELEVEN_IDS,
} from '../../src/features/native-migrations/phase-eleven/definitions.ts'

for (
  const calculatorId
  of PHASE_ELEVEN_IDS
) {
  test(
    `${calculatorId} produces a finite verified example`,
    () => {
      const definition =
        PHASE_ELEVEN_DEFINITIONS[
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
  'Phase Eleven contains unique calculator IDs',
  () => {
    assert.equal(
      new Set(
        PHASE_ELEVEN_IDS,
      ).size,
      PHASE_ELEVEN_IDS.length,
    )
  },
)
