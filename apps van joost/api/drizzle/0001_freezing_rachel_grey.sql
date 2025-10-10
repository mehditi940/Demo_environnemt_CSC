PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`content` text,
	`mimeType` text,
	`addedBy` text NOT NULL,
	`roomId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO `__new_models`("id", "name", "path", "content", "mimeType", "addedBy", "roomId", "createdAt") SELECT "id", "name", "path", "content", "mimeType", "addedBy", "roomId", "createdAt" FROM `models`;--> statement-breakpoint
DROP TABLE `models`;--> statement-breakpoint
ALTER TABLE `__new_models` RENAME TO `models`;--> statement-breakpoint
PRAGMA foreign_keys=ON;