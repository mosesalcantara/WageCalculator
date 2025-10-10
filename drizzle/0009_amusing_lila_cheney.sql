PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`last_name` text NOT NULL,
	`first_name` text NOT NULL,
	`middle_initial` text NOT NULL,
	`rate` real NOT NULL,
	`start_day` text NOT NULL,
	`end_day` text NOT NULL,
	`establishment_id` integer NOT NULL,
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_employees`("id", "last_name", "first_name", "middle_initial", "rate", "start_day", "end_day", "establishment_id") SELECT "id", "last_name", "first_name", "middle_initial", "rate", "start_day", "end_day", "establishment_id" FROM `employees`;--> statement-breakpoint
DROP TABLE `employees`;--> statement-breakpoint
ALTER TABLE `__new_employees` RENAME TO `employees`;--> statement-breakpoint
PRAGMA foreign_keys=ON;