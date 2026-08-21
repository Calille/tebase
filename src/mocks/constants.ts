export const DEFAULT_SEED = 20260821;

export const VOLUME = {
  consultantCount: 8,
  teamCount: 2,
  teacherCount: 50,
  schoolCount: 30,
  matCount: 6,
  historyWeeks: 12,
  extraHistoryWeeks: 4,
  bookingsPerConsultantPerWeek: 10,
  emptyWeekOffset: 3,
} as const;

export type SeedScenario = "default" | "quiet" | "busy" | "queries";

export const SCENARIOS: { id: SeedScenario; label: string; hint: string }[] = [
  {
    id: "default",
    label: "Default",
    hint: "Full coherent dataset with every edge case represented",
  },
  {
    id: "quiet",
    label: "Quiet week",
    hint: "About a third of the usual booking volume",
  },
  {
    id: "busy",
    label: "Busy week",
    hint: "This week is overloaded — pagination and filters get a workout",
  },
  {
    id: "queries",
    label: "Lots of queries",
    hint: "Recent timesheets are mostly sitting in query",
  },
];

export const STORAGE_SEED = "tebase.mock.seed";
export const STORAGE_SCENARIO = "tebase.mock.scenario";

export const IDS = {
  consultants: {
    alex: "cons-alex",
    jordan: "cons-jordan",
    sam: "cons-sam",
    lee: "cons-lee",
    fatima: "cons-fatima",
    owen: "cons-owen",
    amara: "cons-amara",
    idle: "cons-idle",
    teamLead: "cons-tl",
    director: "cons-dir",
  },
  teams: {
    north: "team-north",
    south: "team-south",
  },
  schools: {
    westfield: "sch-westfield",
    stmarys: "sch-stmarys",
    oakridge: "sch-oakridge",
    greenfield: "sch-greenfield",
    harbour: "sch-harbour",
    meadowbank: "sch-meadowbank",
    thin: "sch-thin",
    drop: "sch-drop",
    long: "sch-long",
  },
  teachers: {
    john: "tch-john",
    sarah: "tch-sarah",
    michael: "tch-michael",
    emily: "tch-emily",
    david: "tch-david",
    priya: "tch-priya",
    tom: "tch-tom",
    aisha: "tch-aisha",
    lisa: "tch-lisa",
    wright: "tch-wright",
    nora: "tch-nora",
    nina: "tch-nina",
    james: "tch-james",
    obrien: "tch-obrien",
    ni: "tch-ni",
    long: "tch-long",
    dbs: "tch-dbs",
    noref: "tch-noref",
    awr4: "tch-awr-04",
    awr11: "tch-awr-11",
    awr12: "tch-awr-12",
    awr13: "tch-awr-13",
    awrBreak: "tch-awr-break",
    longterm: "tch-longterm",
  },
  billTos: {
    keepTrust: "bt-keep-trust",
    westfield: "bt-westfield",
    stmarys: "bt-stmarys",
    harbour: "bt-harbour-incomplete",
    countyLa: "bt-county-la",
  },
  timesheets: {
    unapp1: "ts-unapp-1",
    unapp2: "ts-unapp-2",
    unapp3: "ts-unapp-3",
    ok1: "ts-ok-1",
    okGreenfield: "ts-ok-greenfield",
    okHarbour: "ts-ok-harbour",
    sam1: "ts-sam-1",
    overdue1: "ts-overdue-1",
    draftLate: "ts-draft-late",
    inset1: "ts-inset-1",
    prevApproved: "ts-prev-approved",
    olderSlow: "ts-older-slow",
    queryResolved: "ts-query-resolved",
    queryOpen: "ts-query-open",
  },
} as const;
