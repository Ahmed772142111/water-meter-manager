CREATE TABLE `additional_charges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int,
	`unitId` int,
	`description` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`chargeDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `additional_charges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`backupName` varchar(255) NOT NULL,
	`backupData` text,
	`backupSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`consumption` int NOT NULL,
	`baseAmount` int NOT NULL,
	`additionalCharges` int NOT NULL DEFAULT 0,
	`totalAmount` int NOT NULL,
	`status` enum('draft','issued','paid','overdue','cancelled') NOT NULL DEFAULT 'issued',
	`dueDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `meter_readings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meterId` int NOT NULL,
	`reading` int NOT NULL,
	`readingDate` timestamp NOT NULL DEFAULT (now()),
	`consumption` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meter_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unitId` int NOT NULL,
	`meterNumber` varchar(50) NOT NULL,
	`meterType` varchar(50) NOT NULL DEFAULT 'water',
	`installationDate` timestamp,
	`lastReading` int NOT NULL DEFAULT 0,
	`lastReadingDate` timestamp,
	`status` enum('active','inactive','faulty') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meters_id` PRIMARY KEY(`id`),
	CONSTRAINT `meters_meterNumber_unique` UNIQUE(`meterNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentDate` timestamp NOT NULL DEFAULT (now()),
	`paymentMethod` varchar(50) NOT NULL DEFAULT 'cash',
	`reference` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`unitNumber` varchar(50) NOT NULL,
	`location` text,
	`area` int,
	`tenantName` varchar(255),
	`tenantPhone` varchar(20),
	`tenantEmail` varchar(320),
	`status` enum('active','inactive','vacant') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
