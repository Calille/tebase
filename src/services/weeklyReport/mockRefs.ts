import type { PartyRef } from "@/types/party";

export const CONSULTANTS: PartyRef[] = [
  { id: "cons-alex", name: "Alex Patel" },
  { id: "cons-jordan", name: "Jordan Blake" },
  { id: "cons-sam", name: "Sam Reed" },
];

export const SCHOOLS = {
  westfield: { id: "sch-westfield", name: "Westfield Primary" },
  stmarys: { id: "sch-stmarys", name: "St Mary's Secondary" },
  oakridge: { id: "sch-oakridge", name: "Oakridge Academy" },
  greenfield: { id: "sch-greenfield", name: "Greenfield Infants" },
  harbour: { id: "sch-harbour", name: "Harbour View High" },
  meadowbank: { id: "sch-meadowbank", name: "Meadowbank Primary" },
} as const;

export const TEACHERS = {
  john: { id: "tch-john", name: "John Smith" },
  sarah: { id: "tch-sarah", name: "Sarah Johnson" },
  michael: { id: "tch-michael", name: "Michael Chen" },
  emily: { id: "tch-emily", name: "Emily Rodriguez" },
  david: { id: "tch-david", name: "David Wilson" },
  priya: { id: "tch-priya", name: "Priya Nair" },
  tom: { id: "tch-tom", name: "Tom Hughes" },
  aisha: { id: "tch-aisha", name: "Aisha Khan" },
  nina: { id: "tch-nina", name: "Nina Cole" },
  james: { id: "tch-james", name: "James Okonkwo" },
} as const;

export function consultantById(id: string): PartyRef | undefined {
  return CONSULTANTS.find((item) => item.id === id);
}

export function consultantByName(name: string): PartyRef | undefined {
  const needle = name.trim().toLowerCase();
  return CONSULTANTS.find((item) => item.name.toLowerCase() === needle);
}
