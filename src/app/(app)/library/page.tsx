"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      const supabase = createClient();
      const { data } = await supabase
        .from("library_books")
        .select("*")
        .order("title");

      setBooks(data || []);
      setLoading(false);
    }
    loadBooks();
  }, []);

  const columns = [
    { key: "title", header: "Title" },
    { key: "author", header: "Author" },
    {
      key: "isbn",
      header: "ISBN",
      render: (item: Book) => (
        <span className="font-mono text-xs">{item.isbn || "—"}</span>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "available_copies",
      header: "Available",
      className: "text-center",
      render: (item: Book) => (
        <span
          className={`tabular-nums font-medium ${
            item.available_copies > 0 ? "text-success" : "text-danger"
          }`}
        >
          {item.available_copies} / {item.total_copies}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Manage book catalog and issue/return transactions"
        action={
          <Button className="bg-accent hover:bg-accent/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-paper-raised rounded-lg animate-skeleton" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Library is empty"
          description="Add books to your catalog to start tracking issues and returns."
          action={{ label: "Add Book", onClick: () => router.push("/library/issue") }}
        />
      ) : (
        <DataTable
          data={books}
          columns={columns}
          searchKeys={["title", "author", "isbn", "category"]}
          searchPlaceholder="Search by title, author, or ISBN..."
        />
      )}
    </div>
  );
}
