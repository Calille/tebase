export type RegionArea = "innerLondon" | "outerLondon" | "southEast" | "midlands" | "north";

export const POSTCODES: { postcode: string; city: string; region: string; area: RegionArea }[] = [
  { postcode: "B13 8AA", city: "Birmingham", region: "West Midlands", area: "midlands" },
  { postcode: "B14 2BB", city: "Birmingham", region: "West Midlands", area: "midlands" },
  { postcode: "B1 1AA", city: "Birmingham", region: "West Midlands", area: "midlands" },
  { postcode: "CV1 2DH", city: "Coventry", region: "West Midlands", area: "midlands" },
  { postcode: "WS1 3ER", city: "Walsall", region: "West Midlands", area: "midlands" },
  { postcode: "SW1A 2BB", city: "London", region: "Greater London", area: "innerLondon" },
  { postcode: "E1 6AN", city: "London", region: "Greater London", area: "innerLondon" },
  { postcode: "N1 9GU", city: "London", region: "Greater London", area: "innerLondon" },
  { postcode: "CR0 2XX", city: "Croydon", region: "Greater London", area: "outerLondon" },
  { postcode: "BR1 3XX", city: "Bromley", region: "Greater London", area: "outerLondon" },
  { postcode: "RG1 7XX", city: "Reading", region: "South East", area: "southEast" },
  { postcode: "OX1 1PT", city: "Oxford", region: "South East", area: "southEast" },
  { postcode: "SO14 2AA", city: "Southampton", region: "South East", area: "southEast" },
  { postcode: "M1 2AB", city: "Manchester", region: "North West", area: "north" },
  { postcode: "LS1 4AP", city: "Leeds", region: "Yorkshire", area: "north" },
  { postcode: "NE1 4ST", city: "Newcastle", region: "North East", area: "north" },
  { postcode: "L1 8JQ", city: "Liverpool", region: "North West", area: "north" },
  { postcode: "S1 2HU", city: "Sheffield", region: "Yorkshire", area: "north" },
  { postcode: "BS1 4DJ", city: "Bristol", region: "South West", area: "southEast" },
  { postcode: "CF10 1EP", city: "Cardiff", region: "Wales", area: "midlands" },
];

export const REGION_RATE: Record<RegionArea, { pay: number; charge: number }> = {
  innerLondon: { pay: 1.15, charge: 1.18 },
  outerLondon: { pay: 1.08, charge: 1.1 },
  southEast: { pay: 1.04, charge: 1.05 },
  midlands: { pay: 1, charge: 1 },
  north: { pay: 0.95, charge: 0.96 },
};
