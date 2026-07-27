import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { FormEvent } from 'react'
import '../styles/feedback.css'

interface FeedbackPanelProps {
  calculatorTitle: string
  calculatorCategory: string
}

type FeedbackType =
  | 'Bug report'
  | 'Calculator suggestion'
  | 'General feedback'

const FEEDBACK_EMAIL =
  'senasu.samgan@gmail.com'

export function FeedbackPanel({
  calculatorTitle,
  calculatorCategory,
}: FeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] =
    useState<FeedbackType>('General feedback')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [copyStatus, setCopyStatus] =
    useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )

      document.body.style.overflow =
        previousOverflow
    }
  }, [isOpen])

  const feedbackBody = useMemo(
    () =>
      [
        `Feedback type: ${feedbackType}`,
        `Name: ${name.trim() || 'Not provided'}`,
        `Email: ${email.trim() || 'Not provided'}`,
        '',
        'Current calculator:',
        `${calculatorTitle} — ${calculatorCategory}`,
        '',
        'Message:',
        message.trim(),
        '',
        'Technical context:',
        `Page: ${window.location.href}`,
        `Viewport: ${window.innerWidth} × ${window.innerHeight}`,
        `Date: ${new Date().toLocaleString()}`,
      ].join('\n'),
    [
      calculatorCategory,
      calculatorTitle,
      email,
      feedbackType,
      message,
      name,
    ],
  )

  function resetForm() {
    setFeedbackType('General feedback')
    setName('')
    setEmail('')
    setMessage('')
    setCopyStatus('idle')
  }

  function closePanel() {
    setIsOpen(false)
    setCopyStatus('idle')
  }

  async function copyFeedback() {
    try {
      await navigator.clipboard.writeText(
        feedbackBody,
      )

      setCopyStatus('copied')

      window.setTimeout(() => {
        setCopyStatus('idle')
      }, 2200)
    } catch {
      setCopyStatus('idle')
    }
  }

  async function submitFeedback(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!message.trim()) {
      return
    }

    await copyFeedback()

    const subject = encodeURIComponent(
      `[ChemE Toolkit] ${feedbackType}`,
    )

    const body = encodeURIComponent(
      feedbackBody,
    )

    window.location.href =
      `mailto:${FEEDBACK_EMAIL}` +
      `?subject=${subject}&body=${body}`
  }

  return (
    <>
      <button
        type="button"
        className="feedback-launcher"
        aria-label="Send feedback about ChemE Toolkit"
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true">✦</span>
        <span>Feedback</span>
      </button>

      {isOpen ? (
        <div
          className="feedback-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePanel()
            }
          }}
        >
          <section
            className="feedback-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            <header className="feedback-header">
              <div>
                <p>Help improve ChemE Toolkit</p>
                <h2 id="feedback-title">
                  Share your feedback
                </h2>
              </div>

              <button
                type="button"
                className="feedback-close"
                aria-label="Close feedback form"
                onClick={closePanel}
              >
                ×
              </button>
            </header>

            <form
              className="feedback-form"
              onSubmit={submitFeedback}
            >
              <label>
                <span>Feedback type</span>
                <select
                  value={feedbackType}
                  onChange={(event) =>
                    setFeedbackType(
                      event.target
                        .value as FeedbackType,
                    )
                  }
                >
                  <option>General feedback</option>
                  <option>Bug report</option>
                  <option>
                    Calculator suggestion
                  </option>
                </select>
              </label>

              <div className="feedback-two-column">
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Optional"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="Optional"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />
                </label>
              </div>

              <label>
                <span>Current calculator</span>
                <input
                  type="text"
                  readOnly
                  value={`${calculatorTitle} — ${calculatorCategory}`}
                />
              </label>

              <label>
                <span>Your feedback</span>
                <textarea
                  required
                  rows={6}
                  maxLength={2000}
                  placeholder="Describe the issue, suggestion or improvement..."
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                />
                <small>
                  {message.length}/2000 characters
                </small>
              </label>

              <div className="feedback-actions">
                <button
                  type="button"
                  className="feedback-secondary"
                  onClick={copyFeedback}
                  disabled={!message.trim()}
                >
                  {copyStatus === 'copied'
                    ? 'Copied'
                    : 'Copy feedback'}
                </button>

                <button
                  type="submit"
                  className="feedback-primary"
                  disabled={!message.trim()}
                >
                  Prepare email
                </button>
              </div>

              <p className="feedback-note">
                Your default email application will
                open with the feedback details
                prepared. The same text is copied to
                your clipboard as a fallback.
              </p>
            </form>

            <footer className="feedback-dialog-footer">
              <button
                type="button"
                onClick={resetForm}
              >
                Clear form
              </button>

              <span>
                Escape closes this window
              </span>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  )
}
