from pathlib import Path
import re
import json

report_path = Path(
    "audit-reports/phase9-top20-legacy-source.md"
)

report = report_path.read_text()

ids = re.findall(
    r"^- ID: `([^`]+)`",
    report,
    re.M,
)

ids = list(
    dict.fromkeys(ids)
)

if len(ids) != 20:
    raise SystemExit(
        f"❌ Expected exactly 20 Phase 9 IDs; found {len(ids)}"
    )

ready_sections = re.findall(
    r"## \d+\.[\s\S]*?"
    r"- ID: `([^`]+)`[\s\S]*?"
    r"- Formula marker: yes[\s\S]*?"
    r"- Calculate marker: yes[\s\S]*?"
    r"- Fields marker: yes",
    report,
)

ready_ids = set(
    ready_sections
)

missing_ready = [
    calculator_id
    for calculator_id in ids
    if calculator_id not in ready_ids
]

if missing_ready:
    raise SystemExit(
        "❌ Migration-ready olmayan calculatorlar: "
        + ", ".join(missing_ready)
    )

assets = sorted(
    Path(
        "public/legacy/assets"
    ).glob("*.js")
)

if not assets:
    raise SystemExit(
        "❌ Legacy JS assets bulunamadı"
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

        cursor = (
            marker_index
        )

        starts = []

        while (
            cursor >= 0
            and len(starts) < 18
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

            if len(candidate) > 80000:
                continue

            yield candidate

def score_candidate(
    source,
):
    lower = (
        source.lower()
    )

    score = 0

    weights = {
        "calculate:": 100,
        "fields:": 80,
        "formula:": 70,
        "outputlabel:": 45,
        "outputunit:": 35,
        "interpret:": 30,
        "initial:": 12,
        "unit:": 8,
        "math.": 18,
        "=>": 14,
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
        score -= 300

    if (
        "fields:" not in lower
        or "calculate:"
        not in lower
        or "formula:"
        not in lower
    ):
        score -= 500

    score -= (
        len(source)
        / 8000
    )

    return score

definitions = {}

for calculator_id in ids:
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
            f"❌ Source object bulunamadı: {calculator_id}"
        )

    source = best[
        "source"
    ]

    required = [
        "fields:",
        "formula:",
        "calculate:",
    ]

    for marker in required:
        if marker not in source:
            raise SystemExit(
                f"❌ {calculator_id} missing {marker}"
            )

    definitions[
        calculator_id
    ] = best

union = "\n".join(
    f"  | {json.dumps(calculator_id)}"
    for calculator_id in ids
)

entries = []

for calculator_id in ids:
    entries.append(
        "  "
        + json.dumps(
            calculator_id
        )
        + ": "
        + definitions[
            calculator_id
        ]["source"]
        + ","
    )

definition_source = f"""export type PhaseNineCalculatorId =
{union}

export interface PhaseNineFieldDefinition {{
  key: string
  label: string
  unit?: string
  initial?: string | number
  [key: string]: unknown
}}

export interface PhaseNineCalculatorDefinition {{
  id: PhaseNineCalculatorId
  code?: string
  category: string
  mark?: string
  title: string
  fields: PhaseNineFieldDefinition[]
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

export const PHASE_NINE_CALCULATOR_IDS = [
{chr(10).join("  " + json.dumps(calculator_id) + "," for calculator_id in ids)}
] as const satisfies readonly PhaseNineCalculatorId[]

export const PHASE_NINE_DEFINITIONS = {{
{chr(10).join(entries)}
}} satisfies Record<
  PhaseNineCalculatorId,
  PhaseNineCalculatorDefinition
>

export function isPhaseNineCalculatorId(
  value: string,
): value is PhaseNineCalculatorId {{
  return (
    PHASE_NINE_CALCULATOR_IDS as readonly string[]
  ).includes(value)
}}
"""

Path(
    "src/features/native-migrations/phase-nine/definitions.ts"
).write_text(
    definition_source
)

manifest = {
    "calculatorIds": ids,
    "sources": {
        calculator_id: {
            "asset": definitions[
                calculator_id
            ]["asset"],
            "score": definitions[
                calculator_id
            ]["score"],
        }
        for calculator_id
        in ids
    },
}

Path(
    "src/features/native-migrations/phase-nine/manifest.json"
).write_text(
    json.dumps(
        manifest,
        indent=2,
    )
    + "\n"
)

component = """import {
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
  PHASE_NINE_DEFINITIONS,
  type PhaseNineCalculatorId,
} from './definitions'

interface PhaseNineNativeCalculatorProps {
  calculatorId: PhaseNineCalculatorId
}

const CATEGORY_REFERENCES: Record<string, string> = {
  'Engineering Fundamentals':
    'Perry’s Chemical Engineers’ Handbook · Engineering fundamentals',
  'Fluid Mechanics':
    'Çengel & Cimbala · Fluid Mechanics',
  'Heat Transfer':
    'Incropera, DeWitt, Bergman & Lavine · Fundamentals of Heat and Mass Transfer',
  'Mass Transfer':
    'Treybal · Mass-Transfer Operations',
  'Material & Energy Balances':
    'Felder, Rousseau & Bullard · Elementary Principles of Chemical Processes',
  'Numerical Methods':
    'Chapra & Canale · Numerical Methods for Engineers',
  'Process Control':
    'Seborg, Edgar, Mellichamp & Doyle · Process Dynamics and Control',
  'Reaction Engineering':
    'Fogler · Elements of Chemical Reaction Engineering',
  'Separation Processes':
    'Wankat · Separation Process Engineering',
  Thermodynamics:
    'Smith, Van Ness & Abbott · Chemical Engineering Thermodynamics',
}

export function PhaseNineNativeCalculator({
  calculatorId,
}: PhaseNineNativeCalculatorProps) {
  const definition =
    PHASE_NINE_DEFINITIONS[
      calculatorId
    ]

  const createInitialInputs =
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
  >(
    createInitialInputs,
  )

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
          'number' ||
        !Number.isFinite(
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
        'The supplied values are outside the valid range of this engineering relation.',
      )
    }
  }

  function loadExample() {
    setInputs(
      createInitialInputs(),
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

  const interpretation =
    result !== null &&
    definition.interpret
      ? definition.interpret(
          result,
        )
      : 'Verified legacy numerical relation migrated to the native workspace.'

  return (
    <section className="native-calculator">
      <header className="native-calculator-header">
        <div
          className="native-icon"
          aria-hidden="true"
        >
          {definition.mark ?? '∑'}
        </div>

        <div>
          <p>
            {definition.category}
            {definition.code
              ? ` · ${definition.code}`
              : ''}
          </p>

          <h2>
            {definition.title}
          </h2>

          <span>
            Native engineering calculator
          </span>
        </div>
      </header>

      <ReferenceBasis>
        {CATEGORY_REFERENCES[
          definition.category
        ] ??
          'ChemE Toolkit verified engineering reference basis'}
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
          note="The numerical relation is preserved directly from the verified legacy calculator definition."
        >
          <ResultItem
            label="Engineering interpretation"
            value={
              interpretation
            }
            unit="—"
          />

          <ResultItem
            label="Migration basis"
            value="Legacy calculation source preserved"
            unit="native"
          />
        </ResultPanel>
      ) : null}
    </section>
  )
}
"""

Path(
    "src/features/native-migrations/phase-nine/PhaseNineNativeCalculator.tsx"
).write_text(
    component
)

workbench_path = Path(
    "src/components/CalculatorWorkbench.tsx"
)

workbench = (
    workbench_path.read_text()
)

import_line = (
    "import { PhaseNineNativeCalculator } "
    "from '../features/native-migrations/phase-nine/"
    "PhaseNineNativeCalculator'\n"
)

if import_line not in workbench:
    workbench = (
        import_line
        + workbench
    )

anchor = """}: CalculatorWorkbenchProps) {
"""

if anchor not in workbench:
    raise SystemExit(
        "❌ CalculatorWorkbench function anchor bulunamadı"
    )

if (
    "<PhaseNineNativeCalculator"
    not in workbench
):
    routes = []

    for calculator_id in ids:
        routes.append(
            f"""  if (calculatorId === {json.dumps(calculator_id)}) {{
    return (
      <PhaseNineNativeCalculator
        calculatorId={{calculatorId}}
      />
    )
  }}

"""
        )

    workbench = workbench.replace(
        anchor,
        anchor
        + "".join(routes),
        1,
    )

workbench_path.write_text(
    workbench
)

test_source = """import assert from 'node:assert/strict'
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
"""

Path(
    "tests/phase-nine-native-expansion/phase-nine-native-expansion.test.ts"
).write_text(
    test_source
)

print(
    "✅ Phase 9 generated calculators: 20"
)

for calculator_id in ids:
    print(
        f"- {calculator_id}"
    )
