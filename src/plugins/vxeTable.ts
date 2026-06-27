import type { App } from 'vue'

let installPromise: Promise<void> | null = null

export function ensureVxeTableInstalled(app: App): Promise<void> {
  if (!installPromise) {
    installPromise = (async () => {
      const VXETable = await import('vxe-table')
      await import('vxe-table/lib/style.css')
      app.use(VXETable.default)
    })()
  }

  return installPromise
}
