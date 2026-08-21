/**
 * Invoice numbers are prefixed per financial year and sequential within it.
 *
 * ASSUMPTION: the agency financial year starts 1 April (not 6 April tax year).
 * Confirm with Keep Education before going live.
 */
export const FINANCIAL_YEAR_START_MONTH = 4;
export const FINANCIAL_YEAR_START_DAY = 1;

export const INVOICE_NUMBER_PREFIX = "KE";
export const CREDIT_NOTE_NUMBER_PREFIX = "KE-CN";

export interface FinancialYear {
  /** Calendar year the FY begins (e.g. 2026 for 2026/27). */
  startYear: number;
  endYear: number;
  /** Two-digit start + two-digit end, e.g. `2627`. */
  code: string;
}

export function financialYearFor(date: Date): FinancialYear {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const inThisStartYear =
    month > FINANCIAL_YEAR_START_MONTH ||
    (month === FINANCIAL_YEAR_START_MONTH && day >= FINANCIAL_YEAR_START_DAY);
  const startYear = inThisStartYear ? year : year - 1;
  const endYear = startYear + 1;
  return {
    startYear,
    endYear,
    code: `${String(startYear).slice(-2)}${String(endYear).slice(-2)}`,
  };
}

export function formatInvoiceNumber(fyCode: string, sequence: number): string {
  return `${INVOICE_NUMBER_PREFIX}-${fyCode}-${String(sequence).padStart(4, "0")}`;
}

export function formatCreditNoteNumber(fyCode: string, sequence: number): string {
  return `${CREDIT_NOTE_NUMBER_PREFIX}-${fyCode}-${String(sequence).padStart(4, "0")}`;
}
