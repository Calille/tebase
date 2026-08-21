import { formatGbp } from "@/types/payroll";
import type { WeeklyReport } from "@/types/weeklyReport";
import { formatWeekEnding } from "@/lib/payWeek";

function deltaLine(
  label: string,
  delta: { absolute: number; percent: number | null },
  money: boolean,
): string {
  const abs = money ? formatGbp(delta.absolute) : String(delta.absolute);
  const pct =
    delta.percent == null ? "n/a" : `${delta.percent > 0 ? "+" : ""}${delta.percent}%`;
  return `${label}: ${abs} (${pct})`;
}

export function buildWeeklyReportSummary(report: WeeklyReport): string {
  const scope =
    report.scope === "team"
      ? "Team roll-up"
      : report.consultant
        ? report.consultant.name
        : "My week";

  const lines: string[] = [
    `Weekly report — week ending ${formatWeekEnding(report.period.weekEnding)}`,
    `Scope: ${scope}`,
    "",
    `Charge: ${formatGbp(report.headlines.current.chargeTotal)}`,
    `  vs last week ${deltaLine("", report.headlines.charge.lastWeek, true).trim()}`,
    `  vs last term (${report.headlines.lastTermLabel}) ${deltaLine("", report.headlines.charge.lastTerm, true).trim()}`,
    `Pay cost: ${formatGbp(report.headlines.current.payCost)}`,
    `Gross margin: ${formatGbp(report.headlines.current.marginGbp)} (${report.headlines.current.marginPercent}%)`,
    `Days filled: ${report.headlines.current.daysFilled}`,
    "",
    "LOW MARGIN ALERTS",
    report.lowMargin.length === 0
      ? "None this week."
      : report.lowMargin
          .map(
            (group) =>
              `- ${group.school.name}: ${group.bookingCount} booking(s), worst ${formatGbp(group.worstMarginPerDay)}/day (${group.worstMarginPercent}%), ${group.teachers.map((t) => t.name).join(", ")}`,
          )
          .join("\n"),
    "",
    "AWR WEEK-12 WARNINGS",
    report.awrWarnings.length === 0
      ? "None in the next 3 weeks."
      : report.awrWarnings
          .map(
            (item) =>
              `- ${item.teacher.name} at ${item.school.name}: ${item.awrWeeks} weeks, ${item.weeksUntilParity} week(s) to parity. Margin impact needs comparable perm rate.`,
          )
          .join("\n"),
    "",
    `UNAPPROVED TIMESHEETS: ${report.unapprovedTimesheets.count} sheet(s), ${formatGbp(report.unapprovedTimesheets.chargeValue)} not yet invoiceable`,
    "",
    `CANCELLATIONS & EARLY FINISHES: ${formatGbp(report.interruptionMarginLost)} margin lost`,
    report.interruptions
      .map(
        (item) =>
          `- ${item.type === "cancellation" ? "Cancelled" : "Early finish"}: ${item.school.name} / ${item.teacher.name} (${item.daysLost} day(s), ${formatGbp(item.marginLost)})`,
      )
      .join("\n"),
    "",
    `FILL RATE: ${report.fillRate.filled}/${report.fillRate.received} filled (${report.fillRate.fillPercent}%), ${report.fillRate.lost} lost`,
    report.fillRate.lossReasons
      .map((item) => `- ${item.reason}: ${item.count}`)
      .join("\n"),
    "",
    "DORMANT SCHOOLS",
    report.dormantSchools.length === 0
      ? "None."
      : report.dormantSchools
          .map(
            (item) =>
              `- ${item.school.name}: ${formatGbp(item.lastHalfTermCharge)} last half-term (${item.lastHalfTermLabel})`,
          )
          .join("\n"),
    "",
    `NEXT WEEK FORECAST (week ending ${formatWeekEnding(report.forecast.period.weekEnding)}): ${formatGbp(report.forecast.projectedCharge)} charge, ${formatGbp(report.forecast.projectedMargin)} margin, ${report.forecast.bookingCount} confirmed`,
    "",
    `Thresholds: below ${formatGbp(report.thresholds.poundsPerDayFloor)}/day or ${report.thresholds.percentFloor}%.`,
  ];

  return lines.filter((line) => line !== undefined).join("\n");
}
