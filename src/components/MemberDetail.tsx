
import { useState } from "react";
import { useLibrary, Member, BookTransaction } from "@/contexts/LibraryContext";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Mail, Phone, MapPin, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberDetailProps {
  memberId: string | null;
  onClose: () => void;
}

const MemberDetail = ({ memberId, onClose }: MemberDetailProps) => {
  const { getMemberById, getMemberTransactions, getBookById } = useLibrary();
  const [activeTab, setActiveTab] = useState<"info" | "history">("info");
  
  if (!memberId) return null;
  
  const member = getMemberById(memberId);
  if (!member) return null;
  
  const transactions = getMemberTransactions(memberId);
  
  return (
    <Card className="w-full max-w-4xl mx-auto border-t-4 border-t-library-accent">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-serif">{member.name}</CardTitle>
            <CardDescription>Membership #{member.membershipNumber}</CardDescription>
          </div>
          <Badge 
            variant={member.active ? "default" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {member.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex border-b mb-4 space-x-4">
          <Button
            variant="ghost"
            className={cn(
              "pb-2 rounded-none border-b-2 border-transparent",
              activeTab === "info" && "border-library-accent text-library-accent"
            )}
            onClick={() => setActiveTab("info")}
          >
            Member Information
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "pb-2 rounded-none border-b-2 border-transparent",
              activeTab === "history" && "border-library-accent text-library-accent"
            )}
            onClick={() => setActiveTab("history")}
          >
            Borrowing History
          </Button>
        </div>
        
        {activeTab === "info" ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{format(new Date(member.joinDate), 'PPP')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{member.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{member.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{member.address}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Membership Expiry</p>
                  <p className={cn(
                    new Date(member.expiryDate) < new Date() ? "text-red-600 font-medium" : ""
                  )}>
                    {format(new Date(member.expiryDate), 'PPP')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Membership Type</p>
                  <p>{
                    member.membershipType === "6months" ? "6 Months" :
                    member.membershipType === "1year" ? "1 Year" :
                    "2 Years"
                  }</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Issued On</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const book = getBookById(transaction.bookId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                          {book?.title || "Unknown Book"}
                        </TableCell>
                        <TableCell>{format(new Date(transaction.issueDate), 'PP')}</TableCell>
                        <TableCell>{format(new Date(transaction.returnDate), 'PP')}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.actualReturnDate ? "outline" : "secondary"}>
                            {transaction.actualReturnDate ? "Returned" : "Borrowed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.fine > 0 ? (
                            <span className={transaction.finePaid ? "text-green-600" : "text-red-600"}>
                              ${transaction.fine} {transaction.finePaid ? "(Paid)" : ""}
                            </span>
                          ) : "None"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No borrowing history found for this member.
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="justify-end">
        <Button onClick={onClose}>Close</Button>
      </CardFooter>
    </Card>
  );
};

export default MemberDetail;
