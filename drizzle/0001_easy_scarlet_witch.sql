CREATE TABLE `prompt_library_snapshots` (
	`id` int NOT NULL,
	`sourceTitle` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`promptCount` int NOT NULL,
	`refreshedAt` timestamp NOT NULL,
	CONSTRAINT `prompt_library_snapshots_id` PRIMARY KEY(`id`)
);
