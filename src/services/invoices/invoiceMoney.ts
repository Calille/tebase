import { roundGbp } from "@/types/payroll";
import type { InvoiceLine, InvoiceMoney, SchoolSubtotal } from "@/types/invoice";
import { DEFAULT_VAT_SERVICE_TYPE, getVatRate } from "@/lib/vat";
import { resolveChargeRate, type Timesheet, type WorkedDay } from "@/types/timesheet";

export function invoiceLineId(timesheetId: string, date: string): string {
  return `${timesheetId}:${date}`;
}

export function emptyMoney(): InvoiceMoney {
  return { net: 0, vat: 0, gross: 0 };
}

export function addMoney(a: InvoiceMoney, b: InvoiceMoney): InvoiceMoney {
  return {
    net: roundGbp(a.net + b.net),
    vat: roundGbp(a.vat + b.vat),
    gross: roundGbp(a.gross + b.gross),
  };
}

export function subtractMoney(a: InvoiceMoney, b: InvoiceMoney): InvoiceMoney {
  return addMoney(a, { net: -b.net, vat: -b.vat, gross: -b.gross });
}

export function moneyFromLine(line: Pick<InvoiceLine, "net" | "vat" | "gross">): InvoiceMoney {
  return {
    net: line.net ?? 0,
    vat: line.vat ?? 0,
    gross: line.gross ?? 0,
  };
}

export function totalsFromLines(lines: InvoiceLine[]): InvoiceMoney {
  return lines.reduce(
    (acc, line) => addMoney(acc, moneyFromLine(line)),
    emptyMoney(),
  );
}

export function schoolSubtotalsFromLines(lines: InvoiceLine[]): SchoolSubtotal[] {
  const map = new Map<string, SchoolSubtotal>();
  for (const line of lines) {
    const current = map.get(line.school.id) ?? {
      school: line.school,
      ...emptyMoney(),
    };
    map.set(line.school.id, {
      school: current.school,
      ...addMoney(current, moneyFromLine(line)),
    });
  }
  return [...map.values()].sort((a, b) => a.school.name.localeCompare(b.school.name));
}

export function buildInvoiceLine(sheet: Timesheet, day: WorkedDay): InvoiceLine {
  const chargeRate = resolveChargeRate(sheet.rateSchedule, day.date, day.unitType);
  const serviceType = DEFAULT_VAT_SERVICE_TYPE;
  const vatRate = getVatRate(serviceType);
  const rateProblem =
    chargeRate == null
      ? `No ${day.unitType} rate in force on ${day.date} for ${sheet.teacher.name} at ${sheet.school.name}.`
      : undefined;
  const net = chargeRate == null ? null : roundGbp(chargeRate * day.units);
  const vat = net == null || vatRate == null ? null : roundGbp(net * vatRate);
  const gross = net == null || vat == null ? null : roundGbp(net + vat);

  return {
    id: invoiceLineId(sheet.id, day.date),
    timesheetId: sheet.id,
    school: { ...sheet.school },
    teacher: { ...sheet.teacher },
    role: day.role,
    dateWorked: day.date,
    units: day.units,
    unitType: day.unitType,
    chargeRate,
    serviceType,
    vatRate,
    net,
    vat,
    gross,
    rateProblem,
  };
}

export function netPositionFor(
  totals: InvoiceMoney,
  credits: InvoiceMoney[],
): InvoiceMoney {
  return credits.reduce((acc, credit) => subtractMoney(acc, credit), totals);
}
