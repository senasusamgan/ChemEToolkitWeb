import { useCallback, useEffect, useRef, useState } from 'react'

interface LegacyWorkbenchProps {
  calculatorId: string
  title: string
}

const MINIMUM_FRAME_HEIGHT = 520
const MAXIMUM_FRAME_HEIGHT = 1180

export function LegacyWorkbench({
  calculatorId,
  title,
}: LegacyWorkbenchProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)
  const [frameHeight, setFrameHeight] = useState(MINIMUM_FRAME_HEIGHT)

  const source = `/legacy/index.html?embed=1&calculator=${encodeURIComponent(
    calculatorId,
  )}#workbench`

  const synchronizeFrame = useCallback(() => {
    const frame = frameRef.current
    const document = frame?.contentDocument
    if (!frame || !document) return

    const calculatorSelector =
      Array.from(
        document.querySelectorAll<HTMLSelectElement>(
          'select',
        ),
      ).find((selector) =>
        Array.from(
          selector.options,
        ).some(
          (option) =>
            option.value === calculatorId,
        ),
      )

    if (
      calculatorSelector &&
      calculatorSelector.value !== calculatorId
    ) {
      const valueSetter =
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(
            calculatorSelector,
          ),
          'value',
        )?.set

      if (valueSetter) {
        valueSetter.call(
          calculatorSelector,
          calculatorId,
        )
      } else {
        calculatorSelector.value =
          calculatorId
      }

      const inputEvent =
        document.createEvent(
          'Event',
        )

      inputEvent.initEvent(
        'input',
        true,
        false,
      )

      calculatorSelector.dispatchEvent(
        inputEvent,
      )

      const changeEvent =
        document.createEvent(
          'Event',
        )

      changeEvent.initEvent(
        'change',
        true,
        false,
      )

      calculatorSelector.dispatchEvent(
        changeEvent,
      )
    }

    document.documentElement.classList.toggle(
      'cheme-parent-desktop',
      window.innerWidth >= 1024,
    )

    const styleId = 'cheme-local-calculator-polish'
    let style = document.getElementById(styleId) as HTMLStyleElement | null

    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        html, body {
          margin: 0 !important;
          min-height: 0 !important;
          overflow: hidden !important;
          background: #fffdfa !important;
        }

        body > * {
          min-width: 0 !important;
        }

        .site-header,
        .category-ribbon,
        .hero-copy,
        .ruler,
        .categories-section,
        .calculators-section,
        .method-section,
        .references-section,
        footer,
        #categories,
        #calculators,
        #method,
        #references,
        #about {
          display: none !important;
        }

        main,
        .hero,
        .notebook-grid {
          width: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          background: #fffdfa !important;
          background-image: none !important;
        }

        .hero-workbench,
        #workbench {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
          display: block !important;
        }

        .calculator-stage {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .calculator-stage-toolbar,
        .calculator-stage-footer,
        .calculator-switcher {
          display: none !important;
        }

        .calculator-stage-body,
        .legacy-workbench {
          width: 100% !important;
          min-width: 0 !important;
          overflow: visible !important;
        }

        .calculator-card.workbench,
        .workbench {
          width: 100% !important;
          max-width: none !important;
          min-height: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #fffdfa !important;
        }

        .calculator-main {
          padding-top: 26px !important;
        }

        @media (max-width: 700px) {
          .calculator-main {
            padding: 20px 16px 24px !important;
          }

          .calculator-stage-body,
          .native-calculator,
          .calculator-card.workbench,
          .workbench {
            box-sizing: border-box !important;
          }

          .native-calculator {
            padding:
              22px
              18px
              26px !important;
          }

          .native-calculator-header,
          .native-reference,
          .native-input-grid,
          .native-actions,
          .native-result-panel,
          .native-formula {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .native-calculator-header {
            padding-right: 2px !important;
            padding-left: 2px !important;
          }

          .native-reference {
            margin-right: 0 !important;
            margin-left: 0 !important;
          }

          .native-input-grid {
            gap: 15px !important;
          }

          .native-input-grid label {
            width: 100% !important;
            min-width: 0 !important;
          }

          .native-input-shell {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .native-actions {
            margin-top: 22px !important;
          }

          .native-result-panel {
            margin-top: 20px !important;
          }
        }

        @media (max-width: 390px) {
          .native-calculator {
            padding:
              20px
              16px
              24px !important;
          }
        }


        /* LEGACY MOBILE EDGE SPACING */

        @media (max-width: 700px) {
          .calculator-card.workbench,
          .workbench {
            width: calc(100% - 32px) !important;
            max-width: calc(100% - 32px) !important;
            margin-right: 16px !important;
            margin-left: 16px !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .calculator-main,
          .native-calculator {
            width: 100% !important;
            max-width: 100% !important;
            padding:
              22px
              18px
              26px !important;
            box-sizing: border-box !important;
          }

          .native-calculator-header,
          .native-reference,
          .native-input-grid,
          .native-actions,
          .native-result-panel,
          .native-formula {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important;
            margin-left: 0 !important;
            box-sizing: border-box !important;
          }

          .native-input-shell,
          .native-input-shell input,
          .native-input-shell select {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }

        @media (max-width: 390px) {
          .calculator-card.workbench,
          .workbench {
            width: calc(100% - 28px) !important;
            max-width: calc(100% - 28px) !important;
            margin-right: 14px !important;
            margin-left: 14px !important;
          }

          .calculator-main,
          .native-calculator {
            padding:
              20px
              16px
              24px !important;
          }
        }
      `
      document.head.appendChild(style)
    }

    const desktopStyleId =
      'cheme-embedded-desktop-density'

    let desktopStyle =
      document.getElementById(
        desktopStyleId,
      ) as HTMLStyleElement | null

    if (!desktopStyle) {
      desktopStyle =
        document.createElement('style')

      desktopStyle.id = desktopStyleId
      desktopStyle.textContent = `
        html.cheme-parent-desktop,
        html.cheme-parent-desktop body {
          transform: none !important;
          zoom: 1 !important;
          width: 100% !important;
          max-width: 100% !important;
          font-size: 16px !important;
        }

        html.cheme-parent-desktop
        .calculator-stage,
        html.cheme-parent-desktop
        .calculator-stage-body,
        html.cheme-parent-desktop
        .native-calculator,
        html.cheme-parent-desktop
        .calculator-card.workbench,
        html.cheme-parent-desktop
        .workbench {
          box-sizing: border-box !important;
        }

        html.cheme-parent-desktop
        .native-calculator {
          padding-left: 28px !important;
          padding-right: 28px !important;
        }

        html.cheme-parent-desktop
        .native-calculator-header,
        html.cheme-parent-desktop
        .native-reference,
        html.cheme-parent-desktop
        .native-input-grid,
        html.cheme-parent-desktop
        .native-actions,
        html.cheme-parent-desktop
        .native-result-panel,
        html.cheme-parent-desktop
        .native-formula {
          width: auto !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        html.cheme-parent-desktop
        .native-input-grid label,
        html.cheme-parent-desktop
        .native-input-shell {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `

      document.head.appendChild(
        desktopStyle,
      )
    }

    const gutterStyleId =
      'cheme-embedded-content-gutters'

    let gutterStyle =
      document.getElementById(
        gutterStyleId,
      ) as HTMLStyleElement | null

    if (!gutterStyle) {
      gutterStyle =
        document.createElement('style')

      gutterStyle.id = gutterStyleId
      gutterStyle.textContent = `
        /* EMBEDDED CALCULATOR CONTENT GUTTERS */

        .native-input-grid {
          width: 100% !important;
          padding-right: 24px !important;
          padding-left: 24px !important;
          box-sizing: border-box !important;
        }

        .native-input-grid label {
          width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .native-input-grid
        label > span:first-child {
          display: block !important;
          padding-right: 2px !important;
          padding-left: 2px !important;
          box-sizing: border-box !important;
        }

        .native-input-shell {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        .native-actions,
        .native-result-panel,
        .native-formula {
          width: calc(100% - 48px) !important;
          max-width: calc(100% - 48px) !important;
          margin-right: 24px !important;
          margin-left: 24px !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 700px) {
          .native-input-grid {
            padding-right: 16px !important;
            padding-left: 16px !important;
          }

          .native-actions,
          .native-result-panel,
          .native-formula {
            width: calc(100% - 32px) !important;
            max-width: calc(100% - 32px) !important;
            margin-right: 16px !important;
            margin-left: 16px !important;
          }
        }
      `

      document.head.appendChild(
        gutterStyle,
      )
    }

    /*
     * PHASE 2.3 — compact desktop calculator presentation.
     * Presentation only: calculator logic and numerical behavior remain untouched.
     */
    const compactStyleId =
      'cheme-phase-2-3-home-density'

    let compactStyle =
      document.getElementById(
        compactStyleId,
      ) as HTMLStyleElement | null

    if (!compactStyle) {
      compactStyle =
        document.createElement('style')

      compactStyle.id =
        compactStyleId

      compactStyle.textContent = `
        @media (min-width: 701px) {
          .native-calculator {
            padding:
              16px
              20px
              20px !important;
          }

          .native-calculator-header {
            margin:
              0 !important;
            padding:
              6px
              2px
              8px !important;
          }

          .native-calculator-header > * {
            margin-top:
              0 !important;
            margin-bottom:
              0 !important;
          }

          .native-reference {
            margin:
              0
              0
              12px !important;
            padding:
              8px
              12px !important;
          }

          .native-reference > * {
            margin-top:
              0 !important;
            margin-bottom:
              0 !important;
          }

          .native-input-grid {
            display:
              grid !important;
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              ) !important;
            gap:
              10px
              14px !important;
            width:
              100% !important;
            padding:
              0 !important;
            box-sizing:
              border-box !important;
          }

          .native-input-grid label {
            width:
              auto !important;
            min-width:
              0 !important;
            max-width:
              none !important;
            padding-left:
              0 !important;
            padding-right:
              0 !important;
            box-sizing:
              border-box !important;
          }

          .native-input-grid
          label > span:first-child {
            margin-bottom:
              4px !important;
            padding:
              0 !important;
          }

          .native-input-shell {
            width:
              100% !important;
            max-width:
              100% !important;
          }

          .native-input-shell input,
          .native-input-shell select {
            min-height:
              36px !important;
            height:
              36px !important;
          }

          .native-actions {
            width:
              100% !important;
            max-width:
              100% !important;
            margin:
              12px
              0
              0 !important;
            padding-top:
              12px !important;
            border-top:
              1px solid rgba(11, 54, 88, 0.1) !important;
          }

          .native-result-panel {
            width:
              100% !important;
            max-width:
              100% !important;
            margin:
              12px
              0
              0 !important;
            padding:
              10px
              12px !important;
          }

          .native-formula {
            width:
              100% !important;
            max-width:
              100% !important;
            margin:
              8px
              0
              0 !important;
          }
        }
      `

      document.head.appendChild(
        compactStyle,
      )
    }

    const target =
      document.querySelector<HTMLElement>('.calculator-stage-body') ??
      document.querySelector<HTMLElement>('.calculator-stage') ??
      document.querySelector<HTMLElement>('.calculator-card.workbench') ??
      document.querySelector<HTMLElement>('.workbench') ??
      document.body

    const isMobile =
      window.matchMedia('(max-width: 700px)').matches

    const fieldHorizontalInset =
      isMobile ? '16px' : '28px'

    const fieldControls =
      document.querySelectorAll<
        HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
      >('input, select, textarea')

    fieldControls.forEach((control) => {
      const fieldContainer =
        control.closest<HTMLElement>('label') ??
        control.parentElement?.parentElement

      if (!fieldContainer) {
        return
      }

      fieldContainer.style.width = '100%'
      fieldContainer.style.maxWidth = '100%'
      fieldContainer.style.paddingLeft =
        fieldHorizontalInset
      fieldContainer.style.paddingRight =
        fieldHorizontalInset
      fieldContainer.style.boxSizing =
        'border-box'
    })


    /*
     * PHASE 2.3
     * Real legacy Reynolds layout.
     *
     * The bundled legacy calculator uses:
     *   .input-grid
     *   .input-shell
     *
     * Do not use the old .native-input-* selectors here.
     */
    const phase23ReynoldsStyleId =
      'cheme-phase-2-3-real-reynolds-grid'

    let phase23ReynoldsStyle =
      document.getElementById(
        phase23ReynoldsStyleId,
      ) as HTMLStyleElement | null

    if (!phase23ReynoldsStyle) {
      phase23ReynoldsStyle =
        document.createElement('style')

      phase23ReynoldsStyle.id =
        phase23ReynoldsStyleId

      document.head.appendChild(
        phase23ReynoldsStyle,
      )
    }

    phase23ReynoldsStyle.textContent =
      calculatorId === 'reynoldsNumber'
        ? `
          @media (min-width: 520px) {
            .input-grid {
              display: grid !important;
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                ) !important;
              gap: 14px 18px !important;

              width: 100% !important;
              max-width: 100% !important;

              padding-right: 28px !important;
              padding-left: 28px !important;

              margin: 0 !important;
              box-sizing: border-box !important;
            }

            .input-grid label {
              display: grid !important;
              grid-template-columns:
                minmax(0, 1fr) !important;

              gap: 6px !important;

              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;

              padding: 0 !important;
              margin: 0 !important;

              box-sizing: border-box !important;
            }

            .input-grid
            label > span:first-child {
              display: block !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;

              line-height: 1.25 !important;
            }

            .input-shell {
              display: grid !important;

              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;

              box-sizing: border-box !important;
            }

            .input-shell input,
            .input-shell select {
              width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
            }

            .calculate-button {
              width:
                calc(100% - 56px) !important;

              margin:
                18px 28px !important;

              box-sizing: border-box !important;
            }
          }
        `
        : ''

    const alignedSections =
      document.querySelectorAll<HTMLElement>(
        [
          '.native-actions',
          '.native-result-panel',
          '.native-formula',
        ].join(','),
      )

    alignedSections.forEach((section) => {
      section.style.width = isMobile
        ? 'calc(100% - 32px)'
        : 'calc(100% - 56px)'

      section.style.maxWidth = section.style.width
      section.style.marginLeft =
        fieldHorizontalInset
      section.style.marginRight =
        fieldHorizontalInset
      section.style.boxSizing = 'border-box'
    })

    target.style.boxSizing = 'border-box'
    target.style.width = '100%'
    target.style.maxWidth = '100%'

    target.style.padding = isMobile
      ? '20px 18px 26px'
      : '0'

    const measuredHeight = Math.ceil(
      Math.max(
        target.scrollHeight,
        target.getBoundingClientRect().height,
        document.documentElement.scrollHeight,
      ),
    )

    const nextHeight = Math.min(
      MAXIMUM_FRAME_HEIGHT,
      Math.max(MINIMUM_FRAME_HEIGHT, measuredHeight),
    )

    setFrameHeight((currentHeight) =>
      Math.abs(currentHeight - nextHeight) > 2 ? nextHeight : currentHeight,
    )
  }, [calculatorId])

  const connectObservers = useCallback(() => {
    resizeObserverRef.current?.disconnect()
    mutationObserverRef.current?.disconnect()

    const document = frameRef.current?.contentDocument
    if (!document) return

    const target =
      document.querySelector<HTMLElement>('.calculator-stage-body') ??
      document.querySelector<HTMLElement>('.calculator-stage') ??
      document.querySelector<HTMLElement>('.calculator-card.workbench') ??
      document.querySelector<HTMLElement>('.workbench') ??
      document.body

    resizeObserverRef.current = new ResizeObserver(synchronizeFrame)
    resizeObserverRef.current.observe(target)

    mutationObserverRef.current = new MutationObserver(synchronizeFrame)
    mutationObserverRef.current.observe(target, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })

    synchronizeFrame()
  }, [synchronizeFrame])

  function handleLoad() {
    synchronizeFrame()
    connectObservers()
    window.setTimeout(synchronizeFrame, 80)
    window.setTimeout(synchronizeFrame, 260)
    window.setTimeout(synchronizeFrame, 700)
  }

  useEffect(() => {
    setFrameHeight(MINIMUM_FRAME_HEIGHT)
    return () => {
      resizeObserverRef.current?.disconnect()
      mutationObserverRef.current?.disconnect()
    }
  }, [calculatorId])

  return (
    <div className="legacy-workbench">
      <iframe
        ref={frameRef}
        className="legacy-frame"
        src={source}
        title={`${title} calculator`}
        style={{ height: `${frameHeight}px` }}
        onLoad={handleLoad}
      />
    </div>
  )
}
