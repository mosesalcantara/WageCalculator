PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`rate` real NOT NULL,
	`establishment_id` integer NOT NULL,
	FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_employees`("id", "first_name", "last_name", "rate", "establishment_id") SELECT "id", "first_name", "last_name", "rate", "establishment_id" FROM `employees`;--> statement-breakpoint
DROP TABLE `employees`;--> statement-breakpoint
ALTER TABLE `__new_employees` RENAME TO `employees`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_violations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`values` text NOT NULL,
	`employee_id` integer NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_violations`("id", "values", "employee_id") SELECT "id", "values", "employee_id" FROM `violations`;--> statement-breakpoint
DROP TABLE `violations`;--> statement-breakpoint
ALTER TABLE `__new_violations` RENAME TO `violations`;