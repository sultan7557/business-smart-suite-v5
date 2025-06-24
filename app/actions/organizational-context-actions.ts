"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Calculate risk level based on likelihood and severity
function calculateRiskLevel(likelihood: number, severity: number): number {
  return likelihood * severity;
}

// Get all organizational context entries
export async function getOrganizationalContextEntries(includeArchived: boolean = false) {
  try {
    const entries = await prisma.OrganizationalContext.findMany({
      where: {
        archived: includeArchived ? undefined : false,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return { success: true, data: entries };
  } catch (error) {
    console.error("Error fetching organizational context entries:", error);
    return { success: false, error: "Failed to fetch organizational context entries" };
  }
}

// Get a single organizational context entry by ID
export async function getOrganizationalContextById(id: string) {
  try {
    const entry = await prisma.OrganizationalContext.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!entry) {
      return { success: false, error: "Organizational context entry not found" };
    }
    
    return { success: true, data: entry };
  } catch (error) {
    console.error("Error fetching organizational context entry:", error);
    return { success: false, error: "Failed to fetch organizational context entry" };
  }
}

// Create a new organizational context entry
export async function createOrganizationalContext(data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate risk levels
    const initialRiskLevel = calculateRiskLevel(data.initialLikelihood, data.initialSeverity);
    const residualRiskLevel = calculateRiskLevel(data.residualLikelihood, data.residualSeverity);

    const entry = await prisma.OrganizationalContext.create({
      data: {
        ...data,
        initialRiskLevel,
        residualRiskLevel,
        createdById: user.id as string,
      },
    });

    revalidatePath("/organisational-context");
    return { success: true, data: entry };
  } catch (error) {
    console.error("Error creating organizational context entry:", error);
    return { success: false, error: "Failed to create organizational context entry" };
  }
}

// Update an existing organizational context entry
export async function updateOrganizationalContext(id: string, data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate risk levels
    const initialRiskLevel = calculateRiskLevel(data.initialLikelihood, data.initialSeverity);
    const residualRiskLevel = calculateRiskLevel(data.residualLikelihood, data.residualSeverity);

    const entry = await prisma.OrganizationalContext.update({
      where: { id },
      data: {
        ...data,
        initialRiskLevel,
        residualRiskLevel,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/organisational-context");
    revalidatePath(`/organisational-context/${id}`);
    return { success: true, data: entry };
  } catch (error) {
    console.error("Error updating organizational context entry:", error);
    return { success: false, error: "Failed to update organizational context entry" };
  }
}

// Archive/unarchive an organizational context entry
export async function toggleArchiveOrganizationalContext(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const entry = await prisma.OrganizationalContext.findUnique({
      where: { id },
      select: { archived: true },
    });

    if (!entry) {
      return { success: false, error: "Organizational context entry not found" };
    }

    const updatedEntry = await prisma.OrganizationalContext.update({
      where: { id },
      data: {
        archived: !entry.archived,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/organisational-context");
    return { success: true, data: updatedEntry };
  } catch (error) {
    console.error("Error toggling archive status:", error);
    return { success: false, error: "Failed to toggle archive status" };
  }
}

// Delete an organizational context entry
export async function deleteOrganizationalContext(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.OrganizationalContext.delete({
      where: { id },
    });

    revalidatePath("/organisational-context");
    return { success: true };
  } catch (error) {
    console.error("Error deleting organizational context entry:", error);
    return { success: false, error: "Failed to delete organizational context entry" };
  }
}

// Toggle archived view state
export async function toggleArchivedView(currentState: boolean) {
  return { success: true, data: !currentState }
}