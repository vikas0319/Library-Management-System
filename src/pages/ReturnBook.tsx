
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, BookReturn, DollarSign } from "lucide-react";
import { useLibrary, BookTransaction } from "@/contexts/LibraryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const ReturnBook = () => {
  const navigate = useNavigate();
  const { 
    books, 
    transactions, 
    getBookById, 
    getMemberById, 
    returnBook, 
    payFine 
  } = useLibrary();
  
  const [step, setStep] = useState<"return" | "fine">("return");
  const [activeTransactions, setActiveTransactions] = useState<BookTransaction[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<BookTransaction | null>(null);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [fine, setFine] = useState(0);
  const [finePaid, setFinePaid] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get active transactions (books that are checked out)
  useEffect(() => {
    const active = transactions.filter(t => !t.actualReturnDate);
    setActiveTransactions(active);
  }, [transactions]);
  
  // Update related data when transaction selected
  useEffect(() => {
    if (selectedTransactionId) {
      const transaction = transactions.find(t => t.id === selectedTransactionId);
      if (transaction) {
        setSelectedTransaction(transaction);
        const book = getBookById(transaction.bookId);
        const member = getMemberById(transaction.memberId);
        setSelectedBook(book);
        setSelectedMember(member);
        setReturnDate(new Date());
      }
    } else {
      setSelectedTransaction(null);
      setSelectedBook(null);
      setSelectedMember(null);
    }
  }, [selectedTransactionId, transactions, getBookById, getMemberById]);
  
  const validateReturnForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedTransactionId) {
      newErrors.transaction = "You must select a book to return";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateFineForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (fine > 0 && !finePaid) {
      newErrors.finePaid = "Fine must be paid before completing the return";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleReturnConfirm = () => {
    if (!validateReturnForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    setConfirmDialogOpen(true);
  };
  
  const handleReturn = () => {
    if (!selectedTransactionId) return;
    
    const result = returnBook(selectedTransactionId, returnDate);
    setConfirmDialogOpen(false);
    
    if (result.success) {
      setFine(result.fine);
      setStep("fine");
    }
  };
  
  const handleFinePayment = () => {
    if (!validateFineForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    if (selectedTransactionId) {
      if (fine > 0) {
        payFine(selectedTransactionId);
      }
      // Return was successful
      toast.success("Book return process completed successfully");
      navigate("/");
    }
  };
  
  return (
    <div className="page-container">
      {step === "return" ? (
        <>
          <h1 className="section-title">Return Book</h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-md border mb-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="transaction">
                    Select Book to Return <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedTransactionId}
                    onValueChange={setSelectedTransactionId}
                  >
                    <SelectTrigger id="transaction" className={errors.transaction ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a book to return" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTransactions.length > 0 ? (
                        activeTransactions.map(transaction => {
                          const book = getBookById(transaction.bookId);
                          return (
                            <SelectItem key={transaction.id} value={transaction.id}>
                              {book?.title} ({book?.serialNumber})
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="none" disabled>
                          No books to return
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.transaction && <p className="text-sm text-red-500">{errors.transaction}</p>}
                </div>

                {selectedTransaction && selectedBook && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="book-title">Book Title</Label>
                        <Input
                          id="book-title"
                          value={selectedBook.title}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="author">Author</Label>
                        <Input
                          id="author"
                          value={selectedBook.author}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="serial-number">Serial Number</Label>
                        <Input
                          id="serial-number"
                          value={selectedBook.serialNumber}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="issue-date">Issue Date</Label>
                        <Input
                          id="issue-date"
                          value={format(new Date(selectedTransaction.issueDate), "PPP")}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          value={format(new Date(selectedTransaction.returnDate), "PPP")}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="actual-return-date">Return Date <span className="text-red-500">*</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(returnDate, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={returnDate}
                              onSelect={(date) => date && setReturnDate(date)}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleReturnConfirm}
                        className="bg-library-accent hover:bg-library-light-accent"
                      >
                        Confirm Return
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="section-title">Pay Fine</h1>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-md border mb-6">
              {selectedBook && selectedMember && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="book-title">Book Title</Label>
                      <Input
                        id="book-title"
                        value={selectedBook.title}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="member-name">Member</Label>
                      <Input
                        id="member-name"
                        value={selectedMember.name}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        value={format(new Date(selectedTransaction?.returnDate || new Date()), "PPP")}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="return-date">Return Date</Label>
                      <Input
                        id="return-date"
                        value={format(returnDate, "PPP")}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fine-amount">Fine Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fine-amount"
                          value={fine.toFixed(2)}
                          disabled
                          className="bg-muted pl-9"
                        />
                      </div>
                      {fine > 0 && (
                        <p className="text-sm text-amber-600">
                          Fine calculated at $5 per day past the due date.
                        </p>
                      )}
                    </div>
                    
                    {fine > 0 && (
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="fine-paid" 
                            checked={finePaid}
                            onCheckedChange={(checked) => setFinePaid(checked === true)}
                            className={errors.finePaid ? "border-red-500" : ""}
                          />
                          <Label htmlFor="fine-paid" className="font-medium">
                            Fine Paid
                          </Label>
                        </div>
                        {errors.finePaid && <p className="text-sm text-red-500">{errors.finePaid}</p>}
                      </div>
                    )}
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Textarea
                        id="remarks"
                        placeholder="Optional remarks about this return"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep("return")}
                    >
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleFinePayment}
                      className="bg-library-accent hover:bg-library-light-accent"
                    >
                      Complete Return
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Book Return</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to return this book? If returned after the due date, a fine may be applied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReturn}>
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReturnBook;
