import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import '../styles/workspace-metadata.css'

const CALCULATIONS_KEY =
  'cheme-toolkit.saved-calculations.v1'

const COMPARISONS_KEY =
  'cheme-toolkit.saved-comparisons.v1'

const CALCULATIONS_EVENT =
  'cheme-toolkit:saved-calculations-changed'

const COMPARISONS_EVENT =
  'cheme-toolkit:saved-comparisons-changed'

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const MAX_TAGS = 12
const MAX_TAG_LENGTH = 24

type RecordType =
  | 'calculation'
  | 'comparison'

type Status =
  | 'idle'
  | 'saved'
  | 'cleared'
  | 'tag-limit'
  | 'duplicate'
  | 'error'

interface WorkspaceRecord {
  id: string
  name: string
  calculatorTitle: string
  category: string
  createdAt: string
  tags: string[]
  text: string
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

function readArray(
  key: string,
): unknown[] {
  try {
    const raw =
      localStorage.getItem(key)

    if (!raw) {
      return []
    }

    const parsed: unknown =
      JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch {
    return []
  }
}

function normalizeTags(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const seen =
    new Set<string>()

  return value
    .filter(
      (tag): tag is string =>
        typeof tag === 'string',
    )
    .map((tag) =>
      tag.trim().slice(
        0,
        MAX_TAG_LENGTH,
      ),
    )
    .filter((tag) => {
      if (!tag) {
        return false
      }

      const key =
        tag.toLocaleLowerCase(
          'en-US',
        )

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
    .slice(0, MAX_TAGS)
}

function readWorkspaceRecords(
  type: RecordType,
): WorkspaceRecord[] {
  const storageKey =
    type === 'calculation'
      ? CALCULATIONS_KEY
      : COMPARISONS_KEY

  return readArray(storageKey)
    .flatMap((value) => {
      if (!isRecord(value)) {
        return []
      }

      if (
        typeof value.id !==
          'string' ||
        typeof value.name !==
          'string' ||
        typeof value.calculatorTitle !==
          'string' ||
        typeof value.category !==
          'string' ||
        typeof value.createdAt !==
          'string'
      ) {
        return []
      }

      const text =
        type === 'comparison'
          ? (
              typeof value.description ===
              'string'
                ? value.description
                : typeof value.notes ===
                    'string'
                  ? value.notes
                  : ''
            )
          : (
              typeof value.notes ===
              'string'
                ? value.notes
                : ''
            )

      return [{
        id: value.id,
        name: value.name,
        calculatorTitle:
          value.calculatorTitle,
        category:
          value.category,
        createdAt:
          value.createdAt,
        tags:
          normalizeTags(
            value.tags,
          ),
        text,
      }]
    })
    .sort(
      (first, second) =>
        Date.parse(
          second.createdAt,
        ) -
        Date.parse(
          first.createdAt,
        ),
    )
}

function formatDate(
  value: string,
): string {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(
    'tr-TR',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

export function WorkspaceMetadataPanel() {
  const [
    recordType,
    setRecordType,
  ] = useState<RecordType>(
    'calculation',
  )

  const [
    records,
    setRecords,
  ] = useState<WorkspaceRecord[]>(
    () =>
      readWorkspaceRecords(
        'calculation',
      ),
  )

  const [
    selectedId,
    setSelectedId,
  ] = useState('')

  const [
    query,
    setQuery,
  ] = useState('')

  const [
    draftTags,
    setDraftTags,
  ] = useState<string[]>([])

  const [
    tagInput,
    setTagInput,
  ] = useState('')

  const [
    draftText,
    setDraftText,
  ] = useState('')

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const selectedRecord =
    useMemo(
      () =>
        records.find(
          (record) =>
            record.id ===
            selectedId,
        ) ?? null,
      [
        records,
        selectedId,
      ],
    )

  const filteredRecords =
    useMemo(() => {
      const search =
        query
          .trim()
          .toLocaleLowerCase(
            'en-US',
          )

      if (!search) {
        return records
      }

      return records.filter(
        (record) =>
          [
            record.name,
            record.calculatorTitle,
            record.category,
            record.text,
            ...record.tags,
          ]
            .join(' ')
            .toLocaleLowerCase(
              'en-US',
            )
            .includes(search),
      )
    }, [
      records,
      query,
    ])

  function refreshRecords(
    type: RecordType =
      recordType,
  ) {
    const nextRecords =
      readWorkspaceRecords(type)

    setRecords(nextRecords)

    setSelectedId(
      (current) =>
        nextRecords.some(
          (record) =>
            record.id === current,
        )
          ? current
          : nextRecords[0]?.id ??
            '',
    )
  }

  useEffect(() => {
    const nextRecords =
      readWorkspaceRecords(
        recordType,
      )

    setRecords(nextRecords)
    setSelectedId(
      nextRecords[0]?.id ?? '',
    )
    setQuery('')
  }, [recordType])

  useEffect(() => {
    setDraftTags(
      selectedRecord?.tags ?? [],
    )

    setDraftText(
      selectedRecord?.text ?? '',
    )

    setTagInput('')
  }, [selectedRecord])

  useEffect(() => {
    function handleDataChange() {
      refreshRecords()
    }

    window.addEventListener(
      CALCULATIONS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      COMPARISONS_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      PERSONAL_DATA_EVENT,
      handleDataChange,
    )

    window.addEventListener(
      'storage',
      handleDataChange,
    )

    window.addEventListener(
      'focus',
      handleDataChange,
    )

    return () => {
      window.removeEventListener(
        CALCULATIONS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        COMPARISONS_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        PERSONAL_DATA_EVENT,
        handleDataChange,
      )

      window.removeEventListener(
        'storage',
        handleDataChange,
      )

      window.removeEventListener(
        'focus',
        handleDataChange,
      )
    }
  }, [recordType])

  useEffect(() => {
    if (status === 'idle') {
      return
    }

    const timer =
      window.setTimeout(
        () =>
          setStatus('idle'),
        2600,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function addTag() {
    const tag =
      tagInput
        .trim()
        .replace(/\s+/g, ' ')
        .slice(
          0,
          MAX_TAG_LENGTH,
        )

    if (!tag) {
      return
    }

    if (
      draftTags.length >=
      MAX_TAGS
    ) {
      setStatus('tag-limit')
      return
    }

    const duplicate =
      draftTags.some(
        (currentTag) =>
          currentTag.toLocaleLowerCase(
            'en-US',
          ) ===
          tag.toLocaleLowerCase(
            'en-US',
          ),
      )

    if (duplicate) {
      setStatus('duplicate')
      return
    }

    setDraftTags(
      (current) => [
        ...current,
        tag,
      ],
    )

    setTagInput('')
  }

  function removeTag(
    tag: string,
  ) {
    setDraftTags(
      (current) =>
        current.filter(
          (currentTag) =>
            currentTag !== tag,
        ),
    )
  }

  function persistMetadata(
    clear = false,
  ) {
    if (!selectedRecord) {
      setStatus('error')
      return
    }

    const storageKey =
      recordType ===
      'calculation'
        ? CALCULATIONS_KEY
        : COMPARISONS_KEY

    const stored =
      readArray(storageKey)

    const next =
      stored.map((value) => {
        if (
          !isRecord(value) ||
          value.id !==
            selectedRecord.id
        ) {
          return value
        }

        const tags =
          clear
            ? []
            : draftTags

        const text =
          clear
            ? ''
            : draftText.trim()

        if (
          recordType ===
          'comparison'
        ) {
          return {
            ...value,
            tags,
            description: text,
          }
        }

        return {
          ...value,
          tags,
          notes: text,
        }
      })

    localStorage.setItem(
      storageKey,
      JSON.stringify(next),
    )

    window.dispatchEvent(
      new Event(
        recordType ===
        'calculation'
          ? CALCULATIONS_EVENT
          : COMPARISONS_EVENT,
      ),
    )

    window.dispatchEvent(
      new Event(
        PERSONAL_DATA_EVENT,
      ),
    )

    refreshRecords()

    setStatus(
      clear
        ? 'cleared'
        : 'saved',
    )
  }

  function clearMetadata() {
    if (!selectedRecord) {
      return
    }

    const confirmed =
      window.confirm(
        `Clear tags and ${
          recordType ===
          'comparison'
            ? 'description'
            : 'notes'
        } for "${selectedRecord.name}"?`,
      )

    if (!confirmed) {
      return
    }

    setDraftTags([])
    setDraftText('')
    persistMetadata(true)
  }

  return (
    <section
      className="workspace-metadata-panel"
      aria-label="Workspace tags and notes"
    >
      <div className="workspace-metadata-header">
        <div>
          <span>
            Record organization
          </span>

          <h3>
            Tags & notes
          </h3>

          <p>
            Add searchable tags, engineering
            notes and comparison descriptions
            to saved workspace records.
          </p>
        </div>

        <div className="workspace-metadata-summary">
          <strong>
            {records.length}
          </strong>

          <span>
            {recordType ===
            'calculation'
              ? 'saved calculations'
              : 'comparison snapshots'}
          </span>
        </div>
      </div>

      <div className="workspace-metadata-type-switch">
        <button
          type="button"
          className={
            recordType ===
            'calculation'
              ? 'is-active'
              : ''
          }
          onClick={() =>
            setRecordType(
              'calculation',
            )
          }
        >
          Saved calculations
        </button>

        <button
          type="button"
          className={
            recordType ===
            'comparison'
              ? 'is-active'
              : ''
          }
          onClick={() =>
            setRecordType(
              'comparison',
            )
          }
        >
          Comparison snapshots
        </button>
      </div>

      <div className="workspace-metadata-layout">
        <aside className="workspace-metadata-records">
          <label>
            <span>
              Find a record
            </span>

            <input
              type="search"
              value={query}
              placeholder="Search saved records…"
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
            />
          </label>

          <div className="workspace-metadata-record-list">
            {filteredRecords.length ===
            0 ? (
              <div className="workspace-metadata-empty">
                No matching records.
              </div>
            ) : (
              filteredRecords.map(
                (record) => (
                  <button
                    key={record.id}
                    type="button"
                    className={
                      selectedId ===
                      record.id
                        ? 'is-selected'
                        : ''
                    }
                    onClick={() =>
                      setSelectedId(
                        record.id,
                      )
                    }
                  >
                    <span>
                      {record.category}
                    </span>

                    <strong>
                      {record.name}
                    </strong>

                    <small>
                      {
                        record.calculatorTitle
                      }
                    </small>

                    <small>
                      {record.tags.length}{' '}
                      tag
                      {record.tags.length ===
                      1
                        ? ''
                        : 's'}{' '}
                      ·{' '}
                      {formatDate(
                        record.createdAt,
                      )}
                    </small>
                  </button>
                ),
              )
            )}
          </div>
        </aside>

        <div className="workspace-metadata-editor">
          {selectedRecord ? (
            <>
              <header>
                <div>
                  <span>
                    {recordType ===
                    'calculation'
                      ? 'Saved calculation'
                      : 'Comparison snapshot'}
                  </span>

                  <h4>
                    {
                      selectedRecord.name
                    }
                  </h4>

                  <p>
                    {
                      selectedRecord.calculatorTitle
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="workspace-metadata-clear"
                  onClick={
                    clearMetadata
                  }
                >
                  Clear metadata
                </button>
              </header>

              <div className="workspace-tag-editor">
                <label>
                  <span>
                    Add tag
                  </span>

                  <div>
                    <input
                      type="text"
                      value={tagInput}
                      placeholder="Example: validation"
                      maxLength={
                        MAX_TAG_LENGTH
                      }
                      onChange={(
                        event,
                      ) =>
                        setTagInput(
                          event.target.value,
                        )
                      }
                      onKeyDown={(
                        event,
                      ) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          event.preventDefault()
                          addTag()
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={addTag}
                    >
                      Add tag
                    </button>
                  </div>
                </label>

                <div className="workspace-tag-list">
                  {draftTags.length ===
                  0 ? (
                    <span className="workspace-tag-empty">
                      No tags added.
                    </span>
                  ) : (
                    draftTags.map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            removeTag(tag)
                          }
                          title={`Remove ${tag}`}
                        >
                          <span>
                            {tag}
                          </span>

                          <strong
                            aria-hidden="true"
                          >
                            ×
                          </strong>
                        </button>
                      ),
                    )
                  )}
                </div>

                <small>
                  Maximum {MAX_TAGS} tags,
                  {` ${MAX_TAG_LENGTH} `}
                  characters each.
                </small>
              </div>

              <label className="workspace-metadata-notes">
                <span>
                  {recordType ===
                  'comparison'
                    ? 'Comparison description'
                    : 'Engineering notes'}
                </span>

                <textarea
                  value={draftText}
                  rows={8}
                  maxLength={2500}
                  placeholder={
                    recordType ===
                    'comparison'
                      ? 'Describe the cases, baseline and conclusion…'
                      : 'Record assumptions, checks, limitations and next steps…'
                  }
                  onChange={(event) =>
                    setDraftText(
                      event.target.value,
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="workspace-metadata-save"
                onClick={() =>
                  persistMetadata()
                }
              >
                Save tags & notes
              </button>
            </>
          ) : (
            <div className="workspace-metadata-empty workspace-metadata-empty-large">
              <strong>
                No saved records available
              </strong>

              <p>
                Save a calculation or comparison
                snapshot before adding metadata.
              </p>
            </div>
          )}
        </div>
      </div>

      <p
        className="workspace-metadata-status"
        aria-live="polite"
      >
        {status === 'saved'
          ? 'Tags and notes saved.'
          : null}

        {status === 'cleared'
          ? 'Record metadata cleared.'
          : null}

        {status === 'tag-limit'
          ? `A record can contain up to ${MAX_TAGS} tags.`
          : null}

        {status === 'duplicate'
          ? 'This tag already exists.'
          : null}

        {status === 'error'
          ? 'Select a record before saving metadata.'
          : null}
      </p>
    </section>
  )
}
