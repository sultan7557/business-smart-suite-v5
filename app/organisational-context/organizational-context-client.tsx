"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Archive, Edit, Trash2, Eye, ArrowUpDown, Home } from 'lucide-react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { toggleArchiveOrganizationalContext, deleteOrganizationalContext } from "@/app/actions/organizational-context-actions"
import OrganizationalContextForm from "./organizational-context-form"

// Helper function to get risk level color
const getRiskLevelColor = (level: number) => {
  if (level >= 15) return "bg-red-500 text-white";
  if (level >= 9) return "bg-yellow-500 text-white";
  return "bg-green-500 text-white";
};

// Helper function to format category name
const formatCategoryName = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

interface OrganizationalContextClientProps {
  entries: any[];
  canEdit: boolean;
  canDelete: boolean;
  showArchived: boolean;
}

export default function OrganizationalContextClient({
  entries,
  canEdit,
  canDelete,
  showArchived,
}: OrganizationalContextClientProps) {
  const router = useRouter()
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Group entries by category
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort categories
  const sortedCategories = Object.keys(groupedEntries).sort();

  const handleToggleArchived = () => {
    router.push(`/organisational-context?showArchived=${!showArchived}`);
  };

  const handleArchiveToggle = async (id: string) => {
    try {
      const result = await toggleArchiveOrganizationalContext(id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Entry ${result.data.archived ? "archived" : "unarchived"} successfully.`,
        });
        router.refresh();
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
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteOrganizationalContext(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Entry deleted successfully.",
        });
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to delete entry");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the entry.",
        variant: "destructive",
      });
    }
  };

  // Don't render anything until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      {/* back to dashboard */}
      <Button
          variant="outline"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <h1 className="text-2xl font-bold">Organizational Context</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleToggleArchived}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
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
                  <DialogTitle>Add New Organizational Context</DialogTitle>
                </DialogHeader>
                <OrganizationalContextForm 
                  isDialog={true} 
                  onClose={() => setIsDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No organizational context entries found.</p>
          </CardContent>
        </Card>
      ) : (
        sortedCategories.map((category) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className={`bg-[#2d1e3e] text-white py-3`}>
              <CardTitle>{formatCategoryName(category)}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Issue</th>
                      <th className="px-4 py-2 text-center w-16">Risk</th>
                      <th className="px-4 py-2 text-left">Controls and Recommendations</th>
                      <th className="px-4 py-2 text-center w-16">Residual Risk</th>
                      <th className="px-4 py-2 text-left">Objectives</th>
                      <th className="px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedEntries[category].map((entry) => (
                      <tr key={entry.id} className={`border-b ${entry.archived ? "bg-gray-100" : ""}`}>
                        <td className="px-4 py-2">
                          <div className="font-medium">{entry.issue}</div>
                          <div className="text-xs text-muted-foreground">{entry.subCategory}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className={`text-center font-bold rounded-md p-2 ${getRiskLevelColor(entry.initialRiskLevel)}`}>
                            {entry.initialRiskLevel}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="whitespace-pre-line">{entry.controlsRecommendations}</div>
                        </td>
                        <td className="px-4 py-2">
                          <div className={`text-center font-bold rounded-md p-2 ${getRiskLevelColor(entry.residualRiskLevel)}`}>
                            {entry.residualRiskLevel}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <ul className="list-disc pl-4">
                            {entry.objectives.map((objective: string, index: number) => (
                              <li key={index} className="text-sm">{objective}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex space-x-1">
                            <Dialog open={isViewDialogOpen && selectedEntry?.id === entry.id} onOpenChange={(open) => {
                              setIsViewDialogOpen(open);
                              if (!open) setSelectedEntry(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setSelectedEntry(entry)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>View Organizational Context</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <h3 className="font-medium">Category</h3>
                                    <p>{formatCategoryName(entry.category)}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Sub Category</h3>
                                    <p>{formatCategoryName(entry.subCategory)}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Issue</h3>
                                    <p>{entry.issue}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Initial Risk Level</h3>
                                    <div className={`inline-block font-bold rounded-md p-2 ${getRiskLevelColor(entry.initialRiskLevel)}`}>
                                      {entry.initialRiskLevel}
                                    </div>
                                    <p className="mt-1 text-sm">Likelihood: {entry.initialLikelihood}, Severity: {entry.initialSeverity}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Controls & Recommendations</h3>
                                    <p className="whitespace-pre-line">{entry.controlsRecommendations}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Residual Risk Level</h3>
                                    <div className={`inline-block font-bold rounded-md p-2 ${getRiskLevelColor(entry.residualRiskLevel)}`}>
                                      {entry.residualRiskLevel}
                                    </div>
                                    <p className="mt-1 text-sm">Likelihood: {entry.residualLikelihood}, Severity: {entry.residualSeverity}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-medium">Linked Objectives</h3>
                                    <ul className="list-disc pl-4">
                                      {entry.objectives.map((objective: string, index: number) => (
                                        <li key={index}>{objective}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {canEdit && !entry.archived && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Organizational Context</DialogTitle>
                                  </DialogHeader>
                                  <OrganizationalContextForm 
                                    isDialog={true} 
                                    onClose={() => setIsDialogOpen(false)} 
                                    entry={entry}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                            
                            {canDelete && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleArchiveToggle(entry.id)}
                                >
                                  {entry.archived ? (
                                    <Archive className="h-4 w-4" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(entry.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
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
        ))
      )}
    </div>
  )
}