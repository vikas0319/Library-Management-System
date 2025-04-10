
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileText, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for charts
const monthlyBooksData = [
  { name: 'Jan', issued: 65, returned: 55 },
  { name: 'Feb', issued: 59, returned: 49 },
  { name: 'Mar', issued: 80, returned: 72 },
  { name: 'Apr', issued: 81, returned: 78 },
  { name: 'May', issued: 56, returned: 48 },
  { name: 'Jun', issued: 55, returned: 50 },
  { name: 'Jul', issued: 40, returned: 37 },
  { name: 'Aug', issued: 35, returned: 30 },
  { name: 'Sep', issued: 65, returned: 60 },
  { name: 'Oct', issued: 48, returned: 45 },
  { name: 'Nov', issued: 70, returned: 65 },
  { name: 'Dec', issued: 52, returned: 48 },
];

const bookCategoryData = [
  { name: 'Fiction', value: 400 },
  { name: 'Non-Fiction', value: 300 },
  { name: 'Reference', value: 200 },
  { name: 'Textbooks', value: 150 },
  { name: 'Children', value: 100 },
];

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];

const popularBooksData = [
  { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', issueCount: 28 },
  { id: 2, title: '1984', author: 'George Orwell', category: 'Fiction', issueCount: 25 },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', issueCount: 22 },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', issueCount: 20 },
  { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', issueCount: 18 },
];

const overdueBooksData = [
  { id: 1, title: 'The Hobbit', member: 'John Smith', issuedDate: '2023-03-15', dueDate: '2023-04-15', daysOverdue: 360 },
  { id: 2, title: 'Harry Potter', member: 'Emily Johnson', issuedDate: '2023-04-02', dueDate: '2023-05-02', daysOverdue: 342 },
  { id: 3, title: 'The Lord of the Rings', member: 'Michael Brown', issuedDate: '2023-04-10', dueDate: '2023-05-10', daysOverdue: 334 },
  { id: 4, title: 'A Game of Thrones', member: 'Sarah Davis', issuedDate: '2023-05-05', dueDate: '2023-06-05', daysOverdue: 308 },
  { id: 5, title: 'The Hunger Games', member: 'David Wilson', issuedDate: '2023-05-20', dueDate: '2023-06-20', daysOverdue: 293 },
];

const Reports = () => {
  const [timeRange, setTimeRange] = useState('year');
  const { isAdmin } = useAuth();

  const handleDownloadReport = (reportType) => {
    // In a real app, this would generate and download a PDF or CSV report
    alert(`Downloading ${reportType} report...`);
  };

  if (!isAdmin) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View and analyze library statistics and activity reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => handleDownloadReport('combined')}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Books in Circulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">+5.2% from previous period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">356</div>
            <p className="text-xs text-muted-foreground mt-1">+12 new members this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48</div>
            <p className="text-xs text-muted-foreground mt-1">-3 from previous period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Charts & Graphs
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Popular Books
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Overdue Books
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Monthly Book Activity</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReport('monthly')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <CardDescription>Books issued and returned by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyBooksData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="issued" fill="#8884d8" name="Books Issued" />
                    <Bar dataKey="returned" fill="#82ca9d" name="Books Returned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Books by Category</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReport('category')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <CardDescription>Distribution of books by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Most Popular Books</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReport('popular')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <CardDescription>Books with the highest circulation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Issue Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularBooksData.map((book, index) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.category}</TableCell>
                      <TableCell className="text-right">{book.issueCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Overdue Books</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReport('overdue')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <CardDescription>Books that are past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Days Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueBooksData.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.member}</TableCell>
                      <TableCell>{book.issuedDate}</TableCell>
                      <TableCell>{book.dueDate}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        {book.daysOverdue}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
