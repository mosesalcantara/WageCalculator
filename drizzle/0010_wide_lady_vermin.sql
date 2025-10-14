CREATE TABLE `custom_violations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`values` text NOT NULL,
	`employee_id` integer NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
