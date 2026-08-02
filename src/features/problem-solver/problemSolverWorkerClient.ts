import type {
  ProblemSolverMatch,
} from './problemSolverEngine'

export interface ProblemSolverWorkerRequest {
  requestId: number
  query: string
  limit: number
}

export interface ProblemSolverWorkerResponse {
  requestId: number
  matches:
    ProblemSolverMatch[]
  elapsedMs: number
  error?: string
}

export type ProblemSolverWorkerExecutionMode =
  | 'worker'
  | 'fallback'
  | 'cache'

export interface ProblemSolverWorkerResult {
  matches:
    ProblemSolverMatch[]
  elapsedMs: number
  executionMode:
    ProblemSolverWorkerExecutionMode
}

interface PendingWorkerRequest {
  resolve: (
    value:
      ProblemSolverWorkerResult,
  ) => void
  reject: (
    reason?: unknown,
  ) => void
  timeout:
    ReturnType<
      typeof setTimeout
    >
}

const RESULT_CACHE_LIMIT =
  32

const WORKER_TIMEOUT_MS =
  12000

let sharedWorker:
  Worker | null =
    null

let nextRequestId =
  1

const pendingRequests =
  new Map<
    number,
    PendingWorkerRequest
  >()

const inFlightRequests =
  new Map<
    string,
    Promise<
      ProblemSolverWorkerResult
    >
  >()

const resultCache =
  new Map<
    string,
    ProblemSolverWorkerResult
  >()

function currentTime():
  number {
  return (
    typeof performance !==
      'undefined' &&
    typeof performance.now ===
      'function'
      ? performance.now()
      : Date.now()
  )
}

function createCacheKey(
  query: string,
  limit: number,
): string {
  return [
    limit,
    query
      .trim()
      .replace(
        /\s+/g,
        ' ',
      ),
  ].join(
    '::',
  )
}

function cacheResult(
  cacheKey: string,
  result:
    ProblemSolverWorkerResult,
) {
  resultCache.delete(
    cacheKey,
  )

  resultCache.set(
    cacheKey,
    result,
  )

  while (
    resultCache.size >
    RESULT_CACHE_LIMIT
  ) {
    const oldestKey =
      resultCache
        .keys()
        .next()
        .value

    if (
      typeof oldestKey !==
      'string'
    ) {
      break
    }

    resultCache.delete(
      oldestKey,
    )
  }
}

function rejectPendingRequests(
  reason: Error,
) {
  for (
    const pendingRequest
    of pendingRequests.values()
  ) {
    clearTimeout(
      pendingRequest.timeout,
    )

    pendingRequest.reject(
      reason,
    )
  }

  pendingRequests.clear()
}

function resetWorker(
  reason?: Error,
) {
  if (reason) {
    rejectPendingRequests(
      reason,
    )
  }

  sharedWorker
    ?.terminate()

  sharedWorker =
    null
}

function getSharedWorker():
  Worker {
  if (sharedWorker) {
    return sharedWorker
  }

  if (
    typeof Worker ===
    'undefined'
  ) {
    throw new Error(
      'Web Worker is not supported by this browser.',
    )
  }

  const worker =
    new Worker(
      new URL(
        './problemSolver.worker.ts',
        import.meta.url,
      ),
      {
        type:
          'module',
        name:
          'cheme-toolkit-problem-solver',
      },
    )

  worker.onmessage =
    (
      event:
        MessageEvent<
          ProblemSolverWorkerResponse
        >,
    ) => {
      const response =
        event.data

      const pendingRequest =
        pendingRequests.get(
          response.requestId,
        )

      if (!pendingRequest) {
        return
      }

      pendingRequests.delete(
        response.requestId,
      )

      clearTimeout(
        pendingRequest.timeout,
      )

      if (
        response.error
      ) {
        pendingRequest.reject(
          new Error(
            response.error,
          ),
        )

        return
      }

      pendingRequest.resolve({
        matches:
          response.matches,
        elapsedMs:
          response.elapsedMs,
        executionMode:
          'worker',
      })
    }

  worker.onerror =
    (
      event:
        ErrorEvent,
    ) => {
      const message =
        event.message ||
        'Problem Solver worker failed.'

      resetWorker(
        new Error(
          message,
        ),
      )
    }

  sharedWorker =
    worker

  return worker
}

function requestFromWorker(
  query: string,
  limit: number,
): Promise<
  ProblemSolverWorkerResult
> {
  const worker =
    getSharedWorker()

  const requestId =
    nextRequestId

  nextRequestId +=
    1

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const timeout =
        setTimeout(
          () => {
            pendingRequests.delete(
              requestId,
            )

            reject(
              new Error(
                'Problem Solver worker request timed out.',
              ),
            )
          },
          WORKER_TIMEOUT_MS,
        )

      pendingRequests.set(
        requestId,
        {
          resolve,
          reject,
          timeout,
        },
      )

      try {
        const request:
          ProblemSolverWorkerRequest = {
            requestId,
            query,
            limit,
          }

        worker.postMessage(
          request,
        )
      } catch (
        error
      ) {
        clearTimeout(
          timeout,
        )

        pendingRequests.delete(
          requestId,
        )

        reject(
          error,
        )
      }
    },
  )
}

async function runFallback(
  query: string,
  limit: number,
): Promise<
  ProblemSolverWorkerResult
> {
  const startedAt =
    currentTime()

  const [
    calculatorModule,
    engineModule,
  ] =
    await Promise.all([
      import(
        '../../data/calculators'
      ),
      import(
        './problemSolverEngine'
      ),
    ])

  return {
    matches:
      engineModule
        .rankProblemSolvers(
          query,
          calculatorModule
            .calculators,
          limit,
        ),
    elapsedMs:
      currentTime() -
      startedAt,
    executionMode:
      'fallback',
  }
}

export async function requestProblemSolverMatches(
  query: string,
  limit: number,
): Promise<
  ProblemSolverWorkerResult
> {
  const cleanQuery =
    query
      .trim()
      .slice(
        0,
        5000,
      )

  const safeLimit =
    Math.min(
      8,
      Math.max(
        1,
        Math.trunc(
          limit,
        ),
      ),
    )

  if (
    cleanQuery.length <
    3
  ) {
    return {
      matches: [],
      elapsedMs:
        0,
      executionMode:
        'cache',
    }
  }

  const cacheKey =
    createCacheKey(
      cleanQuery,
      safeLimit,
    )

  const cachedResult =
    resultCache.get(
      cacheKey,
    )

  if (cachedResult) {
    return {
      ...cachedResult,
      executionMode:
        'cache',
    }
  }

  const existingRequest =
    inFlightRequests.get(
      cacheKey,
    )

  if (existingRequest) {
    return existingRequest
  }

  const request =
    (
      async () => {
        try {
          return await requestFromWorker(
            cleanQuery,
            safeLimit,
          )
        } catch {
          resetWorker()

          return runFallback(
            cleanQuery,
            safeLimit,
          )
        }
      }
    )()

  inFlightRequests.set(
    cacheKey,
    request,
  )

  try {
    const result =
      await request

    cacheResult(
      cacheKey,
      result,
    )

    return result
  } finally {
    inFlightRequests.delete(
      cacheKey,
    )
  }
}
