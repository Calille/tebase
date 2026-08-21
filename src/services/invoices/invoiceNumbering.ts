import {
  formatCreditNoteNumber,
  formatInvoiceNumber,
  financialYearFor,
} from "@/lib/financialYear";

type SequenceKind = "invoice" | "credit";

const sequences: Record<string, { invoice: number; credit: number }> = {};

export function resetNumberingForTests() {
  for (const key of Object.keys(sequences)) {
    delete sequences[key];
  }
}

export function seedSequence(fyCode: string, kind: SequenceKind, lastUsed: number) {
  const current = sequences[fyCode] ?? { invoice: 0, credit: 0 };
  current[kind] = lastUsed;
  sequences[fyCode] = current;
}

/**
 * Allocate the next gapless number. Voided and credited invoices still
 * consume a number — sequences never go backwards and numbers are never reused.
 */
export function allocateInvoiceNumber(issuedAt: Date): string {
  const { code } = financialYearFor(issuedAt);
  const current = sequences[code] ?? { invoice: 0, credit: 0 };
  current.invoice += 1;
  sequences[code] = current;
  return formatInvoiceNumber(code, current.invoice);
}

export function allocateCreditNoteNumber(issuedAt: Date): string {
  const { code } = financialYearFor(issuedAt);
  const current = sequences[code] ?? { invoice: 0, credit: 0 };
  current.credit += 1;
  sequences[code] = current;
  return formatCreditNoteNumber(code, current.credit);
}

export function lastUsedInvoiceSequence(fyCode: string): number {
  return sequences[fyCode]?.invoice ?? 0;
}
