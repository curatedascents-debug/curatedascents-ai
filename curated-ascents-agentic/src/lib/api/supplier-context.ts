import { headers } from "next/headers";

export interface SupplierContext {
  supplierId: number;
  userId: number;
  role: string;
  supplierName: string;
}

export class SupplierAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupplierAuthError";
  }
}

export async function getSupplierContext(): Promise<SupplierContext | null> {
  const headersList = await headers();

  const supplierId = headersList.get("x-supplier-id");
  const userId = headersList.get("x-supplier-user-id");
  const role = headersList.get("x-supplier-role");
  const supplierName = headersList.get("x-supplier-name");

  if (!supplierId || !userId) {
    return null;
  }

  return {
    supplierId: parseInt(supplierId, 10),
    userId: parseInt(userId, 10),
    role: role || "staff",
    supplierName: supplierName || "",
  };
}

export async function requireSupplierContext(): Promise<SupplierContext> {
  const context = await getSupplierContext();
  if (!context) {
    throw new SupplierAuthError("Not authenticated");
  }
  return context;
}
