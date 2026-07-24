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
        .calculator-switcher { display: none !important; }
        .calculator-card.workbench, .workbench {
          width: 100% !important;
          max-width: none !important;
          min-height: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #fffdfa !important;
        }
        .calculator-main { padding-top: 26px !important; }
        @media (max-width: 700px) {
          .calculator-main { padding: 22px 18px 24px !important; }
        }
      `
      document.head.appendChild(style)
    }

    const target =
      document.querySelector<HTMLElement>('.calculator-card.workbench') ??
      document.querySelector<HTMLElement>('.workbench') ??
      document.body

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
