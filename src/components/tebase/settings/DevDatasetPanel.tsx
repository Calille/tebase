import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyUiSeed, DEFAULT_SEED, getSeedConfig, SCENARIOS } from "@/mocks";
import type { SeedScenario } from "@/mocks";

const DevDatasetPanel = () => {
  const current = getSeedConfig();
  const [seed, setSeed] = useState(String(current.seed));
  const [scenario, setScenario] = useState<SeedScenario>(current.scenario);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-amber-900">Demo dataset (dev only)</h3>
        <p className="text-xs text-amber-800 mt-1">
          Same seed always rebuilds the same schools, teachers, bookings, timesheets,
          payroll and weekly report. Change the seed to shuffle names; pick a scenario
          to jump to a quiet week, a busy week, or a board full of queries.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="mock-seed">Seed</Label>
          <Input
            id="mock-seed"
            value={seed}
            onChange={(event) => setSeed(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Scenario</Label>
          <Select value={scenario} onValueChange={(value) => setScenario(value as SeedScenario)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-amber-800">
        {SCENARIOS.find((item) => item.id === scenario)?.hint}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            const parsed = Number(seed);
            applyUiSeed(Number.isFinite(parsed) ? parsed : DEFAULT_SEED, scenario);
          }}
        >
          Rebuild & reload
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSeed(String(DEFAULT_SEED));
            setScenario("default");
            applyUiSeed(DEFAULT_SEED, "default");
          }}
        >
          Reset default
        </Button>
      </div>
    </div>
  );
};

export default DevDatasetPanel;
