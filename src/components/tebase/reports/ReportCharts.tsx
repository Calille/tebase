import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGbp } from "@/types/payroll";
import type { MarginTrendPoint } from "@/types/weeklyReport";

const ReportCharts = ({ trend }: { trend: MarginTrendPoint[] }) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Margin over the last 8 weeks</CardTitle>
          <p className="text-sm font-normal text-gray-500">
            Gross margin £ (charge − pay). Week-on-week around half-term is the
            wrong lens — this is the stretch.
          </p>
        </CardHeader>
        <CardContent className="h-[260px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value: number) => `£${Math.round(value / 100) / 10}k`}
              />
              <Tooltip
                formatter={(value) => formatGbp(Number(value))}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.weekEnding
                    ? `Week ending ${payload[0].payload.weekEnding}`
                    : ""
                }
              />
              <Line
                type="monotone"
                dataKey="marginGbp"
                name="Margin"
                stroke="#047857"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Charge vs pay</CardTitle>
          <p className="text-sm font-normal text-gray-500">
            Are we billing more, or just paying more? Split for the same 8 weeks.
          </p>
        </CardHeader>
        <CardContent className="h-[260px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value: number) => `£${Math.round(value / 100) / 10}k`}
              />
              <Tooltip formatter={(value) => formatGbp(Number(value))} />
              <Legend />
              <Bar dataKey="chargeTotal" name="Charge" fill="#1e293b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="payCost" name="Pay" fill="#d97706" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCharts;
