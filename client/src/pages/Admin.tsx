import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminStats, useAdminBooks, useAdminCreateBook, useAdminUpdateBook,
  useAdminDeleteBook, useAdminLoans, useAdminReturnLoan, useAdminHolds,
  useAdminUsers, useAdminUpdateRole,
} from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Users, BarChart3, BookMarked, Loader2, Plus, Pencil, Trash2,
  RotateCcw, Shield, Clock, AlertCircle, Search, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { format, isPast, differenceInDays } from "date-fns";
import { useEffect } from "react";
import type { Book } from "@shared/schema";

// ============ Book Form Dialog ============
function BookFormDialog({
  book,
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  book?: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(book?.title || "");
  const [authors, setAuthors] = useState(book?.authors?.join(", ") || "");
  const [description, setDescription] = useState(book?.description || "");
  const [genres, setGenres] = useState(book?.genres?.join(", ") || "");
  const [isbn13, setIsbn13] = useState(book?.isbn13 || "");
  const [coverUrl, setCoverUrl] = useState(book?.coverUrl || "");
  const [totalCopies, setTotalCopies] = useState(book?.totalCopies?.toString() || "1");
  const [availableCopies, setAvailableCopies] = useState(book?.availableCopies?.toString() || "1");

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthors(book.authors?.join(", ") || "");
      setDescription(book.description || "");
      setGenres(book.genres?.join(", ") || "");
      setIsbn13(book.isbn13 || "");
      setCoverUrl(book.coverUrl || "");
      setTotalCopies(book.totalCopies?.toString() || "1");
      setAvailableCopies(book.availableCopies?.toString() || "1");
    } else {
      setTitle(""); setAuthors(""); setDescription(""); setGenres("");
      setIsbn13(""); setCoverUrl(""); setTotalCopies("1"); setAvailableCopies("1");
    }
  }, [book, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...(book ? { id: book.id } : {}),
      title,
      authors: authors.split(",").map(a => a.trim()).filter(Boolean),
      description: description || null,
      genres: genres.split(",").map(g => g.trim()).filter(Boolean),
      isbn13: isbn13 || null,
      coverUrl: coverUrl || null,
      totalCopies: parseInt(totalCopies) || 1,
      availableCopies: parseInt(availableCopies) || 1,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="authors">Authors (comma-separated) *</Label>
            <Input id="authors" value={authors} onChange={e => setAuthors(e.target.value)} required placeholder="Author 1, Author 2" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genres">Genres (comma-separated)</Label>
              <Input id="genres" value={genres} onChange={e => setGenres(e.target.value)} placeholder="Fiction, Classic" />
            </div>
            <div>
              <Label htmlFor="isbn13">ISBN-13</Label>
              <Input id="isbn13" value={isbn13} onChange={e => setIsbn13(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="coverUrl">Cover URL</Label>
            <Input id="coverUrl" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalCopies">Total Copies</Label>
              <Input id="totalCopies" type="number" min="1" value={totalCopies} onChange={e => setTotalCopies(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="availableCopies">Available Copies</Label>
              <Input id="availableCopies" type="number" min="0" value={availableCopies} onChange={e => setAvailableCopies(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !title || !authors}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {book ? "Save Changes" : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ Main Admin Page ============
export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [bookSearch, setBookSearch] = useState("");
  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();

  // Data
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: books, isLoading: booksLoading } = useAdminBooks(bookSearch.length > 2 ? bookSearch : undefined);
  const { data: allLoans, isLoading: loansLoading } = useAdminLoans();
  const { data: allHolds, isLoading: holdsLoading } = useAdminHolds();
  const { data: allUsers, isLoading: usersLoading } = useAdminUsers();

  // Mutations
  const createBook = useAdminCreateBook();
  const updateBook = useAdminUpdateBook();
  const deleteBook = useAdminDeleteBook();
  const returnLoan = useAdminReturnLoan();
  const updateRole = useAdminUpdateRole();

  const isStaff = user?.role === "librarian" || user?.role === "admin";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || statsLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (statsError || !isStaff) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need librarian or admin privileges to access this panel.</p>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Return Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  const activeLoans = allLoans?.filter(l => !l.returnedAt) || [];
  const overdueLoans = activeLoans.filter(l => isPast(new Date(l.dueDate)));

  const handleBookSubmit = (data: any) => {
    if (data.id) {
      const { id, ...rest } = data;
      updateBook.mutate({ id, ...rest }, {
        onSuccess: () => {
          toast({ title: "Book Updated" });
          setBookFormOpen(false);
          setEditingBook(undefined);
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    } else {
      createBook.mutate(data, {
        onSuccess: () => {
          toast({ title: "Book Added" });
          setBookFormOpen(false);
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    }
  };

  const handleDeleteBook = (id: string, title: string) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteBook.mutate(id, {
        onSuccess: () => toast({ title: "Book Deleted" }),
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      });
    }
  };

  const handleReturnLoan = (id: string) => {
    returnLoan.mutate(id, {
      onSuccess: () => toast({ title: "Loan Returned" }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleRoleChange = (userId: string, role: string) => {
    updateRole.mutate({ id: userId, role }, {
      onSuccess: () => toast({ title: "Role Updated" }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40 pt-12 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-[0.12em] mb-2">
                <ShieldCheck className="h-4 w-4" />
                Librarian Panel
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                Administration
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage books, loans, holds, and users.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "text-primary" },
              { label: "Active Loans", value: stats.activeLoans, icon: BookMarked, color: "text-secondary" },
              { label: "Total Loans", value: stats.totalLoans, icon: BarChart3, color: "text-muted-foreground" },
              { label: "Holds", value: stats.totalHolds, icon: Clock, color: "text-orange-600" },
              { label: "Users", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="stat-card"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="font-serif text-3xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="books" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4 mr-2" /> Books
            </TabsTrigger>
            <TabsTrigger value="loans" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookMarked className="h-4 w-4 mr-2" /> Loans
            </TabsTrigger>
            <TabsTrigger value="holds" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4 mr-2" /> Holds
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
          </TabsList>

          {/* ======== BOOKS TAB ======== */}
          <TabsContent value="books" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { setEditingBook(undefined); setBookFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Book
              </Button>
            </div>

            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Authors</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Genres</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Copies</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksLoading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : books?.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No books found</td></tr>
                    ) : (
                      books?.map(book => (
                        <tr key={book.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {book.coverUrl && (
                                <img src={book.coverUrl} alt="" className="w-8 h-12 object-cover rounded" />
                              )}
                              <span className="font-medium">{book.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{book.authors?.join(", ")}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell text-xs">{book.genres?.join(", ")}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={book.availableCopies === 0 ? "text-destructive font-medium" : ""}>
                              {book.availableCopies}/{book.totalCopies}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingBook(book); setBookFormOpen(true); }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBook(book.id, book.title)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======== LOANS TAB ======== */}
          <TabsContent value="loans" className="space-y-4">
            {overdueLoans.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{overdueLoans.length} overdue {overdueLoans.length === 1 ? 'loan' : 'loans'} require attention</p>
              </div>
            )}

            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Book</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patron</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Checked Out</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Due / Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loansLoading ? (
                      <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : allLoans?.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No loans found</td></tr>
                    ) : (
                      allLoans?.map(loan => {
                        const dueDate = new Date(loan.dueDate);
                        const overdue = !loan.returnedAt && isPast(dueDate);
                        const daysLeft = differenceInDays(dueDate, new Date());

                        return (
                          <tr key={loan.id} className={`border-b border-border/30 transition-colors ${overdue ? 'bg-destructive/[0.03]' : 'hover:bg-muted/20'}`}>
                            <td className="py-3 px-4 font-medium">{loan.book?.title || 'Unknown'}</td>
                            <td className="py-3 px-4 text-muted-foreground">{loan.userEmail || loan.userId}</td>
                            <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                              {loan.checkedOutAt ? format(new Date(loan.checkedOutAt), 'MMM d, yyyy') : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              {loan.returnedAt ? (
                                <span className="text-muted-foreground text-xs">Returned {format(new Date(loan.returnedAt), 'MMM d')}</span>
                              ) : overdue ? (
                                <span className="text-destructive text-xs font-medium">Overdue {Math.abs(daysLeft)}d</span>
                              ) : (
                                <span className="text-secondary text-xs">Due in {daysLeft}d</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!loan.returnedAt && (
                                <Button variant="outline" size="sm" onClick={() => handleReturnLoan(loan.id)} disabled={returnLoan.isPending}>
                                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Return
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======== HOLDS TAB ======== */}
          <TabsContent value="holds" className="space-y-4">
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Book</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Patron</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Requested</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdsLoading ? (
                      <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : allHolds?.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No holds found</td></tr>
                    ) : (
                      allHolds?.map(hold => (
                        <tr key={hold.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium">{hold.book?.title || 'Unknown'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{hold.userEmail || hold.userId}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                            {hold.requestedAt ? format(new Date(hold.requestedAt), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              hold.status === 'waiting' ? 'bg-orange-100 text-orange-700' :
                              hold.status === 'ready' ? 'bg-green-100 text-green-700' :
                              hold.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {hold.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ======== USERS TAB ======== */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={4} className="py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
                    ) : allUsers?.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No users found</td></tr>
                    ) : (
                      allUsers?.map(u => (
                        <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            {u.firstName || ''} {u.lastName || ''}
                            {u.id === user?.id && <span className="text-xs text-primary ml-2">(you)</span>}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                            {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <Select
                              value={u.role}
                              onValueChange={(value) => handleRoleChange(u.id, value)}
                              disabled={u.id === user?.id}
                            >
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="patron">Patron</SelectItem>
                                <SelectItem value="librarian">Librarian</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Form Dialog */}
      <BookFormDialog
        book={editingBook}
        open={bookFormOpen}
        onOpenChange={setBookFormOpen}
        onSubmit={handleBookSubmit}
        isPending={createBook.isPending || updateBook.isPending}
      />
    </AppLayout>
  );
}
