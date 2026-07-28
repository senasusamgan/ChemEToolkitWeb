import {
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent } from 'react'
import '../styles/personal-data-backup.css'

const BACKUP_SCHEMA =
  'cheme-toolkit-personal-data'

const BACKUP_VERSION = 1

const MAX_BACKUP_SIZE =
  10 * 1024 * 1024

const STORAGE_KEYS = {
  favorites:
    'cheme-toolkit-favorites-v1',

  recent:
    'cheme-toolkit-recent-v1',

  calculations:
    'cheme-toolkit.saved-calculations.v1',

  comparisons:
    'cheme-toolkit.saved-comparisons.v1',

  projects:
    'cheme-toolkit.project-workspaces.v1',

  activeTab:
    'cheme-toolkit.workspace-active-tab.v1',

  pendingRestore:
    'cheme-toolkit.pending-calculation-restore.v1',
} as const

const PERSONAL_DATA_EVENT =
  'cheme-toolkit:personal-data-changed'

const REFRESH_EVENTS = [
  PERSONAL_DATA_EVENT,
  'cheme-toolkit:saved-calculations-changed',
  'cheme-toolkit:saved-comparisons-changed',
  'cheme-toolkit:project-workspaces-changed',
]

const VALID_WORKSPACE_TABS = [
  'records',
  'compare',
  'projects',
  'data',
  'search',
  'metadata',
] as const

type WorkspaceTabId =
  (typeof VALID_WORKSPACE_TABS)[number]

type ImportMode =
  | 'merge'
  | 'replace'

type Status =
  | 'idle'
  | 'exported'
  | 'file-ready'
  | 'imported'
  | 'cleared'
  | 'invalid'
  | 'error'

interface BackupData {
  favorites: string[]
  recent: string[]
  savedCalculations: unknown[]
  savedComparisons: unknown[]
  projects: unknown[]
  activeWorkspaceTab: WorkspaceTabId
}

interface BackupFile {
  schema: typeof BACKUP_SCHEMA
  version: typeof BACKUP_VERSION
  app: 'ChemE Toolkit Web'
  exportedAt: string
  data: BackupData
}

interface DataSummary {
  favorites: number
  recent: number
  calculations: number
  comparisons: number
  projects: number
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

function readStringArray(
  key: string,
): string[] {
  return readArray(key).filter(
    (value): value is string =>
      typeof value === 'string',
  )
}

function readWorkspaceTab():
  WorkspaceTabId {
  const stored =
    localStorage.getItem(
      STORAGE_KEYS.activeTab,
    )

  return VALID_WORKSPACE_TABS.includes(
    stored as WorkspaceTabId,
  )
    ? stored as WorkspaceTabId
    : 'records'
}

function readCurrentData():
  BackupData {
  return {
    favorites:
      readStringArray(
        STORAGE_KEYS.favorites,
      ),

    recent:
      readStringArray(
        STORAGE_KEYS.recent,
      ),

    savedCalculations:
      readArray(
        STORAGE_KEYS.calculations,
      ),

    savedComparisons:
      readArray(
        STORAGE_KEYS.comparisons,
      ),

    projects:
      readArray(
        STORAGE_KEYS.projects,
      ),

    activeWorkspaceTab:
      readWorkspaceTab(),
  }
}

function createSummary(
  data: BackupData,
): DataSummary {
  return {
    favorites:
      data.favorites.length,

    recent:
      data.recent.length,

    calculations:
      data.savedCalculations.length,

    comparisons:
      data.savedComparisons.length,

    projects:
      data.projects.length,
  }
}

function createBackupFile():
  BackupFile {
  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    app: 'ChemE Toolkit Web',
    exportedAt:
      new Date().toISOString(),
    data: readCurrentData(),
  }
}

function parseBackupFile(
  value: unknown,
): BackupFile | null {
  if (!isRecord(value)) {
    return null
  }

  if (
    value.schema !==
      BACKUP_SCHEMA ||
    value.version !==
      BACKUP_VERSION ||
    value.app !==
      'ChemE Toolkit Web'
  ) {
    return null
  }

  if (
    typeof value.exportedAt !==
      'string' ||
    !isRecord(value.data)
  ) {
    return null
  }

  const data = value.data

  if (
    !Array.isArray(
      data.favorites,
    ) ||
    !data.favorites.every(
      (item) =>
        typeof item === 'string',
    ) ||
    !Array.isArray(
      data.recent,
    ) ||
    !data.recent.every(
      (item) =>
        typeof item === 'string',
    ) ||
    !Array.isArray(
      data.savedCalculations,
    ) ||
    !Array.isArray(
      data.savedComparisons,
    ) ||
    !Array.isArray(
      data.projects,
    ) ||
    typeof data.activeWorkspaceTab !==
      'string'
  ) {
    return null
  }

  const activeWorkspaceTab =
    VALID_WORKSPACE_TABS.includes(
      data.activeWorkspaceTab as WorkspaceTabId,
    )
      ? data.activeWorkspaceTab as WorkspaceTabId
      : 'records'

  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    app: 'ChemE Toolkit Web',
    exportedAt:
      value.exportedAt,
    data: {
      favorites:
        data.favorites as string[],

      recent:
        data.recent as string[],

      savedCalculations:
        data.savedCalculations,

      savedComparisons:
        data.savedComparisons,

      projects:
        data.projects,

      activeWorkspaceTab,
    },
  }
}

function mergeStringIds(
  current: string[],
  imported: string[],
  maximum?: number,
): string[] {
  const merged =
    Array.from(
      new Set([
        ...imported,
        ...current,
      ]),
    )

  return maximum
    ? merged.slice(0, maximum)
    : merged
}

function getRecordId(
  value: unknown,
): string | null {
  if (!isRecord(value)) {
    return null
  }

  return typeof value.id === 'string'
    ? value.id
    : null
}

function mergeRecords(
  current: unknown[],
  imported: unknown[],
): unknown[] {
  const result =
    [...current]

  const indexById =
    new Map<string, number>()

  result.forEach(
    (item, index) => {
      const id =
        getRecordId(item)

      if (id) {
        indexById.set(
          id,
          index,
        )
      }
    },
  )

  imported.forEach((item) => {
    const id =
      getRecordId(item)

    if (!id) {
      result.push(item)
      return
    }

    const existingIndex =
      indexById.get(id)

    if (
      existingIndex === undefined
    ) {
      indexById.set(
        id,
        result.length,
      )

      result.push(item)
      return
    }

    result[existingIndex] =
      item
  })

  return result
}

function writeData(
  data: BackupData,
) {
  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify(
      data.favorites,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.recent,
    JSON.stringify(
      data.recent.slice(0, 5),
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.calculations,
    JSON.stringify(
      data.savedCalculations,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.comparisons,
    JSON.stringify(
      data.savedComparisons,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.projects,
    JSON.stringify(
      data.projects,
    ),
  )

  localStorage.setItem(
    STORAGE_KEYS.activeTab,
    data.activeWorkspaceTab,
  )
}

function dispatchDataEvents() {
  window.dispatchEvent(
    new Event(
      PERSONAL_DATA_EVENT,
    ),
  )

  window.dispatchEvent(
    new Event(
      'cheme-toolkit:saved-calculations-changed',
    ),
  )

  window.dispatchEvent(
    new Event(
      'cheme-toolkit:saved-comparisons-changed',
    ),
  )

  window.dispatchEvent(
    new Event(
      'cheme-toolkit:project-workspaces-changed',
    ),
  )
}

function downloadBackup(
  backup: BackupFile,
) {
  const json =
    JSON.stringify(
      backup,
      null,
      2,
    )

  const blob =
    new Blob(
      [json],
      {
        type:
          'application/json;charset=utf-8',
      },
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  const date =
    new Date()
      .toISOString()
      .slice(0, 10)

  link.href = url
  link.download =
    `cheme-toolkit-backup-${date}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function PersonalDataBackupPanel() {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    )

  const [
    currentSummary,
    setCurrentSummary,
  ] = useState<DataSummary>(
    () =>
      createSummary(
        readCurrentData(),
      ),
  )

  const [
    pendingBackup,
    setPendingBackup,
  ] = useState<BackupFile | null>(
    null,
  )

  const [
    importMode,
    setImportMode,
  ] = useState<ImportMode>(
    'merge',
  )

  const [
    status,
    setStatus,
  ] = useState<Status>(
    'idle',
  )

  const [
    isReading,
    setIsReading,
  ] = useState(false)

  useEffect(() => {
    function refreshSummary() {
      setCurrentSummary(
        createSummary(
          readCurrentData(),
        ),
      )
    }

    REFRESH_EVENTS.forEach(
      (eventName) => {
        window.addEventListener(
          eventName,
          refreshSummary,
        )
      },
    )

    window.addEventListener(
      'storage',
      refreshSummary,
    )

    window.addEventListener(
      'focus',
      refreshSummary,
    )

    return () => {
      REFRESH_EVENTS.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            refreshSummary,
          )
        },
      )

      window.removeEventListener(
        'storage',
        refreshSummary,
      )

      window.removeEventListener(
        'focus',
        refreshSummary,
      )
    }
  }, [])

  useEffect(() => {
    if (
      status === 'idle' ||
      status === 'file-ready'
    ) {
      return
    }

    const timer =
      window.setTimeout(
        () => setStatus('idle'),
        3000,
      )

    return () =>
      window.clearTimeout(timer)
  }, [status])

  function handleExport() {
    const backup =
      createBackupFile()

    downloadBackup(backup)

    setCurrentSummary(
      createSummary(
        backup.data,
      ),
    )

    setStatus('exported')
  }

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    if (
      file.size >
      MAX_BACKUP_SIZE
    ) {
      setPendingBackup(null)
      setStatus('invalid')
      return
    }

    setIsReading(true)

    try {
      const content =
        await file.text()

      const parsed: unknown =
        JSON.parse(content)

      const backup =
        parseBackupFile(parsed)

      if (!backup) {
        setPendingBackup(null)
        setStatus('invalid')
        return
      }

      setPendingBackup(backup)
      setStatus('file-ready')
    } catch {
      setPendingBackup(null)
      setStatus('invalid')
    } finally {
      setIsReading(false)
    }
  }

  function handleImport() {
    if (!pendingBackup) {
      setStatus('error')
      return
    }

    const imported =
      pendingBackup.data

    let nextData:
      BackupData

    if (
      importMode === 'replace'
    ) {
      nextData = {
        ...imported,
        recent:
          imported.recent.slice(
            0,
            5,
          ),
      }
    } else {
      const current =
        readCurrentData()

      nextData = {
        favorites:
          mergeStringIds(
            current.favorites,
            imported.favorites,
          ),

        recent:
          mergeStringIds(
            current.recent,
            imported.recent,
            5,
          ),

        savedCalculations:
          mergeRecords(
            current.savedCalculations,
            imported.savedCalculations,
          ),

        savedComparisons:
          mergeRecords(
            current.savedComparisons,
            imported.savedComparisons,
          ),

        projects:
          mergeRecords(
            current.projects,
            imported.projects,
          ),

        activeWorkspaceTab:
          imported.activeWorkspaceTab,
      }
    }

    writeData(nextData)

    sessionStorage.removeItem(
      STORAGE_KEYS.pendingRestore,
    )

    dispatchDataEvents()

    setCurrentSummary(
      createSummary(nextData),
    )

    setPendingBackup(null)
    setStatus('imported')
  }

  function handleClearAll() {
    const confirmed =
      window.confirm(
        'Delete all ChemE Toolkit personal data stored in this browser? This includes favorites, recent calculators, saved calculations, comparisons and projects.',
      )

    if (!confirmed) {
      return
    }

    Object.values(
      STORAGE_KEYS,
    ).forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })

    dispatchDataEvents()

    setPendingBackup(null)
    setCurrentSummary(
      createSummary(
        readCurrentData(),
      ),
    )

    setStatus('cleared')
  }

  const pendingSummary =
    pendingBackup
      ? createSummary(
          pendingBackup.data,
        )
      : null

  return (
    <section
      className="personal-data-backup-panel"
      aria-label="Personal data backup and restore"
    >
      <div className="personal-data-backup-header">
        <div>
          <span>
            Browser data management
          </span>

          <h3>
            Backup & restore
          </h3>

          <p>
            Export your personal ChemE Toolkit
            workspace as one JSON file or
            restore it in another browser.
          </p>
        </div>

        <div className="personal-data-privacy-note">
          <span aria-hidden="true">
            ◇
          </span>

          <p>
            Your workspace data is stored
            locally in this browser. It is not
            uploaded to a ChemE Toolkit server.
          </p>
        </div>
      </div>

      <div className="personal-data-summary-grid">
        <article>
          <strong>
            {currentSummary.favorites}
          </strong>

          <span>
            Favorites
          </span>
        </article>

        <article>
          <strong>
            {currentSummary.recent}
          </strong>

          <span>
            Recent tools
          </span>
        </article>

        <article>
          <strong>
            {currentSummary.calculations}
          </strong>

          <span>
            Calculations
          </span>
        </article>

        <article>
          <strong>
            {currentSummary.comparisons}
          </strong>

          <span>
            Comparisons
          </span>
        </article>

        <article>
          <strong>
            {currentSummary.projects}
          </strong>

          <span>
            Projects
          </span>
        </article>
      </div>

      <div className="personal-data-action-grid">
        <article className="personal-data-action-card">
          <div>
            <span>
              Step 01
            </span>

            <h4>
              Export a backup
            </h4>

            <p>
              Download favorites, recent tools,
              calculations, comparison
              snapshots, projects and workspace
              settings in one file.
            </p>
          </div>

          <button
            type="button"
            className="personal-data-primary-button"
            onClick={handleExport}
          >
            ↓ Download JSON backup
          </button>
        </article>

        <article className="personal-data-action-card">
          <div>
            <span>
              Step 02
            </span>

            <h4>
              Select a backup file
            </h4>

            <p>
              Only compatible ChemE Toolkit
              backup files are accepted. The
              file is checked before anything
              is changed.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="personal-data-file-input"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={isReading}
          >
            {isReading
              ? 'Reading file…'
              : 'Choose backup file'}
          </button>
        </article>
      </div>

      {pendingBackup &&
      pendingSummary ? (
        <div className="personal-data-import-preview">
          <header>
            <div>
              <span>
                Import preview
              </span>

              <h4>
                Compatible backup found
              </h4>

              <p>
                Exported{' '}
                {new Intl.DateTimeFormat(
                  'tr-TR',
                  {
                    dateStyle:
                      'medium',
                    timeStyle:
                      'short',
                  },
                ).format(
                  new Date(
                    pendingBackup.exportedAt,
                  ),
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPendingBackup(null)
                setStatus('idle')
              }}
            >
              Cancel
            </button>
          </header>

          <div className="personal-data-preview-counts">
            <span>
              <strong>
                {
                  pendingSummary.favorites
                }
              </strong>{' '}
              favorites
            </span>

            <span>
              <strong>
                {
                  pendingSummary.recent
                }
              </strong>{' '}
              recent
            </span>

            <span>
              <strong>
                {
                  pendingSummary.calculations
                }
              </strong>{' '}
              calculations
            </span>

            <span>
              <strong>
                {
                  pendingSummary.comparisons
                }
              </strong>{' '}
              comparisons
            </span>

            <span>
              <strong>
                {
                  pendingSummary.projects
                }
              </strong>{' '}
              projects
            </span>
          </div>

          <fieldset className="personal-data-import-mode">
            <legend>
              Import method
            </legend>

            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="merge"
                checked={
                  importMode === 'merge'
                }
                onChange={() =>
                  setImportMode(
                    'merge',
                  )
                }
              />

              <span>
                <strong>
                  Merge with current data
                </strong>

                <small>
                  Keep current records and add
                  or update matching backup
                  records.
                </small>
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="backup-import-mode"
                value="replace"
                checked={
                  importMode === 'replace'
                }
                onChange={() =>
                  setImportMode(
                    'replace',
                  )
                }
              />

              <span>
                <strong>
                  Replace current data
                </strong>

                <small>
                  Remove the current workspace
                  data and restore only this
                  backup.
                </small>
              </span>
            </label>
          </fieldset>

          <button
            type="button"
            className="personal-data-primary-button personal-data-restore-button"
            onClick={handleImport}
          >
            Restore this backup
          </button>
        </div>
      ) : null}

      <div className="personal-data-danger-zone">
        <div>
          <span>
            Local data reset
          </span>

          <h4>
            Clear personal workspace data
          </h4>

          <p>
            Calculator modules remain
            available. Only personal browser
            data created in ChemE Toolkit is
            removed.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearAll}
        >
          Clear all personal data
        </button>
      </div>

      <p
        className="personal-data-status"
        aria-live="polite"
      >
        {status === 'exported'
          ? 'Backup downloaded successfully.'
          : null}

        {status === 'file-ready'
          ? 'Backup file verified. Choose an import method.'
          : null}

        {status === 'imported'
          ? 'Personal workspace data restored successfully.'
          : null}

        {status === 'cleared'
          ? 'Personal workspace data cleared.'
          : null}

        {status === 'invalid'
          ? 'This file is not a compatible ChemE Toolkit backup.'
          : null}

        {status === 'error'
          ? 'The backup operation could not be completed.'
          : null}
      </p>
    </section>
  )
}
