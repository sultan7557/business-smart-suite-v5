"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { createAudit, updateAudit } from "../actions/audit-actions"
import { useToast } from "@/components/ui/use-toast"
import AuditFileUpload from "@/app/components/audit-file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AuditFormProps {
  users: any[]
  audit?: any
}

export default function AuditForm({ users, audit }: AuditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(audit?.status || "not_started")
  
  // Get selected document IDs from audit
  const selectedDocuments = audit?.auditDocuments || []
  const selectedProcedures = selectedDocuments
    .filter((doc: any) => doc.docType === "procedure")
    .map((doc: any) => doc.docId)
  const selectedManuals = selectedDocuments
    .filter((doc: any) => doc.docType === "manual")
    .map((doc: any) => doc.docId)
  const selectedRegisters = selectedDocuments
    .filter((doc: any) => doc.docType === "register")
    .map((doc: any) => doc.docId)

  // Update status when dateCompleted changes
  useEffect(() => {
    const dateCompletedInput = document.getElementById("dateCompleted") as HTMLInputElement
    if (dateCompletedInput) {
      const handleDateCompletedChange = () => {
        if (dateCompletedInput.value) {
          setStatus("completed")
        }
      }
      
      dateCompletedInput.addEventListener("change", handleDateCompletedChange)
      return () => {
        dateCompletedInput.removeEventListener("change", handleDateCompletedChange)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    // Add status to form data
    formData.append("status", status)
    
    try {
      let result
      
      if (audit) {
        result = await updateAudit(audit.id, formData)
      } else {
        result = await createAudit(formData)
      }
      
      if (result.success) {
        toast({
          title: "Success",
          description: audit ? "Audit updated successfully" : "Audit created successfully",
        })
        router.push("/audit-schedule")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save audit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving audit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Define procedure options
  const procedureOptions = [
    { id: "Procedure No 1 Planning & Review", label: "Procedure No 1 Planning & Review" },
    { id: "Procedure No 2 Information Control", label: "Procedure No 2 Information Control" },
    { id: "Procedure No 3 Problems & Improvements", label: "Procedure No 3 Problems & Improvements" },
    { id: "Procedure No 4 Training & Development", label: "Procedure No 4 Training & Development" },
    { id: "Procedure No 5 Sales Administration", label: "Procedure No 5 Sales Administration" },
    { id: "Procedure No 6 Supplier & Contractor Control", label: "Procedure No 6 Supplier & Contractor Control" },
    { id: "Procedure No 7 Operational Control", label: "Procedure No 7 Operational Control" },
    { id: "Procedure No 8 Technical File Preperation", label: "Procedure No 8 Technical File Preperation" },
  ]

  // Define manual options
  const manualOptions = [
    { id: "Integrated Manual", label: "Integrated Manual" },
  ]

  // Define register options
  const registerOptions = [
    { id: "Training", label: "Training" },
    { id: "Improvement Register", label: "Improvement Register" },
    { id: "Statement of Applicability", label: "Statement of Applicability" },
    { id: "Legal Register", label: "Legal Register" },
    { id: "Suppliers", label: "Suppliers" },
    { id: "Company Energy Consumption Register - 2022", label: "Company Energy Consumption Register - 2022" },
    { id: "Assets Register - 2022", label: "Assets Register - 2022" },
    { id: "Register of Standards", label: "Register of Standards" },
    { id: "Calibration Schedule", label: "Calibration Schedule" },
    { id: "Vehicle Checklist", label: "Vehicle Checklist" },
    { id: "Training Matrix", label: "Training Matrix" },
    { id: "Asset Risk Assessment & Treatment Plan.xls", label: "Asset Risk Assessment & Treatment Plan.xls" },
    { id: "Warehouse SLA 2021", label: "Warehouse SLA 2021" },
    { id: "2021 SLA", label: "2021 SLA" },
    { id: "PPN-0621-AA Xpress Carbon-Reduction-Plan Published and Signed Declaration", label: "PPN-0621-AA Xpress Carbon-Reduction-Plan Published and Signed Declaration" },
    { id: "ISMS Monthly Checks", label: "ISMS Monthly Checks" },
  ]

  // Format date for input fields
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Use a consistent format that works on both server and client
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow-sm">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={audit?.title || ""} 
          placeholder="Name of items to be audited"
          required 
          className="mt-1"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Document(s) to audit</h3>
        
        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Procedures</h4>
          <div className="space-y-2">
            {procedureOptions.map((procedure) => (
              <div key={procedure.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`procedure-${procedure.id}`} 
                  name="procedures" 
                  value={procedure.id}
                  defaultChecked={selectedProcedures.includes(procedure.id)}
                />
                <Label htmlFor={`procedure-${procedure.id}`}>{procedure.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Manuals</h4>
          <div className="space-y-2">
            {manualOptions.map((manual) => (
              <div key={manual.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`manual-${manual.id}`} 
                  name="manuals" 
                  value={manual.id}
                  defaultChecked={selectedManuals.includes(manual.id)}
                />
                <Label htmlFor={`manual-${manual.id}`}>{manual.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Registers</h4>
          <div className="space-y-2">
            {registerOptions.map((register) => (
              <div key={register.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`register-${register.id}`} 
                  name="registers" 
                  value={register.id}
                  defaultChecked={selectedRegisters.includes(register.id)}
                />
                <Label htmlFor={`register-${register.id}`}>{register.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Auditor</h3>
        
        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Internal auditor</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`auditor-${user.id}`} 
                  name="auditorId" 
                  value={user.id}
                  defaultChecked={audit?.auditorId === user.id}
                />
                <Label htmlFor={`auditor-${user.id}`}>{user.name} ({user.email})</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">External/other auditor</h4>
          <Input 
            id="externalAuditor" 
            name="externalAuditor" 
            defaultValue={audit?.externalAuditor || ""} 
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="plannedStartDate">Planned start date</Label>
          <Input 
            id="plannedStartDate" 
            name="plannedStartDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.plannedStartDate) || formatDateForInput(new Date().toISOString())} 
            required 
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="actualStartDate">Actual start date</Label>
          <Input 
            id="actualStartDate" 
            name="actualStartDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.actualStartDate)} 
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="followUpDate">Follow up date</Label>
          <Input 
            id="followUpDate" 
            name="followUpDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.followUpDate)} 
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Closure options</h3>
        <div>
          <Label htmlFor="dateCompleted">Date Completed</Label>
          <Input 
            id="dateCompleted" 
            name="dateCompleted" 
            type="date" 
            defaultValue={formatDateForInput(audit?.dateCompleted)} 
            className="mt-1"
          />
        </div>
        
        <div className="mt-4">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={status} 
            onValueChange={setStatus}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="createNextAudit" 
          name="createNextAudit" 
          defaultChecked={audit?.createNextAudit || false}
        />
        <Label htmlFor="createNextAudit">Create the next audit job</Label>
      </div>

      <div>
        <Label htmlFor="nextAuditDate">Next audit start date</Label>
        <Input 
          id="nextAuditDate" 
          name="nextAuditDate" 
          type="date" 
          defaultValue={formatDateForInput(audit?.nextAuditDate)} 
          className="mt-1"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Documents</h3>
        {audit ? (
          <AuditFileUpload auditId={audit.id} existingDocuments={audit.auditDocuments} />
        ) : (
          <div className="border p-4 text-gray-500">
            Documents can only be uploaded against existing items. Once you have saved this new item then you will be able to upload documents.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/audit-schedule")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : audit ? "Save Changes" : "Save"}
        </Button>
      </div>
    </form>
  )
}