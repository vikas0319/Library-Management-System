import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { addDays } from "date-fns";

// Types
export type Book = {
  id: string;
  title: string;
  author: string;
  type: "book" | "movie";
  serialNumber: string;
  available: boolean;
  shelfLocation: string;
  publicationYear: string;
};

export type Member = {
  id: string;
  membershipNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipType: "6months" | "1year" | "2years";
  joinDate: Date;
  expiryDate: Date;
  active: boolean;
};

export type BookTransaction = {
  id: string;
  bookId: string;
  memberId: string;
  issueDate: Date;
  returnDate: Date;
  actualReturnDate: Date | null;
  fine: number;
  finePaid: boolean;
  remarks: string;
};

type LibraryContextType = {
  books: Book[];
  members: Member[];
  transactions: BookTransaction[];
  addBook: (book: Omit<Book, "id">) => void;
  updateBook: (id: string, bookData: Partial<Book>) => void;
  searchBooks: (query: string) => Book[];
  addMember: (member: Omit<Member, "id" | "joinDate" | "expiryDate">) => void;
  updateMember: (id: string, memberData: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  findMemberByNumber: (membershipNumber: string) => Member | undefined;
  issueBook: (bookId: string, memberId: string, returnDate: Date, remarks: string) => boolean;
  returnBook: (transactionId: string, actualReturnDate: Date) => { success: boolean; fine: number; transactionId: string };
  payFine: (transactionId: string) => boolean;
  getAvailableBooks: () => Book[];
  getBookById: (id: string) => Book | undefined;
  getMemberById: (id: string) => Member | undefined;
  getTransactionById: (id: string) => BookTransaction | undefined;
  getBookTransactions: (bookId: string) => BookTransaction[];
  getMemberTransactions: (memberId: string) => BookTransaction[];
};

// Mock data
const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    type: "book",
    serialNumber: "BK-1001",
    available: true,
    shelfLocation: "A1",
    publicationYear: "1960"
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    type: "book",
    serialNumber: "BK-1002",
    available: true,
    shelfLocation: "A2",
    publicationYear: "1949"
  },
  {
    id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    type: "book",
    serialNumber: "BK-1003",
    available: false,
    shelfLocation: "A3",
    publicationYear: "1925"
  },
  {
    id: "4",
    title: "Inception",
    author: "Christopher Nolan",
    type: "movie",
    serialNumber: "MV-101",
    available: true,
    shelfLocation: "M1",
    publicationYear: "2010"
  }
];

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    membershipNumber: "M10001",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    address: "123 Main St",
    membershipType: "1year",
    joinDate: new Date("2023-01-01"),
    expiryDate: new Date("2024-01-01"),
    active: true
  },
  {
    id: "2",
    membershipNumber: "M10002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "123-456-7891",
    address: "456 Elm St",
    membershipType: "6months",
    joinDate: new Date("2023-06-01"),
    expiryDate: new Date("2023-12-01"),
    active: false
  }
];

const MOCK_TRANSACTIONS: BookTransaction[] = [
  {
    id: "1",
    bookId: "3",
    memberId: "1",
    issueDate: new Date("2023-11-01"),
    returnDate: new Date("2023-11-16"),
    actualReturnDate: null,
    fine: 0,
    finePaid: false,
    remarks: "First borrowing"
  }
];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [transactions, setTransactions] = useState<BookTransaction[]>(MOCK_TRANSACTIONS);

  // Book functions
  const addBook = (bookData: Omit<Book, "id">) => {
    const newBook: Book = {
      ...bookData,
      id: `${Date.now()}`
    };
    setBooks([...books, newBook]);
    toast.success(`Book "${bookData.title}" added successfully`);
  };

  const updateBook = (id: string, bookData: Partial<Book>) => {
    setBooks(
      books.map((book) => (book.id === id ? { ...book, ...bookData } : book))
    );
    toast.success("Book updated successfully");
  };

  const searchBooks = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.serialNumber.toLowerCase().includes(lowerQuery)
    );
  };

  const getAvailableBooks = () => {
    return books.filter((book) => book.available);
  };

  const getBookById = (id: string) => {
    return books.find((book) => book.id === id);
  };

  // Member functions
  const addMember = (memberData: Omit<Member, "id" | "joinDate" | "expiryDate">) => {
    const joinDate = new Date();
    let expiryDate: Date;

    switch (memberData.membershipType) {
      case "6months":
        expiryDate = addDays(joinDate, 182);
        break;
      case "1year":
        expiryDate = new Date(joinDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
      case "2years":
        expiryDate = new Date(joinDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        break;
      default:
        expiryDate = addDays(joinDate, 182);
    }

    const newMember: Member = {
      ...memberData,
      id: `${Date.now()}`,
      joinDate,
      expiryDate,
    };

    setMembers([...members, newMember]);
    toast.success(`Member "${memberData.name}" added successfully`);
  };

  const updateMember = (id: string, memberData: Partial<Member>) => {
    setMembers(
      members.map((member) => (member.id === id ? { ...member, ...memberData } : member))
    );
    toast.success("Member updated successfully");
  };

  const findMemberByNumber = (membershipNumber: string) => {
    return members.find((member) => member.membershipNumber === membershipNumber);
  };

  const getMemberById = (id: string) => {
    return members.find((member) => member.id === id);
  };

  // Transaction functions
  const issueBook = (bookId: string, memberId: string, returnDate: Date, remarks: string) => {
    const book = getBookById(bookId);
    const member = getMemberById(memberId);

    if (!book || !member) {
      toast.error("Book or member not found");
      return false;
    }

    if (!book.available) {
      toast.error("This book is not available for borrowing");
      return false;
    }

    if (!member.active) {
      toast.error("This member's membership is not active");
      return false;
    }

    const issueDate = new Date();
    const newTransaction: BookTransaction = {
      id: `${Date.now()}`,
      bookId,
      memberId,
      issueDate,
      returnDate,
      actualReturnDate: null,
      fine: 0,
      finePaid: false,
      remarks
    };

    setTransactions([...transactions, newTransaction]);
    updateBook(bookId, { available: false });
    toast.success("Book issued successfully");
    return true;
  };

  const returnBook = (transactionId: string, actualReturnDate: Date) => {
    const transaction = getTransactionById(transactionId);
    
    if (!transaction) {
      toast.error("Transaction not found");
      return { success: false, fine: 0, transactionId };
    }

    if (transaction.actualReturnDate) {
      toast.error("This book has already been returned");
      return { success: false, fine: 0, transactionId };
    }

    // Calculate fine (if returned after due date)
    let fine = 0;
    if (actualReturnDate > transaction.returnDate) {
      const diffTime = Math.abs(actualReturnDate.getTime() - transaction.returnDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 5; // $5 per day
    }

    // Update transaction
    const updatedTransaction = {
      ...transaction,
      actualReturnDate,
      fine
    };

    setTransactions(
      transactions.map((t) => (t.id === transactionId ? updatedTransaction : t))
    );

    // Make book available again if fine is paid or there's no fine
    if (fine === 0) {
      updateBook(transaction.bookId, { available: true });
      toast.success("Book returned successfully");
    } else {
      toast.warning(`Book returned with a fine of $${fine}`);
    }

    return { success: true, fine, transactionId };
  };

  const payFine = (transactionId: string) => {
    const transaction = getTransactionById(transactionId);
    
    if (!transaction) {
      toast.error("Transaction not found");
      return false;
    }

    setTransactions(
      transactions.map((t) =>
        t.id === transactionId ? { ...t, finePaid: true } : t
      )
    );

    // Make book available again
    updateBook(transaction.bookId, { available: true });
    toast.success("Fine paid and book returned successfully");
    return true;
  };

  const getTransactionById = (id: string) => {
    return transactions.find((transaction) => transaction.id === id);
  };

  const getBookTransactions = (bookId: string) => {
    return transactions.filter((transaction) => transaction.bookId === bookId);
  };

  const getMemberTransactions = (memberId: string) => {
    return transactions.filter((transaction) => transaction.memberId === memberId);
  };

  // Add delete member function
  const deleteMember = (id: string) => {
    // Check if member has any active transactions
    const activeTransactions = transactions.filter(
      transaction => transaction.memberId === id && !transaction.actualReturnDate
    );

    if (activeTransactions.length > 0) {
      toast.error("Cannot delete member with active transactions");
      return;
    }

    setMembers(members.filter(member => member.id !== id));
    toast.success("Member deleted successfully");
  };

  const value = {
    books,
    members,
    transactions,
    addBook,
    updateBook,
    searchBooks,
    addMember,
    updateMember,
    deleteMember,
    findMemberByNumber,
    issueBook,
    returnBook,
    payFine,
    getAvailableBooks,
    getBookById,
    getMemberById,
    getTransactionById,
    getBookTransactions,
    getMemberTransactions,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};
