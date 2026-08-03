import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'

import {
  dirname,
  join,
  relative,
} from 'node:path'

const CATALOG_PATH =
  'src/data/calculators.ts'

const WORKBENCH_PATH =
  'src/components/CalculatorWorkbench.tsx'

const PACKAGE_PATH =
  'package.json'

const EXPECTED_CALCULATOR_COUNT = 383

const COVERAGE_BASELINE_PATH =
  'scripts/calculator-test-coverage-baseline-v1.json'

const WRITE_BASELINE =
  process.argv.includes(
    '--write-baseline',
  )

const TEST_FILE_PATTERN =
  /\.(?:test|spec)\.(?:ts|tsx|js|jsx|mjs|cjs)$/

const excludedDirectories =
  new Set([
    '.git',
    'node_modules',
    'dist',
    'public',
    'audit-reports',
    'manual-backups',
  ])

const errors = []
const warnings = []

function addError(message) {
  errors.push(message)
}

function addWarning(message) {
  warnings.push(message)
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function unique(values) {
  return [
    ...new Set(values),
  ]
}

function collectFiles(directory) {
  if (!existsSync(directory)) {
    return []
  }

  const results = []

  for (
    const entry
    of readdirSync(
      directory,
      {
        withFileTypes: true,
      },
    )
  ) {
    if (
      entry.isDirectory() &&
      excludedDirectories.has(
        entry.name,
      )
    ) {
      continue
    }

    const path =
      join(
        directory,
        entry.name,
      )

    if (entry.isDirectory()) {
      results.push(
        ...collectFiles(path),
      )
      continue
    }

    if (entry.isFile()) {
      results.push(path)
    }
  }

  return results
}

const catalogSource =
  readFileSync(
    CATALOG_PATH,
    'utf8',
  )

const workbenchSource =
  readFileSync(
    WORKBENCH_PATH,
    'utf8',
  )

const packageJson =
  JSON.parse(
    readFileSync(
      PACKAGE_PATH,
      'utf8',
    ),
  )

const catalogPattern =
  /\{\s*id:\s*"([^"]+)"\s*,\s*title:\s*"([^"]+)"\s*,\s*category:\s*"([^"]+)"\s*,\s*available:\s*(true|false)\s*\}/g

const calculators = [
  ...catalogSource.matchAll(
    catalogPattern,
  ),
].map((match) => ({
  id: match[1],
  title: match[2],
  category: match[3],
  available:
    match[4] === 'true',
}))

if (
  calculators.length !==
  EXPECTED_CALCULATOR_COUNT
) {
  addError(
    `Expected ${EXPECTED_CALCULATOR_COUNT} calculators, found ${calculators.length}.`,
  )
}

const calculatorIdSet =
  new Set(
    calculators.map(
      (calculator) =>
        calculator.id,
    ),
  )

const nativeRouteIds = []

const directNativePattern =
  /calculatorId\s*===\s*(['"])([^'"]+)\1/g

for (
  const match
  of workbenchSource.matchAll(
    directNativePattern,
  )
) {
  nativeRouteIds.push(
    match[2],
  )
}

const groupedNativePattern =
  /if\s*\(\s*\[([\s\S]*?)\]\s*\.includes\(\s*calculatorId\s*\)\s*\)/g

for (
  const groupMatch
  of workbenchSource.matchAll(
    groupedNativePattern,
  )
) {
  const valuePattern =
    /['"]([^'"]+)['"]/g

  for (
    const valueMatch
    of groupMatch[1].matchAll(
      valuePattern,
    )
  ) {
    nativeRouteIds.push(
      valueMatch[1],
    )
  }
}

const uniqueNativeRouteIds =
  unique(
    nativeRouteIds,
  )

const nativeRouteIdSet =
  new Set(
    uniqueNativeRouteIds,
  )

for (
  const routeId
  of uniqueNativeRouteIds
) {
  if (
    !calculatorIdSet.has(
      routeId,
    )
  ) {
    addError(
      `Native route "${routeId}" is not present in the calculator catalog.`,
    )
  }
}

const testFiles =
  unique([
    ...collectFiles('tests'),
    ...collectFiles('src'),
  ])
    .filter((path) =>
      TEST_FILE_PATTERN.test(path),
    )
    .sort()

if (testFiles.length === 0) {
  addError(
    'No test files were discovered.',
  )
}

const testRecords =
  testFiles.map((path) => {
    const source =
      readFileSync(
        path,
        'utf8',
      )

    return {
      path,
      pathKey:
        normalize(path),
      source,
      sourceKey:
        normalize(source),
    }
  })

const importPathsByComponent =
  new Map()

const importPattern =
  /import\s*\{\s*([A-Za-z0-9_]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g

for (
  const match
  of workbenchSource.matchAll(
    importPattern,
  )
) {
  importPathsByComponent.set(
    match[1],
    match[2],
  )
}

const featureKeysByCalculator =
  new Map()

function addFeatureKey(
  calculatorId,
  value,
) {
  const key =
    normalize(value)

  if (key.length < 5) {
    return
  }

  const current =
    featureKeysByCalculator.get(
      calculatorId,
    ) ?? []

  current.push(key)

  featureKeysByCalculator.set(
    calculatorId,
    unique(current),
  )
}

for (
  const calculator
  of calculators
) {
  const quotedIdPattern =
    new RegExp(
      `calculatorId\\s*===\\s*(['"])${calculator.id}\\1`,
    )

  const directMatch =
    quotedIdPattern.exec(
      workbenchSource,
    )

  if (!directMatch) {
    continue
  }

  const start =
    directMatch.index

  const followingSource =
    workbenchSource.slice(
      start,
      start + 2500,
    )

  const nextBranchIndex =
    followingSource
      .slice(20)
      .search(
        /\n\s*if\s*\(/,
      )

  const branchSource =
    nextBranchIndex >= 0
      ? followingSource.slice(
          0,
          nextBranchIndex + 20,
        )
      : followingSource

  const componentMatch =
    branchSource.match(
      /<([A-Za-z0-9_]+Calculator)\b/,
    )

  if (!componentMatch) {
    continue
  }

  const importPath =
    importPathsByComponent.get(
      componentMatch[1],
    )

  if (!importPath) {
    continue
  }

  const featureDirectory =
    dirname(importPath)

  const directoryName =
    featureDirectory
      .split('/')
      .at(-1)

  if (directoryName) {
    addFeatureKey(
      calculator.id,
      directoryName,
    )
  }
}

function hasDirectTestSignal(
  calculator,
) {
  const idKey =
    normalize(
      calculator.id,
    )

  const titleKey =
    normalize(
      calculator.title,
    )

  const featureKeys =
    featureKeysByCalculator.get(
      calculator.id,
    ) ?? []

  const quotedIdPatterns = [
    `'${calculator.id}'`,
    `"${calculator.id}"`,
    `\`${calculator.id}\``,
  ]

  return testRecords.some(
    (test) => {
      if (
        quotedIdPatterns.some(
          (value) =>
            test.source.includes(
              value,
            ),
        )
      ) {
        return true
      }

      if (
        idKey.length >= 6 &&
        test.pathKey.includes(
          idKey,
        )
      ) {
        return true
      }

      if (
        titleKey.length >= 8 &&
        test.pathKey.includes(
          titleKey,
        )
      ) {
        return true
      }

      return featureKeys.some(
        (featureKey) =>
          test.pathKey.includes(
            featureKey,
          ),
      )
    },
  )
}

const coverageRows =
  calculators.map(
    (calculator) => ({
      ...calculator,
      routeType:
        nativeRouteIdSet.has(
          calculator.id,
        )
          ? 'native'
          : 'legacy',
      hasDirectTest:
        hasDirectTestSignal(
          calculator,
        ),
    }),
  )

const directlyTested =
  coverageRows.filter(
    (row) =>
      row.hasDirectTest,
  )

const withoutDirectTest =
  coverageRows.filter(
    (row) =>
      !row.hasDirectTest,
  )

const nativeRows =
  coverageRows.filter(
    (row) =>
      row.routeType === 'native',
  )

const legacyRows =
  coverageRows.filter(
    (row) =>
      row.routeType === 'legacy',
  )

const nativeWithoutDirectTest =
  nativeRows.filter(
    (row) =>
      !row.hasDirectTest,
  )

const legacyWithoutDirectTest =
  legacyRows.filter(
    (row) =>
      !row.hasDirectTest,
  )

const unmatchedTestFiles =
  testRecords.filter(
    (test) =>
      !calculators.some(
        (calculator) => {
          const idKey =
            normalize(
              calculator.id,
            )

          const titleKey =
            normalize(
              calculator.title,
            )

          const featureKeys =
            featureKeysByCalculator.get(
              calculator.id,
            ) ?? []

          return (
            test.source.includes(
              `'${calculator.id}'`,
            ) ||
            test.source.includes(
              `"${calculator.id}"`,
            ) ||
            (
              idKey.length >= 6 &&
              test.pathKey.includes(
                idKey,
              )
            ) ||
            (
              titleKey.length >= 8 &&
              test.pathKey.includes(
                titleKey,
              )
            ) ||
            featureKeys.some(
              (featureKey) =>
                test.pathKey.includes(
                  featureKey,
                ),
            )
          )
        },
      ),
  )

const testScripts =
  Object.entries(
    packageJson.scripts ?? {},
  ).filter(
    ([name]) =>
      name.startsWith(
        'test:',
      ),
  )

if (testScripts.length === 0) {
  addError(
    'No package.json test scripts were found.',
  )
}

for (
  const [
    scriptName,
    command,
  ] of testScripts
) {
  if (
    typeof command !==
    'string'
  ) {
    addError(
      `${scriptName} is not a string command.`,
    )
    continue
  }

  const pathMatches = [
    ...command.matchAll(
      /(?:^|\s)((?:src|tests)\/[^\s'"]+)/g,
    ),
  ]

  if (
    pathMatches.length === 0
  ) {
    addWarning(
      `${scriptName} does not contain a recognizable src/ or tests/ path.`,
    )
    continue
  }

  for (
    const pathMatch
    of pathMatches
  ) {
    const rawPath =
      pathMatch[1]

    const wildcardIndex =
      rawPath.search(
        /[*?[{]/,
      )

    const stablePath =
      wildcardIndex >= 0
        ? rawPath.slice(
            0,
            wildcardIndex,
          )
        : rawPath

    const checkPath =
      stablePath.endsWith('/')
        ? stablePath.slice(
            0,
            -1,
          )
        : stablePath

    if (
      checkPath.length === 0 ||
      !existsSync(
        checkPath,
      )
    ) {
      addError(
        `${scriptName} references a missing path: ${rawPath}`,
      )
    }
  }
}

if (
  directlyTested.length === 0
) {
  addError(
    'No calculator-to-test coverage signals were detected.',
  )
}

if (
  withoutDirectTest.length > 0
) {
  addWarning(
    `${withoutDirectTest.length} calculators have no direct test signal.`,
  )
}

const categories =
  unique(
    calculators.map(
      (calculator) =>
        calculator.category,
    ),
  )

const currentGapIds =
  withoutDirectTest
    .map(
      (row) =>
        row.id,
    )
    .sort()

let baselineGapIds = []
let newGapIds = []
let resolvedGapIds = []

if (!WRITE_BASELINE) {
  if (
    !existsSync(
      COVERAGE_BASELINE_PATH,
    )
  ) {
    addError(
      `Coverage baseline file is missing: ${COVERAGE_BASELINE_PATH}`,
    )
  } else {
    try {
      const baseline =
        JSON.parse(
          readFileSync(
            COVERAGE_BASELINE_PATH,
            'utf8',
          ),
        )

      if (
        baseline.schemaVersion !== 1
      ) {
        addError(
          'Coverage baseline schemaVersion must be 1.',
        )
      }

      if (
        baseline.catalogCalculatorCount !==
        calculators.length
      ) {
        addError(
          `Coverage baseline catalog count is ${baseline.catalogCalculatorCount}; current catalog count is ${calculators.length}.`,
        )
      }

      if (
        !Array.isArray(
          baseline.calculatorIdsWithoutDirectTestSignal,
        )
      ) {
        addError(
          'Coverage baseline calculator ID list is invalid.',
        )
      } else {
        baselineGapIds =
          unique(
            baseline
              .calculatorIdsWithoutDirectTestSignal
              .filter(
                (value) =>
                  typeof value ===
                  'string',
              ),
          ).sort()

        if (
          baselineGapIds.length !==
          baseline
            .calculatorIdsWithoutDirectTestSignal
            .length
        ) {
          addError(
            'Coverage baseline contains duplicate or invalid calculator IDs.',
          )
        }

        if (
          baseline.withoutDirectTestSignal !==
          baselineGapIds.length
        ) {
          addError(
            `Coverage baseline declares ${baseline.withoutDirectTestSignal} gaps but contains ${baselineGapIds.length} IDs.`,
          )
        }

        const unknownBaselineIds =
          baselineGapIds.filter(
            (calculatorId) =>
              !calculatorIdSet.has(
                calculatorId,
              ),
          )

        for (
          const calculatorId
          of unknownBaselineIds
        ) {
          addError(
            `Coverage baseline contains unknown calculator ID "${calculatorId}".`,
          )
        }

        const baselineGapIdSet =
          new Set(
            baselineGapIds,
          )

        const currentGapIdSet =
          new Set(
            currentGapIds,
          )

        newGapIds =
          currentGapIds.filter(
            (calculatorId) =>
              !baselineGapIdSet.has(
                calculatorId,
              ),
          )

        resolvedGapIds =
          baselineGapIds.filter(
            (calculatorId) =>
              !currentGapIdSet.has(
                calculatorId,
              ),
          )

        for (
          const calculatorId
          of newGapIds
        ) {
          addError(
            `New calculator test coverage gap detected: "${calculatorId}".`,
          )
        }
      }
    } catch (error) {
      addError(
        `Coverage baseline could not be read: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

if (errors.length > 0) {
  console.error(
    'CALCULATOR TEST COVERAGE AUDIT FAILED',
  )

  for (
    const [
      index,
      error,
    ] of errors.entries()
  ) {
    console.error(
      `${index + 1}. ${error}`,
    )
  }

  process.exit(1)
}

if (WRITE_BASELINE) {
  const baseline = {
    schemaVersion: 1,
    catalogCalculatorCount:
      calculators.length,
    directTestSignals:
      directlyTested.length,
    withoutDirectTestSignal:
      currentGapIds.length,
    calculatorIdsWithoutDirectTestSignal:
      currentGapIds,
  }

  writeFileSync(
    COVERAGE_BASELINE_PATH,
    `${JSON.stringify(
      baseline,
      null,
      2,
    )}\n`,
  )

  console.log(
    'CALCULATOR TEST COVERAGE BASELINE WRITTEN',
  )

  console.log(
    `Catalog calculators: ${calculators.length}`,
  )

  console.log(
    `Direct test signals: ${directlyTested.length}`,
  )

  console.log(
    `Baseline coverage gaps: ${currentGapIds.length}`,
  )

  console.log(
    `Baseline file: ${COVERAGE_BASELINE_PATH}`,
  )

  process.exit(0)
}

console.log(
  'CALCULATOR TEST COVERAGE AUDIT PASSED',
)

console.log(
  `Catalog calculators: ${calculators.length}`,
)

console.log(
  `Discovered test files: ${testFiles.length}`,
)

console.log(
  `Package test scripts: ${testScripts.length}`,
)

console.log(
  `Native calculators: ${nativeRows.length}`,
)

console.log(
  `Legacy calculators: ${legacyRows.length}`,
)

console.log(
  `Direct test signals: ${directlyTested.length}`,
)

console.log(
  `Without direct test signal: ${withoutDirectTest.length}`,
)

console.log(
  `Native without direct test signal: ${nativeWithoutDirectTest.length}`,
)

console.log(
  `Legacy without direct test signal: ${legacyWithoutDirectTest.length}`,
)

console.log(
  `Unmatched test files: ${unmatchedTestFiles.length}`,
)

console.log(
  `Coverage baseline gaps: ${baselineGapIds.length}`,
)

console.log(
  `New gaps since baseline: ${newGapIds.length}`,
)

console.log(
  `Resolved gaps since baseline: ${resolvedGapIds.length}`,
)

console.log(
  '',
)

console.log(
  'Coverage by category:',
)

for (
  const category
  of categories
) {
  const categoryRows =
    coverageRows.filter(
      (row) =>
        row.category === category,
    )

  const tested =
    categoryRows.filter(
      (row) =>
        row.hasDirectTest,
    ).length

  const native =
    categoryRows.filter(
      (row) =>
        row.routeType === 'native',
    ).length

  const legacy =
    categoryRows.length -
    native

  console.log(
    `- ${category}: ${tested}/${categoryRows.length} direct signals; ${native} native; ${legacy} legacy`,
  )
}

if (
  withoutDirectTest.length > 0
) {
  console.log(
    '',
  )

  console.log(
    'First calculators without a direct test signal:',
  )

  for (
    const row
    of withoutDirectTest.slice(
      0,
      30,
    )
  ) {
    console.log(
      `- ${row.id} | ${row.category} | ${row.routeType}`,
    )
  }

  if (
    withoutDirectTest.length > 30
  ) {
    console.log(
      `- ... and ${withoutDirectTest.length - 30} more`,
    )
  }
}

if (
  unmatchedTestFiles.length > 0
) {
  console.log(
    '',
  )

  console.log(
    'First unmatched test files:',
  )

  for (
    const test
    of unmatchedTestFiles.slice(
      0,
      20,
    )
  ) {
    console.log(
      `- ${relative('.', test.path)}`,
    )
  }

  if (
    unmatchedTestFiles.length > 20
  ) {
    console.log(
      `- ... and ${unmatchedTestFiles.length - 20} more`,
    )
  }
}

if (
  warnings.length > 0
) {
  console.log(
    '',
  )

  console.log(
    'Audit warnings:',
  )

  for (
    const warning
    of warnings
  ) {
    console.log(
      `- ${warning}`,
    )
  }
}

console.log(
  '',
)

console.log(
  'Coverage gaps are informational and do not block the release gate.',
)
