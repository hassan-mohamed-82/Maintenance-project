CREATE TABLE `cities` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(100) NOT NULL,
	`city_id` char(36) NOT NULL,
	`cost` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `zones` ADD CONSTRAINT `zones_city_id_cities_id_fk` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE no action ON UPDATE no action;