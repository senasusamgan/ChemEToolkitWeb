import fs from 'node:fs'
import path from 'node:path'

export const
  PERFORMANCE_GATE_VERSION =
    'problem-solver-performance-gate-v10'

const root =
  process.cwd()

const paths = {
  app:
    path.join(
      root,
      'src/App.tsx',
    ),
  appStyles:
    path.join(
      root,
      'src/App.css',
    ),
  homepage:
    path.join(
      root,
      'src/components/HomepageProblemSolverPanel.tsx',
    ),
  advancedTools:
    path.join(
      root,
      'src/components/SolverAdvancedTools.tsx',
    ),
  resultTools:
    path.join(
      root,
      'src/components/SolverResultTools.tsx',
    ),
  workerClient:
    path.join(
      root,
      'src/features/problem-solver/problemSolverWorkerClient.ts',
    ),
  workerHook:
    path.join(
      root,
      'src/features/problem-solver/useProblemSolverWorker.ts',
    ),
  engine:
    path.join(
      root,
      'src/features/problem-solver/problemSolverEngine.ts',
    ),
  manifest:
    path.join(
      root,
      'dist/.vite/manifest.json',
    ),
  assets:
    path.join(
      root,
      'dist/assets',
    ),
}

const failures = []

function fail(
  message,
) {
  failures.push(
    message,
  )
}

function readRequiredFile(
  filePath,
  label,
) {
  if (
    !fs.existsSync(
      filePath,
    )
  ) {
    fail(
      `${label} is missing: ${filePath}`,
    )

    return ''
  }

  return fs.readFileSync(
    filePath,
    'utf8',
  )
}

function requireMarker(
  content,
  marker,
  label,
) {
  if (
    !content.includes(
      marker,
    )
  ) {
    fail(
      `${label} is missing: ${marker}`,
    )
  }
}

function forbidMarker(
  content,
  marker,
  label,
) {
  if (
    content.includes(
      marker,
    )
  ) {
    fail(
      `${label} is forbidden: ${marker}`,
    )
  }
}

function formatBytes(
  bytes,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(1)} KB`
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(2)} MB`
}

const app =
  readRequiredFile(
    paths.app,
    'App source',
  )

const appStyles =
  readRequiredFile(
    paths.appStyles,
    'App styles',
  )

const homepage =
  readRequiredFile(
    paths.homepage,
    'Homepage Solver source',
  )

const advancedTools =
  readRequiredFile(
    paths.advancedTools,
    'Advanced Tool source',
  )

const resultTools =
  readRequiredFile(
    paths.resultTools,
    'Result Tool source',
  )

const workerClient =
  readRequiredFile(
    paths.workerClient,
    'Worker client source',
  )

const workerHook =
  readRequiredFile(
    paths.workerHook,
    'Worker hook source',
  )

const engine =
  readRequiredFile(
    paths.engine,
    'Problem Solver engine source',
  )

requireMarker(
  app,
  'const HomepageProblemSolverPanel =',
  'Whole-Solver lazy declaration',
)

requireMarker(
  app,
  "import(\n      './components/HomepageProblemSolverPanel'",
  'Whole-Solver dynamic import',
)

requireMarker(
  app,
  'shouldLoadProblemSolver',
  'Solver loading boundary',
)

requireMarker(
  app,
  'problemSolverSectionRef',
  'Solver viewport observer',
)

requireMarker(
  app,
  'problem-solver-lazy-shell',
  'Solver lazy shell',
)

requireMarker(
  appStyles,
  'content-visibility: auto',
  'Solver offscreen content visibility',
)

requireMarker(
  appStyles,
  'contain-intrinsic-size:',
  'Solver intrinsic layout containment',
)

forbidMarker(
  app,
  "import { HomepageProblemSolverPanel } from './components/HomepageProblemSolverPanel'",
  'Static Solver import',
)

requireMarker(
  homepage,
  'PROBLEM_SOLVER_PRIMARY_MATCH_LIMIT',
  'Single-result request limit',
)

requireMarker(
  homepage,
  'PROBLEM_SOLVER_COMPARISON_MATCH_LIMIT',
  'Comparison-result request limit',
)

requireMarker(
  homepage,
  'isSolverActive',
  'Visibility-gated Solver activation',
)

requireMarker(
  homepage,
  'isComparisonOpen &&',
  'Closed comparison worker gate',
)

requireMarker(
  homepage,
  'Previous confirmed result stays mounted',
  'Stable Solver result rendering',
)

requireMarker(
  advancedTools,
  "'explicit-click-loading-v8'",
  'Advanced Tool click-only loading',
)

requireMarker(
  resultTools,
  "'explicit-click-loading-v8'",
  'Result Tool click-only loading',
)

forbidMarker(
  advancedTools,
  'onPointerEnter',
  'Advanced Tool hover prefetch',
)

forbidMarker(
  advancedTools,
  'prefetchTool(',
  'Advanced Tool prefetch function',
)

forbidMarker(
  resultTools,
  'onPointerEnter',
  'Result Tool hover prefetch',
)

forbidMarker(
  resultTools,
  'prefetchTool(',
  'Result Tool prefetch function',
)

requireMarker(
  workerClient,
  'new Worker(',
  'Background Solver worker',
)

requireMarker(
  workerClient,
  'resultCache',
  'Worker result cache',
)

requireMarker(
  workerClient,
  'inFlightRequests',
  'Worker request coalescing',
)

requireMarker(
  workerHook,
  'startTransition',
  'Deferred worker result rendering',
)

requireMarker(
  workerHook,
  "'keep-last-confirmed-result-v7'",
  'Stable worker result mode',
)

requireMarker(
  engine,
  "'two-stage-shortlist'",
  'Two-stage Solver ranking',
)

requireMarker(
  engine,
  'return rankedCandidates.map',
  'Post-shortlist engineering enrichment',
)

if (
  !fs.existsSync(
    paths.manifest,
  )
) {
  fail(
    'Vite manifest is missing. Run npm run build first.',
  )
}

if (
  !fs.existsSync(
    paths.assets,
  )
) {
  fail(
    'dist/assets is missing. Run npm run build first.',
  )
}

let manifest = {}

if (
  fs.existsSync(
    paths.manifest,
  )
) {
  try {
    manifest =
      JSON.parse(
        fs.readFileSync(
          paths.manifest,
          'utf8',
        ),
      )
  } catch (
    error
  ) {
    fail(
      `Vite manifest could not be parsed: ${String(error)}`,
    )
  }
}

function findManifestEntry(
  sourcePath,
) {
  if (
    manifest[
      sourcePath
    ]
  ) {
    return {
      key:
        sourcePath,
      entry:
        manifest[
          sourcePath
        ],
    }
  }

  const matchedEntry =
    Object.entries(
      manifest,
    ).find(
      ([
        key,
      ]) =>
        key.endsWith(
          sourcePath,
        ),
    )

  if (!matchedEntry) {
    return null
  }

  return {
    key:
      matchedEntry[0],
    entry:
      matchedEntry[1],
  }
}

function verifyDynamicEntry({
  sourcePath,
  label,
  maximumBytes,
}) {
  const match =
    findManifestEntry(
      sourcePath,
    )

  if (!match) {
    fail(
      `${label} manifest entry is missing: ${sourcePath}`,
    )

    return null
  }

  const {
    entry,
  } =
    match

  if (
    entry.isDynamicEntry !==
    true
  ) {
    fail(
      `${label} is not a dynamic entry: ${sourcePath}`,
    )
  }

  if (
    typeof entry.file !==
    'string'
  ) {
    fail(
      `${label} JavaScript asset is missing: ${sourcePath}`,
    )

    return null
  }

  const assetPath =
    path.join(
      root,
      'dist',
      entry.file,
    )

  if (
    !fs.existsSync(
      assetPath,
    )
  ) {
    fail(
      `${label} asset does not exist: ${entry.file}`,
    )

    return null
  }

  const bytes =
    fs.statSync(
      assetPath,
    ).size

  if (
    bytes >
    maximumBytes
  ) {
    fail(
      `${label} is ${formatBytes(bytes)}; budget is ${formatBytes(maximumBytes)}.`,
    )
  }

  return {
    sourcePath,
    file:
      entry.file,
    bytes,
  }
}

const budgetRows = []

const solverEntry =
  verifyDynamicEntry({
    sourcePath:
      'src/components/HomepageProblemSolverPanel.tsx',
    label:
      'Homepage Problem Solver chunk',
    maximumBytes:
      900_000,
  })

if (solverEntry) {
  budgetRows.push({
    name:
      'Homepage Solver',
    ...solverEntry,
  })
}

for (
  const definition
  of [
    {
      sourcePath:
        'src/components/SolverAdvancedTools.tsx',
      name:
        'Advanced Tool shell',
      maximumBytes:
        250_000,
    },
    {
      sourcePath:
        'src/components/SolverResultTools.tsx',
      name:
        'Result Tool shell',
      maximumBytes:
        250_000,
    },
  ]
) {
  const result =
    verifyDynamicEntry({
      sourcePath:
        definition.sourcePath,
      label:
        definition.name,
      maximumBytes:
        definition.maximumBytes,
    })

  if (result) {
    budgetRows.push({
      name:
        definition.name,
      ...result,
    })
  }
}

const toolSources = [
  'src/components/GuidedProblemBuilder.tsx',
  'src/components/UnitHarmonizerPanel.tsx',
  'src/components/SensitivitySweepPanel.tsx',
  'src/components/UncertaintyAnalysisPanel.tsx',
  'src/components/RobustnessCornerAnalysisPanel.tsx',
  'src/components/ParameterCalibrationPanel.tsx',
  'src/components/FullFactorialDoePanel.tsx',
  'src/components/TargetOperatingPointPanel.tsx',
  'src/components/DesignEnvelopePanel.tsx',
  'src/components/ConstraintOperatingWindowPanel.tsx',
  'src/components/BatchProblemSolverPanel.tsx',
  'src/components/MissingInputAssistant.tsx',
  'src/components/ResultUnitConverterPanel.tsx',
  'src/components/CalculationTracePanel.tsx',
  'src/components/AssumptionReviewPanel.tsx',
  'src/components/EngineeringValidationGate.tsx',
]

const toolAssetFiles =
  new Set()

for (
  const sourcePath
  of toolSources
) {
  const result =
    verifyDynamicEntry({
      sourcePath,
      label:
        `Solver tool ${path.basename(sourcePath)}`,
      maximumBytes:
        900_000,
    })

  if (result) {
    toolAssetFiles.add(
      result.file,
    )

    budgetRows.push({
      name:
        path.basename(
          sourcePath,
          '.tsx',
        ),
      ...result,
    })
  }
}

if (
  toolAssetFiles.size !==
  toolSources.length
) {
  fail(
    `Expected ${toolSources.length} independent Solver tool chunks but found ${toolAssetFiles.size}.`,
  )
}

let javascriptChunks = []

if (
  fs.existsSync(
    paths.assets,
  )
) {
  javascriptChunks =
    fs.readdirSync(
      paths.assets,
    )
      .filter(
        (fileName) =>
          fileName.endsWith(
            '.js',
          ),
      )
      .map(
        (fileName) => ({
          fileName,
          bytes:
            fs.statSync(
              path.join(
                paths.assets,
                fileName,
              ),
            ).size,
        }),
      )
}

const entryChunks =
  javascriptChunks.filter(
    (chunk) =>
      chunk.fileName.startsWith(
        'index-',
      ),
  )

if (
  entryChunks.length ===
  0
) {
  fail(
    'Initial application entry chunk was not generated.',
  )
}

for (
  const entryChunk
  of entryChunks
) {
  if (
    entryChunk.bytes >
    250_000
  ) {
    fail(
      `Initial entry ${entryChunk.fileName} is ${formatBytes(entryChunk.bytes)}; budget is ${formatBytes(250_000)}.`,
    )
  }
}

const workerChunks =
  javascriptChunks.filter(
    (chunk) =>
      /problemSolver\.worker|problem-solver\.worker/i.test(
        chunk.fileName,
      ),
  )

if (
  workerChunks.length ===
  0
) {
  fail(
    'Problem Solver worker JavaScript asset was not generated.',
  )
}

for (
  const workerChunk
  of workerChunks
) {
  if (
    workerChunk.bytes >
    2_000_000
  ) {
    fail(
      `Problem Solver worker ${workerChunk.fileName} is ${formatBytes(workerChunk.bytes)}; budget is ${formatBytes(2_000_000)}.`,
    )
  }
}

console.log(
  '========================================',
)

console.log(
  'PROBLEM SOLVER PERFORMANCE GATE V10',
)

console.log(
  '========================================',
)

console.log(
  `Gate version: ${PERFORMANCE_GATE_VERSION}`,
)

console.log(
  '',
)

console.log(
  'Dynamic chunk budgets:',
)

for (
  const row
  of budgetRows
) {
  console.log(
    `- ${row.name}: ${formatBytes(row.bytes)} — ${row.file}`,
  )
}

console.log(
  '',
)

console.log(
  'Initial entry chunks:',
)

for (
  const chunk
  of entryChunks
) {
  console.log(
    `- ${chunk.fileName}: ${formatBytes(chunk.bytes)}`,
  )
}

console.log(
  '',
)

console.log(
  'Worker chunks:',
)

for (
  const chunk
  of workerChunks
) {
  console.log(
    `- ${chunk.fileName}: ${formatBytes(chunk.bytes)}`,
  )
}

if (
  failures.length >
  0
) {
  console.error(
    '',
  )

  console.error(
    `FAIL: ${failures.length} Problem Solver performance regression(s) detected.`,
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  process.exit(1)
}

console.log(
  '',
)

console.log(
  `PASS: ${toolSources.length} independent Solver tool chunks verified.`,
)

console.log(
  'PASS: Whole-Solver lazy boundary verified.',
)

console.log(
  'PASS: Background worker architecture verified.',
)

console.log(
  'PASS: Entry, Solver, tool and worker budgets verified.',
)

console.log(
  'PASS: PROBLEM SOLVER PERFORMANCE REGRESSION GATE V10',
)
