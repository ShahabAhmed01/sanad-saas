export interface ImportRow {
  admission_number: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  section_name: string;
  error?: string;
}

// RFC 4180 compliant CSV parser — handles quoted fields, commas inside quotes, escaped quotes
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!text.trim()) return { headers: [], rows: [] };

  const allRows: string[][] = [];
  let currentRow: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(current);
        current = "";
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
        currentRow.push(current);
        current = "";
        if (currentRow.length > 0 && currentRow.some(f => f.trim())) {
          allRows.push(currentRow);
        }
        currentRow = [];
      } else {
        current += ch;
      }
    }
  }

  if (current || currentRow.length > 0) {
    currentRow.push(current);
    if (currentRow.some(f => f.trim())) {
      allRows.push(currentRow);
    }
  }

  if (allRows.length < 2) return { headers: [], rows: [] };

  const headers = allRows[0].map(h => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < allRows.length; i++) {
    const values = allRows[i];
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Map column name aliases to canonical names
export function mapRow(row: Record<string, string>): ImportRow {
  return {
    admission_number: row.admission_number || row.adm_no || row.admno || row.admission || "",
    full_name: row.full_name || row.name || row.student_name || "",
    gender: row.gender || row.sex || "",
    date_of_birth: row.date_of_birth || row.dob || row.birth_date || "",
    section_name: row.section || row.section_name || row.class || "",
  };
}
