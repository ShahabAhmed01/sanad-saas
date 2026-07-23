import { describe, it, expect } from "vitest";
import { queryKeys } from "../query-keys";

describe("queryKeys", () => {
  it("has school, user, parent, and dashboard top-level keys", () => {
    expect(queryKeys).toHaveProperty("school");
    expect(queryKeys).toHaveProperty("user");
    expect(queryKeys).toHaveProperty("parent");
    expect(queryKeys).toHaveProperty("dashboard");
  });

  it("school.all returns correct key", () => {
    expect(queryKeys.school.all).toEqual(["school"]);
  });

  it("school factory functions return correct key arrays", () => {
    expect(queryKeys.school.students("s1")).toEqual(["school", "s1", "students"]);
    expect(queryKeys.school.staff("s1")).toEqual(["school", "s1", "staff"]);
    expect(queryKeys.school.fees("s1")).toEqual(["school", "s1", "fees"]);
    expect(queryKeys.school.attendance("s1", "2026-01-01")).toEqual([
      "school", "s1", "attendance", "2026-01-01",
    ]);
    expect(queryKeys.school.exams("s1")).toEqual(["school", "s1", "exams"]);
    expect(queryKeys.school.settings("s1")).toEqual(["school", "s1", "settings"]);
  });

  it("user factory functions return correct key arrays", () => {
    expect(queryKeys.user.profile("u1")).toEqual(["user", "u1", "profile"]);
    expect(queryKeys.user.leaves("u1")).toEqual(["user", "u1", "leaves"]);
  });

  it("parent factory functions return correct key arrays", () => {
    expect(queryKeys.parent.child("u1")).toEqual(["parent", "u1", "child"]);
    expect(queryKeys.parent.attendance("st1")).toEqual(["parent", "st1", "attendance"]);
    expect(queryKeys.parent.fees("st1")).toEqual(["parent", "st1", "fees"]);
    expect(queryKeys.parent.homework("st1")).toEqual(["parent", "st1", "homework"]);
    expect(queryKeys.parent.marks("st1")).toEqual(["parent", "st1", "marks"]);
    expect(queryKeys.parent.announcements("sch1")).toEqual(["parent", "sch1", "announcements"]);
  });

  it("dashboard key is a static tuple", () => {
    expect(queryKeys.dashboard).toEqual(["dashboard"]);
  });
});
