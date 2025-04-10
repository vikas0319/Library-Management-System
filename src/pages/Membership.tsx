import { useState } from "react";
import { useLibrary } from "@/contexts/LibraryContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, addMonths, addYears } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MemberDetail from "@/components/MemberDetail";
import { UserIcon, Edit, EyeIcon, Trash2 } from "lucide-react";

export default function Membership() {
  const { members, addMember, updateMember, findMemberByNumber, deleteMember } = useLibrary();
  const [activeTab, setActiveTab] = useState("add");
  const [searchNumber, setSearchNumber] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [viewMemberId, setViewMemberId] = useState<string | null>(null);

  // Add Member Form State
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membershipNumber: `M${Math.floor(10000 + Math.random() * 90000)}`,
    membershipType: "6months" as "6months" | "1year" | "2years",
    active: true,
  });
  
  // Update Member Form State
  const [updateType, setUpdateType] = useState<"extend" | "cancel">("extend");
  const [extensionType, setExtensionType] = useState<"6months" | "1year" | "2years">("6months");
  
  const handleAddMember = () => {
    // Validate form
    if (!newMember.name || !newMember.email || !newMember.phone || !newMember.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    addMember(newMember);
    
    // Reset form
    setNewMember({
      name: "",
      email: "",
      phone: "",
      address: "",
      membershipNumber: `M${Math.floor(10000 + Math.random() * 90000)}`,
      membershipType: "6months",
      active: true,
    });
  };
  
  const handleSearchMember = () => {
    if (!searchNumber) {
      toast.error("Please enter a membership number");
      return;
    }
    
    const member = findMemberByNumber(searchNumber);
    if (member) {
      setSelectedMember(member);
    } else {
      toast.error("Member not found");
      setSelectedMember(null);
    }
  };
  
  const handleDeleteMember = (id: string) => {
    deleteMember(id);
    setSelectedMember(null);
    setSearchNumber("");
  };
  
  const handleUpdateMember = () => {
    if (!selectedMember) return;
    
    if (updateType === "extend") {
      let newExpiryDate;
      
      switch (extensionType) {
        case "6months":
          newExpiryDate = addMonths(new Date(), 6);
          break;
        case "1year":
          newExpiryDate = addYears(new Date(), 1);
          break;
        case "2years":
          newExpiryDate = addYears(new Date(), 2);
          break;
      }
      
      updateMember(selectedMember.id, { 
        expiryDate: newExpiryDate, 
        active: true 
      });
      
      toast.success("Membership extended successfully");
    } else {
      // Cancel membership
      updateMember(selectedMember.id, { active: false });
      toast.success("Membership cancelled");
    }
    
    // Reset selected member
    setSelectedMember(null);
    setSearchNumber("");
  };
  
  const viewMemberDetails = (memberId: string) => {
    setViewMemberId(memberId);
  };
  
  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Membership Management</h1>
      
      {viewMemberId ? (
        <MemberDetail memberId={viewMemberId} onClose={() => setViewMemberId(null)} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="list">View Members</TabsTrigger>
            <TabsTrigger value="add">Add Membership</TabsTrigger>
            <TabsTrigger value="update">Update Membership</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Members List</CardTitle>
                <CardDescription>View and manage library members</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Membership #</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Expiry Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium flex items-center">
                            <UserIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                            {member.name}
                          </TableCell>
                          <TableCell>{member.membershipNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className={cn(
                              new Date(member.expiryDate) < new Date() ? "text-red-600" : ""
                            )}>
                              {format(new Date(member.expiryDate), 'PP')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.active ? "default" : "destructive"}>
                              {member.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => viewMemberDetails(member.id)}
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    className="text-destructive"
                                    title="Delete Member"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the member
                                      and remove their data from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No members found. Add members to see them here.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Member</CardTitle>
                <CardDescription>Create a new library membership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="membershipNumber">Membership Number</Label>
                      <Input 
                        id="membershipNumber" 
                        value={newMember.membershipNumber} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-right">Name*</Label>
                      <Input 
                        id="name" 
                        value={newMember.name} 
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address*</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={newMember.email} 
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input 
                      id="phone" 
                      value={newMember.phone} 
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address*</Label>
                    <Input 
                      id="address" 
                      value={newMember.address} 
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Membership Type</Label>
                    <RadioGroup 
                      defaultValue="6months"
                      value={newMember.membershipType}
                      onValueChange={(value) => 
                        setNewMember({
                          ...newMember, 
                          membershipType: value as "6months" | "1year" | "2years"
                        })
                      }
                      className="flex space-x-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6months" id="6months" />
                        <Label htmlFor="6months" className="cursor-pointer">6 Months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1year" id="1year" />
                        <Label htmlFor="1year" className="cursor-pointer">1 Year</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2years" id="2years" />
                        <Label htmlFor="2years" className="cursor-pointer">2 Years</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddMember}>Add Member</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="update">
            <Card>
              <CardHeader>
                <CardTitle>Update Membership</CardTitle>
                <CardDescription>Extend or cancel an existing membership</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4 space-x-2">
                  <Input 
                    placeholder="Enter Membership Number" 
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={handleSearchMember}>Search</Button>
                </div>
                
                {selectedMember && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <div className="p-2 border rounded bg-muted">{selectedMember.name}</div>
                      </div>
                      <div>
                        <Label>Membership Number</Label>
                        <div className="p-2 border rounded bg-muted">{selectedMember.membershipNumber}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Join Date</Label>
                        <div className="p-2 border rounded bg-muted">
                          {format(new Date(selectedMember.joinDate), 'PPP')}
                        </div>
                      </div>
                      <div>
                        <Label>Expiry Date</Label>
                        <div className={cn("p-2 border rounded", 
                          new Date(selectedMember.expiryDate) < new Date() 
                            ? "bg-red-100 text-red-800" 
                            : "bg-muted"
                        )}>
                          {format(new Date(selectedMember.expiryDate), 'PPP')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Email</Label>
                        <div className="p-2 border rounded bg-muted">{selectedMember.email}</div>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className={cn("p-2 border rounded font-medium", 
                          selectedMember.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        )}>
                          {selectedMember.active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex space-x-4 mb-2">
                        <Button 
                          variant={updateType === "extend" ? "default" : "outline"}
                          onClick={() => setUpdateType("extend")}
                          className="flex-1"
                        >
                          Extend Membership
                        </Button>
                        <Button 
                          variant={updateType === "cancel" ? "default" : "outline"}
                          onClick={() => setUpdateType("cancel")}
                          className="flex-1"
                        >
                          Cancel Membership
                        </Button>
                      </div>
                      
                      {updateType === "extend" && (
                        <div className="mt-4">
                          <Label>Extension Duration</Label>
                          <RadioGroup 
                            defaultValue="6months"
                            value={extensionType}
                            onValueChange={(value) => 
                              setExtensionType(value as "6months" | "1year" | "2years")
                            }
                            className="flex space-x-4 pt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="6months" id="extend6months" />
                              <Label htmlFor="extend6months" className="cursor-pointer">6 Months</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1year" id="extend1year" />
                              <Label htmlFor="extend1year" className="cursor-pointer">1 Year</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2years" id="extend2years" />
                              <Label htmlFor="extend2years" className="cursor-pointer">2 Years</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {selectedMember && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Member</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the member
                            and remove their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMember(selectedMember.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={handleUpdateMember}>
                      {updateType === "extend" ? "Extend Membership" : "Cancel Membership"}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
