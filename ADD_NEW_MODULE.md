# 📘 How to Add a New Lecture Module

This guide explains how to add a new subject (e.g., *Calculus 2*) to the Cover PDF Generator using the modular registry system.

---

## 1. Add the PDF Template
Place your empty cover sheet PDF in the `public/covers/` directory.
*   **Example:** `public/covers/calculus2-cover.pdf`

---

## 2. Create the PDF Engine
Create a new JavaScript file in `src/pdfEngine/engines/` to handle the specific text coordinates for this lecture.

> [!TIP]
> The easiest way is to copy `analysisEngine.js` or `linearAlgebraEngine.js` and modify the coordinates.

*   **File:** `src/pdfEngine/engines/calculus2Engine.js`
*   **Key Task:** Update the `x` and `y` coordinates in the `drawText` calls to match your new PDF template.

---

## 3. Register the Module
Open `src/config/modules.ts` and add a new entry to the `modules` array.

### Example Entry:
```typescript
{
  id: 'CALCULUS_2',                        // Unique internal ID
  name: 'Calculus 2',                      // Name shown in the dropdown
  templatePath: 'covers/calculus2-cover.pdf', // Path relative to /public
  fields: [
    // Add any extra fields you need on the form:
    { 
      key: 'tutorName', 
      label: 'Tutor Name', 
      type: 'text', 
      placeholder: 'e.g. Dr. Schmidt' 
    }
  ],
  engine: generateCalculus2PDF,            // Import your function from step 2
  outputType: 'pdf',                       // 'pdf' (Single File) or 'zip' (Multiple)
  requiresTeamName: false,                 // Set to true if a team name is mandatory
},
```

---

## 4. Understanding the `fields` Configuration
The `fields` array automatically generates the UI for your module. You can use three types:

| Type | Description |
| :--- | :--- |
| `number` | A standard numeric input (e.g., for Group Number). |
| `text` | A standard text input (e.g., for Tutor Name). |
| `pages-array` | A comma-separated list of numbers (used for Linear Algebra tasks). |

**Note:** The `Sheet Number` field is always shown for every module and does not need to be added to the `fields` array.

---

## 5. (Optional) Custom Validation
If your module requires specific logic (e.g., "Field X must be greater than Field Y"), you can add a `validate` function to the config:

```typescript
validate: (data) => {
  if (data.myCustomField > 100) {
    throw new Error("Value cannot be higher than 100!");
  }
}
```

---

## ✅ Summary of Steps
1. Add `.pdf` to `public/covers/`
2. Create `.js` engine in `src/pdfEngine/engines/`
3. Add entry to `src/config/modules.ts` (Import engine + define fields)
4. **Done!** The UI and processing logic will handle everything else automatically.
