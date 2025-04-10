
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useLibrary, Book } from "@/contexts/LibraryContext";
import { toast } from "sonner";

const SearchBooks = () => {
  const { books, searchBooks } = useLibrary();
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    onlyAvailable: false,
  });
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  
  useEffect(() => {
    // Apply search and filters
    let filteredResults = query ? searchBooks(query) : books;
    
    // Apply type filter
    if (filters.type !== "all") {
      filteredResults = filteredResults.filter(book => book.type === filters.type);
    }
    
    // Apply availability filter
    if (filters.onlyAvailable) {
      filteredResults = filteredResults.filter(book => book.available);
    }
    
    setResults(filteredResults);
  }, [query, books, searchBooks, filters]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This empty handler is just to prevent page reload on form submit
  };
  
  const handleIssueBook = () => {
    if (!selectedBook) {
      toast.error("Please select a book first");
      return;
    }
    
    // Navigate to issue book page with selected book ID
    navigate(`/issue-book?bookId=${selectedBook}`);
  };
  
  return (
    <div className="page-container">
      <h1 className="section-title">Search Books</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or serial number..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter size={16} />
                Filters
              </Button>
              
              <Button type="submit" className="bg-library-accent hover:bg-library-light-accent">
                Search
              </Button>
            </div>
            
            {showFilters && (
              <div className="bg-muted/50 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="type-filter" className="mb-2 block">Type</Label>
                  <RadioGroup 
                    id="type-filter"
                    value={filters.type} 
                    onValueChange={(value) => setFilters({...filters, type: value})}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All Types</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="book" id="book" />
                      <Label htmlFor="book">Books Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="movie" id="movie" />
                      <Label htmlFor="movie">Movies Only</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 h-full">
                    <Checkbox 
                      id="availability" 
                      checked={filters.onlyAvailable}
                      onCheckedChange={(checked) => 
                        setFilters({...filters, onlyAvailable: checked === true})
                      }
                    />
                    <Label htmlFor="availability">Show only available items</Label>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* Search Results */}
      <div className="bg-white rounded-md border mb-6">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-medium text-lg font-serif">Search Results</h2>
          <p className="text-sm text-muted-foreground">
            Showing {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Author</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Serial #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Select</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((book) => (
                  <tr key={book.id} className="border-t hover:bg-muted/20">
                    <td className="p-4 text-sm">{book.title}</td>
                    <td className="p-4 text-sm">{book.author}</td>
                    <td className="p-4 text-sm capitalize">{book.type}</td>
                    <td className="p-4 text-sm font-mono text-xs">{book.serialNumber}</td>
                    <td className="p-4 text-sm">{book.shelfLocation}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.available ? 'Available' : 'Checked Out'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <RadioGroup 
                        value={selectedBook || ""} 
                        onValueChange={setSelectedBook}
                        className="flex justify-center"
                      >
                        <RadioGroupItem 
                          value={book.id} 
                          id={`book-${book.id}`} 
                          disabled={!book.available}
                        />
                      </RadioGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <BookOpen size={48} className="text-muted-foreground/50 mb-2" />
                      <p>No books found. Try a different search term or clear the filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleIssueBook} 
          className="bg-library-accent hover:bg-library-light-accent"
          disabled={!selectedBook}
        >
          Issue Selected Book
        </Button>
      </div>
    </div>
  );
};

export default SearchBooks;
