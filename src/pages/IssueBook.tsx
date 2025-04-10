
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLibrary } from "@/contexts/LibraryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const IssueBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, members, issueBook, getBookById } = useLibrary();
  
  const [formData, setFormData] = useState({
    bookId: "",
    memberId: "",
    issueDate: new Date(),
    returnDate: addDays(new Date(), 15),
    remarks: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  
  // Extract bookId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookId = params.get("bookId");
    
    if (bookId) {
      const book = getBookById(bookId);
      if (book && book.available) {
        setFormData(prev => ({ ...prev, bookId }));
        setSelectedBook(book);
      } else if (book && !book.available) {
        toast.error("Selected book is not available for borrowing");
      }
    }
  }, [location.search, getBookById]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bookId) {
      newErrors.bookId = "Book selection is required";
    }
    
    if (!formData.memberId) {
      newErrors.memberId = "Member selection is required";
    }
    
    // Ensure issue date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.issueDate < today) {
      newErrors.issueDate = "Issue date cannot be in the past";
    }
    
    // Ensure return date is not earlier than issue date
    if (formData.returnDate < formData.issueDate) {
      newErrors.returnDate = "Return date cannot be earlier than issue date";
    }
    
    // Ensure return date is not more than 15 days from issue date
    const maxReturnDate = addDays(formData.issueDate, 15);
    if (formData.returnDate > maxReturnDate) {
      newErrors.returnDate = "Return date cannot be more than 15 days from issue date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleBookChange = (bookId: string) => {
    const book = getBookById(bookId);
    setSelectedBook(book);
    setFormData(prev => ({ ...prev, bookId }));
  };
  
  const handleReturnDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, returnDate: date }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    const success = issueBook(
      formData.bookId,
      formData.memberId,
      formData.returnDate,
      formData.remarks
    );
    
    if (success) {
      navigate("/");
    }
  };
  
  // Filter only available books
  const availableBooks = books.filter(book => book.available);
  
  // Filter only active members
  const activeMembers = members.filter(member => member.active);
  
  return (
    <div className="page-container">
      <h1 className="section-title">Issue Book</h1>
      
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="book">Book <span className="text-red-500">*</span></Label>
              <Select
                value={formData.bookId}
                onValueChange={handleBookChange}
              >
                <SelectTrigger id="book" className={errors.bookId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.length > 0 ? (
                    availableBooks.map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} ({book.serialNumber})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No available books
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.bookId && <p className="text-sm text-red-500">{errors.bookId}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={selectedBook?.author || ""}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="member">Member <span className="text-red-500">*</span></Label>
              <Select
                value={formData.memberId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
              >
                <SelectTrigger id="member" className={errors.memberId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.length > 0 ? (
                    activeMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.membershipNumber})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No active members
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.memberId && <p className="text-sm text-red-500">{errors.memberId}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
              <Input
                id="issueDate"
                type="text"
                value={format(formData.issueDate, "PPP")}
                disabled
                className="bg-muted"
              />
              {errors.issueDate && <p className="text-sm text-red-500">{errors.issueDate}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnDate">Return Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      errors.returnDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.returnDate ? (
                      format(formData.returnDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.returnDate}
                    onSelect={handleReturnDateChange}
                    disabled={(date) => 
                      date < formData.issueDate || date > addDays(formData.issueDate, 15)
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.returnDate && <p className="text-sm text-red-500">{errors.returnDate}</p>}
              <p className="text-xs text-muted-foreground">
                Maximum loan period is 15 days.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Optional remarks about this transaction"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-library-accent hover:bg-library-light-accent">
              Issue Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueBook;
