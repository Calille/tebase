import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGbp } from "@/types/payroll";
import type { ComparedStat, WeeklyHeadline } from "@/types/weeklyReport";
import { cn } from "@/lib/utils";

function Delta({
  delta,
  money,
}: {
  delta: { absolute: number; percent: number | null };
  money?: boolean;
}) {
  const positive = delta.absolute > 0;
  const negative = delta.absolute < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const text =
    delta.percent == null
      ? money
        ? formatGbp(delta.absolute)
        : String(delta.absolute)
      : `${delta.percent > 0 ? "+" : ""}${delta.percent}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium",
        positive && "text-emerald-700",
        negative && "text-red-700",
        !positive && !negative && "text-gray-500",
      )}
    >
      <Icon className="mr-0.5 h-3 w-3" />
      {text}
    </span>
  );
}

function Tile({
  title,
  value,
  hint,
  stat,
  money,
}: {
  title: string;
  value: string;
  hint: string;
  stat: ComparedStat;
  money?: boolean;
}) {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums tracking-tight text-gray-900">
          {value}
        </p>
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
        <div className="mt-3 space-y-1">
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <Delta delta={stat.lastWeek} money={money} />
            <span>vs last week</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <Delta delta={stat.lastTerm} money={money} />
            <span>vs same week last term</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const ReportStatTiles = ({ headlines }: { headlines: WeeklyHeadline }) => {
  const { current } = headlines;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          title="Total charge"
          value={formatGbp(current.chargeTotal)}
          hint="Billed to schools this week"
          stat={headlines.charge}
          money
        />
        <Tile
          title="Total pay cost"
          value={formatGbp(current.payCost)}
          hint="PAYE gross + umbrella assignment"
          stat={headlines.payCost}
          money
        />
        <Tile
          title="Gross margin"
          value={formatGbp(current.marginGbp)}
          hint={`${current.marginPercent}% of charge · charge − pay`}
          stat={headlines.marginGbp}
          money
        />
        <Tile
          title="Days filled"
          value={String(current.daysFilled)}
          hint="Teacher-days worked this week"
          stat={headlines.daysFilled}
        />
      </div>
      <p className="text-xs text-gray-500">
        Last-term comparison: {headlines.lastTermLabel}
        {headlines.lastTermIsProxy
          ? ". Selected week sits outside the stub term calendar, so this is a 13-week proxy."
          : "."}
      </p>
    </div>
  );
};

export default ReportStatTiles;
