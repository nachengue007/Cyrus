CREATE TABLE `histories` (
	`id` text PRIMARY KEY,
	`contact_id` text NOT NULL,
	`status` text NOT NULL,
	`sent_at` text DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `fk_histories_contact_id_contacts_id_fk` FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY,
	`name` text,
	`subject` text,
	`body` text UNIQUE,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
