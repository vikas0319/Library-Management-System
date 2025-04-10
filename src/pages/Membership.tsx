import { useState } from "react";
import { format, addMonths, addYears } from "date-fns";
import { Calendar as CalendarIcon, Check, User, UserPlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLibrary, Member } from "@/contexts/LibraryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const addMemberSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: "Invalid phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  membershipType: z.enum(["6months", "1year", "2years"]),
});

const editMemberSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: "Invalid phone number.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  active: z.boolean(),
});

const Membership = () => {
  const { members, addMember, updateMember, deleteMember } = useLibrary();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const formAdd = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      membershipType: "6months",
    },
  });
  
  const formEdit = useForm<z.infer<typeof editMemberSchema>>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: selectedMember || {
      name: "",
      email: "",
      phone: "",
      address: "",
      active: true,
    },
    values: selectedMember || {
      name: "",
      email: "",
      phone: "",
      address: "",
      active: true,
    },
    mode: "onChange",
    shouldUnregister: false,
  });
  
  const handleAddMember = (data: z.infer<typeof addMemberSchema>) => {
    // Generate a unique membership number
    const membershipNumber = `MEM${Date.now().toString().slice(-6)}`;
    
    // Calculate expiry date based on membership type
    const joinDate = new Date();
    let expiryDate = new Date();
    
    if (data.membershipType === "6months") {
      expiryDate = addMonths(joinDate, 6);
    } else if (data.membershipType === "1year") {
      expiryDate = addYears(joinDate, 1);
    } else {
      expiryDate = addYears(joinDate, 2);
    }
    
    // Add new member
    addMember({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      membershipNumber,
      membershipType: data.membershipType,
      active: true
    });
    
    // Reset form and show success message
    formAdd.reset();
    toast.success(`Membership created successfully for ${data.name}`);
  };
  
  const handleEditMember = (data: z.infer<typeof editMemberSchema>) => {
    if (!selectedMember) return;
    
    updateMember({
      id: selectedMember.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      membershipNumber: selectedMember.membershipNumber,
      membershipType: selectedMember.membershipType,
      active: data.active,
    });
    
    setSelectedMember(null);
    toast.success(`Membership updated successfully for ${data.name}`);
  };
  
  const handleDeleteClick = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (!selectedMember) return;
    
    deleteMember(selectedMember.id);
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
    toast.success("Member deleted successfully");
  };
  
  return (
    <div className="page-container">
      <h1 className="section-title">Membership Management</h1>
      
      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">Add Member</TabsTrigger>
          <TabsTrigger value="edit" disabled={members.length === 0}>Edit Member</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={formAdd.handleSubmit(handleAddMember)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="John Doe" {...formAdd.register("name")} />
                    {formAdd.formState.errors.name && (
                      <p className="text-sm text-red-500">{formAdd.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="john.doe@example.com" {...formAdd.register("email")} />
                    {formAdd.formState.errors.email && (
                      <p className="text-sm text-red-500">{formAdd.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+15551234567" {...formAdd.register("phone")} />
                    {formAdd.formState.errors.phone && (
                      <p className="text-sm text-red-500">{formAdd.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St, Anytown" {...formAdd.register("address")} />
                    {formAdd.formState.errors.address && (
                      <p className="text-sm text-red-500">{formAdd.formState.errors.address.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="membershipType">Membership Type</Label>
                  <RadioGroup defaultValue="6months" {...formAdd.register("membershipType")}>
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
                
                <Button type="submit" className="bg-library-accent hover:bg-library-light-accent">
                  Add Member
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-4">
          {members.length === 0 ? (
            <p>No members to edit. Please add a member first.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberSelect">Select Member</Label>
                <select
                  id="memberSelect"
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const member = members.find((m) => m.id === selectedId);
                    setSelectedMember(member || null);
                    
                    if (member) {
                      formEdit.reset(member);
                    }
                  }}
                  value={selectedMember?.id || ""}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.membershipNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMember && (
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={formEdit.handleSubmit(handleEditMember)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="John Doe" {...formEdit.register("name")} />
                        {formEdit.formState.errors.name && (
                          <p className="text-sm text-red-500">{formEdit.formState.errors.name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="john.doe@example.com" {...formEdit.register("email")} />
                        {formEdit.formState.errors.email && (
                          <p className="text-sm text-red-500">{formEdit.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" placeholder="+15551234567" {...formEdit.register("phone")} />
                        {formEdit.formState.errors.phone && (
                          <p className="text-sm text-red-500">{formEdit.formState.errors.phone.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="123 Main St, Anytown" {...formEdit.register("address")} />
                        {formEdit.formState.errors.address && (
                          <p className="text-sm text-red-500">{formEdit.formState.errors.address.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="active">Active</Label>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="active" {...formEdit.register("active")} className="h-5 w-5" />
                          <Label htmlFor="active">Active</Label>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDeleteClick(selectedMember)}
                        >
                          Delete Member
                        </Button>
                        <Button type="submit" className="bg-library-accent hover:bg-library-light-accent">
                          Update Member
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Membership;
