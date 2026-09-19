ALTER TABLE "users" ADD COLUMN "role" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_unique" UNIQUE("role");