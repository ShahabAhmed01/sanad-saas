"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface Subject {
  name: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

interface ReportCardProps {
  studentName: string;
  fatherName: string;
  admissionNo: string;
  className: string;
  section: string;
  examName: string;
  examDate: string;
  schoolName: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  position: number;
  totalStudents: number;
  result: "Pass" | "Fail";
  remarks?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#B8862F",
    paddingBottom: 15,
  },
  schoolName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#12332F",
    marginBottom: 4,
  },
  schoolSubtitle: {
    fontSize: 10,
    color: "#6B6B62",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B8862F",
    marginTop: 8,
  },
  studentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f7f6f1",
    borderRadius: 6,
  },
  infoGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6B6B62",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#12332F",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#12332F",
    color: "#ffffff",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4E2D8",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E4E2D8",
    backgroundColor: "#f7f6f1",
  },
  colSubject: {
    flex: 3,
    fontSize: 10,
  },
  colMarks: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  colGrade: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    padding: 12,
    backgroundColor: "#B8862F",
    borderRadius: 6,
    color: "#ffffff",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    opacity: 0.8,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultPass: {
    color: "#1F7A5C",
  },
  resultFail: {
    color: "#BD4545",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#E4E2D8",
    paddingTop: 10,
    fontSize: 8,
    color: "#6B6B62",
  },
  signature: {
    textAlign: "center",
  },
  remarks: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f7f6f1",
    borderRadius: 6,
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#12332F",
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 9,
    color: "#6B6B62",
    lineHeight: 1.5,
  },
});

export function ReportCardPDF({
  studentName,
  fatherName,
  admissionNo,
  className,
  section,
  examName,
  examDate,
  schoolName,
  subjects,
  totalMarks,
  obtainedMarks,
  percentage,
  position,
  totalStudents,
  result,
  remarks,
}: ReportCardProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.schoolName}>{schoolName}</Text>
          <Text style={styles.schoolSubtitle}>Academic Report Card</Text>
          <Text style={styles.reportTitle}>{examName}</Text>
        </View>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Student Name</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Father's Name</Text>
            <Text style={styles.infoValue}>{fatherName}</Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Class / Section</Text>
            <Text style={styles.infoValue}>
              {className} - {section}
            </Text>
          </View>
          <View style={styles.infoGroup}>
            <Text style={styles.infoLabel}>Admission No.</Text>
            <Text style={styles.infoValue}>{admissionNo}</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colSubject, styles.headerText]}>Subject</Text>
          <Text style={[styles.colMarks, styles.headerText]}>Marks</Text>
          <Text style={[styles.colMarks, styles.headerText]}>Max</Text>
          <Text style={[styles.colGrade, styles.headerText]}>Grade</Text>
        </View>

        {/* Table Rows */}
        {subjects.map((subject, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.colSubject}>{subject.name}</Text>
            <Text style={styles.colMarks}>{subject.marksObtained}</Text>
            <Text style={styles.colMarks}>{subject.maxMarks}</Text>
            <Text style={styles.colGrade}>{subject.grade}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Marks</Text>
            <Text style={styles.summaryValue}>
              {obtainedMarks}/{totalMarks}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Percentage</Text>
            <Text style={styles.summaryValue}>{percentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Position</Text>
            <Text style={styles.summaryValue}>
              {position}/{totalStudents}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Result</Text>
            <Text
              style={[
                styles.summaryValue,
                result === "Pass" ? styles.resultPass : styles.resultFail,
              ]}
            >
              {result}
            </Text>
          </View>
        </View>

        {/* Remarks */}
        {remarks && (
          <View style={styles.remarks}>
            <Text style={styles.remarksTitle}>Remarks</Text>
            <Text style={styles.remarksText}>{remarks}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text>_________________</Text>
            <Text>Class Teacher</Text>
          </View>
          <View style={styles.signature}>
            <Text>_________________</Text>
            <Text>Principal</Text>
          </View>
          <View>
            <Text>Date: {examDate}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
