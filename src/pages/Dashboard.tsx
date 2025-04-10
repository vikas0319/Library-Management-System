
import { useEffect } from "react";
import { Book, Users, BookCheck, BookOpen, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLibrary } from "@/contexts/LibraryContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { books, members, transactions } = useLibrary();
  const { user } = useAuth();
  
  // Calculate dashboard stats
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.available).length;
  const activeMembers = members.filter(member => member.active).length;
  const overdueBooks = transactions.filter(
    transaction => !transaction.actualReturnDate && new Date() > transaction.returnDate
  ).length;

  // Generate mock stats for the chart
  const borrowingStats = [
    { name: "Jan", count: 12 },
    { name: "Feb", count: 19 },
    { name: "Mar", count: 15 },
    { name: "Apr", count: 21 },
    { name: "May", count: 25 },
    { name: "Jun", count: 18 },
    { name: "Jul", count: 20 },
    { name: "Aug", count: 17 },
    { name: "Sep", count: 23 },
    { name: "Oct", count: 26 },
    { name: "Nov", count: 24 },
    { name: "Dec", count: 29 },
  ];

  const recentBooks = books.slice(0, 5);
  
  return (
    <div className="page-container">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="section-title mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 sm:mt-0 bg-library-warm/10 px-4 py-2 rounded-md border border-library-warm/30">
          <span className="text-library-dark font-medium">Today:</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-library-warm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{totalBooks}</div>
              <Book className="h-8 w-8 text-library-warm opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {availableBooks} currently available
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-library-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{activeMembers}</div>
              <Users className="h-8 w-8 text-library-accent opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {members.length} total members registered
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Books Checked Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{totalBooks - availableBooks}</div>
              <BookCheck className="h-8 w-8 text-green-500 opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span>5% increase from last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">{overdueBooks}</div>
              <BookOpen className="h-8 w-8 text-red-500 opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
              <span>2% decrease from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7 mb-8">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Book Borrowings</CardTitle>
            <CardDescription>Number of books borrowed each month</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={borrowingStats} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2E5D4B" barSize={30} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Books</CardTitle>
            <CardDescription>Latest books in our collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <div className="text-xs font-medium">
                    {book.type === 'book' ? 'Book' : 'Movie'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Showing {recentBooks.length} of {books.length} books
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
