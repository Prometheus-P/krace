/**
 * Retry Utility with Exponential Backoff
 *
 * Provides resilient API call handling with automatic retries
 * and configurable backoff strategy.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 5) */
  maxRetries?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Optional callback for each retry attempt */
  onRetry?: (attempt: number, error: Error, nextDelay: number) => void;
  /** Optional function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'isRetryable'>> = {
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

/**
 * Default function to determine if an error is retryable
 * Retries on network errors and 5xx server errors
 */
function defaultIsRetryable(error: Error): boolean {
  // Network errors are retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Check for HTTP status in error message
  const statusMatch = error.message.match(/status[:\s]*(\d{3})/i);
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10);
    // Retry on 5xx server errors and 429 rate limit
    return status >= 500 || status === 429;
  }

  return true; // Default to retryable
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt - 1);
  const delay = Math.min(exponentialDelay, maxDelay);
  // Add random jitter (±10%) to prevent thundering herd
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Result object with success status, data/error, and metrics
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchDataFromAPI(),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => {
 *       console.log(`Retry ${attempt}: ${error.message}`);
 *     },
 *   }
 * );
 *
 * if (result.success) {
 *   console.log('Data:', result.data);
 * } else {
 *   console.error('Failed after retries:', result.error);
 * }
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    isRetryable: options.isRetryable ?? defaultIsRetryable,
  };

  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt > opts.maxRetries || !opts.isRetryable(lastError)) {
        break;
      }

      // Calculate next delay
      const nextDelay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      // Call retry callback if provided
      if (opts.onRetry) {
        opts.onRetry(attempt, lastError, nextDelay);
      }

      // Wait before retrying
      await sleep(nextDelay);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: opts.maxRetries + 1,
    totalTime: Date.now() - startTime,
  };
}

/**
 * Create a retry wrapper with pre-configured options
 *
 * @example
 * ```typescript
 * const apiRetry = createRetryWrapper({ maxRetries: 3 });
 * const result = await apiRetry(() => fetch(url));
 * ```
 */
export function createRetryWrapper(
  defaultOptions: RetryOptions
): <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<RetryResult<T>> {
  return <T>(fn: () => Promise<T>, options?: RetryOptions) =>
    withRetry(fn, { ...defaultOptions, ...options });
}

/**
 * Options for retry with failure logging
 */
export interface RetryWithLoggingOptions extends RetryOptions {
  /** Job type for failure logging */
  jobType: 'schedule_poll' | 'entry_poll' | 'result_poll' | 'odds_poll';
  /** Entity type for failure logging */
  entityType: 'race' | 'entry' | 'result' | 'odds';
  /** Entity ID for failure logging */
  entityId: string;
  /** Whether to send Slack notification on failure */
  notifyOnFailure?: boolean;
}

/**
 * Execute with retry and log failures to database
 *
 * @param fn - Async function to execute
 * @param options - Retry and logging options
 * @returns Result with success status and failure ID if failed
 */
export async function withRetryAndLogging<T>(
  fn: () => Promise<T>,
  options: RetryWithLoggingOptions
): Promise<RetryResult<T> & { failureId?: string }> {
  const { jobType, entityType, entityId, notifyOnFailure = true, ...retryOptions } = options;

  const result = await withRetry(fn, {
    ...retryOptions,
    onRetry: (attempt, error, nextDelay) => {
      console.log(
        `[Retry] ${jobType}/${entityId} - Attempt ${attempt} failed: ${error.message}. Retrying in ${nextDelay}ms`
      );
      retryOptions.onRetry?.(attempt, error, nextDelay);
    },
  });

  if (!result.success && result.error) {
    try {
      // Dynamic import to avoid circular dependencies
      const { logFailure } = await import('./failureLogger');
      const failure = await logFailure({
        jobType,
        entityType,
        entityId,
        errorMessage: result.error.message,
        errorStack: result.error.stack,
        maxRetries: retryOptions.maxRetries ?? 5,
        metadata: {
          attempts: result.attempts,
          totalTime: result.totalTime,
        },
      });

      console.log(`[Retry] Logged failure ${failure.id} for ${jobType}/${entityId}`);

      // Send Slack notification if enabled
      if (notifyOnFailure) {
        const { notifyIngestionFailure } = await import('../services/slackNotifier');
        await notifyIngestionFailure({
          jobType,
          entityId,
          error: result.error.message,
          retryCount: result.attempts,
          maxRetries: retryOptions.maxRetries ?? 5,
        });
      }

      return { ...result, failureId: String(failure.id) };
    } catch (loggingError) {
      console.error('[Retry] Failed to log failure:', loggingError);
    }
  }

  return result;
}
