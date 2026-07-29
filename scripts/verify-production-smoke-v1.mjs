import { spawn } from 'node:child_process'

const host = '127.0.0.1'
const port = 4174
const baseUrl =
  'http://' +
  host +
  ':' +
  String(port)

const npmCommand =
  process.platform === 'win32'
    ? 'npm.cmd'
    : 'npm'

const preview = spawn(
  npmCommand,
  [
    'run',
    'preview',
    '--',
    '--host',
    host,
    '--port',
    String(port),
    '--strictPort',
  ],
  {
    stdio: [
      'ignore',
      'pipe',
      'pipe',
    ],
  },
)

let previewLogs = ''

preview.stdout.on(
  'data',
  (chunk) => {
    previewLogs +=
      String(chunk)
  },
)

preview.stderr.on(
  'data',
  (chunk) => {
    previewLogs +=
      String(chunk)
  },
)

function sleep(milliseconds) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      )
    },
  )
}

async function stopPreview() {
  if (preview.exitCode !== null) {
    return
  }

  preview.kill('SIGTERM')
  await sleep(500)

  if (preview.exitCode === null) {
    preview.kill('SIGKILL')
  }
}

async function waitForPreview() {
  for (
    let attempt = 1;
    attempt <= 40;
    attempt += 1
  ) {
    if (preview.exitCode !== null) {
      throw new Error(
        'Vite preview stopped before becoming ready.\n' +
        previewLogs,
      )
    }

    try {
      const response =
        await fetch(
          baseUrl + '/',
        )

      if (response.ok) {
        return
      }
    } catch {
      // Preview is still starting.
    }

    await sleep(250)
  }

  throw new Error(
    'Vite preview did not become ready.\n' +
    previewLogs,
  )
}

async function fetchText(
  route,
  marker,
) {
  const response =
    await fetch(
      baseUrl + route,
    )

  if (!response.ok) {
    throw new Error(
      route +
      ' returned HTTP ' +
      String(response.status),
    )
  }

  const text =
    await response.text()

  if (!text.includes(marker)) {
    throw new Error(
      route +
      ' is missing marker: ' +
      marker,
    )
  }

  return text
}

async function verifyAsset(
  assetPath,
) {
  const response =
    await fetch(
      new URL(
        assetPath,
        baseUrl,
      ),
    )

  if (!response.ok) {
    throw new Error(
      assetPath +
      ' returned HTTP ' +
      String(response.status),
    )
  }

  const content =
    await response.arrayBuffer()

  if (content.byteLength === 0) {
    throw new Error(
      assetPath +
      ' returned an empty file.',
    )
  }

  return content.byteLength
}

async function runSmokeTest() {
  await waitForPreview()

  console.log(
    'Preview server is ready.',
  )

  const html =
    await fetchText(
      '/',
      'ChemE Toolkit — Chemical Engineering Calculators',
    )

  await fetchText(
    '/favicon.svg',
    '#0b3556',
  )

  await fetchText(
    '/site.webmanifest',
    '"name": "ChemE Toolkit"',
  )

  await fetchText(
    '/robots.txt',
    'User-agent: *',
  )

  await fetchText(
    '/sitemap.xml',
    '<urlset',
  )

  if (
    !html.includes(
      '<div id="root"></div>',
    )
  ) {
    throw new Error(
      'React root element is missing.',
    )
  }

  if (
    html.includes(
      'chemetoolkitweb-source',
    )
  ) {
    throw new Error(
      'Generic development title is still present.',
    )
  }

  const matches =
    Array.from(
      html.matchAll(
        /(?:src|href)="([^"]+\.(?:js|css))"/g,
      ),
    )

  const assets =
    Array.from(
      new Set(
        matches.map(
          (match) =>
            match[1],
        ),
      ),
    )

  if (assets.length < 2) {
    throw new Error(
      'Built JavaScript and CSS assets were not found.',
    )
  }

  let downloadedBytes = 0

  for (const asset of assets) {
    downloadedBytes +=
      await verifyAsset(asset)
  }

  console.log(
    'PRODUCTION SMOKE TEST PASSED',
  )

  console.log(
    'Root page verified.',
  )

  console.log(
    'Favicon and manifest verified.',
  )

  console.log(
    'Robots and sitemap verified.',
  )

  console.log(
    'Built assets verified: ' +
    String(assets.length),
  )

  console.log(
    'Downloaded asset bytes: ' +
    String(downloadedBytes),
  )
}

try {
  await runSmokeTest()
} catch (error) {
  console.error()
  console.error(
    'PRODUCTION SMOKE TEST FAILED',
  )

  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  )

  if (previewLogs.trim()) {
    console.error()
    console.error(
      previewLogs.trim(),
    )
  }

  process.exitCode = 1
} finally {
  await stopPreview()
}
