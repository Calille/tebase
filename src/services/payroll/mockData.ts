import {
  computeChargeTotal,
  computeGrossPay,
  computeMarginContribution,
  unitsWorked,
  type PayePayrollLine,
  type PayrollCostModel,
  type PayrollPartyRef,
  type PayrollRateUnit,
  type PayrollWorkerLine,
  type UmbrellaPayrollLine,
} from "@/types/payroll";
import type { PayWeek } from "@/types/payroll";

export const CONSULTANTS: PayrollPartyRef[] = [
  { id: "cons-alex", name: "Alex Patel" },
  { id: "cons-jordan", name: "Jordan Blake" },
  { id: "cons-sam", name: "Sam Reed" },
];

export const SCHOOLS: PayrollPartyRef[] = [
  { id: "sch-westfield", name: "Westfield Primary" },
  { id: "sch-stmarys", name: "St Mary's Secondary" },
  { id: "sch-oakridge", name: "Oakridge Academy" },
  { id: "sch-greenfield", name: "Greenfield Infants" },
  { id: "sch-harbour", name: "Harbour View High" },
];

const MAINPAY = "Mainpay";

type WorkerTemplate = {
  id: string;
  name: string;
  payrollType: "paye" | "umbrella";
  umbrellaProvider?: string;
  niNumber: string | null;
  payrollNumber: string | null;
  consultantId: string;
  schoolIds: string[];
  extraSchoolId?: string;
  rateUnit: PayrollRateUnit;
  payRate: number | null;
  chargeRate: number | null;
  costExtras?: Pick<PayrollCostModel, "employerNi" | "holidayAccrual" | "pensionCost">;
  /** Typical days in a full week. Varied per period by seed. */
  typicalDays: number;
  /** If true, this worker is included only on the current week, with a deliberate validation issue. */
  validationOnlyOnCurrent?: "missing_ni" | "missing_rate" | "zero_hours";
};

const WORKERS: WorkerTemplate[] = [
  {
    id: "tch-john",
    name: "John Smith",
    payrollType: "paye",
    niNumber: "QQ123456C",
    payrollNumber: "PAYE-1001",
    consultantId: "cons-alex",
    schoolIds: ["sch-westfield"],
    rateUnit: "daily",
    payRate: 160,
    chargeRate: 210,
    costExtras: { employerNi: 22.08, holidayAccrual: 19.37, pensionCost: 4.8 },
    typicalDays: 5,
  },
  {
    id: "tch-sarah",
    name: "Sarah Johnson",
    payrollType: "paye",
    niNumber: "QQ654321A",
    payrollNumber: "PAYE-1002",
    consultantId: "cons-alex",
    schoolIds: ["sch-stmarys"],
    extraSchoolId: "sch-oakridge",
    rateUnit: "daily",
    payRate: 155,
    chargeRate: 205,
    typicalDays: 4,
  },
  {
    id: "tch-michael",
    name: "Michael Chen",
    payrollType: "paye",
    niNumber: "QQ112233B",
    payrollNumber: "PAYE-1003",
    consultantId: "cons-jordan",
    schoolIds: ["sch-oakridge"],
    rateUnit: "daily",
    payRate: 170,
    chargeRate: 230,
    typicalDays: 5,
  },
  {
    id: "tch-emily",
    name: "Emily Rodriguez",
    payrollType: "paye",
    niNumber: "QQ998877C",
    payrollNumber: "PAYE-1004",
    consultantId: "cons-sam",
    schoolIds: ["sch-greenfield"],
    rateUnit: "daily",
    payRate: 150,
    chargeRate: 195,
    typicalDays: 3,
  },
  {
    id: "tch-david",
    name: "David Wilson",
    payrollType: "paye",
    niNumber: "QQ445566D",
    payrollNumber: "PAYE-1005",
    consultantId: "cons-jordan",
    schoolIds: ["sch-harbour"],
    rateUnit: "daily",
    payRate: 165,
    chargeRate: 215,
    typicalDays: 5,
  },
  {
    id: "tch-priya",
    name: "Priya Nair",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: "QQ778899A",
    payrollNumber: "UMB-2001",
    consultantId: "cons-alex",
    schoolIds: ["sch-westfield"],
    rateUnit: "daily",
    payRate: 185,
    chargeRate: 230,
    typicalDays: 5,
  },
  {
    id: "tch-tom",
    name: "Tom Hughes",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: "QQ223344B",
    payrollNumber: "UMB-2002",
    consultantId: "cons-sam",
    schoolIds: ["sch-stmarys"],
    rateUnit: "daily",
    payRate: 180,
    chargeRate: 225,
    typicalDays: 4,
  },
  {
    id: "tch-aisha",
    name: "Aisha Khan",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: "QQ556677C",
    payrollNumber: "UMB-2003",
    consultantId: "cons-jordan",
    schoolIds: ["sch-harbour", "sch-oakridge"],
    rateUnit: "daily",
    payRate: 190,
    chargeRate: 240,
    typicalDays: 5,
  },
  {
    id: "tch-lisa",
    name: "Lisa Okonkwo",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: null,
    payrollNumber: "UMB-2004",
    consultantId: "cons-alex",
    schoolIds: ["sch-greenfield"],
    rateUnit: "daily",
    payRate: 175,
    chargeRate: 220,
    typicalDays: 3,
    validationOnlyOnCurrent: "missing_ni",
  },
  {
    id: "tch-james",
    name: "James Wright",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: "QQ334455D",
    payrollNumber: "UMB-2005",
    consultantId: "cons-sam",
    schoolIds: ["sch-westfield"],
    rateUnit: "daily",
    payRate: 180,
    chargeRate: 225,
    typicalDays: 0,
    validationOnlyOnCurrent: "zero_hours",
  },
  {
    id: "tch-nora",
    name: "Nora Ellis",
    payrollType: "umbrella",
    umbrellaProvider: MAINPAY,
    niNumber: "QQ667788E",
    payrollNumber: "UMB-2006",
    consultantId: "cons-jordan",
    schoolIds: ["sch-oakridge"],
    rateUnit: "daily",
    payRate: null,
    chargeRate: 220,
    typicalDays: 2,
    validationOnlyOnCurrent: "missing_rate",
  },
];

function refById(list: PayrollPartyRef[], id: string): PayrollPartyRef {
  const found = list.find((item) => item.id === id);
  if (!found) {
    throw new Error(`Unknown payroll ref: ${id}`);
  }
  return found;
}

function daysForWeek(typical: number, weekIndexFromCurrent: number): number {
  if (typical <= 0) return 0;
  const wobble = (weekIndexFromCurrent * 2 + typical) % 2 === 0 ? 0 : -1;
  return Math.max(1, typical + wobble);
}

function hoursFromDays(days: number): number {
  // Mock hours only — not a product rule for the length of a school day.
  return days === 0 ? 0 : Math.round(days * 6.5 * 10) / 10;
}

function finaliseLine(
  base: Omit<PayrollWorkerLine, "grossPay" | "chargeTotal" | "marginContribution" | "payrollType" | "umbrellaProvider"> & {
    payrollType: "paye" | "umbrella";
    umbrellaProvider?: string;
  },
): PayrollWorkerLine {
  const units = unitsWorked(base);
  const totals = {
    grossPay: computeGrossPay(base.cost, units),
    chargeTotal: computeChargeTotal(base.cost, units),
    marginContribution: computeMarginContribution(base.cost, units),
  };

  if (base.payrollType === "umbrella") {
    const umbrella: UmbrellaPayrollLine = {
      ...base,
      payrollType: "umbrella",
      umbrellaProvider: base.umbrellaProvider ?? MAINPAY,
      ...totals,
    };
    return umbrella;
  }

  const paye: PayePayrollLine = {
    ...base,
    payrollType: "paye",
    ...totals,
  };
  return paye;
}

export function buildLinesForWeek(
  week: PayWeek,
  weekIndexFromCurrent: number,
): PayrollWorkerLine[] {
  const isCurrent = weekIndexFromCurrent === 0;

  return WORKERS.flatMap((worker) => {
    if (worker.validationOnlyOnCurrent && !isCurrent) {
      return [];
    }

    let days = daysForWeek(worker.typicalDays, weekIndexFromCurrent);
    let payRate = worker.payRate;
    let niNumber = worker.niNumber;

    if (worker.validationOnlyOnCurrent === "zero_hours") {
      days = 0;
    }
    if (worker.validationOnlyOnCurrent === "missing_rate") {
      payRate = null;
    }
    if (worker.validationOnlyOnCurrent === "missing_ni") {
      niNumber = null;
    }

    const hours = hoursFromDays(days);
    const schoolIds =
      worker.extraSchoolId && weekIndexFromCurrent % 2 === 0
        ? [...worker.schoolIds, worker.extraSchoolId]
        : worker.schoolIds;

    return [
      finaliseLine({
        id: `${worker.id}-${week.id}`,
        periodId: week.id,
        worker: { id: worker.id, name: worker.name },
        payrollType: worker.payrollType,
        umbrellaProvider: worker.umbrellaProvider,
        niNumber,
        payrollNumber: worker.payrollNumber,
        consultant: refById(CONSULTANTS, worker.consultantId),
        schools: schoolIds.map((id) => refById(SCHOOLS, id)),
        daysWorked: days,
        hoursWorked: hours,
        rateUnit: worker.rateUnit,
        cost: {
          payRate,
          chargeRate: worker.chargeRate,
          ...worker.costExtras,
        },
      }),
    ];
  });
}
