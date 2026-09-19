ALTER TABLE "products" RENAME COLUMN "username" TO "name";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_username_unique";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_name_unique" UNIQUE("name");