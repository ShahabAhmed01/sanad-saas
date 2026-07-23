import { describe, it, expect } from "vitest";
import { parseCSV, mapRow } from "@/lib/csv-parser";

describe("parseCSV", () => {
  it("parses simple CSV with headers and rows", () => {
    const csv = "full_name,admission_number,gender\nAli,A001,Male\nAhmed,A002,Male";
    const result = parseCSV(csv);
    expect(result.headers).toEqual(["full_name", "admission_number", "gender"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual({ full_name: "Ali", admission_number: "A001", gender: "Male" });
    expect(result.rows[1]).toEqual({ full_name: "Ahmed", admission_number: "A002", gender: "Male" });
  });

  it("handles quoted fields with commas", () => {
    const csv = 'name,address\n"Ali, Khan","Lahore, Pakistan"';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe("Ali, Khan");
    expect(result.rows[0].address).toBe("Lahore, Pakistan");
  });

  it("handles escaped quotes (RFC 4180)", () => {
    const csv = 'name,notes\n"Ali","He said ""hello"""';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].notes).toBe('He said "hello"');
  });

  it("returns empty result for text with fewer than 2 lines", () => {
    expect(parseCSV("")).toEqual({ headers: [], rows: [] });
    expect(parseCSV("full_name,admission_number")).toEqual({ headers: [], rows: [] });
  });

  it("skips empty lines", () => {
    const csv = "name,id\nAli,1\n\nAhmed,2\n";
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("skips malformed rows with fewer than 2 values", () => {
    const csv = "name,id\nAli,1\nAhmed";
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe("Ali");
  });

  it("normalizes headers to lowercase and trims whitespace", () => {
    const csv = " Full Name , Admission Number \nAli,A001";
    const result = parseCSV(csv);
    expect(result.headers).toEqual(["full name", "admission number"]);
    expect(result.rows[0]["full name"]).toBe("Ali");
  });

  it("handles CRLF line endings", () => {
    const csv = "name,id\r\nAli,1\r\nAhmed,2";
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("handles mixed line endings", () => {
    const csv = "name,id\nAli,1\r\nAhmed,2";
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
  });

  it("handles values with extra whitespace", () => {
    const csv = "name,id\n  Ali  ,  1  ";
    const result = parseCSV(csv);
    expect(result.rows[0].name).toBe("Ali");
    expect(result.rows[0].id).toBe("1");
  });

  it("handles missing values in rows (shorter than header count)", () => {
    const csv = "name,id,gender\nAli,1";
    const result = parseCSV(csv);
    expect(result.rows[0]).toEqual({ name: "Ali", id: "1", gender: "" });
  });

  it("handles Windows-style CRLF with quoted fields", () => {
    const csv = 'name,address\r\n"Ali, Khan","Lahore"\r\nAhmed,"Islamabad"';
    const result = parseCSV(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].address).toBe("Lahore");
  });
});

describe("mapRow", () => {
  it("maps canonical column names", () => {
    const row = {
      admission_number: "A001",
      full_name: "Ali",
      gender: "Male",
      date_of_birth: "2010-01-01",
      section: "A",
    };
    const result = mapRow(row);
    expect(result.admission_number).toBe("A001");
    expect(result.full_name).toBe("Ali");
    expect(result.gender).toBe("Male");
    expect(result.date_of_birth).toBe("2010-01-01");
    expect(result.section_name).toBe("A");
  });

  it("maps alias adm_no to admission_number", () => {
    const result = mapRow({ adm_no: "A001", name: "Ali" });
    expect(result.admission_number).toBe("A001");
    expect(result.full_name).toBe("Ali");
  });

  it("maps alias admno to admission_number", () => {
    const result = mapRow({ admno: "A001" });
    expect(result.admission_number).toBe("A001");
  });

  it("maps alias admission to admission_number", () => {
    const result = mapRow({ admission: "A001" });
    expect(result.admission_number).toBe("A001");
  });

  it("maps alias student_name to full_name", () => {
    const result = mapRow({ student_name: "Ali" });
    expect(result.full_name).toBe("Ali");
  });

  it("maps alias name to full_name", () => {
    const result = mapRow({ name: "Ali" });
    expect(result.full_name).toBe("Ali");
  });

  it("maps alias sex to gender", () => {
    const result = mapRow({ sex: "Female" });
    expect(result.gender).toBe("Female");
  });

  it("maps alias dob to date_of_birth", () => {
    const result = mapRow({ dob: "2010-01-01" });
    expect(result.date_of_birth).toBe("2010-01-01");
  });

  it("maps alias birth_date to date_of_birth", () => {
    const result = mapRow({ birth_date: "2010-01-01" });
    expect(result.date_of_birth).toBe("2010-01-01");
  });

  it("maps alias class to section_name", () => {
    const result = mapRow({ class: "5-A" });
    expect(result.section_name).toBe("5-A");
  });

  it("maps alias section_name to section_name", () => {
    const result = mapRow({ section_name: "5-A" });
    expect(result.section_name).toBe("5-A");
  });

  it("returns empty strings for missing fields", () => {
    const result = mapRow({});
    expect(result.admission_number).toBe("");
    expect(result.full_name).toBe("");
    expect(result.gender).toBe("");
    expect(result.date_of_birth).toBe("");
    expect(result.section_name).toBe("");
  });

  it("prioritizes canonical name over aliases", () => {
    const result = mapRow({
      admission_number: "A001",
      adm_no: "A999",
      full_name: "Ali",
      name: "Ahmed",
    });
    expect(result.admission_number).toBe("A001");
    expect(result.full_name).toBe("Ali");
  });
});
