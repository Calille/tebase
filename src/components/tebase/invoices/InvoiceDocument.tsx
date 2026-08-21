import { format, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { AGENCY_DETAILS } from "@/services/invoices/agencyDetails";
import { formatPostalAddress } from "@/types/billing";
import { INVOICE_STATUS_LABELS, type Invoice } from "@/types/invoice";
import { TEACHER_ROLE_LABELS } from "@/types/timesheet";
import { formatGbp } from "@/types/payroll";
import { VAT_SERVICE_TYPE_LABELS } from "@/lib/vat";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return format(parseISO(iso), "d MMMM yyyy", { locale: enGB });
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const address = invoice.billingAddress;
  const agency = AGENCY_DETAILS;

  return (
    <article
      id="invoice-print"
      className="invoice-print-root mx-auto max-w-3xl bg-white p-8 text-sm text-slate-900"
    >
      <header className="flex items-start justify-between border-b pb-4">
        <div>
          <p className="text-xl font-semibold tracking-tight">{agency.tradingName}</p>
          <p className="text-xs text-slate-600">{agency.legalName}</p>
          <p className="mt-2 text-xs text-slate-600">
            {formatPostalAddress(agency.address)}
          </p>
          <p className="text-xs text-slate-600">
            VAT {agency.vatNumber} · Company {agency.companyNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">
            {invoice.number ?? "DRAFT — unnumbered"}
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {INVOICE_STATUS_LABELS[invoice.status]}
          </p>
          <p className="mt-2 text-xs">Invoice date {formatDate(invoice.issueDate)}</p>
          <p className="text-xs">Due {formatDate(invoice.dueDate)}</p>
          {invoice.poNumber ? (
            <p className="text-xs">PO {invoice.poNumber}</p>
          ) : null}
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bill to
          </p>
          <p className="font-medium">{invoice.billTo.name}</p>
          {address ? (
            <p className="text-xs text-slate-600">{formatPostalAddress(address)}</p>
          ) : (
            <p className="text-xs text-red-700">No billing address on file</p>
          )}
          {invoice.billTo.financeContact ? (
            <p className="text-xs text-slate-600">
              {invoice.billTo.financeContact.name} · {invoice.billTo.financeContact.email}
            </p>
          ) : (
            <p className="text-xs text-red-700">No finance contact on file</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payment
          </p>
          <p className="text-xs text-slate-600">
            Terms: {invoice.billTo.paymentTermsDays} days
          </p>
          <p className="text-xs text-slate-600">
            {agency.bank.accountName} · {agency.bank.bankName}
          </p>
          <p className="text-xs text-slate-600">
            Sort {agency.bank.sortCode} · Acc {agency.bank.accountNumber}
          </p>
        </div>
      </section>

      {invoice.schoolSubtotals.length > 1
        ? invoice.schoolSubtotals.map((subtotal) => (
            <section key={subtotal.school.id} className="mt-6">
              <h3 className="mb-2 font-semibold">{subtotal.school.name}</h3>
              <LineTable
                lines={invoice.lines.filter(
                  (line) => line.school.id === subtotal.school.id,
                )}
              />
              <p className="mt-1 text-right text-xs text-slate-600">
                School subtotal {formatGbp(subtotal.net)} net · {formatGbp(subtotal.vat)} VAT ·{" "}
                {formatGbp(subtotal.gross)} gross
              </p>
            </section>
          ))
        : (
          <section className="mt-6">
            <LineTable lines={invoice.lines} />
          </section>
        )}

      <section className="mt-6 ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Net</span>
          <span className="tabular-nums">{formatGbp(invoice.totals.net)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT</span>
          <span className="tabular-nums">{formatGbp(invoice.totals.vat)}</span>
        </div>
        <div className="flex justify-between border-t pt-1 font-semibold">
          <span>Gross</span>
          <span className="tabular-nums">{formatGbp(invoice.totals.gross)}</span>
        </div>
        {invoice.credits.length > 0 ? (
          <>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Credits</span>
              <span className="tabular-nums">
                −{formatGbp(invoice.totals.gross - invoice.netPosition.gross)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Net position</span>
              <span className="tabular-nums">
                {formatGbp(invoice.netPosition.gross)}
              </span>
            </div>
          </>
        ) : null}
      </section>

      {invoice.credits.length > 0 ? (
        <section className="mt-6">
          <h3 className="mb-2 font-semibold">Credit notes</h3>
          <ul className="space-y-1 text-xs">
            {invoice.credits.map((credit) => (
              <li key={credit.id}>
                {credit.number} · {credit.reason} · {formatGbp(credit.totals.gross)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-8 text-xs text-slate-500">
        VAT is standard-rated supply of staff ({VAT_SERVICE_TYPE_LABELS.supply_of_staff}
        ), applied to the full charge.
      </p>
    </article>
  );
}

function LineTable({ lines }: { lines: Invoice["lines"] }) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b text-left text-slate-500">
          <th className="py-1 pr-2 font-medium">Teacher</th>
          <th className="py-1 pr-2 font-medium">Role</th>
          <th className="py-1 pr-2 font-medium">Date</th>
          <th className="py-1 pr-2 font-medium text-right">Units</th>
          <th className="py-1 pr-2 font-medium text-right">Rate</th>
          <th className="py-1 pr-2 font-medium text-right">Net</th>
          <th className="py-1 pr-2 font-medium text-right">VAT</th>
          <th className="py-1 font-medium text-right">Gross</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className="border-b border-slate-100">
            <td className="py-1 pr-2">{line.teacher.name}</td>
            <td className="py-1 pr-2">{TEACHER_ROLE_LABELS[line.role]}</td>
            <td className="py-1 pr-2">{line.dateWorked}</td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {line.units} {line.unitType === "hour" ? "h" : "d"}
            </td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {line.chargeRate == null ? "—" : formatGbp(line.chargeRate)}
            </td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {line.net == null ? "—" : formatGbp(line.net)}
            </td>
            <td className="py-1 pr-2 text-right tabular-nums">
              {line.vat == null ? "—" : formatGbp(line.vat)}
            </td>
            <td className="py-1 text-right tabular-nums">
              {line.gross == null ? "—" : formatGbp(line.gross)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
