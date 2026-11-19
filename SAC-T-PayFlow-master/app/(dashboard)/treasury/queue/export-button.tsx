'use client'

import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BankDetails } from '@/types'

interface ExportClaim {
  student: { full_name: string | null; email: string | null; roll_number: string | null } | null
  event: { name: string | null } | null
  prize_position: string
  prize_amount: number
  status: string
  bank_details_snapshot: BankDetails | null
}

const DATE_STR = new Date().toISOString().slice(0, 10)

function claimsToRows(claims: ExportClaim[]) {
  return claims.map((c, i) => ({
    '#': i + 1,
    'Student Name': c.student?.full_name ?? '',
    'Roll Number': c.student?.roll_number ?? '',
    'Event': c.event?.name ?? '',
    'Position': c.prize_position,
    'Amount (₹)': c.prize_amount,
    'Account Holder': c.bank_details_snapshot?.account_holder ?? '',
    'Account Number': c.bank_details_snapshot?.account_number ?? '',
    'IFSC Code': c.bank_details_snapshot?.ifsc_code ?? '',
    'Bank Name': c.bank_details_snapshot?.bank_name ?? '',
    'Branch': c.bank_details_snapshot?.branch ?? '',
    'UPI ID': c.bank_details_snapshot?.upi_id ?? '',
  }))
}

async function exportXlsx(claims: ExportClaim[]) {
  const xlsx = await import('xlsx')
  const rows = claimsToRows(claims)
  const ws = xlsx.utils.json_to_sheet(rows)
  const wb = xlsx.utils.book_new()
  xlsx.utils.book_append_sheet(wb, ws, 'NEFT Claims')

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? '').length)) + 2,
  }))
  ws['!cols'] = colWidths

  xlsx.writeFile(wb, `neft-claims-${DATE_STR}.xlsx`)
}

async function exportDocx(claims: ExportClaim[]) {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell,
    TextRun, AlignmentType, WidthType, BorderStyle, HeadingLevel,
    ShadingType,
  } = await import('docx')

  const rows = claimsToRows(claims)
  const headers = Object.keys(rows[0] ?? {})

  const HEADER_COLOR = '1e293b'
  const ALT_ROW_COLOR = 'f8fafc'

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) =>
      new TableCell({
        shading: { type: ShadingType.SOLID, color: HEADER_COLOR },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })],
          }),
        ],
      })
    ),
  })

  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: headers.map((h) =>
        new TableCell({
          shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: ALT_ROW_COLOR } : undefined,
          children: [
            new Paragraph({
              alignment: h === '#' || h === 'Amount (₹)' ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({ text: String(row[h as keyof typeof row] ?? ''), size: 18 })],
            }),
          ],
        })
      ),
    })
  )

  const totalAmount = claims.reduce((sum, c) => sum + (c.prize_amount ?? 0), 0)

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 16838, height: 11906 }, // A4 landscape in twentieths of a point
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'IPM SAC — NEFT Payment Advice', bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: `Date: ${DATE_STR}`, size: 20, color: '64748b' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: `Total Claims: ${claims.length}     `, size: 20, color: '64748b' }),
              new TextRun({ text: `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`, size: 20, bold: true, color: '0f172a' }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' },
            },
            rows: [headerRow, ...dataRows],
          }),
          new Paragraph({
            spacing: { before: 600 },
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'Authorised Signatory', size: 20, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'SAC Treasurer, IIM Indore', size: 18, color: '64748b' })],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `neft-claims-${DATE_STR}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportButton({ claims }: { claims: ExportClaim[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" disabled={claims.length === 0}>
          <Download className="h-4 w-4 mr-1.5" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportXlsx(claims)}>
          <FileSpreadsheet className="h-4 w-4 mr-2 text-[#4338ca]" />
          Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportDocx(claims)}>
          <FileText className="h-4 w-4 mr-2 text-blue-500" />
          Export as Doc (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
