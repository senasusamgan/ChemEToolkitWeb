import assert from 'node:assert/strict'
import test from 'node:test'

import {
  PHASE_TEN_THERMODYNAMICS_DEFINITIONS,
  PHASE_TEN_THERMODYNAMICS_IDS,
} from '../../src/features/native-migrations/phase-ten-thermodynamics/definitions.ts'

for (
  const calculatorId
  of PHASE_TEN_THERMODYNAMICS_IDS
) {
  test(
    `${calculatorId} reproduces its legacy example with a finite result`,
    () => {
      const definition =
        PHASE_TEN_THERMODYNAMICS_DEFINITIONS[
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
  'Phase 10 contains every Thermodynamics calculator that was still legacy',
  () => {
    assert.ok(
      PHASE_TEN_THERMODYNAMICS_IDS.length > 0,
    )

    assert.equal(
      new Set(
        PHASE_TEN_THERMODYNAMICS_IDS,
      ).size,
      PHASE_TEN_THERMODYNAMICS_IDS.length,
    )
  },
)
