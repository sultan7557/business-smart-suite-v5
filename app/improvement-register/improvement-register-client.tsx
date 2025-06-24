"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Archive, Eye, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { archiveImprovementRegister, deleteImprovementRegister, restoreImprovementRegister } from "../actions/improvement-register-actions"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface ImprovementRegisterClientProps {
  improvements: any[]
  completedImprovements: any[]
  users: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function ImprovementRegisterClient({
  improvements,
  completedImprovements,
  users,
  canEdit,
  canDelete,
}: ImprovementRegisterClientProps) {
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [rootCauseFilter, setRootCauseFilter] = useState("")
  const [showArchived, setShowArchived] = useState(false)

  // Category options
  const categoryOptions = [
    "Accident",
    "Complaint",
    "Environment",
    "External Audit",
    "Goods Damaged in Transit",
    "Health and Safety",
    "Improvement Suggestion",
    "Information Security",
    "Installation Issue",
    "Internal Audit",
    "Management Review",
    "Near Miss",
    "Process Issue",
    "Safeguarding",
    "Supplier Defect",
  ]

  // Type options
  const typeOptions = ["OFI", "Non Conformance", "Major Non Conformance"]

  // Root cause options
  const rootCauseOptions = [
    "Materials",
    "Machinery",
    "Location",
    "Human Error",
    "Management Error",
    "Lack of Control Procedure",
    "Software",
    "Information Security",
  ]

  // Filter improvements based on selected filters
  const filteredImprovements = improvements.filter((improvement) => {
    // Skip if category filter is set and doesn't match
    if (categoryFilter && categoryFilter !== "all" && improvement.category !== categoryFilter) return false
    
    // Skip if type filter is set and doesn't match
    if (typeFilter && typeFilter !== "all" && improvement.type !== typeFilter) return false
    
    // Skip if root cause filter is set and doesn't match
    if (rootCauseFilter && rootCauseFilter !== "all" && improvement.rootCauseType !== rootCauseFilter) return false
    
    // Show archived items only when showArchived is true
    if (showArchived && !improvement.archived) return false
    if (!showArchived && improvement.archived) return false
    
    return true
  })

  const filteredCompletedImprovements = completedImprovements.filter((improvement) => {
    // Skip if category filter is set and doesn't match
    if (categoryFilter && categoryFilter !== "all" && improvement.category !== categoryFilter) return false
    
    // Skip if type filter is set and doesn't match
    if (typeFilter && typeFilter !== "all" && improvement.type !== typeFilter) return false
    
    // Skip if root cause filter is set and doesn't match
    if (rootCauseFilter && rootCauseFilter !== "all" && improvement.rootCauseType !== rootCauseFilter) return false
    
    // Show archived items only when showArchived is true
    if (showArchived && !improvement.archived) return false
    if (!showArchived && improvement.archived) return false
    
    return true
  })

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this improvement?")) {
      const result = await archiveImprovementRegister(id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement archived successfully",
        })
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive improvement",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this improvement? This action cannot be undone.")) {
      const result = await deleteImprovementRegister(id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete improvement",
          variant: "destructive",
        })
      }
    }
  }

  const handleRestore = async (id: string) => {
    if (confirm("Are you sure you want to restore this improvement?")) {
      const result = await restoreImprovementRegister(id)
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement restored successfully",
        })
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore improvement",
          variant: "destructive",
        })
      }
    }
  }

  const getOwnerName = (improvement: any) => {
    if (improvement.internalOwner) {
      return improvement.internalOwner.name
    }
    if (improvement.externalOwner) {
      return improvement.externalOwner
    }
    return "Not assigned"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Improvement Register</h1>
        {canEdit && (
          <Button asChild>
            <Link href="/improvement-register/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Entry
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Category filter</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Category filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Categories --</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Type filter</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Type filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Types --</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Root cause filter</label>
          <Select value={rootCauseFilter} onValueChange={setRootCauseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Root cause filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Root Causes --</SelectItem>
              {rootCauseOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setCategoryFilter("")
            setTypeFilter("")
            setRootCauseFilter("")
          }}
          variant="outline"
        >
          Clear Filters
        </Button>

        <Button
          onClick={() => setShowArchived(!showArchived)}
          variant={showArchived ? "default" : "outline"}
          className="ml-auto"
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>

      <div className="bg-gray-100 p-4">
        <p className="font-medium">
          Current latest improvement report reference is: {improvements[0]?.number || "N/A"}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Improvement Register Items</h2>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date raised</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action Taken</TableHead>
                <TableHead>Date due</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImprovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No improvement register items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredImprovements.map((improvement) => (
                  <TableRow key={improvement.id}>
                    <TableCell>{improvement.number}</TableCell>
                    <TableCell>{format(new Date(improvement.dateRaised), "dd/MMM/yyyy")}</TableCell>
                    <TableCell>{improvement.category}</TableCell>
                    <TableCell>
                      <Badge variant={improvement.type === "OFI" ? "outline" : "destructive"}>{improvement.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{improvement.description}</TableCell>
                    <TableCell>{improvement.correctiveAction ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {improvement.dateDue ? format(new Date(improvement.dateDue), "MMM yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>{getOwnerName(improvement)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/improvement-register/${improvement.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canEdit && !improvement.archived && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/improvement-register/${improvement.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canEdit && (
                          <>
                            {improvement.archived ? (
                              <Button variant="ghost" size="icon" onClick={() => handleRestore(improvement.id)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleArchive(improvement.id)}>
                            <Archive className="h-4 w-4" />
                          </Button>
                            )}
                          </>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(improvement.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Completed Improvement Register Items</h2>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Date raised</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action Taken</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompletedImprovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-4">
                    No completed improvement register items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompletedImprovements.map((improvement) => (
                  <TableRow key={improvement.id}>
                    <TableCell>{improvement.number}</TableCell>
                    <TableCell>{format(new Date(improvement.dateRaised), "dd/MMM/yyyy")}</TableCell>
                    <TableCell>{improvement.category}</TableCell>
                    <TableCell>
                      <Badge variant={improvement.type === "OFI" ? "outline" : "destructive"}>{improvement.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{improvement.description}</TableCell>
                    <TableCell>{improvement.correctiveAction ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {improvement.dateDue ? format(new Date(improvement.dateDue), "MMM yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      {improvement.dateCompleted ? format(new Date(improvement.dateCompleted), "MMM yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>{getOwnerName(improvement)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/improvement-register/${improvement.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canEdit && !improvement.archived && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/improvement-register/${improvement.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canEdit && (
                          <>
                            {improvement.archived ? (
                              <Button variant="ghost" size="icon" onClick={() => handleRestore(improvement.id)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" onClick={() => handleArchive(improvement.id)}>
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(improvement.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
