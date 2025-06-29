import { hasPermission } from "@/lib/auth"
import prisma from "@/lib/prisma"
import LegalRegisterClient from "./legal-register-client"

export default async function LegalRegisterPage() {
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")
  const canApprove = await hasPermission("write")

  // Fetch active legal register items
  const legalRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: false,
      approved: true,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        take: 1,
        orderBy: {
          reviewDate: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch unapproved legal register items
  const unapprovedRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: false,
      approved: false,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch archived legal register items
  const archivedRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: true,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        take: 1,
        orderBy: {
          reviewDate: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch users for dropdown selections
  const users = await prisma.user.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="p-4">
      <LegalRegisterClient
        legalRegisters={legalRegisters}
        unapprovedRegisters={unapprovedRegisters}
        archivedRegisters={archivedRegisters}
        users={users}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
      />
    </div>
  )
}