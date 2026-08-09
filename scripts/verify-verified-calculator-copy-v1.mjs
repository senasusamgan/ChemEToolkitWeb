import {
  readFile,
  readdir,
} from 'node:fs/promises'

import {
  extname,
  join,
} from 'node:path'

const baseline =
  JSON.parse(
    await readFile(
      'scripts/calculator-test-coverage-baseline-v1.json',
      'utf8',
    ),
  )

const expectedCount =
  baseline.catalogCalculatorCount

const allowedExtensions =
  new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.html',
    '.md',
  ])

const targets = []

async function collectDirectory(
  directory,
) {
  const entries =
    await readdir(
      directory,
      {
        withFileTypes: true,
      },
    )

  for (const entry of entries) {
    const path =
      join(
        directory,
        entry.name,
      )

    if (
      entry.isDirectory()
    ) {
      await collectDirectory(
        path,
      )

      continue
    }

    if (
      allowedExtensions.has(
        extname(
          entry.name,
        ),
      )
    ) {
      targets.push(
        path,
      )
    }
  }
}

for (const directory of [
  'src',
  'public',
]) {
  try {
    await collectDirectory(
      directory,
    )
  } catch {
    // Ignore absent directory.
  }
}

targets.push(
  'index.html',
)

const pattern =
  /\b(\d+)\+?\s+verified\s+calculators\b/gi

const stale = []

let occurrenceCount =
  0

for (const path of targets) {
  let source

  try {
    source =
      await readFile(
        path,
        'utf8',
      )
  } catch {
    continue
  }

  for (
    const match of
    source.matchAll(
      pattern,
    )
  ) {
    occurrenceCount +=
      1

    const actual =
      Number(
        match[1],
      )

    if (
      actual !==
      expectedCount
    ) {
      stale.push({
        path,
        actual,
      })
    }
  }
}

if (
  stale.length > 0
) {
  throw new Error(
    [
      `Stale verified-calculator copy detected. Expected ${expectedCount}.`,
      ...stale.map(
        item =>
          `${item.path}: ${item.actual} verified calculators`,
      ),
    ].join(
      '\n',
    ),
  )
}

console.log(
  `PASS: all visible verified-calculator counts match ${expectedCount}.`,
)

console.log(
  `Verified-copy occurrences checked: ${occurrenceCount}`,
)
