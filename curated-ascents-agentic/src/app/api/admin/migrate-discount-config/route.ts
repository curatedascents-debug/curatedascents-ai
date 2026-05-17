import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { verifyAdminSession, adminUnauthorizedResponse } from "@/lib/auth/admin-api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = verifyAdminSession(req);
  if (!auth.authenticated) return adminUnauthorizedResponse();

  try {
    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pricing_config (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS early_bird_rules (
        id SERIAL PRIMARY KEY,
        days_in_advance INTEGER NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        label VARCHAR(100),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS group_discount_rules (
        id SERIAL PRIMARY KEY,
        min_pax INTEGER NOT NULL,
        max_pax INTEGER,
        discount_percent NUMERIC(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        label VARCHAR(100),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS last_minute_rules (
        id SERIAL PRIMARY KEY,
        days_before_departure INTEGER NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        label VARCHAR(100),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id SERIAL PRIMARY KEY,
        tier_name VARCHAR(50) NOT NULL,
        min_points INTEGER NOT NULL,
        discount_percent NUMERIC(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE service_fee_type AS ENUM ('none', 'flat_per_unit', 'percentage');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS service_type_margins (
        id SERIAL PRIMARY KEY,
        service_type_key VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(150),
        b2c_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 50,
        agent_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 30,
        service_fee_type service_fee_type DEFAULT 'none',
        service_fee_amount NUMERIC(10,2),
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Seed pricingConfig
    await db.execute(sql`
      INSERT INTO pricing_config (key, value, description)
      VALUES ('discounts_enabled', 'false', 'Master kill switch for all discounts')
      ON CONFLICT (key) DO NOTHING
    `);

    // Seed earlyBirdRules
    await db.execute(sql`
      INSERT INTO early_bird_rules (days_in_advance, discount_percent, is_active, label)
      VALUES
        (60, 10.00, false, 'Book 60+ days ahead'),
        (90, 15.00, false, 'Book 90+ days ahead')
      ON CONFLICT DO NOTHING
    `);

    // Seed groupDiscountRules
    await db.execute(sql`
      INSERT INTO group_discount_rules (min_pax, max_pax, discount_percent, is_active, label)
      VALUES
        (8, 15, 5.00, false, 'Small group (8–15 pax)'),
        (16, NULL, 10.00, false, 'Large group (16+ pax)')
      ON CONFLICT DO NOTHING
    `);

    // Seed lastMinuteRules
    await db.execute(sql`
      INSERT INTO last_minute_rules (days_before_departure, discount_percent, is_active, label)
      VALUES (14, 5.00, false, 'Last minute (14 days before)')
      ON CONFLICT DO NOTHING
    `);

    // Seed loyaltyTiers
    await db.execute(sql`
      INSERT INTO loyalty_tiers (tier_name, min_points, discount_percent, is_active)
      VALUES
        ('Silver', 500, 5.00, false),
        ('Gold', 1500, 8.00, false),
        ('Platinum', 3000, 12.00, false)
      ON CONFLICT DO NOTHING
    `);

    // Seed serviceTypeMargins
    await db.execute(sql`
      INSERT INTO service_type_margins (service_type_key, display_name, b2c_margin_percent, agent_margin_percent)
      VALUES
        ('trekking_permit',    'Trekking Permits & TIMS',           35, 20),
        ('guide_service',      'Guide Services',                    40, 25),
        ('porter_service',     'Porter Services',                   40, 25),
        ('hotel_room_only',    'Hotel (Room Only, EP)',              50, 30),
        ('hotel_with_meals',   'Hotel (with Meals, CP/MAP/AP)',      45, 28),
        ('domestic_flight',    'Domestic Flights',                  12,  8),
        ('international_flight','International Flights',             8,  5),
        ('ground_transport',   'Ground Transportation',             40, 25),
        ('helicopter',         'Helicopter Services',               30, 18),
        ('cultural_tour',      'Cultural Tours & Sightseeing',      45, 28),
        ('adventure_activity', 'Adventure Activities',              40, 25),
        ('equipment_rental',   'Equipment Rental',                  35, 20),
        ('visa_assistance',    'Visa & Documentation Assistance',   25, 15),
        ('miscellaneous',      'Miscellaneous & Other Services',    40, 25)
      ON CONFLICT (service_type_key) DO NOTHING
    `);

    return NextResponse.json({
      success: true,
      message: "Discount config tables created and seeded successfully.",
    });
  } catch (error) {
    console.error("migrate-discount-config error:", error);
    return NextResponse.json(
      { error: "Migration failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
