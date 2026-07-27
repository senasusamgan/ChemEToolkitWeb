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
        html.cheme-parent-desktop
        body
        .calculator-stage
        .native-calculator {
          padding:
            18px
            20px
            22px !important;
        }

        html.cheme-parent-desktop
        body
        .native-calculator-header {
          gap: 12px !important;
        }

        html.cheme-parent-desktop
        body
        .native-icon {
          width: 46px !important;
          height: 46px !important;
          flex-basis: 46px !important;
          font-size: 1.25rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-calculator-header h2 {
          margin:
            2px
            0
            4px !important;
          font-size: 1.95rem !important;
          line-height: 1 !important;
        }

        html.cheme-parent-desktop
        body
        .native-calculator-header small,
        html.cheme-parent-desktop
        body
        .native-calculator-header p {
          font-size: 0.7rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-reference {
          margin:
            14px
            0
            12px !important;
          padding:
            11px
            13px !important;
          font-size: 0.72rem !important;
          line-height: 1.45 !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-grid {
          margin-top: 13px !important;
          gap: 10px !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-grid label {
          gap: 5px !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-grid label > span:first-child {
          margin-bottom: 0 !important;
          font-size: 0.78rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-shell {
          min-height: 42px !important;
          border-radius: 7px !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-shell input,
        html.cheme-parent-desktop
        body
        .native-input-shell select {
          min-height: 40px !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          font-size: 0.88rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-input-shell span {
          font-size: 0.76rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-actions {
          margin-top: 14px !important;
        }

        html.cheme-parent-desktop
        body
        .native-actions button {
          min-height: 44px !important;
          font-size: 0.86rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-result-panel {
          margin-top: 15px !important;
        }

        html.cheme-parent-desktop
        body
        .native-result-heading {
          padding:
            13px
            15px !important;
        }

        html.cheme-parent-desktop
        body
        .native-result-heading strong {
          font-size: 1.75rem !important;
        }

        html.cheme-parent-desktop
        body
        .native-result-grid article {
          min-height: 78px !important;
          padding:
            11px
            13px !important;
        }
      `

      document.head.appendChild(
        desktopStyle,
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

    target.style.boxSizing = 'border-box'
    target.style.width = '100%'
    target.style.maxWidth = '100%'
    target.style.padding = isMobile
      ? '20px 18px 26px'
      : '26px 30px 30px'

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
  }, [])

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
