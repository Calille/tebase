import type { PartyRef } from "@/types/party";
import { getDataset } from "@/mocks";

function consultants(): PartyRef[] {
  return getDataset()
    .consultants.filter((item) => item.role === "consultant")
    .map((item) => ({ id: item.id, name: item.name }));
}

export const CONSULTANTS: PartyRef[] = new Proxy([] as PartyRef[], {
  get(_target, prop, receiver) {
    return Reflect.get(consultants(), prop, receiver);
  },
});

export const SCHOOLS = {
  get westfield() {
    const school = getDataset().schools.find((item) => item.id === "sch-westfield");
    return { id: "sch-westfield", name: school?.name ?? "Westfield Primary" };
  },
  get stmarys() {
    const school = getDataset().schools.find((item) => item.id === "sch-stmarys");
    return { id: "sch-stmarys", name: school?.name ?? "St Mary's Secondary" };
  },
  get oakridge() {
    const school = getDataset().schools.find((item) => item.id === "sch-oakridge");
    return { id: "sch-oakridge", name: school?.name ?? "Oakridge Academy" };
  },
  get greenfield() {
    const school = getDataset().schools.find((item) => item.id === "sch-greenfield");
    return { id: "sch-greenfield", name: school?.name ?? "Greenfield Infants" };
  },
  get harbour() {
    const school = getDataset().schools.find((item) => item.id === "sch-harbour");
    return { id: "sch-harbour", name: school?.name ?? "Harbour View High" };
  },
  get meadowbank() {
    const school = getDataset().schools.find((item) => item.id === "sch-meadowbank");
    return { id: "sch-meadowbank", name: school?.name ?? "Meadowbank Primary" };
  },
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
  return getDataset()
    .consultants.map((item) => ({ id: item.id, name: item.name }))
    .find((item) => item.id === id);
}

export function consultantByName(name: string): PartyRef | undefined {
  const needle = name.trim().toLowerCase();
  return getDataset()
    .consultants.map((item) => ({ id: item.id, name: item.name }))
    .find((item) => item.name.toLowerCase() === needle);
}
