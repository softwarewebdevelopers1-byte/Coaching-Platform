export const PROGRAMS = [
  { id: "individual-executive", title: "Individual Executive Coaching" },
  { id: "group-executive", title: "Group Executive Coaching" },
] as const;

const normalize = (value: string) => value.trim().toLowerCase();
const splitProgramValues = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const resolveProgram = (value: string) =>
  PROGRAMS.find(
    (program) =>
      program.id === value ||
      normalize(program.title) === normalize(value) ||
      program.title === value,
  );

export const programsMatch = (a: string, b: string): boolean => {
  if (!a || !b) return false;
  const valuesA = splitProgramValues(a);
  const valuesB = splitProgramValues(b);

  if (valuesA.length > 1 || valuesB.length > 1) {
    return valuesA.some((valueA) =>
      valuesB.some((valueB) => programsMatch(valueA, valueB)),
    );
  }

  if (normalize(a) === normalize(b)) return true;

  const programA = resolveProgram(a);
  const programB = resolveProgram(b);

  if (programA && programB) return programA.id === programB.id;
  if (programA) return programA.id === b || normalize(programA.title) === normalize(b);
  if (programB) return programB.id === a || normalize(programB.title) === normalize(a);

  return false;
};
