import type { App } from 'vue'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

export function installVxeTable(app: App): void {
  app.use(VXETable)
}
