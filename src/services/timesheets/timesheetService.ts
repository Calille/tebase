import {
  computeChargeTotal,
  type PayrollCostModel,
} from "@/types/payroll";
import type { PartyRef } from "@/types/party";
import {
  isUnapprovedTimesheetStatus,
  type Timesheet,
  type TimesheetStatus,
  type UnapprovedTimesheetSummary,
} from "@/types/timesheet";
import { CONSULTANTS, SCHOOLS, TEACHERS } from "@/services/weeklyReport/mockRefs";

function sheet(
  id: string,
  periodId: string,
  status: TimesheetStatus,
  teacher: PartyRef,
  school: PartyRef,
  consultant: PartyRef,
  days: number,
  cost: PayrollCostModel,
): Timesheet {
  const hours = Math.round(days * 6.5 * 10) / 10;
  const confirmed = status === "approved";
  return {
    id,
    periodId,
    bookingId: `bk-${id}`,
    school,
    teacher,
    consultant,
    status,
    expectedHours: hours,
    expectedDays: days,
    confirmedHours: confirmed ? hours : null,
    confirmedDays: confirmed ? days : null,
    cost,
    chargeValue: computeChargeTotal(cost, days),
  };
}

let sheets: Timesheet[] = [];
let seeded = false;

function seedIfNeeded() {
  if (seeded) return;
  seeded = true;
  const alex = CONSULTANTS[0];
  const jordan = CONSULTANTS[1];
  const sam = CONSULTANTS[2];
  // Period ids are week-ending dates; weekly report seeds the current week
  // at runtime. Timesheets for “this week” are attached by periodId when
  // getUnapprovedSummary is called — we keep a template list keyed later.
  sheets = [
    sheet(
      "ts-unapp-1",
      "__current__",
      "sent",
      TEACHERS.john,
      SCHOOLS.westfield,
      alex,
      5,
      { payRate: 160, chargeRate: 210 },
    ),
    sheet(
      "ts-unapp-2",
      "__current__",
      "queried",
      TEACHERS.sarah,
      SCHOOLS.stmarys,
      alex,
      4,
      { payRate: 155, chargeRate: 205 },
    ),
    sheet(
      "ts-unapp-3",
      "__current__",
      "viewed",
      TEACHERS.priya,
      SCHOOLS.harbour,
      jordan,
      3,
      { payRate: 185, chargeRate: 230 },
    ),
    sheet(
      "ts-ok-1",
      "__current__",
      "approved",
      TEACHERS.michael,
      SCHOOLS.oakridge,
      jordan,
      5,
      { payRate: 170, chargeRate: 230 },
    ),
    sheet(
      "ts-sam-1",
      "__current__",
      "sent",
      TEACHERS.emily,
      SCHOOLS.greenfield,
      sam,
      3,
      { payRate: 150, chargeRate: 195 },
    ),
  ];
}

function forPeriod(periodId: string): Timesheet[] {
  seedIfNeeded();
  return sheets.map((item) =>
    item.periodId === "__current__" ? { ...item, periodId } : item,
  );
}

/**
 * Timesheet domain service.
 *
 * Weekly Report reads unapproved value from here so it does not duplicate
 * approval logic. The Timesheets page will expand this same module.
 */
export const timesheetService = {
  async getUnapprovedSummary(
    periodId: string,
    consultantId?: string,
  ): Promise<UnapprovedTimesheetSummary> {
    const unapproved = forPeriod(periodId).filter((item) => {
      if (!isUnapprovedTimesheetStatus(item.status)) return false;
      if (consultantId && consultantId !== "all") {
        return item.consultant.id === consultantId;
      }
      return true;
    });

    return {
      periodId,
      count: unapproved.length,
      chargeValue: Math.round(
        unapproved.reduce((sum, item) => sum + item.chargeValue, 0) * 100,
      ) / 100,
      timesheetIds: unapproved.map((item) => item.id),
    };
  },
};

export function resetTimesheetStoreForTests() {
  seeded = false;
  sheets = [];
}
