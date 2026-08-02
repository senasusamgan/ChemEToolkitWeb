import fs from 'node:fs'
import path from 'node:path'

const root =
  process.cwd()

const appPath =
  path.join(
    root,
    'src/App.tsx',
  )

const vitePath =
  path.join(
    root,
    'vite.config.ts',
  )

const assetsPath =
  path.join(
    root,
    'dist/assets',
  )

const manifestPath =
  path.join(
    root,
    'dist/.vite/manifest.json',
  )

const failures = []

function fail(message) {
  failures.push(message)
}

function requireMarker(
  content,
  marker,
  label,
) {
  if (
    content.includes(marker) ===
    false
  ) {
    fail(
      `Missing ${label}: ${marker}`,
    )
  }
}

if (
  fs.existsSync(appPath) ===
  false
) {
  fail(
    'src/App.tsx is missing.',
  )
}

if (
  fs.existsSync(vitePath) ===
  false
) {
  fail(
    'vite.config.ts is missing.',
  )
}

const app =
  fs.existsSync(appPath)
    ? fs.readFileSync(
        appPath,
        'utf8',
      )
    : ''

const vite =
  fs.existsSync(vitePath)
    ? fs.readFileSync(
        vitePath,
        'utf8',
      )
    : ''

requireMarker(
  app,
  'const EngineeringWorkspace =',
  'lazy Workspace definition',
)

requireMarker(
  app,
  'new IntersectionObserver(',
  'deferred Workspace observer',
)

requireMarker(
  app,
  'shouldLoadWorkspace',
  'Workspace loading state',
)

requireMarker(
  app,
  'workspace-lazy-placeholder',
  'Workspace loading fallback',
)

requireMarker(
  vite,
  'manualChunks(id)',
  'manual chunk strategy',
)

requireMarker(
  vite,
  "'vendor-react'",
  'React vendor chunk',
)

requireMarker(
  vite,
  "'calculator-catalog'",
  'calculator catalog chunk',
)

requireMarker(
  vite,
  "'/src/features/'",
  'feature category chunks',
)

requireMarker(
  vite,
  'manifest: true',
  'Vite build manifest',
)

if (
  fs.existsSync(manifestPath) ===
  false
) {
  fail(
    'Vite manifest was not generated.',
  )
}

if (
  fs.existsSync(assetsPath) ===
  false
) {
  fail(
    'dist/assets directory is missing.',
  )
}

let chunks = []

if (
  fs.existsSync(assetsPath)
) {
  chunks =
    fs.readdirSync(
      assetsPath,
    )
      .filter(
        (fileName) =>
          fileName.endsWith(
            '.js',
          ),
      )
      .map((fileName) => {
        const filePath =
          path.join(
            assetsPath,
            fileName,
          )

        return {
          fileName,
          bytes:
            fs.statSync(
              filePath,
            ).size,
        }
      })
      .sort(
        (first, second) =>
          second.bytes -
          first.bytes,
      )
}

if (chunks.length < 5) {
  fail(
    `Expected at least 5 JavaScript chunks but found ${chunks.length}.`,
  )
}

const largest =
  chunks[0]

const maximumChunkBytes =
  1_200_000

if (
  largest &&
  largest.bytes >
    maximumChunkBytes
) {
  fail(
    `Largest JavaScript chunk is ${largest.bytes} bytes; budget is ${maximumChunkBytes} bytes.`,
  )
}

if (
  chunks.some(
    (chunk) =>
      chunk.fileName.startsWith(
        'vendor-react-',
      ),
  ) === false
) {
  fail(
    'React vendor chunk was not generated.',
  )
}

if (
  chunks.some(
    (chunk) =>
      chunk.fileName.startsWith(
        'workspace-',
      ),
  ) === false
) {
  fail(
    'Workspace chunk was not generated.',
  )
}

if (
  chunks.some(
    (chunk) =>
      chunk.fileName.startsWith(
        'feature-',
      ),
  ) === false
) {
  fail(
    'Feature category chunks were not generated.',
  )
}

if (
  fs.existsSync(
    manifestPath,
  )
) {
  const manifestText =
    fs.readFileSync(
      manifestPath,
      'utf8',
    )

  if (
    manifestText.includes(
      'workspace-',
    ) === false
  ) {
    fail(
      'Workspace build asset is not represented in the Vite manifest.',
    )
  }
}

const entryChunks =
  chunks.filter(
    (chunk) =>
      chunk.fileName.startsWith(
        'index-',
      ),
  )

if (
  entryChunks.length === 0
) {
  fail(
    'Application entry chunk was not generated.',
  )
}

const largestEntryChunk =
  entryChunks.sort(
    (first, second) =>
      second.bytes -
      first.bytes,
  )[0]

const maximumEntryBytes =
  250_000

if (
  largestEntryChunk &&
  largestEntryChunk.bytes >
    maximumEntryBytes
) {
  fail(
    'Initial application entry is ' +
    String(
      largestEntryChunk.bytes,
    ) +
    ' bytes; budget is ' +
    String(
      maximumEntryBytes,
    ) +
    ' bytes.',
  )
}


requireMarker(
  app,
  'const HomepageProblemSolverPanel =',
  'lazy Problem Solver definition',
)

requireMarker(
  app,
  "import(\n      './components/HomepageProblemSolverPanel'",
  'dynamic Problem Solver import',
)

requireMarker(
  app,
  'shouldLoadProblemSolver',
  'Problem Solver loading state',
)

requireMarker(
  app,
  'problemSolverSectionRef',
  'Problem Solver observer reference',
)

requireMarker(
  app,
  'problem-solver-lazy-shell',
  'Problem Solver lazy shell',
)

if (
  app.includes(
    "import { HomepageProblemSolverPanel } from './components/HomepageProblemSolverPanel'",
  )
) {
  fail(
    'Homepage Problem Solver is still statically imported.',
  )
}

if (
  fs.existsSync(
    manifestPath,
  )
) {
  try {
    const manifest =
      JSON.parse(
        fs.readFileSync(
          manifestPath,
          'utf8',
        ),
      )

    const solverManifestEntry =
      Object.entries(
        manifest,
      ).find(
        (
          [
            key,
          ],
        ) =>
          key.endsWith(
            'src/components/HomepageProblemSolverPanel.tsx',
          ),
      )

    if (!solverManifestEntry) {
      fail(
        'Problem Solver dynamic manifest entry is missing.',
      )
    } else {
      const [
        ,
        entry,
      ] =
        solverManifestEntry

      if (
        entry.isDynamicEntry !==
        true
      ) {
        fail(
          'Homepage Problem Solver is not marked as a dynamic entry.',
        )
      }

      if (
        typeof entry.file !==
        'string'
      ) {
        fail(
          'Problem Solver dynamic JavaScript asset is missing.',
        )
      } else {
        const solverAssetPath =
          path.join(
            root,
            'dist',
            entry.file,
          )

        if (
          !fs.existsSync(
            solverAssetPath,
          )
        ) {
          fail(
            'Problem Solver dynamic asset does not exist.',
          )
        } else {
          const solverChunkBytes =
            fs.statSync(
              solverAssetPath,
            ).size

          const maximumSolverChunkBytes =
            900_000

          if (
            solverChunkBytes >
            maximumSolverChunkBytes
          ) {
            fail(
              'Problem Solver chunk is ' +
              String(
                solverChunkBytes,
              ) +
              ' bytes; budget is ' +
              String(
                maximumSolverChunkBytes,
              ) +
              ' bytes.',
            )
          }
        }
      }
    }
  } catch (
    error
  ) {
    fail(
      'Problem Solver manifest verification failed: ' +
      String(
        error,
      ),
    )
  }
}

if (
  failures.length > 0
) {
  console.error()
  console.error(
    'PERFORMANCE VERIFICATION FAILED',
  )

  failures.forEach(
    (message) =>
      console.error(
        `- ${message}`,
      ),
  )

  process.exit(1)
}

console.log(
  'PERFORMANCE VERIFICATION PASSED',
)

console.log(
  `JavaScript chunks: ${chunks.length}`,
)

console.log(
  `Largest chunk: ${
    largest?.fileName ??
    'none'
  }`,
)

console.log(
  `Largest size: ${
    largest
      ? (
          largest.bytes /
          1024
        ).toFixed(2)
      : '0.00'
  } KiB`,
)

console.log(
  `Initial entry size: ${
    largestEntryChunk
      ? (
          largestEntryChunk.bytes /
          1024
        ).toFixed(2)
      : '0.00'
  } KiB`,
)

console.log()
console.log(
  'Largest five chunks:',
)

chunks
  .slice(0, 5)
  .forEach((chunk) => {
    console.log(
      `- ${chunk.fileName}: ${(
        chunk.bytes /
        1024
      ).toFixed(2)} KiB`,
    )
  })
