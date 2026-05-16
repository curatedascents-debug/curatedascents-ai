#!/usr/bin/env python3
"""
Import Nepal hotel data from Ashray's Excel file into CuratedAscents DB.

Usage:
  python3 scripts/import-nepal-hotels.py

The script is fully re-runnable (upsert, not insert-only).
"""

import re
import sys
import json
from datetime import datetime

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor

# ── Connection ────────────────────────────────────────────────────────────────
EXCEL_PATH = "/Users/kiranpokhrel/Downloads/NEPAL-Hotel_Rates.xlsx"
DATABASE_URL = (
    "postgresql://neondb_owner:npg_9hC7woYBHLjm"
    "@ep-gentle-union-aesfhsjn-pooler.c-2.us-east-2.aws.neon.tech"
    "/neondb?sslmode=require"
)
MARGIN = 1.50  # sell = cost × 1.50 (50 % margin)

# ── Normalisation maps ────────────────────────────────────────────────────────
CATEGORY_MAP = {
    "luxury": "luxury",
    "boutique": "boutique",
    "mid-range": "mid-range",
    "mid range": "mid-range",
    "midrange": "mid-range",
    "budget": "budget",
}
ROOM_TYPE_MAP = {
    "standard": "standard",
    "deluxe": "deluxe",
    "superior": "superior",
    "premium": "premium",
    "suite": "suite",
    "villa": "villa",
}
MEAL_PLAN_MAP = {
    "EP": "EP",
    "CP": "CP",
    "MAP": "MAP",
    "AP": "AP",
    "AI": "AI",
    "B&B": "CP",
    "BB": "CP",
    "ROOM ONLY": "EP",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def sv(val):
    """String value or None – strips whitespace."""
    if val is None:
        return None
    if isinstance(val, float):
        import math
        if math.isnan(val):
            return None
    s = str(val).strip()
    return s if s else None


def _is_nan(val):
    if val is None:
        return True
    if isinstance(val, float):
        import math
        return math.isnan(val)
    return pd.isna(val)


def parse_numeric(val):
    """Parse possibly messy numeric strings like '70++', '3,500', etc."""
    if _is_nan(val):
        return None
    s = str(val).strip()
    # strip trailing junk after the number (++, *, spaces)
    s = re.sub(r"[+*\s].*$", "", s)
    s = s.replace(",", "")
    try:
        f = float(s)
        return f if f > 0 else None
    except ValueError:
        return None


def sell(cost):
    """Apply 50 % margin: sell = cost × 1.5, or None if cost is None."""
    return round(cost * MARGIN, 2) if cost is not None else None


def parse_date(val):
    """Parse dates that come in multiple formats from Excel."""
    if _is_nan(val):
        return None
    if isinstance(val, (datetime,)):
        return val.date().isoformat()
    s = str(val).strip()
    # Excel may give us a datetime string
    for fmt in [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%Y-%d-%m",  # rare ambiguous, last resort
    ]:
        try:
            return datetime.strptime(s[:19], fmt[:19]).date().isoformat()
        except ValueError:
            pass
    print(f"  [WARN] Could not parse date: {val!r}")
    return None


def bool_yes(val):
    if _is_nan(val):
        return False
    return str(val).strip().lower() == "yes"


def normalise_name(name):
    """Lowercase + collapse whitespace for matching."""
    if name is None:
        return ""
    return re.sub(r"\s+", " ", name.strip().lower())


# ── Excel parsing ─────────────────────────────────────────────────────────────

def read_sheet(xl, sheet_name):
    """
    Sheet layout:
      Physical row 1 → merged title  (skiprows=[0])
      Physical row 2 → column headers
      Physical row 3 → instructions  (skiprows=[2] relative to file)
      Physical row 4+ → data
    After the two skips: header=0 lands on the real header row.
    """
    df = pd.read_excel(xl, sheet_name=sheet_name, skiprows=[0, 2], header=0)
    # Normalise column names (strip trailing ★ / spaces)
    df.columns = [re.sub(r"\s*★\s*", "", c).strip() for c in df.columns]
    return df


def is_section_row_hotels(row):
    """True if this is a region/section-header row in Hotel Details."""
    name = sv(row.get("Hotel Name"))
    if not name:
        return True  # blank row
    # If city, star rating, category, and address are all empty → section header
    city = sv(row.get("City / Destination"))
    star = sv(row.get("Star Rating"))
    cat = sv(row.get("Category"))
    addr = sv(row.get("Address"))
    return all(_is_nan(v) or not sv(v) for v in [city, star, cat, addr])


def is_section_row_rates(row):
    """True if this is a region/section-header row in Room Rates."""
    name = sv(row.get("Hotel Name"))
    if not name:
        return True
    rt = sv(row.get("Room Type"))
    mp = sv(row.get("Meal Plan"))
    cs = parse_numeric(row.get("Cost Single (USD)"))
    cd = parse_numeric(row.get("Cost Double (USD)"))
    return all(v is None for v in [rt, mp, cs, cd])


# ── DB helpers ────────────────────────────────────────────────────────────────

def find_hotel(cur, name):
    cur.execute(
        "SELECT id FROM hotels WHERE lower(trim(name)) = lower(trim(%s))",
        (name,)
    )
    row = cur.fetchone()
    return row["id"] if row else None


def find_hotel_fuzzy(cur, name):
    """Try exact match first, then prefix/contains match."""
    hid = find_hotel(cur, name)
    if hid:
        return hid, name
    # Try matching if the DB hotel name is a leading substring of the rate name
    norm = normalise_name(name)
    cur.execute("SELECT id, name FROM hotels WHERE %s ILIKE name || '%%'", (norm,))
    row = cur.fetchone()
    if row:
        return row["id"], row["name"]
    # Or if rate name starts with DB name (handles "Farm"/"Lake" suffixes)
    cur.execute(
        "SELECT id, name FROM hotels WHERE lower(trim(%s)) LIKE lower(trim(name)) || '%%'",
        (name,)
    )
    row = cur.fetchone()
    if row:
        return row["id"], row["name"]
    return None, None


def find_supplier(cur, name):
    cur.execute(
        "SELECT id FROM suppliers WHERE lower(trim(name)) = lower(trim(%s)) AND type = 'hotel'",
        (name,)
    )
    row = cur.fetchone()
    return row["id"] if row else None


def upsert_supplier(cur, name, city, website, contact_name, contact_email,
                    contact_phone, contact_whatsapp):
    sid = find_supplier(cur, name)
    contacts = []
    if contact_name or contact_email or contact_phone:
        contacts = [{
            "name": contact_name or "",
            "email": contact_email or "",
            "phoneMobile": contact_phone or "",
            "phoneWhatsapp": contact_whatsapp or "",
            "isPrimary": True,
        }]

    if sid:
        cur.execute(
            """UPDATE suppliers SET
                city = COALESCE(%s, city),
                website = COALESCE(%s, website),
                contacts = %s::jsonb,
                phone_whatsapp = COALESCE(%s, phone_whatsapp),
                updated_at = now()
               WHERE id = %s""",
            (city, website, json.dumps(contacts), contact_whatsapp, sid)
        )
        return sid, False

    cur.execute(
        """INSERT INTO suppliers
            (name, type, country, city, website, contacts, phone_whatsapp, is_active)
           VALUES (%s, 'hotel', 'Nepal', %s, %s, %s::jsonb, %s, true)
           RETURNING id""",
        (name, city, website, json.dumps(contacts), contact_whatsapp)
    )
    return cur.fetchone()["id"], True


def upsert_hotel(cur, name, supplier_id, city, star_rating, category,
                 address, description, amenities_str, checkin, checkout,
                 internal_notes, is_active):
    # Parse amenities into a JSON array
    amenities = None
    if amenities_str:
        parts = [a.strip() for a in amenities_str.split(",") if a.strip()]
        if parts:
            amenities = json.dumps(parts)

    star = None
    if star_rating is not None and not _is_nan(star_rating):
        try:
            star = int(float(str(star_rating)))
        except (ValueError, TypeError):
            pass

    cat = None
    if category:
        cat = CATEGORY_MAP.get(category.lower().strip())

    hid = find_hotel(cur, name)
    if hid:
        cur.execute(
            """UPDATE hotels SET
                supplier_id = COALESCE(%s, supplier_id),
                star_rating = COALESCE(%s, star_rating),
                category = COALESCE(%s, category),
                address = COALESCE(%s, address),
                description = COALESCE(%s, description),
                amenities = COALESCE(%s::jsonb, amenities),
                check_in_time = COALESCE(%s, check_in_time),
                check_out_time = COALESCE(%s, check_out_time),
                is_active = %s,
                updated_at = now()
               WHERE id = %s""",
            (supplier_id, star, cat, address, description,
             amenities, checkin, checkout, is_active, hid)
        )
        return hid, False

    cur.execute(
        """INSERT INTO hotels
            (supplier_id, name, star_rating, category, address, description,
             amenities, check_in_time, check_out_time, is_active)
           VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s)
           RETURNING id""",
        (supplier_id, name.strip(), star, cat, address, description,
         amenities, checkin, checkout, is_active)
    )
    return cur.fetchone()["id"], True


def upsert_rate(cur, hotel_id, room_type, meal_plan,
                cost_single, cost_double, cost_triple,
                cost_child_bed, cost_child_nobed,
                currency, valid_from, valid_to, season,
                inclusions, exclusions, notes, is_active):
    # Sell prices
    ss = sell(cost_single)
    sd = sell(cost_double)
    st = sell(cost_triple)
    scb = sell(cost_child_bed)
    scn = sell(cost_child_nobed)

    # Build a note marking rates as fully inclusive
    full_notes = notes or ""
    if "fully inclusive" not in (full_notes or "").lower():
        tag = "Rates are fully inclusive of all taxes (VAT + service charge)."
        full_notes = f"{tag} {full_notes}".strip() if full_notes else tag

    cur.execute(
        """SELECT id FROM hotel_room_rates
           WHERE hotel_id = %s
             AND lower(room_type) = lower(%s)
             AND lower(meal_plan) = lower(%s)
             AND (valid_from = %s::date OR (valid_from IS NULL AND %s IS NULL))
             AND (valid_to = %s::date OR (valid_to IS NULL AND %s IS NULL))""",
        (hotel_id, room_type, meal_plan,
         valid_from, valid_from, valid_to, valid_to)
    )
    existing = cur.fetchone()

    if existing:
        cur.execute(
            """UPDATE hotel_room_rates SET
                cost_single = %s, cost_double = %s, cost_triple = %s,
                cost_child_with_bed = %s, cost_child_no_bed = %s,
                sell_single = %s, sell_double = %s, sell_triple = %s,
                sell_child_with_bed = %s, sell_child_no_bed = %s,
                margin_percent = 50.00,
                currency = %s,
                inclusions = %s, exclusions = %s, notes = %s,
                vat_percent = 0, service_charge_percent = 0,
                is_active = %s,
                updated_at = now()
               WHERE id = %s""",
            (cost_single, cost_double, cost_triple, cost_child_bed, cost_child_nobed,
             ss, sd, st, scb, scn,
             currency or "USD",
             inclusions, exclusions, full_notes,
             is_active, existing["id"])
        )
        return existing["id"], False

    cur.execute(
        """INSERT INTO hotel_room_rates
            (hotel_id, room_type, meal_plan,
             cost_single, cost_double, cost_triple,
             cost_child_with_bed, cost_child_no_bed,
             sell_single, sell_double, sell_triple,
             sell_child_with_bed, sell_child_no_bed,
             margin_percent, currency,
             valid_from, valid_to,
             inclusions, exclusions, notes,
             vat_percent, service_charge_percent,
             is_active)
           VALUES
            (%s, %s, %s,
             %s, %s, %s, %s, %s,
             %s, %s, %s, %s, %s,
             50.00, %s,
             %s::date, %s::date,
             %s, %s, %s,
             0, 0,
             %s)
           RETURNING id""",
        (hotel_id, room_type, meal_plan,
         cost_single, cost_double, cost_triple, cost_child_bed, cost_child_nobed,
         ss, sd, st, scb, scn,
         currency or "USD",
         valid_from, valid_to,
         inclusions, exclusions, full_notes,
         is_active)
    )
    return cur.fetchone()["id"], True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("CuratedAscents — Nepal Hotel Import")
    print("=" * 60)

    # ── Parse Excel ──────────────────────────────────────────────────
    xl = pd.ExcelFile(EXCEL_PATH)
    df_hotels = read_sheet(xl, "Hotel Details")
    df_rates = read_sheet(xl, "Room Rates")

    print(f"\nExcel loaded: {len(df_hotels)} hotel rows, {len(df_rates)} rate rows (before filtering)")

    # ── Connect ──────────────────────────────────────────────────────
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor(cursor_factory=RealDictCursor)

    stats = {
        "hotels_new": 0, "hotels_updated": 0,
        "suppliers_new": 0, "suppliers_updated": 0,
        "rates_new": 0, "rates_updated": 0,
        "hotels_skipped": [], "rates_skipped": [],
    }

    # name → hotel_id map for the rate phase
    hotel_name_map: dict[str, int] = {}

    # ── Phase 1: Hotels ───────────────────────────────────────────────
    print("\n── Phase 1: Hotels ──────────────────────────────────────")
    for _, row in df_hotels.iterrows():
        if is_section_row_hotels(row):
            continue

        name = sv(row.get("Hotel Name"))
        if not name:
            continue

        city       = sv(row.get("City / Destination"))
        star       = sv(row.get("Star Rating"))
        category   = sv(row.get("Category"))
        address    = sv(row.get("Address"))
        description = sv(row.get("Description"))
        amenities  = sv(row.get("Amenities"))
        checkin    = sv(row.get("Check-In Time"))
        checkout   = sv(row.get("Check-Out Time"))
        contact_n  = sv(row.get("Contact Name"))
        contact_e  = sv(row.get("Contact Email"))
        contact_p  = sv(row.get("Contact Phone"))
        contact_w  = sv(row.get("Contact WhatsApp"))
        website    = sv(row.get("Website"))
        chain      = sv(row.get("Supplier / Chain Name"))
        notes      = sv(row.get("Internal Notes"))
        is_active  = bool_yes(row.get("Active (Yes/No)"))

        # Supplier name: prefer chain name, fall back to hotel name
        supplier_name = chain or name

        try:
            sid, s_new = upsert_supplier(
                cur, supplier_name, city, website,
                contact_n, contact_e, contact_p, contact_w
            )
            if s_new:
                stats["suppliers_new"] += 1
                print(f"  [NEW supplier] {supplier_name}")
            else:
                stats["suppliers_updated"] += 1

            hid, h_new = upsert_hotel(
                cur, name, sid, city, star, category,
                address, description, amenities,
                checkin, checkout, notes, is_active
            )
            hotel_name_map[normalise_name(name)] = hid

            if h_new:
                stats["hotels_new"] += 1
                print(f"  [NEW hotel]    {name} (id={hid})")
            else:
                stats["hotels_updated"] += 1
                print(f"  [UPD hotel]    {name} (id={hid})")

        except Exception as e:
            conn.rollback()
            msg = f"{name}: {e}"
            stats["hotels_skipped"].append(msg)
            print(f"  [ERROR] {msg}")
            continue

    conn.commit()

    # Reload map from DB to pick up any pre-existing hotels
    cur.execute("SELECT id, name FROM hotels")
    for row in cur.fetchall():
        hotel_name_map[normalise_name(row["name"])] = row["id"]

    # ── Phase 2: Room Rates ───────────────────────────────────────────
    print("\n── Phase 2: Room Rates ──────────────────────────────────")
    for _, row in df_rates.iterrows():
        if is_section_row_rates(row):
            continue

        rate_hotel_name = sv(row.get("Hotel Name"))
        if not rate_hotel_name:
            continue

        room_type_raw = sv(row.get("Room Type"))
        meal_plan_raw = sv(row.get("Meal Plan"))

        if not room_type_raw or not meal_plan_raw:
            stats["rates_skipped"].append(
                f"{rate_hotel_name}: missing room type or meal plan"
            )
            continue

        room_type = ROOM_TYPE_MAP.get(room_type_raw.lower().strip())
        meal_plan = MEAL_PLAN_MAP.get(meal_plan_raw.upper().strip())

        if not room_type:
            stats["rates_skipped"].append(
                f"{rate_hotel_name}: unknown room type '{room_type_raw}'"
            )
            print(f"  [SKIP] {rate_hotel_name} — unknown room type: {room_type_raw}")
            continue
        if not meal_plan:
            stats["rates_skipped"].append(
                f"{rate_hotel_name}: unknown meal plan '{meal_plan_raw}'"
            )
            print(f"  [SKIP] {rate_hotel_name} — unknown meal plan: {meal_plan_raw}")
            continue

        # Find hotel
        hid, matched_name = find_hotel_fuzzy(cur, rate_hotel_name)
        if not hid:
            stats["rates_skipped"].append(
                f"{rate_hotel_name}: no matching hotel found in DB"
            )
            print(f"  [SKIP] {rate_hotel_name} — hotel not found in DB")
            continue

        cost_single    = parse_numeric(row.get("Cost Single (USD)"))
        cost_double    = parse_numeric(row.get("Cost Double (USD)"))
        cost_triple    = parse_numeric(row.get("Cost Triple (USD)"))
        cost_child_bed = parse_numeric(row.get("Cost Child+Bed (USD)"))
        cost_child_nob = parse_numeric(row.get("Cost Child NoBed (USD)"))
        currency       = sv(row.get("Currency")) or "USD"
        valid_from     = parse_date(row.get("Valid From"))
        valid_to       = parse_date(row.get("Valid To"))
        season         = sv(row.get("Season"))
        inclusions     = sv(row.get("Inclusions"))
        exclusions     = sv(row.get("Exclusions"))
        notes          = sv(row.get("Notes"))
        is_active      = bool_yes(row.get("Active (Yes/No)"))

        # Warn if cost had "++" — stripped, using numeric part
        cs_raw = sv(row.get("Cost Single (USD)"))
        has_plus = cs_raw and "++" in str(cs_raw)
        if has_plus:
            note_tag = "Cost entered with '++' suffix (treated as base cost; may exclude extras)."
            notes = f"{note_tag} {notes}".strip() if notes else note_tag
            print(f"  [WARN] {rate_hotel_name} — '++' stripped from rate (stored base cost only)")

        try:
            rid, r_new = upsert_rate(
                cur, hid, room_type, meal_plan,
                cost_single, cost_double, cost_triple,
                cost_child_bed, cost_child_nob,
                currency, valid_from, valid_to, season,
                inclusions, exclusions, notes, is_active
            )
            label = "NEW" if r_new else "UPD"
            stats["rates_new" if r_new else "rates_updated"] += 1
            suffix = f" [matched: {matched_name}]" if matched_name != rate_hotel_name else ""
            print(f"  [{label} rate]   {rate_hotel_name} — {room_type}/{meal_plan}{suffix} (id={rid})")
        except Exception as e:
            conn.rollback()
            msg = f"{rate_hotel_name} {room_type}/{meal_plan}: {e}"
            stats["rates_skipped"].append(msg)
            print(f"  [ERROR] {msg}")
            continue

    conn.commit()
    cur.close()
    conn.close()

    # ── Summary ───────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("IMPORT SUMMARY")
    print("=" * 60)
    print(f"  Suppliers : {stats['suppliers_new']} new, {stats['suppliers_updated']} updated")
    print(f"  Hotels    : {stats['hotels_new']} new, {stats['hotels_updated']} updated")
    print(f"  Rates     : {stats['rates_new']} new, {stats['rates_updated']} updated")

    skipped_h = stats["hotels_skipped"]
    skipped_r = stats["rates_skipped"]
    total_skip = len(skipped_h) + len(skipped_r)
    print(f"  Skipped   : {total_skip} rows")
    if skipped_h:
        print("\n  Hotel skips:")
        for s in skipped_h:
            print(f"    • {s}")
    if skipped_r:
        print("\n  Rate skips:")
        for s in skipped_r:
            print(f"    • {s}")
    print()


if __name__ == "__main__":
    main()
