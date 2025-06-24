"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Create a new interested party
export async function createInterestedParty(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const needsExpectations = formData.get("needsExpectations") as string
    const initialLikelihood = parseInt(formData.get("initialLikelihood") as string) || 3
    const initialSeverity = parseInt(formData.get("initialSeverity") as string) || 3
    const controlsRecommendations = formData.get("controlsRecommendations") as string
    const residualLikelihood = parseInt(formData.get("residualLikelihood") as string) || 1
    const residualSeverity = parseInt(formData.get("residualSeverity") as string) || 3

    // Calculate risk levels
    const riskLevel = initialLikelihood * initialSeverity
    const residualRiskLevel = residualLikelihood * residualSeverity

    // Create the interested party
    const interestedParty = await prisma.interestedParty.create({
      data: {
        name,
        description,
        needsExpectations,
        initialLikelihood,
        initialSeverity,
        controlsRecommendations,
        residualLikelihood,
        residualSeverity,
        riskLevel,
        residualRiskLevel,
        createdById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true, id: interestedParty.id }
  } catch (error) {
    console.error("Error creating interested party:", error)
    return { success: false, error: "Failed to create interested party" }
  }
}

// Update an existing interested party
export async function updateInterestedParty(id: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const needsExpectations = formData.get("needsExpectations") as string
    const initialLikelihood = parseInt(formData.get("initialLikelihood") as string) || 3
    const initialSeverity = parseInt(formData.get("initialSeverity") as string) || 3
    const controlsRecommendations = formData.get("controlsRecommendations") as string
    const residualLikelihood = parseInt(formData.get("residualLikelihood") as string) || 1
    const residualSeverity = parseInt(formData.get("residualSeverity") as string) || 3

    // Calculate risk levels
    const riskLevel = initialLikelihood * initialSeverity
    const residualRiskLevel = residualLikelihood * residualSeverity

    // Update the interested party
    const interestedParty = await prisma.interestedParty.update({
      where: { id },
      data: {
        name,
        description,
        needsExpectations,
        initialLikelihood,
        initialSeverity,
        controlsRecommendations,
        residualLikelihood,
        residualSeverity,
        riskLevel,
        residualRiskLevel,
        updatedById: user.id,
      },
    })

    revalidatePath("/interested-parties")
    revalidatePath(`/interested-parties/${id}`)
    return { success: true, id: interestedParty.id }
  } catch (error) {
    console.error("Error updating interested party:", error)
    return { success: false, error: "Failed to update interested party" }
  }
}

// Delete an interested party
export async function deleteInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Delete the interested party
    await prisma.interestedParty.delete({
      where: { id },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error deleting interested party:", error)
    return { success: false, error: "Failed to delete interested party" }
  }
}

// Archive an interested party
export async function archiveInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedParty.update({
      where: { id },
      data: {
        archived: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error archiving interested party:", error)
    return { 
      success: false, 
      error: `Failed to archive interested party: ${error}` 
    }
  }
}

// Unarchive an interested party
export async function unarchiveInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedParty.update({
      where: { id },
      data: {
        archived: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving interested party:", error)
    return { 
      success: false, 
      error: `Failed to unarchive interested party: ${error}` 
    }
  }
}

// Reorder interested party
export async function reorderInterestedParty(id: string, direction: "up" | "down") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const interestedParty = await prisma.interestedParty.findUnique({
      where: { id },
      select: { order: true },
    })

    if (!interestedParty) {
      throw new Error("Interested party not found")
    }

    const currentOrder = interestedParty.order
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    // Find interested party at the new order position
    const interestedPartyAtNewOrder = await prisma.interestedParty.findFirst({
      where: {
        order: newOrder,
        archived: false,
      },
    })

    if (interestedPartyAtNewOrder) {
      // Swap orders
      await prisma.interestedParty.update({
        where: { id: interestedPartyAtNewOrder.id },
        data: { order: currentOrder },
      })

      await prisma.interestedParty.update({
        where: { id },
        data: {
          order: newOrder,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error reordering interested party:", error)
    return { success: false, error: "Failed to reorder interested party" }
  }
}