CREATE TABLE `bus_check_ins` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`bus_id` char(36) NOT NULL,
	`garage_id` char(36) NOT NULL,
	`security_user_id` char(36) NOT NULL,
	`description` text,
	`check_in_time` timestamp NOT NULL,
	`check_out_time` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bus_check_ins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `garage_id` char(36);--> statement-breakpoint
ALTER TABLE `bus_check_ins` ADD CONSTRAINT `bus_check_ins_bus_id_buses_id_fk` FOREIGN KEY (`bus_id`) REFERENCES `buses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bus_check_ins` ADD CONSTRAINT `bus_check_ins_garage_id_garages_id_fk` FOREIGN KEY (`garage_id`) REFERENCES `garages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bus_check_ins` ADD CONSTRAINT `bus_check_ins_security_user_id_users_id_fk` FOREIGN KEY (`security_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_garage_id_garages_id_fk` FOREIGN KEY (`garage_id`) REFERENCES `garages`(`id`) ON DELETE no action ON UPDATE no action;