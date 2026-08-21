import type { PostalAddress } from "@/types/billing";

/**
 * Agency letterhead and bank details for invoice output.
 * PLACEHOLDER values until Keep Education supplies the live registered office,
 * VAT number, and paying-in account.
 */
export interface AgencyBankDetails {
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
}

export interface AgencyDetails {
  tradingName: string;
  legalName: string;
  address: PostalAddress;
  vatNumber: string;
  companyNumber: string;
  bank: AgencyBankDetails;
  email: string;
  phone: string;
}

export const AGENCY_DETAILS: AgencyDetails = {
  tradingName: "Keep Education",
  legalName: "Keep Education Ltd",
  address: {
    line1: "PLACEHOLDER — registered office",
    city: "Birmingham",
    postcode: "B1 1AA",
  },
  vatNumber: "GB-PLACEHOLDER",
  companyNumber: "00000000",
  bank: {
    bankName: "PLACEHOLDER Bank",
    accountName: "Keep Education Ltd",
    sortCode: "00-00-00",
    accountNumber: "00000000",
  },
  email: "finance@placeholder.keep-education.example",
  phone: "0121 000 0000",
};
