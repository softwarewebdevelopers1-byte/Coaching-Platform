export type ContactLeadStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "converted"
  | "closed";

export function interestToProgramSlug(
  interest: string,
): "individual-executive" | "group-executive" | null {
  if (interest === "Individual Executive Coaching") return "individual-executive";
  if (interest === "Group Executive Coaching") return "group-executive";
  return null;
}

export function programSlugToTitle(slug: string): string {
  if (slug === "individual-executive") return "Individual Executive Coaching";
  if (slug === "group-executive") return "Group Executive Coaching";
  return slug;
}
