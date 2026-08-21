import type { BillTo } from "@/types/billing";
import { SCHOOLS } from "@/services/weeklyReport/mockRefs";

export const BILL_TOS: BillTo[] = [
  {
    id: "bt-keep-trust",
    name: "Keep Academy Trust",
    kind: "multi_academy_trust",
    schoolIds: [SCHOOLS.oakridge.id, SCHOOLS.greenfield.id],
    paymentTermsDays: 30,
    invoiceFrequency: "monthly",
    grouping: "consolidated",
    poRequired: true,
    financeContact: {
      name: "Priya Shah",
      email: "finance@keepacademy.example",
      phone: "0121 555 0101",
    },
    billingAddress: {
      line1: "Trust Finance, Keep House",
      line2: "12 Academy Way",
      city: "Birmingham",
      postcode: "B12 4AA",
    },
    xeroContactId: null,
  },
  {
    id: "bt-westfield",
    name: "Westfield Primary",
    kind: "school",
    schoolIds: [SCHOOLS.westfield.id],
    paymentTermsDays: 14,
    invoiceFrequency: "weekly",
    grouping: "per_school",
    poRequired: false,
    financeContact: {
      name: "Neil Cartwright",
      email: "office@westfield.example",
      phone: "0121 555 0202",
    },
    billingAddress: {
      line1: "Westfield Primary School",
      city: "Birmingham",
      postcode: "B13 8BB",
    },
    xeroContactId: null,
  },
  {
    id: "bt-stmarys",
    name: "St Mary's Secondary",
    kind: "school",
    schoolIds: [SCHOOLS.stmarys.id],
    paymentTermsDays: 30,
    invoiceFrequency: "fortnightly",
    grouping: "per_school",
    poRequired: false,
    financeContact: {
      name: "Claire Dunn",
      email: "finance@stmarys.example",
    },
    billingAddress: {
      line1: "St Mary's Secondary School",
      city: "Birmingham",
      postcode: "B14 2CC",
    },
    xeroContactId: null,
  },
  {
    id: "bt-harbour-incomplete",
    name: "Harbour View High",
    kind: "school",
    schoolIds: [SCHOOLS.harbour.id],
    paymentTermsDays: 30,
    invoiceFrequency: "monthly",
    grouping: "per_school",
    poRequired: false,
    financeContact: null,
    billingAddress: null,
    xeroContactId: null,
  },
  {
    id: "bt-county-la",
    name: "West Midlands County Council",
    kind: "local_authority",
    schoolIds: [SCHOOLS.meadowbank.id],
    paymentTermsDays: 30,
    invoiceFrequency: "monthly",
    grouping: "consolidated",
    poRequired: false,
    financeContact: {
      name: "Schools Finance team",
      email: "schools.finance@wmcc.example",
      phone: "0121 555 0303",
    },
    billingAddress: {
      line1: "County Hall",
      city: "Birmingham",
      postcode: "B1 2DD",
    },
    xeroContactId: null,
  },
];

export function billToById(id: string): BillTo | undefined {
  return BILL_TOS.find((item) => item.id === id);
}

export function billToForSchoolId(schoolId: string): BillTo | undefined {
  return BILL_TOS.find((item) => item.schoolIds.includes(schoolId));
}
