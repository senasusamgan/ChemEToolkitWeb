from pathlib import Path
import re
import json

catalog_source = Path(
    "src/data/calculators.ts"
).read_text()

workbench_path = Path(
    "src/components/CalculatorWorkbench.tsx"
)

workbench_source = workbench_path.read_text()

catalog_pattern = re.compile(
    r'\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}'
)

calculators = [
    {
        "id": match.group(1),
        "title": match.group(2),
        "category": match.group(3),
        "available": match.group(4) == "true",
    }
    for match in catalog_pattern.finditer(
        catalog_source
    )
]

native_ids = set()

for match in re.finditer(
    r'calculatorId\s*===\s*([\'"])([^\'"]+)\1',
    workbench_source,
):
    native_ids.add(
        match.group(2)
    )

for group in re.finditer(
    r'if\s*\(\s*\[([\s\S]*?)\]\s*\.includes\(\s*calculatorId\s*\)\s*\)',
    workbench_source,
):
    for value in re.finditer(
        r'[\'"]([^\'"]+)[\'"]',
        group.group(1),
    ):
        native_ids.add(
            value.group(1)
        )

thermodynamics = [
    calculator
    for calculator in calculators
    if (
        calculator["category"]
        == "Thermodynamics"
        and calculator["available"]
    )
]

legacy = [
    calculator
    for calculator in thermodynamics
    if calculator["id"]
    not in native_ids
]

if not legacy:
    raise SystemExit(
        "✅ Thermodynamics içinde migrate edilecek legacy calculator kalmadı"
    )

assets = sorted(
    Path(
        "public/legacy/assets"
    ).glob("*.js")
)

if not assets:
    raise SystemExit(
        "❌ Legacy JS bundle bulunamadı"
    )

def find_matching_brace(
    source,
    start,
):
    depth = 0
    quote = None
    escaped = False

    for index in range(
        start,
        len(source),
    ):
        char = source[index]

        if escaped:
            escaped = False
            continue

        if char == "\\":
            escaped = True
            continue

        if quote is not None:
            if char == quote:
                quote = None
            continue

        if char in (
            "'",
            '"',
            "`",
        ):
            quote = char
            continue

        if char == "{":
            depth += 1
            continue

        if char == "}":
            depth -= 1

            if depth == 0:
                return index

    return None

def candidates_for_id(
    source,
    calculator_id,
):
    pattern = re.compile(
        r"id\s*:\s*([\'\"`])"
        + re.escape(
            calculator_id
        )
        + r"\1"
    )

    for match in pattern.finditer(
        source
    ):
        marker_index = (
            match.start()
        )

        cursor = marker_index
        starts = []

        while (
            cursor >= 0
            and len(starts) < 20
        ):
            cursor = source.rfind(
                "{",
                0,
                cursor,
            )

            if cursor < 0:
                break

            starts.append(
                cursor
            )

        for start in starts:
            end = find_matching_brace(
                source,
                start,
            )

            if end is None:
                continue

            if not (
                start
                <= marker_index
                <= end
            ):
                continue

            candidate = source[
                start:end + 1
            ]

            if (
                calculator_id
                not in candidate
            ):
                continue

            if len(candidate) > 90000:
                continue

            yield candidate

def score_candidate(
    source,
):
    lower = source.lower()

    score = 0

    weights = {
        "calculate:": 120,
        "fields:": 100,
        "formula:": 90,
        "outputlabel:": 55,
        "outputunit:": 40,
        "interpret:": 35,
        "initial:": 15,
        "unit:": 8,
        "math.": 20,
        "=>": 15,
    }

    for token, weight in (
        weights.items()
    ):
        score += (
            lower.count(token)
            * weight
        )

    if (
        "available:" in lower
        and "calculate:"
        not in lower
    ):
        score -= 500

    if (
        "fields:" not in lower
        or "formula:" not in lower
        or "calculate:" not in lower
    ):
        score -= 1000

    score -= (
        len(source)
        / 10000
    )

    return score

definitions = {}

for calculator in legacy:
    calculator_id = (
        calculator["id"]
    )

    best = None

    for asset in assets:
        source = asset.read_text(
            errors="ignore"
        )

        for candidate in candidates_for_id(
            source,
            calculator_id,
        ):
            score = score_candidate(
                candidate
            )

            if (
                best is None
                or score
                > best["score"]
            ):
                best = {
                    "score": score,
                    "asset": str(
                        asset
                    ),
                    "source": candidate,
                }

    if best is None:
        raise SystemExit(
            f"❌ Legacy source bulunamadı: {calculator_id}"
        )

    for marker in (
        "fields:",
        "formula:",
        "calculate:",
    ):
        if marker not in best["source"]:
            raise SystemExit(
                f"❌ {calculator_id} migration-ready değil; missing {marker}"
            )

    definitions[
        calculator_id
    ] = best

ids = [
    calculator["id"]
    for calculator in legacy
]

union = "\n".join(
    f"  | {json.dumps(calculator_id)}"
    for calculator_id in ids
)

entries = "\n".join(
    "  "
    + json.dumps(
        calculator_id
    )
    + ": "
    + definitions[
        calculator_id
    ]["source"]
    + ","
    for calculator_id in ids
)

id_array = "\n".join(
    "  "
    + json.dumps(
        calculator_id
    )
    + ","
    for calculator_id in ids
)

definitions_ts = f"""export type PhaseTenThermodynamicsCalculatorId =
{union}

export interface PhaseTenFieldDefinition {{
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}}

export interface PhaseTenThermodynamicsDefinition {{
  id: PhaseTenThermodynamicsCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseTenFieldDefinition[]
  formula: string
  outputLabel: string
  outputUnit?: string
  calculate: (
    values: Record<string, number>,
  ) => number
  interpret?: (
    result: number,
  ) => string
  [key: string]: unknown
}}

export const PHASE_TEN_THERMODYNAMICS_IDS = [
{id_array}
] as const satisfies readonly PhaseTenThermodynamicsCalculatorId[]

export const PHASE_TEN_THERMODYNAMICS_DEFINITIONS = {{
{entries}
}} satisfies Record<
  PhaseTenThermodynamicsCalculatorId,
  PhaseTenThermodynamicsDefinition
>
"""

Path(
    "src/features/native-migrations/phase-ten-thermodynamics/definitions.ts"
).write_text(
    definitions_ts
)

component_ts = """import {
  useState,
} from 'react'
import {
  ActionBar,
  NumericInput,
  ReferenceBasis,
  ResultItem,
  ResultPanel,
  formatEngineeringNumber,
} from '../../mass-transfer/shared/NativeCalculatorPrimitives'
import {
  PHASE_TEN_THERMODYNAMICS_DEFINITIONS,
  type PhaseTenThermodynamicsCalculatorId,
} from './definitions'

interface Props {
  calculatorId: PhaseTenThermodynamicsCalculatorId
}

export function PhaseTenThermodynamicsCalculator({
  calculatorId,
}: Props) {
  const definition =
    PHASE_TEN_THERMODYNAMICS_DEFINITIONS[
      calculatorId
    ]

  const createInputs =
    () =>
      Object.fromEntries(
        definition.fields.map(
          (field) => [
            field.key,
            String(
              field.initial ?? '',
            ),
          ],
        ),
      )

  const [
    inputs,
    setInputs,
  ] = useState<
    Record<string, string>
  >(createInputs)

  const [
    result,
    setResult,
  ] = useState<
    number | null
  >(null)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  function calculate() {
    const values =
      Object.fromEntries(
        Object.entries(
          inputs,
        ).map(
          ([
            key,
            value,
          ]) => [
            key,
            Number(value),
          ],
        ),
      )

    if (
      Object.values(
        values,
      ).some(
        (value) =>
          !Number.isFinite(
            value,
          ),
      )
    ) {
      setResult(null)
      setErrorMessage(
        'Enter finite numeric values for every input.',
      )
      return
    }

    try {
      const nextResult =
        definition.calculate(
          values,
        )

      if (
        typeof nextResult !==
          'number'
        || !Number.isFinite(
          nextResult,
        )
      ) {
        throw new Error(
          'Non-finite result',
        )
      }

      setResult(
        nextResult,
      )
      setErrorMessage('')
    } catch {
      setResult(null)
      setErrorMessage(
        'The supplied values are outside the valid range of this thermodynamic relation.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createInputs(),
    )
    setResult(null)
    setErrorMessage('')
  }

  function clearInputs() {
    setInputs(
      Object.fromEntries(
        definition.fields.map(
          (field) => [
            field.key,
            '',
          ],
        ),
      ),
    )
    setResult(null)
    setErrorMessage('')
  }

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          {definition.mark ?? 'T'}
        </div>

        <div>
          <p>
            Thermodynamics
            {definition.code
              ? ` · ${definition.code}`
              : ''}
          </p>

          <h2>
            {definition.title}
          </h2>

          <span>
            Native thermodynamics calculator
          </span>
        </div>
      </header>

      <ReferenceBasis>
        Smith, Van Ness & Abbott · Chemical Engineering Thermodynamics
      </ReferenceBasis>

      <div className="native-formula">
        {definition.formula}
      </div>

      <div className="native-input-grid">
        {definition.fields.map(
          (field) => (
            <NumericInput
              key={field.key}
              label={field.label}
              value={
                inputs[
                  field.key
                ] ?? ''
              }
              unit={
                field.unit ?? '—'
              }
              onChange={(
                value,
              ) =>
                setInputs(
                  (
                    current,
                  ) => ({
                    ...current,
                    [field.key]:
                      value,
                  }),
                )
              }
            />
          ),
        )}
      </div>

      <ActionBar
        onLoadExample={
          loadExample
        }
        onClear={
          clearInputs
        }
        onCalculate={
          calculate
        }
        calculateLabel="Calculate"
      />

      {errorMessage ? (
        <div
          className="native-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {result !== null ? (
        <ResultPanel
          headlineLabel={
            definition.outputLabel
          }
          headlineValue={`${formatEngineeringNumber(
            result,
          )}${
            definition.outputUnit
              ? ` ${definition.outputUnit}`
              : ''
          }`}
          modelName={
            definition.code ??
            calculatorId
          }
          note="The verified legacy numerical relation is preserved in the native workspace."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              definition.interpret
                ? definition.interpret(
                    result,
                  )
                : 'Thermodynamic relation evaluated on the stated basis.'
            }
            unit="—"
          />

          <ResultItem
            label="Reference family"
            value="Smith, Van Ness & Abbott"
            unit="native"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
"""

Path(
    "src/features/native-migrations/phase-ten-thermodynamics/PhaseTenThermodynamicsCalculator.tsx"
).write_text(
    component_ts
)

import_line = (
    "import { PhaseTenThermodynamicsCalculator } "
    "from '../features/native-migrations/phase-ten-thermodynamics/"
    "PhaseTenThermodynamicsCalculator'\n"
)

if import_line not in workbench_source:
    workbench_source = (
        import_line
        + workbench_source
    )

anchor = """}: CalculatorWorkbenchProps) {
"""

if anchor not in workbench_source:
    raise SystemExit(
        "❌ CalculatorWorkbench anchor bulunamadı"
    )

routes = []

for calculator_id in ids:
    routes.append(
        f"""  if (calculatorId === {json.dumps(calculator_id)}) {{
    return (
      <PhaseTenThermodynamicsCalculator
        calculatorId={{calculatorId}}
      />
    )
  }}

"""
    )

workbench_source = (
    workbench_source.replace(
        anchor,
        anchor
        + "".join(routes),
        1,
    )
)

workbench_path.write_text(
    workbench_source
)

test_source = """import assert from 'node:assert/strict'
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
"""

Path(
    "tests/phase-ten-thermodynamics/phase-ten-thermodynamics.test.ts"
).write_text(
    test_source
)

manifest = {
    "category": "Thermodynamics",
    "catalogAvailableCount":
        len(thermodynamics),
    "alreadyNativeBeforePhase10":
        len(thermodynamics)
        - len(legacy),
    "migratedCount":
        len(legacy),
    "calculatorIds":
        ids,
    "sources": {
        calculator_id: {
            "asset":
                definitions[
                    calculator_id
                ]["asset"],
            "score":
                definitions[
                    calculator_id
                ]["score"],
        }
        for calculator_id in ids
    },
}

Path(
    "src/features/native-migrations/phase-ten-thermodynamics/manifest.json"
).write_text(
    json.dumps(
        manifest,
        indent=2,
    )
    + "\n"
)

print(
    "======================================"
)
print(
    "PHASE 10 THERMODYNAMICS DISCOVERY"
)
print(
    "======================================"
)
print(
    f"available Thermodynamics: {len(thermodynamics)}"
)
print(
    f"already native:           {len(thermodynamics) - len(legacy)}"
)
print(
    f"migrated this phase:      {len(legacy)}"
)
print("")

for calculator_id in ids:
    print(
        f"- {calculator_id}"
    )
