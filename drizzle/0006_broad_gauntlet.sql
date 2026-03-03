DROP TABLE `super_admins`;--> statement-breakpoint
DROP TABLE `organization_types`;--> statement-breakpoint
DROP TABLE `organizations`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
DROP TABLE `organization_payments`;--> statement-breakpoint
DROP TABLE `plan`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
DROP TABLE `promocodes`;--> statement-breakpoint
DROP TABLE `payment_methods`;--> statement-breakpoint
DROP TABLE `super_admin_roles`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
DROP TABLE `fee_installments`;--> statement-breakpoint
DROP TABLE `parent_plan`;--> statement-breakpoint
DROP TABLE `parent_payments`;--> statement-breakpoint
DROP TABLE `parent_subscriptions`;--> statement-breakpoint
DROP TABLE `drivers`;--> statement-breakpoint
DROP TABLE `codrivers`;--> statement-breakpoint
DROP TABLE `routes`;--> statement-breakpoint
DROP TABLE `route_pickup_points`;--> statement-breakpoint
DROP TABLE `rides`;--> statement-breakpoint
DROP TABLE `pickup_points`;--> statement-breakpoint
DROP TABLE `departments`;--> statement-breakpoint
DROP TABLE `students`;--> statement-breakpoint
DROP TABLE `parents`;--> statement-breakpoint
DROP TABLE `ride_students`;--> statement-breakpoint
DROP TABLE `cities`;--> statement-breakpoint
DROP TABLE `zones`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `ride_occurrence_students`;--> statement-breakpoint
DROP TABLE `ride_occurrences`;--> statement-breakpoint
DROP TABLE `organization_services`;--> statement-breakpoint
DROP TABLE `wallet_recharge_requests`;--> statement-breakpoint
DROP TABLE `wallet_transactions`;--> statement-breakpoint
ALTER TABLE `admins` DROP FOREIGN KEY `admins_organization_id_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `buses` DROP FOREIGN KEY `buses_organization_id_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `admins` MODIFY COLUMN `type` enum('superadmin','admin') NOT NULL DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE `admins` DROP COLUMN `organization_id`;--> statement-breakpoint
ALTER TABLE `admins` DROP COLUMN `permissions`;--> statement-breakpoint
ALTER TABLE `admins` DROP COLUMN `fcm_tokens`;--> statement-breakpoint
ALTER TABLE `buses` DROP COLUMN `organization_id`;