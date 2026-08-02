import {
  useEffect,
  useState,
} from 'react'

import type {
  ProblemSolverMatch,
} from './problemSolverEngine'
import {
  requestProblemSolverMatches,
} from './problemSolverWorkerClient'
import type {
  ProblemSolverWorkerExecutionMode,
} from './problemSolverWorkerClient'

interface UseProblemSolverWorkerOptions {
  query: string
  limit: number
  enabled?: boolean
}

interface ProblemSolverWorkerHookState {
  resolvedQuery: string
  matches:
    ProblemSolverMatch[]
  isLoading: boolean
  errorMessage: string
  elapsedMs:
    number | null
  executionMode:
    ProblemSolverWorkerExecutionMode | null
}

export interface UseProblemSolverWorkerResult {
  matches:
    ProblemSolverMatch[]
  isLoading: boolean
  errorMessage: string
  elapsedMs:
    number | null
  executionMode:
    ProblemSolverWorkerExecutionMode | null
}

export function useProblemSolverWorker({
  query,
  limit,
  enabled = true,
}: UseProblemSolverWorkerOptions):
  UseProblemSolverWorkerResult {
  const [
    state,
    setState,
  ] =
    useState<
      ProblemSolverWorkerHookState
    >({
      resolvedQuery:
        '',
      matches: [],
      isLoading:
        false,
      errorMessage:
        '',
      elapsedMs:
        null,
      executionMode:
        null,
    })

  const cleanQuery =
    query.trim()

  const isEligible =
    enabled &&
    cleanQuery.length >=
      3

  useEffect(
    () => {
      if (!isEligible) {
        setState({
          resolvedQuery:
            query,
          matches: [],
          isLoading:
            false,
          errorMessage:
            '',
          elapsedMs:
            null,
          executionMode:
            null,
        })

        return
      }

      let isCurrent =
        true

      setState({
        resolvedQuery:
          query,
        matches: [],
        isLoading:
          true,
        errorMessage:
          '',
        elapsedMs:
          null,
        executionMode:
          null,
      })

      void requestProblemSolverMatches(
        query,
        limit,
      )
        .then(
          (
            result,
          ) => {
            if (!isCurrent) {
              return
            }

            setState({
              resolvedQuery:
                query,
              matches:
                result.matches,
              isLoading:
                false,
              errorMessage:
                '',
              elapsedMs:
                result.elapsedMs,
              executionMode:
                result
                  .executionMode,
            })
          },
        )
        .catch(
          (
            error:
              unknown,
          ) => {
            if (!isCurrent) {
              return
            }

            setState({
              resolvedQuery:
                query,
              matches: [],
              isLoading:
                false,
              errorMessage:
                error instanceof
                Error
                  ? error.message
                  : 'Background Solver analysis failed.',
              elapsedMs:
                null,
              executionMode:
                null,
            })
          },
        )

      return () => {
        isCurrent =
          false
      }
    },
    [
      isEligible,
      limit,
      query,
    ],
  )

  const isStale =
    isEligible &&
    state.resolvedQuery !==
      query

  return {
    matches:
      isStale
        ? []
        : state.matches,
    isLoading:
      isEligible &&
      (
        state.isLoading ||
        isStale
      ),
    errorMessage:
      isStale
        ? ''
        : state.errorMessage,
    elapsedMs:
      isStale
        ? null
        : state.elapsedMs,
    executionMode:
      isStale
        ? null
        : state.executionMode,
  }
}
