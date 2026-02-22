CREATE TYPE "public"."lssn_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."slide_reaction" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('viewer', 'creator', 'admin');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lssn_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"lssn_id" integer NOT NULL,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lssn_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"lssn_id" integer NOT NULL,
	"topic_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lssns" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"status" "lssn_status" DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"slides_count" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"dislikes_count" integer DEFAULT 0 NOT NULL,
	"rating" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_id" varchar(64) NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_rotated" boolean DEFAULT false NOT NULL,
	CONSTRAINT "refresh_sessions_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "slide_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lssn_id" integer NOT NULL,
	"slide_index" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction" "slide_reaction" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"lssn_id" integer NOT NULL,
	"slide_index" integer NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"dislikes_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(140) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP TABLE "permissions" CASCADE;--> statement-breakpoint
DROP TABLE "user_permissions" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'creator' NOT NULL;--> statement-breakpoint
ALTER TABLE "lssn_categories" ADD CONSTRAINT "lssn_categories_lssn_id_lssns_id_fk" FOREIGN KEY ("lssn_id") REFERENCES "public"."lssns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lssn_categories" ADD CONSTRAINT "lssn_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lssn_topics" ADD CONSTRAINT "lssn_topics_lssn_id_lssns_id_fk" FOREIGN KEY ("lssn_id") REFERENCES "public"."lssns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lssn_topics" ADD CONSTRAINT "lssn_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lssns" ADD CONSTRAINT "lssns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_reactions" ADD CONSTRAINT "slide_reactions_lssn_id_lssns_id_fk" FOREIGN KEY ("lssn_id") REFERENCES "public"."lssns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slide_reactions" ADD CONSTRAINT "slide_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slides" ADD CONSTRAINT "slides_lssn_id_lssns_id_fk" FOREIGN KEY ("lssn_id") REFERENCES "public"."lssns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lssn_category_unique" ON "lssn_categories" USING btree ("lssn_id","category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lssn_topic_unique" ON "lssn_topics" USING btree ("lssn_id","topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slide_reaction_unique" ON "slide_reactions" USING btree ("lssn_id","slide_index","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "slide_unique" ON "slides" USING btree ("lssn_id","slide_index");