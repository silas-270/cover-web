/**
 * Global validation — always runs regardless of module.
 * Throws an Error with a user-facing message on failure.
 *
 * @param {Object} data - Form data (sheetNum, etc.)
 * @param {Object} group - The group for the current lecture { teamName, students }
 */
export function validateGlobal(data, group) {
  const isPositiveInt = (val) => Number.isInteger(val) && val >= 0;

  // 1. Sheet number
  if (!isPositiveInt(data.sheetNum)) {
    throw new Error("Bitte gib eine gültige Blattnummer ein.");
  }

  // 2. Group must exist
  if (!group) {
    throw new Error("Für diese Vorlesung wurde noch keine Gruppe erstellt. Erstelle eine in den Einstellungen.");
  }

  // 3. Students
  const s = group.students;
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