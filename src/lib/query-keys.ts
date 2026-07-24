export const queryKeys = {
  // School-scoped queries
  school: {
    all: ["school"] as const,
    students: (schoolId: string) => ["school", schoolId, "students"] as const,
    staff: (schoolId: string) => ["school", schoolId, "staff"] as const,
    fees: (schoolId: string) => ["school", schoolId, "fees"] as const,
    attendance: (schoolId: string, date: string) =>
      ["school", schoolId, "attendance", date] as const,
    exams: (schoolId: string) => ["school", schoolId, "exams"] as const,
    homework: (schoolId: string) => ["school", schoolId, "homework"] as const,
    announcements: (schoolId: string) =>
      ["school", schoolId, "announcements"] as const,
    expenses: (schoolId: string) => ["school", schoolId, "expenses"] as const,
    payroll: (schoolId: string) => ["school", schoolId, "payroll"] as const,
    library: (schoolId: string) => ["school", schoolId, "library"] as const,
    transport: (schoolId: string) => ["school", schoolId, "transport"] as const,
    leave: (schoolId: string) => ["school", schoolId, "leave"] as const,
    audit: (schoolId: string) => ["school", schoolId, "audit"] as const,
    notifications: (schoolId: string) =>
      ["school", schoolId, "notifications"] as const,
    certificates: (schoolId: string) =>
      ["school", schoolId, "certificates"] as const,
    gradebook: (schoolId: string) =>
      ["school", schoolId, "gradebook"] as const,
    settings: (schoolId: string) => ["school", schoolId, "settings"] as const,
    calendar: (schoolId: string) => ["school", schoolId, "calendar"] as const,
    calendarEvents: (schoolId: string) =>
      ["school", schoolId, "calendar", "events"] as const,
    trash: (schoolId: string) => ["school", schoolId, "trash"] as const,
    performance: (schoolId: string) =>
      ["school", schoolId, "performance"] as const,
    paymentHistory: (schoolId: string) =>
      ["school", schoolId, "paymentHistory"] as const,
    feeDefaulters: (schoolId: string) =>
      ["school", schoolId, "feeDefaulters"] as const,
    attendanceReports: (schoolId: string, dateRange?: string) =>
      ["school", schoolId, "attendance", "reports", dateRange ?? ""] as const,
    staffAttendance: (schoolId: string, date: string) =>
      ["school", schoolId, "staffAttendance", date] as const,
    academicYears: (schoolId: string) =>
      ["school", schoolId, "academicYears"] as const,
    classes: (schoolId: string) => ["school", schoolId, "classes"] as const,
    subjects: (schoolId: string) => ["school", schoolId, "subjects"] as const,
    subscription: (schoolId: string) =>
      ["school", schoolId, "subscription"] as const,
  },
  // User-scoped queries
  user: {
    profile: (userId: string) => ["user", userId, "profile"] as const,
    leaves: (userId: string) => ["user", userId, "leaves"] as const,
  },
  // Parent-scoped queries
  parent: {
    child: (userId: string) => ["parent", userId, "child"] as const,
    attendance: (studentId: string) =>
      ["parent", studentId, "attendance"] as const,
    fees: (studentId: string) => ["parent", studentId, "fees"] as const,
    homework: (studentId: string) => ["parent", studentId, "homework"] as const,
    marks: (studentId: string) => ["parent", studentId, "marks"] as const,
    announcements: (schoolId: string) =>
      ["parent", schoolId, "announcements"] as const,
  },
  // Dashboard
  dashboard: ["dashboard"] as const,
} as const;
