CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_type" varchar NOT NULL,
	"badge_data" jsonb NOT NULL,
	"earned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_certificates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar DEFAULT 'ai-fundamentals-5day' NOT NULL,
	"certificate_data" jsonb NOT NULL,
	"issued_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"day_id" integer NOT NULL,
	"completed_sections" jsonb DEFAULT '[]'::jsonb,
	"completed_slides" jsonb DEFAULT '[]'::jsonb,
	"quiz_scores" jsonb DEFAULT '{}'::jsonb,
	"current_slide" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"full_name" varchar,
	"phone" varchar,
	"profession" varchar DEFAULT 'student',
	"course_type" varchar,
	"stream" varchar,
	"field_of_work" varchar,
	"designation" varchar,
	"organization" varchar,
	"date_of_birth" varchar,
	"profile_locked" boolean DEFAULT false,
	"is_profile_complete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_certificates" ADD CONSTRAINT "user_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_user_badges_user" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_badges_type" ON "user_badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "idx_user_certificates_user" ON "user_certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_progress_user_day" ON "user_progress" USING btree ("user_id","day_id");