"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, BookOpen, RotateCcw } from "lucide-react";

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
  const [books, setBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerType, setBorrowerType] = useState("student");
  const [dueDays, setDueDays] = useState("14");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"issue" | "return">("issue");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [booksRes, transRes] = await Promise.all([
        supabase.from("library_books").select("id, title, author, available_copies").order("title"),
        supabase.from("library_transactions").select("*, library_books!inner(title), students(full_name)").is("returned_at", null).order("issued_at", { ascending: false }),
      ]);
      setBooks(booksRes.data || []);
      setTransactions((transRes.data || []).map((t: any) => ({
        ...t,
        book_title: t.library_books?.title || "",
        borrower_name: t.students?.full_name || "Staff",
      })));
    }
    load();
  }, []);

  async function issueBook() {
    if (!selectedBook || !borrowerName) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(dueDays));

    await supabase.from("library_transactions").insert({
      book_id: selectedBook.id,
      borrower_type: borrowerType,
      due_date: dueDate.toISOString().split("T")[0],
      handled_by: user?.id,
    });

    await supabase
      .from("library_books")
      .update({ available_copies: selectedBook.available_copies - 1 })
      .eq("id", selectedBook.id);

    setSuccess(`"${selectedBook.title}" issued successfully`);
    setSelectedBook(null);
    setBorrowerName("");
    setLoading(false);
    setTimeout(() => setSuccess(""), 2000);
  }

  async function returnBook(transactionId: string, bookId: string) {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("library_transactions")
      .update({ returned_at: new Date().toISOString().split("T")[0] })
      .eq("id", transactionId);

    const book = books.find((b) => b.id === bookId);
    if (book) {
      await supabase
        .from("library_books")
        .update({ available_copies: book.available_copies + 1 })
        .eq("id", bookId);
    }

    setSuccess("Book returned successfully");
    setLoading(false);
    setTimeout(() => setSuccess(""), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Library Issue / Return" description="Issue and return books" />

      {success && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <p className="font-medium text-ink">{success}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        <Button variant={mode === "issue" ? "default" : "outline"} onClick={() => setMode("issue")} className={mode === "issue" ? "bg-accent text-white" : ""}>
          <BookOpen className="h-4 w-4 mr-2" /> Issue Book
        </Button>
        <Button variant={mode === "return" ? "default" : "outline"} onClick={() => setMode("return")} className={mode === "return" ? "bg-accent text-white" : ""}>
          <RotateCcw className="h-4 w-4 mr-2" /> Return Book
        </Button>
      </div>

      {mode === "issue" ? (
        <Card className="border-slate-light max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg font-display">Issue a Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-ink">Select Book</Label>
              <select
                value={selectedBook?.id || ""}
                onChange={(e) => {
                  const book = books.find((b) => b.id === e.target.value);
                  setSelectedBook(book || null);
                }}
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink"
              >
                <option value="">Select a book...</option>
                {books.filter((b) => b.available_copies > 0).map((b) => (
                  <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-ink">Borrower Name</Label>
              <Input value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="Student or staff name" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-ink">Type</Label>
                <select value={borrowerType} onChange={(e) => setBorrowerType(e.target.value)} className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-light bg-paper-raised px-3 py-2 text-sm text-ink">
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <Label className="text-ink">Due in (days)</Label>
                <Input type="number" value={dueDays} onChange={(e) => setDueDays(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <Button onClick={issueBook} disabled={loading || !selectedBook || !borrowerName} className="w-full bg-accent hover:bg-accent/90 text-white">
              {loading ? "Issuing..." : "Issue Book"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card className="border-slate-light">
              <CardContent className="py-8 text-center">
                <p className="text-slate">No books currently issued</p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((t) => (
              <Card key={t.id} className="border-slate-light">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{t.book_title}</p>
                    <p className="text-xs text-slate">Issued: {new Date(t.issued_at).toLocaleDateString("en-PK")} | Due: {new Date(t.due_date).toLocaleDateString("en-PK")}</p>
                  </div>
                  <Button size="sm" onClick={() => returnBook(t.id, t.book_id)} className="bg-accent hover:bg-accent/90 text-white">
                    <RotateCcw className="h-4 w-4 mr-1" /> Return
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
