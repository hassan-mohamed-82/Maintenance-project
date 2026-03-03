CREATE TABLE `maintenance_types` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenances` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`maintenance_type_id` char(36) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `maintenances` ADD CONSTRAINT `maintenances_maintenance_type_id_maintenance_types_id_fk` FOREIGN KEY (`maintenance_type_id`) REFERENCES `maintenance_types`(`id`) ON DELETE no action ON UPDATE no action;