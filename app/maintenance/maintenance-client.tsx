"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Archive, Edit, Trash2, Eye, Check, X, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { toggleArchiveMaintenanceItem, deleteMaintenanceItem, getDocumentById } from "@/app/actions/maintenance-actions"
import MaintenanceForm from "./maintenance-form"
import DocumentUpload from "./document-upload"
import DocumentViewer from "./document-viewer"
import { format } from "date-fns"

// Helper function to get due date color
const getDueDateColor = (dueDate: string | Date) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Calculate difference in days
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "bg-red-600 text-white"; // Overdue
  if (diffDays < 30) return "bg-red-500 text-white"; // Due soon
  if (diffDays < 60) return "bg-yellow-500 text-white"; // Coming up
  return "bg-green-500 text-white"; // Plenty of time
};

interface MaintenanceClientProps {
  maintenanceItems: any[];
  closedMaintenanceItems: any[];
  calibrationItems: any[];
  closedCalibrationItems: any[];
  users: any[];
  subCategories: string[];
  canEdit: boolean;
  canDelete: boolean;
  showArchived: boolean;
  toggleShowArchived: (currentState: boolean) => Promise<{ success: boolean; data: boolean; error?: string }>;
}

export default function MaintenanceClient({
  maintenanceItems,
  closedMaintenanceItems,
  calibrationItems,
  closedCalibrationItems,
  users,
  subCategories,
  canEdit,
  canDelete,
  showArchived,
  toggleShowArchived,
}: MaintenanceClientProps) {
  // State for client-side rendering
  const [mounted, setMounted] = useState(false);
  const [localShowArchived, setLocalShowArchived] = useState(showArchived);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSubCategory, setFilterSubCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterAllocatedTo, setFilterAllocatedTo] = useState<string>("all");

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
    setLocalShowArchived(showArchived);
  }, [showArchived]);

  const handleArchiveToggle = async (id: string) => {
    try {
      const result = await toggleArchiveMaintenanceItem(id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Maintenance item ${result.data?.archived ? "archived" : "unarchived"} successfully.`,
        });
      } else {
        throw new Error(result.error || "Failed to toggle archive status");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while toggling archive status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance item? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteMaintenanceItem(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Maintenance item deleted successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to delete maintenance item");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the maintenance item.",
        variant: "destructive",
      });
    }
  };

  const handleViewDocument = async (documentId: string) => {
    try {
      const result = await getDocumentById(documentId);
      if (result.success && result.data) {
      setSelectedDocument(result.data);
      setDocumentViewerOpen(true);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        title: "Error",
        description: "Failed to fetch document",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchived = async () => {
    try {
      const result = await toggleShowArchived(localShowArchived);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle archived view");
      }
      // Force a page refresh to update the view
      window.location.href = `/maintenance?showArchived=${!localShowArchived}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while toggling archived view.",
        variant: "destructive",
      });
    }
  };

  const renderMaintenanceTable = (items: any[], title: string) => {
    // Filter items based on selected filters
    const filteredItems = items.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterSubCategory !== "all" && item.subCategory !== filterSubCategory) return false;
      if (filterStatus !== "all") {
        if (filterStatus === "completed" && !item.completed) return false;
        if (filterStatus === "pending" && item.completed) return false;
      }
      if (filterOwner !== "all" && item.owner !== filterOwner) return false;
      if (filterAllocatedTo !== "all" && item.allocatedTo !== filterAllocatedTo) return false;
      return true;
    });

    if (filteredItems.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader className="bg-gray-700 text-white py-3 flex flex-row justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>
            </Button>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No maintenance items found.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-gray-700 text-white py-3 flex flex-row justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleArchived}
            >
              {localShowArchived ? "Hide Archived" : "Show Archived"}
            </Button>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Maintenance Item</DialogTitle>
                  </DialogHeader>
                  <MaintenanceForm
                    users={users}
                    subCategories={subCategories}
                    onClose={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Ref</th>
                  <th className="px-4 py-2 text-left">Serial</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Supplier</th>
                  <th className="px-4 py-2 text-left">Tolerance</th>
                  <th className="px-4 py-2 text-left">Frequency</th>
                  <th className="px-4 py-2 text-center">Due date</th>
                  <th className="px-4 py-2 text-left">Owner</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className={`border-b ${item.archived ? "bg-gray-100" : ""}`}>
                    <td className="px-4 py-2">
                      <div className="font-medium">{item.name}</div>
                    </td>
                    <td className="px-4 py-2">{item.reference || "-"}</td>
                    <td className="px-4 py-2">{item.serialNumber || "-"}</td>
                    <td className="px-4 py-2">
                      <div className="text-sm max-w-[200px] truncate" title={item.actionRequired}>
                        {item.actionRequired}
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.supplier || "-"}</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">{item.frequency}</td>
                    <td className="px-4 py-2">
                      <div className={`text-center font-bold rounded-md p-2 ${getDueDateColor(item.dueDate)}`}>
                        {format(new Date(item.dueDate), "dd/MM/yyyy")}
                      </div>
                    </td>
                    <td className="px-4 py-2">{item.owner}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleArchiveToggle(item.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planned Maintenance</h1>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Filter options:</span>
            <Select value={filterSubCategory} onValueChange={setFilterSubCategory}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="-- Select sub-category to filter --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-- Select sub-category to filter --</SelectItem>
                {subCategories.map((subCategory) => (
                  <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setFilterSubCategory("all")}>
              Apply filter
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={handleToggleArchived}
          >
            {localShowArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Maintenance Item</DialogTitle>
                </DialogHeader>
                <MaintenanceForm 
                  isDialog={true} 
                  onClose={() => setIsDialogOpen(false)} 
                  users={users}
                  subCategories={subCategories}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Maintenance Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p>{selectedItem.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Category</h3>
                <p>{selectedItem.category}</p>
              </div>
              <div>
                <h3 className="font-medium">Sub-Category</h3>
                <p>{selectedItem.subCategory}</p>
              </div>
              <div>
                <h3 className="font-medium">Supplier</h3>
                <p>{selectedItem.supplier || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Serial Number</h3>
                <p>{selectedItem.serialNumber || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Reference</h3>
                <p>{selectedItem.reference || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Action Required</h3>
                <p className="whitespace-pre-line">{selectedItem.actionRequired}</p>
              </div>
              <div>
                <h3 className="font-medium">Frequency</h3>
                <p>{selectedItem.frequency}</p>
              </div>
              <div>
                <h3 className="font-medium">Due Date</h3>
                <p>{selectedItem.dueDate ? format(new Date(selectedItem.dueDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Owner</h3>
                <p>{selectedItem.owner}</p>
              </div>
              <div>
                <h3 className="font-medium">Allocated To</h3>
                <p>{selectedItem.allocatedTo || "-"}</p>
              </div>
              {selectedItem.completed && (
                <div>
                  <h3 className="font-medium">Date Completed</h3>
                  <p>{selectedItem.dateCompleted ? format(new Date(selectedItem.dateCompleted), "dd/MM/yyyy") : "-"}</p>
                </div>
              )}

              {selectedItem.documents && selectedItem.documents.length > 0 && (
                <div>
                  <h3 className="font-medium">Documents</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedItem.documents.map((doc: any) => (
                      <li key={doc.id} className="flex items-center">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-blue-600"
                          onClick={() => handleViewDocument(doc.id)}
                        >
                          {doc.title}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedItem(null);
                    setViewDialogOpen(false);
                  }}
                >
                  Close
                </Button>
                {canEdit && (
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canEdit && (
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setDocumentDialogOpen(true);
                    }}
                  >
                    Upload Document
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <MaintenanceForm
              item={selectedItem}
              users={users}
              subCategories={subCategories}
              onClose={() => {
                setEditDialogOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <DocumentUpload 
              maintenanceId={selectedItem.id} 
              onUploadComplete={() => {
                setDocumentDialogOpen(false);
                // Refresh the page to show the new document
                window.location.reload();
              }}
              onCancel={() => setDocumentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <DocumentViewer 
              document={selectedDocument} 
              onBack={() => setDocumentViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {renderMaintenanceTable(maintenanceItems, "Open maintenance items")}
      {renderMaintenanceTable(closedMaintenanceItems, "Closed maintenance items")}
      {renderMaintenanceTable(calibrationItems, "Open calibration items")}
      {renderMaintenanceTable(closedCalibrationItems, "Closed calibration items")}
    </div>
  );
}