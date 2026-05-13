CREATE TYPE "public"."job_status" AS ENUM('idle', 'executing', 'success', 'error');--> statement-breakpoint
CREATE TABLE "eth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"addr" text NOT NULL,
	"private_key" text NOT NULL,
	"nonce" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "eth_accounts_addr_unique" UNIQUE("addr"),
	CONSTRAINT "eth_accounts_private_key_unique" UNIQUE("private_key")
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	CONSTRAINT "admins_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "authorized_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"election_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"img" text,
	"election_id" integer NOT NULL,
	"votes" integer
);
--> statement-breakpoint
CREATE TABLE "elections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"admin_id" integer NOT NULL,
	"private" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"private_key" text NOT NULL,
	"public_key" text NOT NULL,
	"master_public_key" text NOT NULL,
	"admin_count" integer NOT NULL,
	"contract_addr" text,
	"encrypted_result" text,
	CONSTRAINT "elections_slug_unique" UNIQUE("slug"),
	CONSTRAINT "elections_private_key_unique" UNIQUE("private_key"),
	CONSTRAINT "elections_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE "issued_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"addr" text NOT NULL,
	"election_id" integer,
	"revoked" boolean DEFAULT false,
	"revoked_by" integer,
	CONSTRAINT "issued_tickets_addr_unique" UNIQUE("addr")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"handler" text NOT NULL,
	"arguments" json DEFAULT '{}'::json,
	"error_msg" text,
	"iat" timestamp with time zone DEFAULT now(),
	"execution_date" timestamp with time zone NOT NULL,
	"status" "job_status" DEFAULT 'idle',
	CONSTRAINT "jobs_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"sessionToken" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" text,
	"cert" text,
	"public_key" text
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"election_id" integer NOT NULL,
	"recovery_eth_private" text NOT NULL,
	"signature" text NOT NULL,
	CONSTRAINT "votes_user_id_election_id_pk" PRIMARY KEY("user_id","election_id"),
	CONSTRAINT "votes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorized_users" ADD CONSTRAINT "authorized_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authorized_users" ADD CONSTRAINT "authorized_users_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elections" ADD CONSTRAINT "elections_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issued_tickets" ADD CONSTRAINT "issued_tickets_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_election_id_elections_id_fk" FOREIGN KEY ("election_id") REFERENCES "public"."elections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cert_idx" ON "users" USING hash ("cert");