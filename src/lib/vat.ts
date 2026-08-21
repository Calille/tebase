/**
 * VAT rate by service type — not a hardcoded global.
 *
 * Only standard-rated supply of staff (20% on the full charge, not margin)
 * is modelled until Keep Education confirms other treatments.
 * Unknown types return null so invoicing must block rather than guess.
 */
export type VatServiceType = "supply_of_staff";

export const VAT_RATE_BY_SERVICE_TYPE: Record<VatServiceType, number> = {
  supply_of_staff: 0.2,
};

export const VAT_SERVICE_TYPE_LABELS: Record<VatServiceType, string> = {
  supply_of_staff: "Supply of staff",
};

export const DEFAULT_VAT_SERVICE_TYPE: VatServiceType = "supply_of_staff";

export function getVatRate(serviceType: string): number | null {
  if (serviceType in VAT_RATE_BY_SERVICE_TYPE) {
    return VAT_RATE_BY_SERVICE_TYPE[serviceType as VatServiceType];
  }
  return null;
}
