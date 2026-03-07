CREATE TABLE `checkin_maint_types` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`checkin_id` char(36) NOT NULL,
	`maint_type_id` char(36) NOT NULL,
	CONSTRAINT `checkin_maint_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `bus_check_ins` ADD `driver_id` char(36);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `checkin_maint_types` ADD CONSTRAINT `checkin_maint_types_checkin_id_bus_check_ins_id_fk` FOREIGN KEY (`checkin_id`) REFERENCES `bus_check_ins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkin_maint_types` ADD CONSTRAINT `checkin_maint_types_maint_type_id_maintenance_types_id_fk` FOREIGN KEY (`maint_type_id`) REFERENCES `maintenance_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bus_check_ins` ADD CONSTRAINT `bus_check_ins_driver_id_users_id_fk` FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;