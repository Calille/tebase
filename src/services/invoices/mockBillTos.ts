import type { BillTo } from "@/types/billing";
import { getDataset } from "@/mocks";

export const BILL_TOS: BillTo[] = new Proxy([] as BillTo[], {
  get(_target, prop, receiver) {
    return Reflect.get(getDataset().billTos, prop, receiver);
  },
});

export function billToById(id: string): BillTo | undefined {
  return getDataset().billTos.find((item) => item.id === id);
}

export function billToForSchoolId(schoolId: string): BillTo | undefined {
  return getDataset().billTos.find((item) => item.schoolIds.includes(schoolId));
}
