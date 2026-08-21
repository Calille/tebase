import type { BillTo } from "@/types/billing";
import { IDS, VOLUME } from "../constants";
import { MATS } from "../data/schools";
import { POSTCODES, type RegionArea } from "../data/postcodes";
import { PHASES, type Phase } from "../data/subjects";
import { int, pick, type Rng } from "../rng";
import type { SeedSchool } from "../types";

const FIXTURE_SCHOOLS: Array<{
  id: string;
  name: string;
  phase: Phase;
  matId: string | null;
  city?: string;
  area?: RegionArea;
  thinMargin?: boolean;
  droppedMargin?: boolean;
  dormant?: boolean;
  slowTimesheets?: boolean;
  longName?: boolean;
}> = [
  {
    id: IDS.schools.westfield,
    name: "Westfield Primary",
    phase: "primary",
    matId: null,
    slowTimesheets: true,
  },
  {
    id: IDS.schools.stmarys,
    name: "St Mary's Secondary",
    phase: "secondary",
    matId: "mat-meridian",
  },
  {
    id: IDS.schools.oakridge,
    name: "Oakridge Academy",
    phase: "secondary",
    matId: "mat-keep",
  },
  {
    id: IDS.schools.greenfield,
    name: "Greenfield Infants",
    phase: "infant",
    matId: "mat-keep",
  },
  {
    id: IDS.schools.harbour,
    name: "Harbour View High",
    phase: "secondary",
    matId: null,
  },
  {
    id: IDS.schools.meadowbank,
    name: "Meadowbank Primary",
    phase: "primary",
    matId: null,
    dormant: true,
  },
  {
    id: IDS.schools.thin,
    name: "Pebble Brook Community Primary",
    phase: "primary",
    matId: "mat-vale",
    thinMargin: true,
  },
  {
    id: IDS.schools.drop,
    name: "Riverside High School",
    phase: "secondary",
    matId: "mat-northbridge",
    droppedMargin: true,
  },
  {
    id: IDS.schools.long,
    name: "Saint Catherine of Siena Church of England Voluntary Aided Primary School and Nursery",
    phase: "primary",
    matId: "mat-silverbirch",
    longName: true,
  },
];

const GENERATED_NAMES: { name: string; phase: Phase }[] = [
  { name: "St Anne CE Primary", phase: "primary" },
  { name: "St Joseph CE Primary", phase: "primary" },
  { name: "St Peter CE Primary", phase: "primary" },
  { name: "Ashgrove Academy", phase: "secondary" },
  { name: "Cedar Park Academy", phase: "secondary" },
  { name: "Kingsmead Academy", phase: "secondary" },
  { name: "Larkspur High School", phase: "secondary" },
  { name: "Neston High School", phase: "secondary" },
  { name: "Thornfield High School", phase: "secondary" },
  { name: "Foxhollow Community Primary", phase: "primary" },
  { name: "Maple Cross Community Primary", phase: "primary" },
  { name: "Orchard Community Primary", phase: "primary" },
  { name: "Parkside Junior School", phase: "junior" },
  { name: "Uplands Junior School", phase: "junior" },
  { name: "Quayside Infant School", phase: "infant" },
  { name: "Redwood Special School", phase: "special" },
  { name: "Southbank Sixth Form", phase: "sixth_form" },
  { name: "Meridian Sixth Form", phase: "sixth_form" },
  { name: "Vale Community Primary", phase: "primary" },
  { name: "Northbridge Academy", phase: "secondary" },
  { name: "Silver Birch Primary", phase: "primary" },
];

function matName(id: string | null): string | null {
  if (!id) return null;
  return MATS.find((item) => item.id === id)?.name ?? null;
}

export function generateSchools(rng: Rng): SeedSchool[] {
  const schools: SeedSchool[] = [];

  const make = (
    id: string,
    name: string,
    phase: Phase,
    index: number,
    extra: Partial<SeedSchool> & { matId: string | null },
  ): SeedSchool => {
    const loc = POSTCODES[index % POSTCODES.length]!;
    const head = ["Patrice Bell", "Joanna Hale", "Neil Cartwright", "Helen Crowe", "Chris Adey"][
      index % 5
    ]!;
    return {
      id,
      name,
      phase,
      urn: String(100000 + index * 17),
      postcode: loc.postcode,
      city: loc.city,
      region: loc.region,
      area: extra.area ?? loc.area,
      address: `${20 + index} Education Lane`,
      phone: `0121 555 ${String(1000 + index).slice(0, 4)}`,
      website: `https://${id.replace("sch-", "")}.school.example`,
      matId: extra.matId,
      matName: matName(extra.matId),
      standalone: extra.matId == null,
      billToId: "",
      thinMargin: Boolean(extra.thinMargin),
      droppedMargin: Boolean(extra.droppedMargin),
      dormant: Boolean(extra.dormant),
      slowTimesheets: Boolean(extra.slowTimesheets),
      longName: Boolean(extra.longName),
      contactName: head,
      contactEmail: `office@${id.replace("sch-", "")}.school.example`,
    };
  };

  FIXTURE_SCHOOLS.forEach((fixture, index) => {
    schools.push(
      make(fixture.id, fixture.name, fixture.phase, index, fixture),
    );
  });

  const keepSlots = 3;
  let generated = 0;
  while (schools.length < VOLUME.schoolCount) {
    const spec = GENERATED_NAMES[generated % GENERATED_NAMES.length]!;
    const id = `sch-${String(schools.length + 1).padStart(3, "0")}`;
    const remainingKeep = keepSlots - Math.max(0, schools.filter((s) => s.matId === "mat-keep").length - 2);
    let matId: string | null;
    if (schools.filter((s) => s.matId === "mat-keep").length < 5 && remainingKeep > 0) {
      matId = "mat-keep";
    } else if (generated % 7 === 0) {
      matId = null;
    } else {
      matId = MATS[(generated % (MATS.length - 1)) + 1]!.id;
    }
    schools.push(
      make(id, spec.name, spec.phase, schools.length, {
        matId,
        phase: spec.phase as Phase,
      } as Partial<SeedSchool> & { matId: string | null }),
    );
    generated += 1;
  }

  const keepSchools = schools.filter((s) => s.matId === "mat-keep").slice(0, 5);
  if (keepSchools.length < 5) {
    for (const school of schools) {
      if (keepSchools.length >= 5) break;
      if (school.matId == null && !school.dormant && school.id !== IDS.schools.harbour) {
        school.matId = "mat-keep";
        school.matName = matName("mat-keep");
        school.standalone = false;
        keepSchools.push(school);
      }
    }
  }

  return schools;
}

export function generateBillTos(schools: SeedSchool[]): BillTo[] {
  const keepIds = schools.filter((s) => s.matId === "mat-keep").slice(0, 5).map((s) => s.id);
  const billTos: BillTo[] = [
    {
      id: IDS.billTos.keepTrust,
      name: "Keep Academy Trust",
      kind: "multi_academy_trust",
      schoolIds: keepIds,
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
      id: IDS.billTos.westfield,
      name: "Westfield Primary",
      kind: "school",
      schoolIds: [IDS.schools.westfield],
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
      xeroContactId: "xero-c-westfield",
    },
    {
      id: IDS.billTos.stmarys,
      name: "St Mary's Secondary",
      kind: "school",
      schoolIds: [IDS.schools.stmarys],
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
      xeroContactId: "xero-c-stmarys",
    },
    {
      id: IDS.billTos.harbour,
      name: "Harbour View High",
      kind: "school",
      schoolIds: [IDS.schools.harbour],
      paymentTermsDays: 30,
      invoiceFrequency: "monthly",
      grouping: "per_school",
      poRequired: false,
      financeContact: null,
      billingAddress: null,
      xeroContactId: null,
    },
    {
      id: IDS.billTos.countyLa,
      name: "West Midlands County Council",
      kind: "local_authority",
      schoolIds: [IDS.schools.meadowbank],
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
      xeroContactId: "xero-c-wmcc",
    },
  ];

  const covered = new Set(billTos.flatMap((item) => item.schoolIds));
  for (const school of schools) {
    if (covered.has(school.id)) continue;
    if (school.matId && school.matId !== "mat-keep") {
      const existing = billTos.find((bt) => bt.id === `bt-${school.matId}`);
      if (existing) {
        existing.schoolIds.push(school.id);
        covered.add(school.id);
        continue;
      }
      billTos.push({
        id: `bt-${school.matId}`,
        name: school.matName ?? school.name,
        kind: "multi_academy_trust",
        schoolIds: [school.id],
        paymentTermsDays: 30,
        invoiceFrequency: "monthly",
        grouping: "per_school",
        poRequired: false,
        financeContact: {
          name: "Trust Finance",
          email: `finance@${school.matId}.example`,
        },
        billingAddress: {
          line1: "Trust Office",
          city: school.city,
          postcode: school.postcode,
        },
        xeroContactId: `xero-c-${school.matId}`,
      });
      covered.add(school.id);
      continue;
    }
    billTos.push({
      id: `bt-${school.id}`,
      name: school.name,
      kind: "school",
      schoolIds: [school.id],
      paymentTermsDays: 14,
      invoiceFrequency: "weekly",
      grouping: "per_school",
      poRequired: false,
      financeContact: {
        name: school.contactName,
        email: school.contactEmail,
      },
      billingAddress: {
        line1: school.address,
        city: school.city,
        postcode: school.postcode,
      },
      xeroContactId: `xero-c-${school.id}`,
    });
    covered.add(school.id);
  }

  const bySchool = new Map<string, string>();
  for (const billTo of billTos) {
    for (const schoolId of billTo.schoolIds) {
      bySchool.set(schoolId, billTo.id);
    }
  }
  for (const school of schools) {
    school.billToId = bySchool.get(school.id) ?? `bt-${school.id}`;
  }

  return billTos;
}

export function unusedInt(rng: Rng): number {
  return int(rng, 0, 9);
}

export function pickPhase(rng: Rng): Phase {
  return pick(rng, PHASES);
}
