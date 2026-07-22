"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Inbox, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoverPreview } from "@/components/ui/hover-preview";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  renderPreview?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
  onRowClick?: (item: T) => void;
  rowKey?: keyof T;
  syncUrl?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  onExport?: (selected: T[]) => void;
  onDelete?: (selected: T[]) => void;
  headerActions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  pageSize: initialPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  emptyMessage = "No records found",
  emptyDescription,
  emptyIcon: EmptyIcon,
  onRowClick,
  rowKey,
  syncUrl = false,
  selectable = false,
  onSelectionChange,
  onExport,
  onDelete,
  headerActions,
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = syncUrl ? (searchParams.get("q") || "") : "";
  const initialPage = syncUrl ? parseInt(searchParams.get("page") || "1", 10) : 1;

  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const updateUrl = useCallback(
    (newSearch: string, newPage: number) => {
      if (!syncUrl) return;
      const params = new URLSearchParams(searchParams.toString());
      if (newSearch) params.set("q", newSearch);
      else params.delete("q");
      if (newPage > 1) params.set("page", String(newPage));
      else params.delete("page");
      const qs = params.toString();
      router.replace(`?${qs}`, { scroll: false });
    },
    [syncUrl, router, searchParams]
  );

  const filtered = useMemo(() => {
    let result = searchable
      ? data.filter((item) => {
          if (!search) return true;
          const term = search.toLowerCase();
          return searchKeys.some((key) => {
            const value = item[key];
            return String(value ?? "")
              .toLowerCase()
              .includes(term);
          });
        })
      : data;

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = String((a as Record<string, unknown>)[sortKey] ?? "");
        const bVal = String((b as Record<string, unknown>)[sortKey] ?? "");
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, searchable, searchKeys, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    updateUrl(value, 1);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    updateUrl(search, newPage);
  }

  function handleSelectAll() {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(paginated.map((_, i) => (page - 1) * pageSize + i));
      setSelectedRows(newSelected);
      onSelectionChange?.(paginated);
    }
  }

  function handleSelectRow(index: number) {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected).map(i => filtered[i]));
  }

  const selectedItems = Array.from(selectedRows).map(i => filtered[i]);

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {searchable && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {selectable && selectedRows.size > 0 && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              {onExport && (
                <Button variant="outline" size="sm" onClick={() => onExport(selectedItems)}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(selectedItems)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </>
          )}
          {headerActions}
          {pageSizeOptions.length > 1 && (
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {selectable && (
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginated.length && paginated.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                      col.className
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="inline-flex flex-col">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      {EmptyIcon ? (
                        <div className="rounded-full bg-muted p-4 mb-4">
                          <EmptyIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-muted p-4 mb-4">
                          <Inbox className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground mb-1">{emptyMessage}</p>
                      {emptyDescription && (
                        <p className="text-xs text-muted-foreground max-w-sm">{emptyDescription}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, i) => {
                  const globalIndex = (page - 1) * pageSize + i;
                  const isSelected = selectedRows.has(globalIndex);
                  return (
                    <tr
                      key={rowKey ? String(item[rowKey]) : i}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        onRowClick && "cursor-pointer",
                        isSelected && "bg-muted/50"
                      )}
                    >
                      {selectable && (
                        <td className="w-10 px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(globalIndex)}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const cellContent = col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "") || "—";
                        return (
                          <td
                            key={col.key}
                            className={cn("px-4 py-3 text-sm text-foreground", col.className)}
                          >
                            {col.renderPreview ? (
                              <HoverPreview content={col.renderPreview(item)}>
                                <span className="cursor-help border-b border-dashed border-muted-foreground/30 hover:border-muted-foreground transition-colors">
                                  {cellContent}
                                </span>
                              </HoverPreview>
                            ) : (
                              cellContent
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 p-0",
                      page === pageNum && "bg-accent text-white"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
