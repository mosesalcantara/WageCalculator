CREATE TABLE `violations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`values` text,
	`employee_id` integer,
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
