"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, BookOpen, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSchoolId } from "@/hooks/use-user-profile";
import { queryKeys } from "@/lib/query-keys";
import { useI18n } from "@/i18n/provider";

interface Book {
  id: string;
  title: string;
  author: string;
  available_copies: number;
}

interface Transaction {
  id: string;
  book_id: string;
  book_title: string;
  borrower_name: string;
  issued_at: string;
  due_date: string;
  returned_at: string | null;
  fine_amount: number;
}

export default function LibraryIssueReturnPage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerType, setBorrowerType] = useState("student");
  const [dueDays, setDueDays] = useState("14");
  const [mode, setMode] = useState<"issue" | "return">("issue");
  const [success, setSuccess] = useState("");
  const queryClient = useQueryClient();
  const schoolId = useSchoolId();
  const { t } = useI18n();

  const { data: books = [] } = useQuery<Book[]>({
    queryKey: queryKeys.school.library(schoolId),
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("library_books")
        .select("id, title, author, available_copies")
        .order("title");
      return data || [];
    },
    enabled: !!schoolId,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [...queryKeys.school.library(schoolId), "transactions"],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("library_transactions")
        .select("*, library_books!inner(title), students(full_name)")
        .is("returned_at", null)
        .order("issued_at", { ascending: false });
      return (data || []).map((t: { id: string; book_id: string; issued_at: string; due_date: string; returned_at: string | null; fine_amount: number; library_books: { title: string } | null; students: { full_name: string } | null }) => ({
        id: t.id,
        book_id: t.book_id,
        issued_at: t.issued_at,
        due_date: t.due_date,
        returned_at: t.returned_at,
        fine_amount: t.fine_amount,
        book_title: t.library_books?.title || "",
        borrower_name: t.students?.full_name || "Staff",
      }));
    },
    enabled: !!schoolId,
  });

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBook || !borrowerName) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(dueDays));

      const { error: insertError } = await supabase.from("library_transactions").insert({
        book_id: selectedBook.id,
        borrower_type: borrowerType,
        due_date: dueDate.toISOString().split("T")[0],
        handled_by: user?.id,
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("library_books")
        .update({ available_copies: selectedBook.available_copies - 1 })
        .eq("id", selectedBook.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      if (!selectedBook) return;
      toast.success(t("library.bookIssued"), { description: `"${selectedBook.title}" issued successfully` });
      setSuccess(`"${selectedBook.title}" issued successfully`);
      setSelectedBook(null);
      setBorrowerName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.school.library(schoolId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.school.library(schoolId), "transactions"] });
      setTimeout(() => setSuccess(""), 2000);
    },
    onError: (error) => {
      toast.error(t("common.error"), { description: error.message });
    },
  });

  const returnMutation = useMutation({
    mutationFn: async ({ transactionId, bookId }: { transactionId: string; bookId: string }) => {
      const supabase = createClient();
      const { error: updateTxError } = await supabase
        .from("library_transactions")
        .update({ returned_at: new Date().toISOString().split("T")[0] })
        .eq("id", transactionId);
      if (updateTxError) throw updateTxError;

      const book = books.find((b) => b.id === bookId);
      if (book) {
        const { error: updateBookError } = await supabase
          .from("library_books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", bookId);
        if (updateBookError) throw updateBookError;
      }
    },
    onSuccess: () => {
      toast.success(t("library.bookReturned"), { description: t("library.issue.bookReturnedDesc") });
      setSuccess(t("library.issue.bookReturnedSuccess"));
      queryClient.invalidateQueries({ queryKey: queryKeys.school.library(schoolId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.school.library(schoolId), "transactions"] });
      setTimeout(() => setSuccess(""), 2000);
    },
    onError: (error) => {
      toast.error(t("common.error"), { description: error.message });
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: t("library.title"), href: "/library" }, { label: t("library.issueReturn") }]} />
      <div className="space-y-6">
      <PageHeader title={t("library.issueReturn")} description={t("library.manageBooks")} />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">{success}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        <Button variant={mode === "issue" ? "default" : "outline"} onClick={() => setMode("issue")} className={mode === "issue" ? "bg-accent text-white hover:bg-accent/90" : ""}>
          <BookOpen className="h-4 w-4 mr-2" /> {t("library.issueBook")}
        </Button>
        <Button variant={mode === "return" ? "default" : "outline"} onClick={() => setMode("return")} className={mode === "return" ? "bg-accent text-white hover:bg-accent/90" : ""}>
          <RotateCcw className="h-4 w-4 mr-2" /> {t("library.returnBook")}
        </Button>
      </div>

      {mode === "issue" ? (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">{t("library.issueBook")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="select-book" className="text-ink">{t("library.bookTitle")}</Label>
              <Select
                id="select-book"
                value={selectedBook?.id || ""}
                onChange={(e) => {
                  const book = books.find((b) => b.id === e.target.value);
                  setSelectedBook(book || null);
                }}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
                placeholder={t("library.issue.selectBook")}
                options={books.filter((b) => b.available_copies > 0).map((b) => ({ value: b.id, label: `${b.title} (${b.available_copies} available)` }))}
              />
            </div>
            <div>
              <Label htmlFor="borrower-name" className="text-ink">{t("library.issuedTo")}</Label>
              <Input id="borrower-name" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder={t("library.issue.borrowerPlaceholder")} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="borrower-type" className="text-ink">{t("common.type")}</Label>
                <Select id="borrower-type" value={borrowerType} onChange={(e) => setBorrowerType(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink" placeholder={t("library.issue.student")} options={[
                  { value: "student", label: t("library.issue.student") },
                  { value: "staff", label: t("library.issue.staff") },
                ]} />
              </div>
              <div>
                <Label htmlFor="due-days" className="text-ink">{t("library.returnDate")}</Label>
                <Input id="due-days" type="number" value={dueDays} onChange={(e) => setDueDays(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={() => issueMutation.mutate()} isLoading={issueMutation.isPending} disabled={!selectedBook || !borrowerName} className="w-full bg-accent hover:bg-accent/90 text-white">
              {t("library.issueBook")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card className="border-slate-light">
              <CardContent className="py-8 text-center">
                <p className="text-slate">{t("library.noOverdue")}</p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((tx) => (
              <Card key={tx.id} className="border-slate-light">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{tx.book_title}</p>
                    <p className="text-xs text-slate">Issued: {new Date(tx.issued_at).toLocaleDateString("en-PK")} | Due: {new Date(tx.due_date).toLocaleDateString("en-PK")}</p>
                  </div>
                  <Button size="sm" isLoading={returnMutation.isPending} onClick={() => returnMutation.mutate({ transactionId: tx.id, bookId: tx.book_id })} className="bg-accent hover:bg-accent/90 text-white">
                    <RotateCcw className="h-4 w-4 mr-1" /> {t("library.returnBook")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
    </>
  );
}
