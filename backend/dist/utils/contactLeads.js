export function interestToProgramSlug(interest) {
    if (interest === "Individual Executive Coaching")
        return "individual-executive";
    if (interest === "Group Executive Coaching")
        return "group-executive";
    return null;
}
export function programSlugToTitle(slug) {
    if (slug === "individual-executive")
        return "Individual Executive Coaching";
    if (slug === "group-executive")
        return "Group Executive Coaching";
    return slug;
}
//# sourceMappingURL=contactLeads.js.map