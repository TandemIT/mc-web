CREATE TABLE `download_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`timestamp` integer NOT NULL,
	`ip_address` text,
	`user_agent` text
);
--> statement-breakpoint
CREATE TABLE `downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`first_download` integer NOT NULL,
	`last_download` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `downloads_filename_unique` ON `downloads` (`filename`);