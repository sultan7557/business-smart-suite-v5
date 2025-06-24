"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown, Archive, Plus, RotateCcw, Home } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { 
  deleteInterestedParty, 
  archiveInterestedParty, 
  reorderInterestedParty,
  unarchiveInterestedParty 
} from "@/app/actions/interested-party-actions"
import InterestedPartyForm from "./interested-party-form"

interface InterestedPartiesClientProps {
  interestedParties: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function InterestedPartiesClient({ 
  interestedParties, 
  canEdit, 
  canDelete 
}: InterestedPartiesClientProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedParty, setSelectedParty] = useState<any>(null)
  const [showArchived, setShowArchived] = useState(false)
  
  const handleAddNew = () => {
    setSelectedParty(null)
    setFormOpen(true)
  }
  
  const handleEdit = (party: any) => {
    setSelectedParty(party)
    setFormOpen(true)
  }
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this interested party? This action cannot be undone.")) {
      const result = await deleteInterestedParty(id)
      if (result.success) {
        toast({
          title: "Interested party deleted",
          description: "The interested party has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete interested party.",
          variant: "destructive",
        })
      }
    }
  }
  
  const handleArchive = async (id: string) => {
    const result = await archiveInterestedParty(id)
    if (result.success) {
      toast({
        title: "Interested party archived",
        description: "The interested party has been archived successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to archive interested party.",
        variant: "destructive",
      })
    }
  }

  const handleUnarchive = async (id: string) => {
    const result = await unarchiveInterestedParty(id)
    if (result.success) {
      toast({
        title: "Interested party restored",
        description: "The interested party has been restored successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to restore interested party.",
        variant: "destructive",
      })
    }
  }
  
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const result = await reorderInterestedParty(id, direction)
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to reorder interested party.",
        variant: "destructive",
      })
    }
  }
  
  // Function to get color based on risk level
  const getRiskLevelColor = (level: number) => {
    if (level <= 4) return "bg-green-500" // Low risk
    if (level <= 9) return "bg-yellow-500" // Medium risk
    if (level <= 14) return "bg-orange-500" // High risk
    return "bg-red-500" // Very high risk
  }

  const filteredParties = showArchived 
    ? interestedParties 
    : interestedParties.filter(party => !party.archived)

  return (
    <>
      <div className="flex justify-between mb-4">
        {/* Back to Dashboard button */}
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

        {/* Existing archive toggle button */}
        <Button
          variant="outline"
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2"
        >
          {showArchived ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Hide Archived
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              Show Archived
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Interested Party</th>
              <th className="border p-2 text-center">Risk Level</th>
              <th className="border p-2 text-left">Controls and Recommendations</th>
              <th className="border p-2 text-center">Residual Risk</th>
              <th className="border p-2 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-500">
                  No interested parties found. Click the "Add Interested Party" button to create one.
                </td>
              </tr>
            ) : (
              filteredParties.map((party) => (
                <tr key={party.id} className={`border-b hover:bg-gray-50 ${party.archived ? 'bg-gray-100' : ''}`}>
                  <td className="border p-2">
                    <div className="font-medium">{party.name}</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{party.needsExpectations}</div>
                  </td>
                  <td className={`border p-2 text-center ${getRiskLevelColor(party.riskLevel)} text-white font-bold`}>
                    {party.riskLevel}
                  </td>
                  <td className="border p-2">
                    <div className="text-sm whitespace-pre-wrap">{party.controlsRecommendations}</div>
                  </td>
                  <td className={`border p-2 text-center ${getRiskLevelColor(party.residualRiskLevel)} text-white font-bold`}>
                    {party.residualRiskLevel}
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center space-x-1">
                      {canEdit && !party.archived && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleReorder(party.id, "up")}
                            title="Move up"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(party)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <>
                          {party.archived ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleUnarchive(party.id)}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleArchive(party.id)}
                              title="Archive"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(party.id)}
                            className="text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <Button 
        onClick={handleAddNew} 
        className="mt-4"
        variant="outline"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Interested Party
      </Button>
      
      <InterestedPartyForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        interestedParty={selectedParty} 
      />
    </>
  )
}