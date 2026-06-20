export const PROGRAMS = [
  { id: "career", title: "Career Coaching" },
  { id: "business", title: "Business Coaching" },
  { id: "life", title: "Life Coaching" },
  { id: "leadership", title: "Leadership Coaching" },
] as const;

const normalize = (value: string) => value.trim().toLowerCase();

const resolveProgram = (value: string) =>
  PROGRAMS.find(
    (program) =>
      program.id === value ||
      normalize(program.title) === normalize(value) ||
      program.title === value,
  );

export const programsMatch = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  if (normalize(a) === normalize(b)) return true;

  const programA = resolveProgram(a);
  const programB = resolveProgram(b);

  if (programA && programB) return programA.id === programB.id;
  if (programA) return programA.id === b || normalize(programA.title) === normalize(b);
  if (programB) return programB.id === a || normalize(programB.title) === normalize(a);

  return false;
};

export const coachMatchesProgram = (
  coachSpecialization: string,
  selectedProgram: string,
): boolean => programsMatch(coachSpecialization, selectedProgram);
