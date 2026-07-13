type JobHandler<T> = (payload: T) => Promise<void>;

/**
 * NOTE: this is a minimal in-process queue for local development only.
 * Swap this implementation for BullMQ + Redis before deploying to
 * production (see Part 8 of the architecture spec) — the interface below
 * is intentionally small so that swap doesn't require changing any
 * calling code, only this file.
 */
class InProcessQueue<T> {
  private handler: JobHandler<T> | null = null;

  process(handler: JobHandler<T>) {
    this.handler = handler;
  }

  async add(payload: T) {
    if (!this.handler) {
      throw new Error("No handler registered for this queue.");
    }
    // Runs on the next tick so the caller gets an immediate response —
    // matching the "never block requests waiting for AI analysis" rule.
    setImmediate(() => {
      this.handler!(payload).catch((err) => console.error("Job failed:", err));
    });
  }
}

export const analysisQueue = new InProcessQueue<{
  sessionId: string;
  projectId: string;
  idea: string;
}>();
