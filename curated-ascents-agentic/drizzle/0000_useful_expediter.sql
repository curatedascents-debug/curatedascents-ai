CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"preferences" jsonb,
	"conversation_history" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_interaction" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "itineraries" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"title" varchar(255) NOT NULL,
	"destinations" jsonb NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"number_of_pax" integer NOT NULL,
	"is_mice" boolean DEFAULT false NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"total_revenue" numeric(12, 2) NOT NULL,
	"margin_applied" numeric(5, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"day_by_day" jsonb NOT NULL,
	"selected_rates" jsonb,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operations" (
	"id" serial PRIMARY KEY NOT NULL,
	"itinerary_id" integer NOT NULL,
	"operation_type" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_name" varchar(255) NOT NULL,
	"destination" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL,
	"sell_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"margin" numeric(5, 2) DEFAULT '50.00' NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"blackout_dates" jsonb,
	"description" text,
	"images" jsonb,
	"capacity" integer,
	"inclusions" jsonb,
	"exclusions" jsonb,
	"tax_rate" numeric(5, 2),
	"service_charge" numeric(5, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_itinerary_id_itineraries_id_fk" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE no action ON UPDATE no action;