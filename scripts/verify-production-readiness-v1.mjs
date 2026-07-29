import fs from 'node:fs'
import path from 'node:path'

const root =
  process.cwd()

const failures = []

function fail(message) {
  failures.push(message)
}

function readFile(
  relativePath,
) {
  const filePath =
    path.join(
      root,
      relativePath,
    )

  if (
    fs.existsSync(filePath) ===
    false
  ) {
    fail(
      `Missing file: ${relativePath}`,
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
    content.includes(marker) ===
    false
  ) {
    fail(
      `Missing ${label}: ${marker}`,
    )
  }
}

const index =
  readFile('index.html')

const manifestText =
  readFile(
    'public/site.webmanifest',
  )

const robots =
  readFile(
    'public/robots.txt',
  )

const sitemap =
  readFile(
    'public/sitemap.xml',
  )

const favicon =
  readFile(
    'public/favicon.svg',
  )

const vercelText =
  readFile('vercel.json')

requireMarker(
  index,
  '<html lang="en">',
  'document language',
)

requireMarker(
  index,
  'ChemE Toolkit — Chemical Engineering Calculators',
  'production page title',
)

requireMarker(
  index,
  'name="description"',
  'meta description',
)

requireMarker(
  index,
  'rel="canonical"',
  'canonical URL',
)

requireMarker(
  index,
  'property="og:title"',
  'Open Graph title',
)

requireMarker(
  index,
  'property="og:description"',
  'Open Graph description',
)

requireMarker(
  index,
  'name="twitter:card"',
  'Twitter card',
)

requireMarker(
  index,
  'rel="manifest"',
  'web manifest link',
)

if (
  index.includes(
    '<title>chemetoolkitweb-source</title>',
  )
) {
  fail(
    'Generic Vite page title is still present.',
  )
}

let manifest = null

try {
  manifest =
    JSON.parse(
      manifestText,
    )
} catch {
  fail(
    'site.webmanifest is not valid JSON.',
  )
}

if (manifest) {
  if (
    manifest.name !==
    'ChemE Toolkit'
  ) {
    fail(
      'Web manifest name is incorrect.',
    )
  }

  if (
    manifest.start_url !== '/'
  ) {
    fail(
      'Web manifest start_url must be root.',
    )
  }

  if (
    Array.isArray(
      manifest.icons,
    ) === false ||
    manifest.icons.length === 0
  ) {
    fail(
      'Web manifest has no application icon.',
    )
  }
}

requireMarker(
  robots,
  'User-agent: *',
  'robots user agent',
)

requireMarker(
  robots,
  'Allow: /',
  'robots allow rule',
)

requireMarker(
  robots,
  'sitemap.xml',
  'robots sitemap declaration',
)

requireMarker(
  sitemap,
  '<urlset',
  'sitemap URL set',
)

requireMarker(
  sitemap,
  'https://cheme-toolkit-web.vercel.app/',
  'production sitemap URL',
)

requireMarker(
  favicon,
  '#0b3556',
  'brand navy favicon color',
)

requireMarker(
  favicon,
  '#079c99',
  'brand teal favicon color',
)

let vercel = null

try {
  vercel =
    JSON.parse(
      vercelText,
    )
} catch {
  fail(
    'vercel.json is not valid JSON.',
  )
}

if (vercel) {
  const headers =
    Array.isArray(
      vercel.headers,
    )
      ? vercel.headers
      : []

  const serialized =
    JSON.stringify(headers)

  const requiredHeaders = [
    'Cache-Control',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
  ]

  requiredHeaders.forEach(
    (header) => {
      if (
        serialized.includes(
          header,
        ) === false
      ) {
        fail(
          `Missing Vercel header: ${header}`,
        )
      }
    },
  )
}

const distFiles = [
  'dist/index.html',
  'dist/favicon.svg',
  'dist/site.webmanifest',
  'dist/robots.txt',
  'dist/sitemap.xml',
]

distFiles.forEach(
  (relativePath) => {
    if (
      fs.existsSync(
        path.join(
          root,
          relativePath,
        ),
      ) === false
    ) {
      fail(
        `Production build is missing: ${relativePath}`,
      )
    }
  },
)

const distIndex =
  readFile(
    'dist/index.html',
  )

requireMarker(
  distIndex,
  'ChemE Toolkit — Chemical Engineering Calculators',
  'built page title',
)

requireMarker(
  distIndex,
  'site.webmanifest',
  'built manifest link',
)

if (
  failures.length > 0
) {
  console.error()
  console.error(
    'PRODUCTION READINESS VERIFICATION FAILED',
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
  'PRODUCTION READINESS VERIFICATION PASSED',
)

console.log(
  'SEO metadata verified.',
)

console.log(
  'Social sharing metadata verified.',
)

console.log(
  'Web manifest and favicon verified.',
)

console.log(
  'Robots and sitemap verified.',
)

console.log(
  'Vercel caching and security headers verified.',
)

console.log(
  'Production build assets verified.',
)
