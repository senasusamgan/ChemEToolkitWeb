const LIVE_LABEL = 'live calculators'
const QUEUED_LABEL = 'clean-source migrations queued'
const HIDDEN_CLASS = 'cheme-hero-stats-hidden'
const STYLE_ID = 'cheme-hero-runtime-style'
const HERO_COPY_SELECTOR = '.hero-copy'
const CATEGORY_RIBBON_SELECTOR = '.category-ribbon'

function normalizeText(value: string | null): string {
  return (value ?? '')
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .${HIDDEN_CLASS} {
      display: none !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    .hero-copy.cheme-hero-copy-aligned {
      align-self: start !important;
      justify-self: stretch !important;
      will-change: transform;
    }
  `

  document.head.appendChild(style)
}

function deepestElementsContaining(
  phrase: string,
): HTMLElement[] {
  const elements = Array.from(
    document.body.querySelectorAll<HTMLElement>('*'),
  )

  return elements.filter((element) => {
    const ownText = normalizeText(element.textContent)

    if (!ownText.includes(phrase)) {
      return false
    }

    return !Array.from(element.children).some((child) =>
      normalizeText(child.textContent).includes(phrase),
    )
  })
}

function lowestCommonAncestor(
  first: HTMLElement,
  second: HTMLElement,
): HTMLElement | null {
  const firstAncestors = new Set<HTMLElement>()
  let current: HTMLElement | null = first

  while (current) {
    firstAncestors.add(current)
    current = current.parentElement
  }

  current = second

  while (current) {
    if (firstAncestors.has(current)) {
      return current
    }

    current = current.parentElement
  }

  return null
}

function hasBothLabels(element: HTMLElement): boolean {
  const text = normalizeText(element.textContent)

  return (
    text.includes(LIVE_LABEL) &&
    text.includes(QUEUED_LABEL)
  )
}

function isUnsafeLargeContainer(
  element: HTMLElement,
): boolean {
  return (
    element === document.body ||
    element === document.documentElement ||
    element.tagName === 'MAIN' ||
    element.classList.contains('hero')
  )
}

function findSmallStatItem(
  labelElement: HTMLElement,
): HTMLElement {
  let candidate: HTMLElement = labelElement
  let current: HTMLElement | null = labelElement

  while (current && !isUnsafeLargeContainer(current)) {
    const className = current.className.toString().toLowerCase()
    const text = normalizeText(current.textContent)

    if (
      /(stat|metric|counter|migration|summary|progress)/.test(
        className,
      )
    ) {
      return current
    }

    if (
      text.length <= 90 &&
      current.children.length <= 4
    ) {
      candidate = current
    }

    current = current.parentElement
  }

  return candidate
}

function hideStats(): void {
  if (!document.body) {
    return
  }

  ensureStyle()

  const liveElements =
    deepestElementsContaining(LIVE_LABEL)

  const queuedElements =
    deepestElementsContaining(QUEUED_LABEL)

  if (
    liveElements.length === 0 ||
    queuedElements.length === 0
  ) {
    return
  }

  let best:
    | {
        container: HTMLElement
        size: number
      }
    | null = null

  for (const liveElement of liveElements) {
    for (const queuedElement of queuedElements) {
      const common = lowestCommonAncestor(
        liveElement,
        queuedElement,
      )

      if (!common || !hasBothLabels(common)) {
        continue
      }

      const size =
        normalizeText(common.textContent).length

      if (!best || size < best.size) {
        best = {
          container: common,
          size,
        }
      }
    }
  }

  if (
    best &&
    !isUnsafeLargeContainer(best.container)
  ) {
    best.container.classList.add(HIDDEN_CLASS)
    best.container.setAttribute('aria-hidden', 'true')
    return
  }

  for (const element of liveElements) {
    const item = findSmallStatItem(element)
    item.classList.add(HIDDEN_CLASS)
    item.setAttribute('aria-hidden', 'true')
  }

  for (const element of queuedElements) {
    const item = findSmallStatItem(element)
    item.classList.add(HIDDEN_CLASS)
    item.setAttribute('aria-hidden', 'true')
  }
}

function findCategoryRibbon(
  heroCopy: HTMLElement,
): HTMLElement | null {
  const hero =
    heroCopy.closest<HTMLElement>('.hero')

  return (
    hero?.querySelector<HTMLElement>(
      CATEGORY_RIBBON_SELECTOR,
    ) ??
    document.querySelector<HTMLElement>(
      CATEGORY_RIBBON_SELECTOR,
    )
  )
}

function alignHeroCopy(): void {
  const heroCopy =
    document.querySelector<HTMLElement>(
      HERO_COPY_SELECTOR,
    )

  if (!heroCopy) {
    return
  }

  const categoryRibbon =
    findCategoryRibbon(heroCopy)

  if (!categoryRibbon) {
    return
  }

  ensureStyle()

  heroCopy.classList.add(
    'cheme-hero-copy-aligned',
  )

  heroCopy.style.removeProperty('transform')

  const ribbonRect =
    categoryRibbon.getBoundingClientRect()

  const copyRect =
    heroCopy.getBoundingClientRect()

  const viewportWidth =
    window.innerWidth

  const desiredGap =
    viewportWidth <= 760
      ? 22
      : viewportWidth <= 1100
        ? 34
        : 52

  const currentGap =
    copyRect.top -
    ribbonRect.bottom

  const maximumShift =
    Math.max(
      0,
      copyRect.height * 0.58,
    )

  const requiredShift =
    Math.max(
      0,
      Math.min(
        currentGap -
        desiredGap,
        maximumShift,
      ),
    )

  if (requiredShift <= 1) {
    heroCopy.style.setProperty(
      'transform',
      'none',
      'important',
    )
    return
  }

  heroCopy.style.setProperty(
    'transform',
    `translateY(-${requiredShift.toFixed(2)}px)`,
    'important',
  )
}

let scheduledFrame = 0

function scheduleCleanup(): void {
  if (scheduledFrame !== 0) {
    window.cancelAnimationFrame(
      scheduledFrame,
    )
  }

  scheduledFrame =
    window.requestAnimationFrame(() => {
      scheduledFrame = 0
      hideStats()
      alignHeroCopy()
    })
}

function startCleanup(): void {
  scheduleCleanup()

  window.requestAnimationFrame(() => {
    scheduleCleanup()
  })

  const observer = new MutationObserver(() => {
    scheduleCleanup()
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  })

  const resizeObserver =
    new ResizeObserver(() => {
      scheduleCleanup()
    })

  resizeObserver.observe(document.documentElement)

  window.addEventListener(
    'resize',
    scheduleCleanup,
    { passive: true },
  )
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startCleanup,
    { once: true },
  )
} else {
  startCleanup()
}

export {}
