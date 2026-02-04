CREATE TYPE "public"."guide_type" AS ENUM('city', 'trekking', 'mountaineering', 'cultural', 'naturalist');--> statement-breakpoint
CREATE TYPE "public"."meal_plan" AS ENUM('EP', 'CP', 'MAP', 'AP', 'AI');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('fixed_departure_trek', 'expedition', 'tibet_tour', 'bhutan_program', 'india_program', 'multi_country');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('standard', 'deluxe', 'superior', 'premium', 'suite', 'villa');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('sedan', 'suv', 'hiace', 'coaster', 'bus', 'land_cruiser', '4wd');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer,
	"client_id" integer,
	"booking_reference" text,
	"status" text DEFAULT 'confirmed',
	"payment_status" text DEFAULT 'pending',
	"total_amount" numeric(12, 2),
	"paid_amount" numeric(12, 2),
	"balance_amount" numeric(12, 2),
	"currency" text DEFAULT 'USD',
	"supplier_confirmations" jsonb,
	"operations_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE "destinations" (
	"id" serial PRIMARY KEY NOT NULL,
	"country" text NOT NULL,
	"region" text,
	"city" text,
	"description" text,
	"altitude" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flights_domestic" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"airline_name" text NOT NULL,
	"flight_sector" text NOT NULL,
	"departure_city" text,
	"arrival_city" text,
	"flight_duration" text,
	"baggage_allowance_kg" integer,
	"aircraft_type" text,
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"fare_class" text DEFAULT 'economy',
	"valid_from" date,
	"valid_to" date,
	"season_id" integer,
	"inclusions" text,
	"exclusions" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"guide_type" text NOT NULL,
	"destination" text,
	"license_number" text,
	"languages" jsonb,
	"specializations" jsonb,
	"experience_years" integer,
	"cost_per_day" numeric(10, 2),
	"sell_per_day" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"max_group_size" integer,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "helicopter_charter" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"route_name" text NOT NULL,
	"route_from" text,
	"route_to" text,
	"flight_duration" text,
	"helicopter_type" text,
	"max_passengers" integer,
	"max_payload_kg" integer,
	"cost_per_charter" numeric(10, 2),
	"sell_per_charter" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "helicopter_sharing" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"route_name" text NOT NULL,
	"route_from" text,
	"route_to" text,
	"flight_duration" text,
	"helicopter_type" text,
	"seats_available" integer,
	"min_passengers" integer,
	"cost_per_seat" numeric(10, 2),
	"sell_per_seat" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotel_room_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"hotel_id" integer NOT NULL,
	"room_type" text NOT NULL,
	"meal_plan" text NOT NULL,
	"cost_single" numeric(10, 2),
	"cost_double" numeric(10, 2),
	"cost_triple" numeric(10, 2),
	"cost_extra_bed" numeric(10, 2),
	"cost_child_with_bed" numeric(10, 2),
	"cost_child_no_bed" numeric(10, 2),
	"sell_single" numeric(10, 2),
	"sell_double" numeric(10, 2),
	"sell_triple" numeric(10, 2),
	"sell_extra_bed" numeric(10, 2),
	"sell_child_with_bed" numeric(10, 2),
	"sell_child_no_bed" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"valid_from" date,
	"valid_to" date,
	"season_id" integer,
	"inclusions" text,
	"exclusions" text,
	"vat_percent" numeric(5, 2) DEFAULT '13.00',
	"service_charge_percent" numeric(5, 2) DEFAULT '10.00',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"name" text NOT NULL,
	"destination_id" integer,
	"star_rating" integer,
	"category" text,
	"address" text,
	"description" text,
	"amenities" jsonb,
	"check_in_time" text,
	"check_out_time" text,
	"images" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "miscellaneous_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"destination" text,
	"description" text,
	"duration" text,
	"capacity" integer,
	"min_participants" integer,
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"price_type" text DEFAULT 'per_person',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"name" text NOT NULL,
	"package_type" text NOT NULL,
	"country" text,
	"region" text,
	"duration_days" integer,
	"duration_nights" integer,
	"difficulty" text,
	"max_altitude" integer,
	"group_size_min" integer,
	"group_size_max" integer,
	"itinerary_summary" text,
	"itinerary_detailed" jsonb,
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"price_type" text DEFAULT 'per_person',
	"currency" text DEFAULT 'USD',
	"pricing_tiers" jsonb,
	"single_supplement" numeric(10, 2),
	"inclusions" text,
	"exclusions" text,
	"departure_dates" jsonb,
	"is_fixed_departure" boolean DEFAULT false,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permits_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"country" text,
	"region" text,
	"applicable_to" text,
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"price_type" text DEFAULT 'per_person',
	"valid_from" date,
	"valid_to" date,
	"description" text,
	"required_documents" text,
	"processing_time" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "porters" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"region" text,
	"max_weight_kg" integer,
	"cost_per_day" numeric(10, 2),
	"sell_per_day" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"service_id" integer,
	"service_name" text,
	"description" text,
	"quantity" integer,
	"days" integer,
	"nights" integer,
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"margin" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"quote_name" text,
	"destination" text,
	"start_date" date,
	"end_date" date,
	"number_of_pax" integer,
	"number_of_rooms" integer,
	"total_sell_price" numeric(12, 2),
	"per_person_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"total_cost_price" numeric(12, 2),
	"total_margin" numeric(12, 2),
	"margin_percent" numeric(5, 2),
	"is_mice" boolean DEFAULT false,
	"status" text DEFAULT 'draft',
	"valid_until" date,
	"inclusions_summary" text,
	"exclusions_summary" text,
	"terms_conditions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"start_month" integer,
	"end_month" integer,
	"price_multiplier" numeric(3, 2) DEFAULT '1.00',
	"description" text
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"country" text,
	"city" text,
	"contact_person" text,
	"email" text,
	"phone" text,
	"website" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transportation" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer,
	"vehicle_type" text NOT NULL,
	"vehicle_name" text,
	"capacity" integer,
	"route_from" text,
	"route_to" text,
	"route_description" text,
	"distance_km" integer,
	"duration_hours" numeric(4, 1),
	"cost_price" numeric(10, 2),
	"sell_price" numeric(10, 2),
	"margin_percent" numeric(5, 2) DEFAULT '50.00',
	"price_type" text DEFAULT 'per_vehicle',
	"currency" text DEFAULT 'USD',
	"inclusions" text,
	"exclusions" text,
	"valid_from" date,
	"valid_to" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "itineraries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "operations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "supplier_rates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "itineraries" CASCADE;--> statement-breakpoint
DROP TABLE "operations" CASCADE;--> statement-breakpoint
DROP TABLE "supplier_rates" CASCADE;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "phone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights_domestic" ADD CONSTRAINT "flights_domestic_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flights_domestic" ADD CONSTRAINT "flights_domestic_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guides" ADD CONSTRAINT "guides_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helicopter_charter" ADD CONSTRAINT "helicopter_charter_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "helicopter_sharing" ADD CONSTRAINT "helicopter_sharing_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_room_rates" ADD CONSTRAINT "hotel_room_rates_hotel_id_hotels_id_fk" FOREIGN KEY ("hotel_id") REFERENCES "public"."hotels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel_room_rates" ADD CONSTRAINT "hotel_room_rates_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miscellaneous_services" ADD CONSTRAINT "miscellaneous_services_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "porters" ADD CONSTRAINT "porters_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transportation" ADD CONSTRAINT "transportation_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "last_interaction";