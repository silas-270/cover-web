"use server"

import { PdfData } from "@/src/zustand/usePdfStore";

/**
 * Logs user input data to the server terminal for debugging purposes.
 * This runs on the server, so the output will appear in the developer's console/terminal.
 */
export async function logUserData(type: string, data: PdfData) {
  console.log("--- DEBUG: User Input Data ---");
  console.log(`Module Type: ${type}`);
  console.log("Form Data:", JSON.stringify(data, null, 2));
  console.log("------------------------------");
  return { success: true };
}
