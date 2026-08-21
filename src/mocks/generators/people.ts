import { IDS, VOLUME } from "../constants";
import { CONSULTANT_FIXTURES, FIRST_NAMES, LEADERSHIP, SURNAMES } from "../data/names";
import { POSTCODES } from "../data/postcodes";
import { RATE_BANDS, STAFF_ROLES, type StaffRole } from "../data/roles";
import { PHASES, PRIMARY_KEY_STAGES, SECONDARY_SUBJECTS, type Phase } from "../data/subjects";
import { chance, int, pick, type Rng, round2 } from "../rng";
import type { SeedConsultant, SeedTeacher, SeedTeam } from "../types";

function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

function fakeNi(rng: Rng, index: number): string {
  const letters = "ABGHJLNPTW";
  const a = letters[index % letters.length];
  const b = letters[(index * 3 + 2) % letters.length];
  const n = String(100000 + ((index * 7919) % 800000)).slice(0, 6);
  const suffix = "ABCD"[index % 4];
  return `${a}${b}${n}${suffix}`;
}

function fakeDbs(index: number): string {
  return `00${String(100000000000 + index * 17).slice(0, 12)}`;
}

function fakeMobile(index: number): string {
  const rest = String(900000 + index).slice(0, 6);
  return `07700 ${rest.slice(0, 3)}${rest.slice(3)}`;
}

function bandRate(
  rng: Rng,
  role: StaffRole,
  longTerm: boolean,
  payMul: number,
  chargeMul: number,
): { pay: number; charge: number } {
  const band = longTerm ? RATE_BANDS.long_term : RATE_BANDS[role];
  const pay = round2((band.pay[0] + rng() * (band.pay[1] - band.pay[0])) * payMul);
  const minCharge = Math.max(band.charge[0] * chargeMul, pay + 15);
  const charge = round2(
    minCharge + rng() * Math.max(5, band.charge[1] * chargeMul - minCharge),
  );
  return { pay, charge };
}

export function generateOrgPeople(rng: Rng): {
  teams: SeedTeam[];
  consultants: SeedConsultant[];
} {
  const teams: SeedTeam[] = [
    { id: IDS.teams.north, name: "North desk", leaderId: IDS.consultants.teamLead },
    { id: IDS.teams.south, name: "South desk", leaderId: IDS.consultants.teamLead },
  ];

  const consultants: SeedConsultant[] = CONSULTANT_FIXTURES.map((item) => ({
    id: item.id,
    name: item.name,
    email: `${slug(item.name)}@keep-supply.example`,
    teamId: item.teamId,
    role: "consultant",
  }));

  consultants.push({
    id: LEADERSHIP.teamLead.id,
    name: LEADERSHIP.teamLead.name,
    email: "maya.hernandez@keep-supply.example",
    teamId: IDS.teams.north,
    role: "team_leader",
  });
  consultants.push({
    id: LEADERSHIP.director.id,
    name: LEADERSHIP.director.name,
    email: "chris.adey@keep-supply.example",
    teamId: IDS.teams.north,
    role: "director",
  });

  return { teams, consultants };
}

const FIXTURE_TEACHERS: Array<{
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  payrollType: "paye" | "umbrella";
  consultantId: string;
  phase: Phase | "mixed";
  subjects: string[];
  dbsExpired?: boolean;
  missingReference?: boolean;
  niNull?: boolean;
  payNull?: boolean;
  zeroDaysOnly?: boolean;
}> = [
  {
    id: IDS.teachers.john,
    firstName: "John",
    lastName: "Smith",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.alex,
    phase: "secondary",
    subjects: ["Maths"],
  },
  {
    id: IDS.teachers.sarah,
    firstName: "Sarah",
    lastName: "Johnson",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.alex,
    phase: "secondary",
    subjects: ["English"],
  },
  {
    id: IDS.teachers.michael,
    firstName: "Michael",
    lastName: "Chen",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["Science"],
  },
  {
    id: IDS.teachers.emily,
    firstName: "Emily",
    lastName: "Rodriguez",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.sam,
    phase: "primary",
    subjects: ["Primary"],
  },
  {
    id: IDS.teachers.david,
    firstName: "David",
    lastName: "Wilson",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["PE"],
  },
  {
    id: IDS.teachers.priya,
    firstName: "Priya",
    lastName: "Nair",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.alex,
    phase: "secondary",
    subjects: ["English"],
  },
  {
    id: IDS.teachers.tom,
    firstName: "Tom",
    lastName: "Hughes",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.sam,
    phase: "secondary",
    subjects: ["Humanities"],
  },
  {
    id: IDS.teachers.aisha,
    firstName: "Aisha",
    lastName: "Khan",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["Science"],
  },
  {
    id: IDS.teachers.lisa,
    firstName: "Lisa",
    lastName: "Okonkwo",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.alex,
    phase: "primary",
    subjects: ["Primary"],
    niNull: true,
  },
  {
    id: IDS.teachers.wright,
    firstName: "James",
    lastName: "Wright",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.sam,
    phase: "secondary",
    subjects: ["Maths"],
    zeroDaysOnly: true,
  },
  {
    id: IDS.teachers.nora,
    firstName: "Nora",
    lastName: "Ellis",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["MFL"],
    payNull: true,
  },
  {
    id: IDS.teachers.nina,
    firstName: "Nina",
    lastName: "Cole",
    role: "teaching_assistant",
    payrollType: "paye",
    consultantId: IDS.consultants.sam,
    phase: "infant",
    subjects: ["Primary"],
  },
  {
    id: IDS.teachers.james,
    firstName: "James",
    lastName: "Okonkwo",
    role: "cover_supervisor",
    payrollType: "paye",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["Cover"],
  },
  {
    id: IDS.teachers.obrien,
    firstName: "Siobhan",
    lastName: "O'Brien",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.lee,
    phase: "primary",
    subjects: ["Primary"],
  },
  {
    id: IDS.teachers.ni,
    firstName: "Aoife",
    lastName: "Ní Mhaoileoin",
    role: "hlta",
    payrollType: "paye",
    consultantId: IDS.consultants.fatima,
    phase: "primary",
    subjects: ["Primary"],
  },
  {
    id: IDS.teachers.long,
    firstName: "Charlotte-Anne",
    lastName: "Harrington-Smythe",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.owen,
    phase: "secondary",
    subjects: ["English"],
  },
  {
    id: IDS.teachers.dbs,
    firstName: "Ravi",
    lastName: "Kapoor",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.amara,
    phase: "secondary",
    subjects: ["Science"],
    dbsExpired: true,
  },
  {
    id: IDS.teachers.noref,
    firstName: "Elena",
    lastName: "Popescu",
    role: "teaching_assistant",
    payrollType: "paye",
    consultantId: IDS.consultants.lee,
    phase: "primary",
    subjects: ["Primary"],
    missingReference: true,
  },
  {
    id: IDS.teachers.awr4,
    firstName: "Hassan",
    lastName: "Ali",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.alex,
    phase: "secondary",
    subjects: ["Maths"],
  },
  {
    id: IDS.teachers.awr11,
    firstName: "Mei",
    lastName: "Zhang",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.jordan,
    phase: "secondary",
    subjects: ["MFL"],
  },
  {
    id: IDS.teachers.awr12,
    firstName: "Daniel",
    lastName: "Okeke",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.sam,
    phase: "secondary",
    subjects: ["Science"],
  },
  {
    id: IDS.teachers.awr13,
    firstName: "Freya",
    lastName: "Walsh",
    role: "supply_teacher",
    payrollType: "umbrella",
    consultantId: IDS.consultants.fatima,
    phase: "secondary",
    subjects: ["English"],
  },
  {
    id: IDS.teachers.awrBreak,
    firstName: "Omar",
    lastName: "Rahman",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.owen,
    phase: "secondary",
    subjects: ["DT"],
  },
  {
    id: IDS.teachers.longterm,
    firstName: "Imani",
    lastName: "Adeyemi",
    role: "supply_teacher",
    payrollType: "paye",
    consultantId: IDS.consultants.amara,
    phase: "secondary",
    subjects: ["Humanities"],
  },
];

export function generateTeachers(
  rng: Rng,
  consultants: SeedConsultant[],
  now: Date,
): SeedTeacher[] {
  const desks = consultants.filter((item) => item.role === "consultant");
  const teachers: SeedTeacher[] = [];

  const make = (
    id: string,
    firstName: string,
    lastName: string,
    opts: {
      role: StaffRole;
      payrollType: "paye" | "umbrella";
      consultantId: string;
      phase: Phase | "mixed";
      subjects: string[];
      dbsExpired?: boolean;
      missingReference?: boolean;
      niNull?: boolean;
      payNull?: boolean;
      index: number;
    },
  ): SeedTeacher => {
    const loc = POSTCODES[opts.index % POSTCODES.length]!;
    const rates = bandRate(rng, opts.role, id === IDS.teachers.longterm, 1, 1);
    const dbsExpiry = new Date(now);
    if (opts.dbsExpired) {
      dbsExpiry.setDate(dbsExpiry.getDate() - 40);
    } else {
      dbsExpiry.setFullYear(dbsExpiry.getFullYear() + 1 + (opts.index % 3));
    }
    const keyStages =
      opts.phase === "secondary" || opts.phase === "sixth_form"
        ? []
        : [pick(rng, PRIMARY_KEY_STAGES)];
    return {
      id,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: `${slug(`${firstName} ${lastName}`)}@keep-supply.example`,
      phone: fakeMobile(opts.index + 11),
      niNumber: opts.niNull ? null : fakeNi(rng, opts.index + 3),
      payrollNumber:
        opts.payrollType === "paye" ? `PAYE-${1000 + opts.index}` : `UMB-${2000 + opts.index}`,
      payrollType: opts.payrollType,
      umbrellaProvider: opts.payrollType === "umbrella" ? "Mainpay" : null,
      dbsNumber: fakeDbs(opts.index + 20),
      dbsExpiry: dbsExpiry.toISOString().slice(0, 10),
      dbsExpired: Boolean(opts.dbsExpired),
      missingReference: Boolean(opts.missingReference),
      subjects: opts.subjects,
      keyStages,
      role: opts.role,
      phase: opts.phase,
      status: opts.missingReference ? "pending" : "active",
      consultantId: opts.consultantId,
      region: loc.region,
      postcode: loc.postcode,
      address: `${10 + opts.index} ${lastName.split("-")[0]} Close, ${loc.city}`,
      payRate: opts.payNull ? null : rates.pay,
      chargeRate: rates.charge,
      lastBookingDate: null,
      blockedFromBookings: Boolean(opts.missingReference || opts.dbsExpired),
    };
  };

  FIXTURE_TEACHERS.forEach((fixture, index) => {
    teachers.push(
      make(fixture.id, fixture.firstName, fixture.lastName, {
        ...fixture,
        index,
      }),
    );
  });

  const usedNames = new Set(teachers.map((item) => item.name));
  let i = teachers.length;
  while (teachers.length < VOLUME.teacherCount) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = SURNAMES[(i * 5) % SURNAMES.length]!;
    const name = `${first} ${last}`;
    if (usedNames.has(name)) {
      i += 1;
      continue;
    }
    usedNames.add(name);
    const role = STAFF_ROLES[i % STAFF_ROLES.length]!;
    const payrollType: "paye" | "umbrella" = chance(rng, 0.6) ? "paye" : "umbrella";
    const consultant = desks[i % desks.length]!;
    const phase = PHASES[i % PHASES.length]!;
    const subjects =
      phase === "secondary" || phase === "sixth_form"
        ? [pick(rng, SECONDARY_SUBJECTS)]
        : ["Primary"];
    teachers.push(
      make(`tch-${String(i + 1).padStart(3, "0")}`, first, last, {
        role,
        payrollType,
        consultantId: consultant.id,
        phase,
        subjects,
        index: i,
      }),
    );
    i += 1;
  }

  return teachers;
}

export function intRange(rng: Rng, min: number, max: number): number {
  return int(rng, min, max);
}
