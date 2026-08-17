import {
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'

import {
  gzipSync,
} from 'node:zlib'

import {
  join,
} from 'node:path'

const baseline =
  JSON.parse(
    readFileSync(
      'audit-reports/performance-baseline-v1.json',
      'utf8',
    ),
  )

const assetsDir =
  'dist/assets'

const manifest =
  JSON.parse(
    readFileSync(
      'dist/.vite/manifest.json',
      'utf8',
    ),
  )

const chunks =
  readdirSync(
    assetsDir,
  )
    .filter(
      (file) =>
        file.endsWith(
          '.js',
        ),
    )
    .map(
      (file) => {
        const path =
          join(
            assetsDir,
            file,
          )

        const source =
          readFileSync(
            path,
          )

        return {
          file,
          raw:
            statSync(
              path,
            ).size,
          gzip:
            gzipSync(
              source,
              {
                level: 9,
              },
            ).length,
        }
      },
    )
    .sort(
      (a, b) =>
        b.raw -
        a.raw,
    )

const largest =
  chunks[0]

const entries =
  chunks.filter(
    (chunk) =>
      chunk.file.startsWith(
        'index-',
      ),
  )

const largestEntry =
  Math.max(
    0,
    ...entries.map(
      (chunk) =>
        chunk.raw,
    ),
  )

const totalRaw =
  chunks.reduce(
    (sum, chunk) =>
      sum +
      chunk.raw,
    0,
  )

const totalGzip =
  chunks.reduce(
    (sum, chunk) =>
      sum +
      chunk.gzip,
    0,
  )

const dynamicEntries =
  Object.values(
    manifest,
  ).filter(
    (entry) =>
      entry.isDynamicEntry ===
      true,
  ).length

const {
  budgets,
} = baseline

const failures = []

if (
  !largest
) {
  failures.push(
    'No JavaScript chunks were generated.',
  )
} else if (
  largest.raw >
  budgets.maxChunkBytes
) {
  failures.push(
    `Largest chunk ${largest.file} is ${(largest.raw / 1024).toFixed(1)} KiB; budget is ${(budgets.maxChunkBytes / 1024).toFixed(1)} KiB.`,
  )
}

if (
  largestEntry >
  budgets.maxEntryBytes
) {
  failures.push(
    `Entry chunk is ${(largestEntry / 1024).toFixed(1)} KiB; budget is ${(budgets.maxEntryBytes / 1024).toFixed(1)} KiB.`,
  )
}

if (
  totalRaw >
  budgets.maxTotalJsBytes
) {
  failures.push(
    `Total JS is ${(totalRaw / 1024).toFixed(1)} KiB; budget is ${(budgets.maxTotalJsBytes / 1024).toFixed(1)} KiB.`,
  )
}

if (
  totalGzip >
  budgets.maxTotalGzipBytes
) {
  failures.push(
    `Total gzip JS is ${(totalGzip / 1024).toFixed(1)} KiB; budget is ${(budgets.maxTotalGzipBytes / 1024).toFixed(1)} KiB.`,
  )
}

if (
  dynamicEntries <
  budgets.minDynamicEntries
) {
  failures.push(
    `Dynamic entries dropped to ${dynamicEntries}; minimum is ${budgets.minDynamicEntries}.`,
  )
}

if (
  failures.length
) {
  console.error(
    'BUNDLE PERFORMANCE BUDGET FAILED',
  )

  for (
    const failure
    of failures
  ) {
    console.error(
      `- ${failure}`,
    )
  }

  console.error('')
  console.error(
    'Largest chunks:',
  )

  for (
    const chunk
    of chunks.slice(
      0,
      10,
    )
  ) {
    console.error(
      `- ${chunk.file}: ${(chunk.raw / 1024).toFixed(1)} KiB`,
    )
  }

  process.exit(1)
}

console.log(
  'BUNDLE PERFORMANCE BUDGET PASSED',
)
console.log(
  `JavaScript chunks: ${chunks.length}`,
)
console.log(
  `Dynamic entries: ${dynamicEntries}`,
)
console.log(
  `Largest chunk: ${largest.file}`,
)
console.log(
  `Largest size: ${(largest.raw / 1024).toFixed(1)} KiB`,
)
console.log(
  `Initial entry: ${(largestEntry / 1024).toFixed(1)} KiB`,
)
console.log(
  `Total JS: ${(totalRaw / 1024).toFixed(1)} KiB`,
)
console.log(
  `Total gzip: ${(totalGzip / 1024).toFixed(1)} KiB`,
)
