CREATE TABLE `contacts` (
	`id` text PRIMARY KEY,
	`name` text,
	`company` text,
	`email` text UNIQUE,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
