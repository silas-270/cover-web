/**
 * Global validation — always runs regardless of module.
 * Throws an Error with a user-facing message on failure.
 */
export function validateGlobal(data) {
  const isPositiveInt = (val) => Number.isInteger(val) && val >= 0;

  // 1. Sheet number
  if (!isPositiveInt(data.sheetNum)) {
    throw new Error("Bitte gib eine gültige Blattnummer ein.");
  }

  // 2. Students
  const s = data.students;
  if (!s || !Array.isArray(s) || s.length === 0) {
    throw new Error("Bitte füge in den Einstellungen mindestens ein Teammitglied hinzu.");
  }

  const isValidStudents = s.every(
    (student) =>
      typeof student.lastName === "string" &&
      typeof student.firstName === "string" &&
      typeof student.matNum === "string"
  );

  if (!isValidStudents) {
    throw new Error("Alle Teammitglieder müssen Vorname, Nachname und Matrikelnummer haben.");
  }

  return true;
}