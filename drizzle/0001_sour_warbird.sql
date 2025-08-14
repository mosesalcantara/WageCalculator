CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`rate` real NOT NULL,
	`establishment_id` integer,
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON UPDATE no action ON DELETE no action
);
