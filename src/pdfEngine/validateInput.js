/**
 * Validiert das JSON-Datenobjekt.
 * @param {Object} data - Das zu prüfende Objekt.
 * @param {boolean} allowNull - Wenn true, dürfen (LA) Felder null/undefined sein.
 * @returns {boolean} - True, wenn valide.
 */
export function validateInput(data, allowNull = false) {
  // Hilfsfunktion für Ganzzahlen >= 0
  const isPositiveInt = (val) => Number.isInteger(val) && val >= 0;

  // 1. Pflichtfeld: sheetNum (Immer prüfen)
  if (!isPositiveInt(data.sheetNum)) throw new Error("Bitte gib eine gültige Blattnummer ein.");

  // Hilfs-Check für (LA) Felder
  const checkLA = (val, validator) => {
    if (allowNull && (val === null || val === undefined)) return true;
    return validator(val);
  };

  // 2. (LA) startIdx
  if (!checkLA(data.startIdx, isPositiveInt)) throw new Error("Bitte gib eine gültige Startaufgabe ein.");

  // 3. (LA) pagesArray
  if (!checkLA(data.pagesArray, (val) => Array.isArray(val) && val.every(isPositiveInt))) {
    throw new Error("Bitte prüfe die Eingabe für 'Pages per Task'.");
  }

  // 4. (LA) teamName
  if (!checkLA(data.teamName, (val) => typeof val === 'string' && val.trim() !== '')) {
    throw new Error("Bitte gib einen Teamnamen in den Einstellungen an.");
  }

  // 5. Students Sektion
  const s = data.students;
  if (!s || !Array.isArray(s) || s.length === 0) {
    throw new Error("Bitte füge in den Einstellungen mindestens ein Teammitglied hinzu.");
  }
  
  const isValidStudents = s.every(student => 
    typeof student.lastName === 'string' &&
    typeof student.firstName === 'string' &&
    typeof student.matNum === 'string'
  );

  if (!isValidStudents) {
    throw new Error("Alle Teammitglieder müssen Vorname, Nachname und Matrikelnummer haben.");
  }
  
  return true;
}