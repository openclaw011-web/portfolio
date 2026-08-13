/**
 * Shared "loader finished" signal.
 * ScrollTrigger creation, pin measurement and Lenis setup are deferred until
 * the preloader completes, so the loader animation never competes with the
 * mount-time layout work (long tasks / jank).
 */
let _resolve: (() => void) | null = null
export const loaderReady: Promise<void> = new Promise((res) => {
  _resolve = res
})

export function markLoaderDone(): void {
  _resolve?.()
  _resolve = null
}
