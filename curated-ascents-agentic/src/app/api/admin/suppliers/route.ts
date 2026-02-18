import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

// GET all suppliers
export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const result = await db
      .select()
      .from(suppliers)
      .orderBy(desc(suppliers.createdAt));

    return NextResponse.json({
      success: true,
      suppliers: result,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

// POST - Create new supplier
export async function POST(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse(auth.error);

  try {
    const body = await req.json();

    // Build the insert object with only non-undefined values
    const insertData: any = {
      name: body.name,
      isActive: body.isActive ?? true,
      isPreferred: body.isPreferred ?? false,
    };

    // Add optional fields only if they have values
    if (body.type) insertData.type = body.type;
    if (body.country) insertData.country = body.country;
    if (body.city) insertData.city = body.city;
    
    // Contacts array (JSONB)
    if (body.contacts && Array.isArray(body.contacts) && body.contacts.length > 0) {
      insertData.contacts = body.contacts;
    }
    
    // Department emails
    if (body.salesEmail) insertData.salesEmail = body.salesEmail;
    if (body.reservationEmail) insertData.reservationEmail = body.reservationEmail;
    if (body.accountsEmail) insertData.accountsEmail = body.accountsEmail;
    if (body.operationsEmail) insertData.operationsEmail = body.operationsEmail;
    
    // Phone numbers
    if (body.phoneMain) insertData.phoneMain = body.phoneMain;
    if (body.phoneSales) insertData.phoneSales = body.phoneSales;
    if (body.phoneReservation) insertData.phoneReservation = body.phoneReservation;
    if (body.phoneEmergency) insertData.phoneEmergency = body.phoneEmergency;
    if (body.phoneWhatsapp) insertData.phoneWhatsapp = body.phoneWhatsapp;
    
    // Online presence
    if (body.website) insertData.website = body.website;
    if (body.bookingPortal) insertData.bookingPortal = body.bookingPortal;
    
    // Address
    if (body.address) insertData.address = body.address;
    if (body.postalCode) insertData.postalCode = body.postalCode;
    
    // Banking
    if (body.bankName) insertData.bankName = body.bankName;
    if (body.bankBranch) insertData.bankBranch = body.bankBranch;
    if (body.bankAccountName) insertData.bankAccountName = body.bankAccountName;
    if (body.bankAccountNumber) insertData.bankAccountNumber = body.bankAccountNumber;
    if (body.bankSwiftCode) insertData.bankSwiftCode = body.bankSwiftCode;
    if (body.bankIban) insertData.bankIban = body.bankIban;
    
    // Payment terms
    if (body.paymentTerms) insertData.paymentTerms = body.paymentTerms;
    if (body.creditLimit) insertData.creditLimit = body.creditLimit;
    if (body.currency) insertData.currency = body.currency;
    
    // Contract dates
    if (body.contractStartDate) {
      insertData.contractStartDate = new Date(body.contractStartDate);
    }
    if (body.contractEndDate) {
      insertData.contractEndDate = new Date(body.contractEndDate);
    }
    if (body.commissionPercent) insertData.commissionPercent = body.commissionPercent;
    
    // Notes and ratings
    if (body.notes) insertData.notes = body.notes;
    if (body.internalRemarks) insertData.internalRemarks = body.internalRemarks;
    if (body.reliabilityRating) insertData.reliabilityRating = parseInt(body.reliabilityRating);
    if (body.qualityRating) insertData.qualityRating = parseInt(body.qualityRating);
    if (body.valueRating) insertData.valueRating = parseInt(body.valueRating);

    const result = await db
      .insert(suppliers)
      .values(insertData)
      .returning();

    return NextResponse.json({
      success: true,
      message: "Supplier created successfully",
      supplier: result[0],
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { 
        error: "Failed to create supplier",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
