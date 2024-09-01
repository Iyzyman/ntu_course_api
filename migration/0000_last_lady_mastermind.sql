CREATE TABLE IF NOT EXISTS "core_lists" (
	"key" varchar(256),
	"slug" varchar(256) NOT NULL,
	"source" varchar(256) DEFAULT 'shelvd',
	"name" varchar(256),
	"description" varchar(256) DEFAULT '',
	"booksCount" integer DEFAULT 0,
	"bookKeys" json DEFAULT '[]'::json,
	"creatorKey" varchar(256) NOT NULL,
	CONSTRAINT "core_lists_slug_creatorKey_pk" PRIMARY KEY("slug","creatorKey")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "created_lists" (
	"key" varchar(256),
	"slug" varchar(256) NOT NULL,
	"source" varchar(256) DEFAULT 'shelvd',
	"name" varchar(256),
	"description" varchar(256) DEFAULT '',
	"booksCount" integer DEFAULT 0,
	"bookKeys" json DEFAULT '[]'::json,
	"creatorKey" varchar(256) NOT NULL,
	CONSTRAINT "created_lists_slug_creatorKey_pk" PRIMARY KEY("slug","creatorKey")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "following_lists" (
	"userId" varchar(256) PRIMARY KEY NOT NULL,
	"listKeys" json DEFAULT '[]'::json,
	CONSTRAINT "following_lists_userId_unique" UNIQUE("userId")
);
