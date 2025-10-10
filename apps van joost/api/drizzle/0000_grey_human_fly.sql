CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`pinCode` text NOT NULL,
	`startedBy` text NOT NULL,
	`roomId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`validUntil` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`content` text NOT NULL,
	`mimeType` text NOT NULL,
	`addedBy` text NOT NULL,
	`roomId` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`nummer` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_nummer_unique` ON `patients` (`nummer`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`patient` text,
	`type` text DEFAULT 'patient',
	`createdBy` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `users_to_groups` (
	`user_id` text NOT NULL,
	`rooms_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `rooms_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rooms_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`salt` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`role` text DEFAULT 'user',
	`deleted` text DEFAULT 'false',
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);