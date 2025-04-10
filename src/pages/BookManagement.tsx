
import { useState } from "react";
import { Book as BookIcon, PlusCircle, Pencil, RefreshCw } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLibrary, Book } from "@/contexts/LibraryContext";
import { toast } from "sonner";

const BookManagement = () => {
  const { books, addBook, updateBook } = useLibrary();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editBookId, setEditBookId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    type: "book" as "book" | "movie",
    serialNumber: "",
    shelfLocation: "",
    publicationYear: "",
    available: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      type: "book",
      serialNumber: "",
      shelfLocation: "",
      publicationYear: "",
      available: true,
    });
    setErrors({});
    setIsEdit(false);
    setEditBookId(null);
  };
  
  const openAddDialog = () => {
    resetForm();
    setOpen(true);
  };
  
  const openEditDialog = (book: Book) => {
    setFormData({
      title: book.title,
      author: book.author,
      type: book.type,
      serialNumber: book.serialNumber,
      shelfLocation: book.shelfLocation,
      publicationYear: book.publicationYear,
      available: book.available,
    });
    setIsEdit(true);
    setEditBookId(book.id);
    setOpen(true);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    }
    
    if (!formData.shelfLocation.trim()) {
      newErrors.shelfLocation = "Shelf location is required";
    }
    
    if (!formData.publicationYear.trim()) {
      newErrors.publicationYear = "Publication year is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    if (isEdit && editBookId) {
      updateBook(editBookId, formData);
      setOpen(false);
    } else {
      addBook(formData);
      setOpen(false);
    }
    
    resetForm();
  };
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title mb-0">Book Management</h1>
        <Button onClick={openAddDialog} className="bg-library-accent hover:bg-library-light-accent gap-2">
          <PlusCircle size={16} />
          Add New Book
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value="books">Books Only</TabsTrigger>
          <TabsTrigger value="movies">Movies Only</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <BookList books={books} onEdit={openEditDialog} />
        </TabsContent>
        
        <TabsContent value="books" className="mt-6">
          <BookList 
            books={books.filter(book => book.type === "book")} 
            onEdit={openEditDialog} 
          />
        </TabsContent>
        
        <TabsContent value="movies" className="mt-6">
          <BookList 
            books={books.filter(book => book.type === "movie")} 
            onEdit={openEditDialog} 
          />
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <BookList 
            books={books.filter(book => book.available)} 
            onEdit={openEditDialog} 
          />
        </TabsContent>
        
        <TabsContent value="checked-out" className="mt-6">
          <BookList 
            books={books.filter(book => !book.available)} 
            onEdit={openEditDialog} 
          />
        </TabsContent>
      </Tabs>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Update Book" : "Add New Book"}</DialogTitle>
            <DialogDescription>
              {isEdit 
                ? "Update the information for this book in the library collection." 
                : "Add a new book to the library collection."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: "book" | "movie") => 
                    setFormData({...formData, type: value})
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="book" id="book-type" />
                    <Label htmlFor="book-type">Book</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="movie" id="movie-type" />
                    <Label htmlFor="movie-type">Movie</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                  <Input 
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className={errors.author ? "border-red-500" : ""}
                  />
                  {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    className={errors.serialNumber ? "border-red-500" : ""}
                  />
                  {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shelfLocation">Shelf Location <span className="text-red-500">*</span></Label>
                  <Input 
                    id="shelfLocation"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({...formData, shelfLocation: e.target.value})}
                    className={errors.shelfLocation ? "border-red-500" : ""}
                  />
                  {errors.shelfLocation && <p className="text-sm text-red-500">{errors.shelfLocation}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publicationYear">Publication Year <span className="text-red-500">*</span></Label>
                  <Input 
                    id="publicationYear"
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({...formData, publicationYear: e.target.value})}
                    className={errors.publicationYear ? "border-red-500" : ""}
                  />
                  {errors.publicationYear && <p className="text-sm text-red-500">{errors.publicationYear}</p>}
                </div>
                
                {isEdit && (
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <RadioGroup
                      value={formData.available ? "available" : "unavailable"}
                      onValueChange={(value) => 
                        setFormData({...formData, available: value === "available"})
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="available" id="available" />
                        <Label htmlFor="available">Available</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unavailable" id="unavailable" />
                        <Label htmlFor="unavailable">Checked Out</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-library-accent hover:bg-library-light-accent">
                {isEdit ? "Update Book" : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// BookList component for displaying books
const BookList = ({ 
  books, 
  onEdit 
}: { 
  books: Book[]; 
  onEdit: (book: Book) => void;
}) => {
  return (
    <div className="bg-white rounded-md border">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <div>
          <h2 className="font-medium font-serif">Book Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Showing {books.length} {books.length === 1 ? 'item' : 'items'}
          </p>
        </div>
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
              <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? (
              books.map((book) => (
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(book)}
                      className="h-8 w-8"
                    >
                      <Pencil size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <BookIcon size={48} className="text-muted-foreground/50 mb-2" />
                    <p>No books found in this category.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookManagement;
