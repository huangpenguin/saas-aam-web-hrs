import * as XLSX from 'xlsx'
import { formatPreviewCell } from '@/utils/previewCellValue'
import type { MonthlySalaryDetailsRequest } from '@/types/payroll'
import type { SalaryDetailColumn } from '@/types/table'

export type PayrollExportFormat = 'excel' | 'pdf'

export interface PayrollExportPayload {
  title: string
  filenameBase: string
  columns: SalaryDetailColumn[]
  rows: Record<string, string | number | null>[]
}

export function buildPayrollExportPayload(
  columns: SalaryDetailColumn[],
  rows: Record<string, string | number | null>[],
  lastQuery: MonthlySalaryDetailsRequest | null,
): PayrollExportPayload {
  const queryLabel = lastQuery
    ? `${lastQuery.year}年${lastQuery.month}月${lastQuery.uid ? ` / ${lastQuery.uid}` : ''}`
    : '查询结果'

  const filenameBase = lastQuery
    ? `payroll-${lastQuery.year}-${lastQuery.month}${lastQuery.uid ? `-${lastQuery.uid}` : ''}`
    : `payroll-export-${Date.now()}`

  return {
    title: `教员薪资明细 - ${queryLabel}`,
    filenameBase,
    columns,
    rows,
  }
}

export function buildPayrollExportMatrix(
  columns: SalaryDetailColumn[],
  rows: Record<string, string | number | null>[],
): { headers: string[]; body: string[][] } {
  const headers = columns.map((column) => column.title)
  const body = rows.map((row) =>
    columns.map((column) => formatPreviewCell(column, row)),
  )

  return { headers, body }
}

export function exportPayrollToExcel(payload: PayrollExportPayload): void {
  if (payload.rows.length === 0) {
    throw new Error('没有可导出的数据')
  }

  const { headers, body } = buildPayrollExportMatrix(payload.columns, payload.rows)
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll')
  XLSX.writeFile(workbook, `${payload.filenameBase}.xlsx`)
}

function createExportTableElement(
  title: string,
  headers: string[],
  body: string[][],
): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-10000px'
  wrapper.style.top = '0'
  wrapper.style.width = '1200px'
  wrapper.style.padding = '24px'
  wrapper.style.background = '#ffffff'
  wrapper.style.color = '#111827'
  wrapper.style.fontFamily =
    '"Hiragino Sans", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'

  const heading = document.createElement('h1')
  heading.textContent = title
  heading.style.margin = '0 0 16px'
  heading.style.fontSize = '20px'
  wrapper.appendChild(heading)

  const table = document.createElement('table')
  table.style.width = '100%'
  table.style.borderCollapse = 'collapse'
  table.style.fontSize = '12px'

  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  headers.forEach((header) => {
    const cell = document.createElement('th')
    cell.textContent = header
    cell.style.border = '1px solid #d1d5db'
    cell.style.padding = '8px 10px'
    cell.style.background = '#f3f4f6'
    cell.style.textAlign = 'left'
    headerRow.appendChild(cell)
  })
  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  body.forEach((rowValues) => {
    const row = document.createElement('tr')
    rowValues.forEach((value) => {
      const cell = document.createElement('td')
      cell.textContent = value
      cell.style.border = '1px solid #e5e7eb'
      cell.style.padding = '8px 10px'
      cell.style.whiteSpace = 'nowrap'
      row.appendChild(cell)
    })
    tbody.appendChild(row)
  })
  table.appendChild(tbody)
  wrapper.appendChild(table)

  return wrapper
}

export async function exportPayrollToPdf(payload: PayrollExportPayload): Promise<void> {
  if (payload.rows.length === 0) {
    throw new Error('没有可导出的数据')
  }

  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  const { headers, body } = buildPayrollExportMatrix(payload.columns, payload.rows)
  const element = createExportTableElement(payload.title, headers, body)
  document.body.appendChild(element)

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    })

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const printableWidth = pageWidth - margin * 2
    const printableHeight = pageHeight - margin * 2
    const imageWidth = printableWidth
    const imageHeight = (canvas.height * imageWidth) / canvas.width

    let positionY = margin
    let remainingHeight = imageHeight
    let sourceY = 0
    const sliceHeight = (canvas.width * printableHeight) / imageWidth

    while (remainingHeight > 0) {
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = Math.min(sliceHeight, canvas.height - sourceY)

      const context = pageCanvas.getContext('2d')
      if (!context) {
        throw new Error('PDF 渲染失败')
      }

      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height,
      )

      const imageData = pageCanvas.toDataURL('image/png')
      if (sourceY > 0) {
        pdf.addPage()
      }

      const currentImageHeight = (pageCanvas.height * imageWidth) / canvas.width
      pdf.addImage(imageData, 'PNG', margin, positionY, imageWidth, currentImageHeight)

      sourceY += pageCanvas.height
      remainingHeight -= printableHeight
    }

    pdf.save(`${payload.filenameBase}.pdf`)
  } finally {
    document.body.removeChild(element)
  }
}

export async function exportPayroll(
  format: PayrollExportFormat,
  payload: PayrollExportPayload,
): Promise<void> {
  if (format === 'excel') {
    exportPayrollToExcel(payload)
    return
  }

  await exportPayrollToPdf(payload)
}
