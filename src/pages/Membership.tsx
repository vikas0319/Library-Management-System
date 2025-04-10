
import { useState } from "react";
import { Library, PlusCircle, Pencil, User, CheckCircle2, XCircle } from "lucide-react";
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
import { format, addDays, addMonths, addYears } from "date-fns";
import { useLibrary, Member } from "@/contexts/LibraryContext";
import { toast } from "sonner";

const Membership = () => {
  const { members, addMember, updateMember, findMemberByNumber } = useLibrary();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "update">("add");
  const [updateMode, setUpdateMode] = useState<"extend" | "cancel">("extend");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membershipNumber: "",
    membershipType: "6months" as "6months" | "1year" | "2years",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchMembershipNumber, setSearchMembershipNumber] = useState("");
  const [memberToUpdate, setMemberToUpdate] = useState<Member | null>(null);
  
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      membershipNumber: "",
      membershipType: "6months",
    });
    setErrors({});
    setMemberToUpdate(null);
    setSearchMembershipNumber("");
  };
  
  const openAddDialog = () => {
    resetForm();
    setMode("add");
    setOpen(true);
  };
  
  const openUpdateDialog = () => {
    resetForm();
    setMode("update");
    setUpdateMode("extend");
    setOpen(true);
  };
  
  const validateAddForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (!formData.membershipNumber.trim()) {
      newErrors.membershipNumber = "Membership number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateUpdateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!searchMembershipNumber.trim()) {
      newErrors.searchMembershipNumber = "Membership number is required";
    } else if (!memberToUpdate) {
      newErrors.searchMembershipNumber = "No member found with this membership number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    addMember(formData);
    setOpen(false);
    resetForm();
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUpdateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }
    
    if (memberToUpdate) {
      if (updateMode === "extend") {
        let newExpiryDate = new Date(memberToUpdate.expiryDate);
        
        switch (formData.membershipType) {
          case "6months":
            newExpiryDate = addMonths(newExpiryDate, 6);
            break;
          case "1year":
            newExpiryDate = addYears(newExpiryDate, 1);
            break;
          case "2years":
            newExpiryDate = addYears(newExpiryDate, 2);
            break;
        }
        
        updateMember(memberToUpdate.id, {
          expiryDate: newExpiryDate,
          active: true,
        });
        
        toast.success(`Membership extended until ${format(newExpiryDate, "PPP")}`);
      } else if (updateMode === "cancel") {
        updateMember(memberToUpdate.id, {
          active: false,
        });
        
        toast.success("Membership has been canceled");
      }
      
      setOpen(false);
      resetForm();
    }
  };
  
  const handleSearchMember = () => {
    if (!searchMembershipNumber.trim()) {
      setErrors({
        searchMembershipNumber: "Membership number is required",
      });
      return;
    }
    
    const member = findMemberByNumber(searchMembershipNumber);
    
    if (member) {
      setMemberToUpdate(member);
      setErrors({});
    } else {
      setMemberToUpdate(null);
      setErrors({
        searchMembershipNumber: "No member found with this membership number",
      });
    }
  };
  
  // Generate a random membership number for new members
  const generateMembershipNumber = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const membershipNumber = `M${randomNum}`;
    setFormData({ ...formData, membershipNumber });
  };
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="section-title mb-0">Membership Management</h1>
        <div className="flex space-x-4">
          <Button 
            onClick={openAddDialog} 
            className="bg-library-accent hover:bg-library-light-accent gap-2"
          >
            <PlusCircle size={16} />
            Add New Member
          </Button>
          <Button 
            onClick={openUpdateDialog} 
            variant="outline"
            className="gap-2"
          >
            <Pencil size={16} />
            Update Membership
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="active">Active Members</TabsTrigger>
          <TabsTrigger value="expired">Expired Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <MemberList members={members} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <MemberList 
            members={members.filter(member => member.active)} 
          />
        </TabsContent>
        
        <TabsContent value="expired" className="mt-6">
          <MemberList 
            members={members.filter(member => !member.active)} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Add/Update Membership Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Member" : "Update Membership"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" 
                ? "Add a new member to the library system." 
                : "Extend or cancel an existing membership."}
            </DialogDescription>
          </DialogHeader>
          
          {mode === "add" ? (
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input 
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="membershipNumber">
                    Membership Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="membershipNumber"
                      value={formData.membershipNumber}
                      onChange={(e) => setFormData({...formData, membershipNumber: e.target.value})}
                      className={cn(
                        "flex-1",
                        errors.membershipNumber ? "border-red-500" : ""
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={generateMembershipNumber}
                    >
                      Generate
                    </Button>
                  </div>
                  {errors.membershipNumber && (
                    <p className="text-sm text-red-500">{errors.membershipNumber}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Membership Type <span className="text-red-500">*</span></Label>
                  <RadioGroup
                    value={formData.membershipType}
                    onValueChange={(value: "6months" | "1year" | "2years") => 
                      setFormData({...formData, membershipType: value})
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6months" id="6months" />
                      <Label htmlFor="6months">6 Months</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1year" id="1year" />
                      <Label htmlFor="1year">1 Year</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2years" id="2years" />
                      <Label htmlFor="2years">2 Years</Label>
                    </div>
                  </RadioGroup>
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
                  Add Member
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-membership">Membership Number <span className="text-red-500">*</span></Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="search-membership"
                      value={searchMembershipNumber}
                      onChange={(e) => setSearchMembershipNumber(e.target.value)}
                      placeholder="Enter membership number"
                      className={cn(
                        "flex-1",
                        errors.searchMembershipNumber ? "border-red-500" : ""
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleSearchMember}
                    >
                      Search
                    </Button>
                  </div>
                  {errors.searchMembershipNumber && (
                    <p className="text-sm text-red-500">{errors.searchMembershipNumber}</p>
                  )}
                </div>
                
                {memberToUpdate && (
                  <div className="border rounded-md p-4 bg-muted/20">
                    <h3 className="font-medium mb-2">Member Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{memberToUpdate.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{memberToUpdate.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Status</p>
                        <p className={memberToUpdate.active ? "text-green-600" : "text-red-600"}>
                          {memberToUpdate.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p>{format(new Date(memberToUpdate.expiryDate), "PPP")}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label>Update Action</Label>
                      <RadioGroup
                        value={updateMode}
                        onValueChange={(value: "extend" | "cancel") => setUpdateMode(value)}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="extend" id="extend" />
                          <Label htmlFor="extend">Extend Membership</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cancel" id="cancel" />
                          <Label htmlFor="cancel">Cancel Membership</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {updateMode === "extend" && (
                      <div className="space-y-2 mt-4">
                        <Label>Extension Period</Label>
                        <RadioGroup
                          value={formData.membershipType}
                          onValueChange={(value: "6months" | "1year" | "2years") => 
                            setFormData({...formData, membershipType: value})
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="6months" id="update-6months" />
                            <Label htmlFor="update-6months">6 Months</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1year" id="update-1year" />
                            <Label htmlFor="update-1year">1 Year</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2years" id="update-2years" />
                            <Label htmlFor="update-2years">2 Years</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className={updateMode === "cancel" ? "bg-red-600 hover:bg-red-700" : "bg-library-accent hover:bg-library-light-accent"}
                  disabled={!memberToUpdate}
                >
                  {updateMode === "extend" ? "Extend Membership" : "Cancel Membership"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// MemberList component for displaying members
const MemberList = ({ members }: { members: Member[] }) => {
  return (
    <div className="bg-white rounded-md border">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <div>
          <h2 className="font-medium font-serif">Member List</h2>
          <p className="text-sm text-muted-foreground">
            Showing {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Membership #</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Join Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Expiry Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="border-t hover:bg-muted/20">
                  <td className="p-4 text-sm">{member.name}</td>
                  <td className="p-4 text-sm font-mono text-xs">{member.membershipNumber}</td>
                  <td className="p-4 text-sm">{member.email}</td>
                  <td className="p-4 text-sm">{member.phone}</td>
                  <td className="p-4 text-sm">{format(new Date(member.joinDate), "PP")}</td>
                  <td className="p-4 text-sm">{format(new Date(member.expiryDate), "PP")}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center">
                      {member.active ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <User size={48} className="text-muted-foreground/50 mb-2" />
                    <p>No members found in this category.</p>
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

export default Membership;
