ALTER TABLE `garages` DROP FOREIGN KEY `garages_zone_id_zones_id_fk`;
--> statement-breakpoint
ALTER TABLE `garages` ADD `location` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `garages` DROP COLUMN `zone_id`;