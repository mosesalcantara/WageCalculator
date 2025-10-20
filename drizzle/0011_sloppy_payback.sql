CREATE TABLE `wageOrders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`less_than_ten` real NOT NULL,
	`ten_or_more` real NOT NULL
);
