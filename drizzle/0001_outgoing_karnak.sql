CREATE TABLE `gallery_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`altText` varchar(280) NOT NULL,
	`category` varchar(64) NOT NULL DEFAULT 'School life',
	`imageKey` varchar(512) NOT NULL,
	`imageUrl` varchar(768) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_entries_id` PRIMARY KEY(`id`)
);
