import { Prisma } from "@prisma/client";

/** Each filter dimension is answered independently: no preference, yes, or no. */
export const TRISTATE = ["all", "yes", "no"] as const;
export type Tristate = (typeof TRISTATE)[number];

export interface RegistrationFilters {
  rsvp: Tristate;
  whatsapp: Tristate;
}

export const DEFAULT_FILTERS: RegistrationFilters = { rsvp: "all", whatsapp: "all" };

function parseTristate(value: string | null): Tristate {
  return TRISTATE.includes(value as Tristate) ? (value as Tristate) : "all";
}

export function parseRegistrationFilters(params: URLSearchParams): RegistrationFilters {
  return {
    rsvp: parseTristate(params.get("rsvp")),
    whatsapp: parseTristate(params.get("whatsapp")),
  };
}

export function filtersToQuery(filters: RegistrationFilters): string {
  return new URLSearchParams({ rsvp: filters.rsvp, whatsapp: filters.whatsapp }).toString();
}

// RSVP is stored in customData as {"attending":true|false}. Records written before
// that field existed have no key at all, so "attending" means "not explicitly declined".
const DECLINED: Prisma.RegistrationWhereInput = {
  customData: { contains: '"attending":false' },
};

const ATTENDING: Prisma.RegistrationWhereInput = {
  OR: [{ customData: null }, { NOT: DECLINED }],
};

export function registrationWhere(
  eventId: string,
  filters: RegistrationFilters
): Prisma.RegistrationWhereInput {
  const clauses: Prisma.RegistrationWhereInput[] = [{ eventId }];

  if (filters.rsvp === "yes") clauses.push(ATTENDING);
  else if (filters.rsvp === "no") clauses.push(DECLINED);

  if (filters.whatsapp === "yes") clauses.push({ whatsappOptIn: true });
  else if (filters.whatsapp === "no") clauses.push({ whatsappOptIn: false });

  // AND-ed rather than spread into one object: the RSVP clauses use OR/NOT at the
  // top level, so merging them with a second dimension would clobber the key.
  return clauses.length === 1 ? clauses[0] : { AND: clauses };
}
