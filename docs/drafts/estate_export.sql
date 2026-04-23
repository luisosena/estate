-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table estate.api_tokens
CREATE TABLE IF NOT EXISTS `api_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `refresh_expires_at` timestamp NULL DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `device_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_type` enum('ios','android','web') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_fingerprint` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `biometric_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `biometric_key_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_tokens_token_hash_unique` (`token_hash`),
  UNIQUE KEY `api_tokens_refresh_token_hash_unique` (`refresh_token_hash`),
  KEY `api_tokens_user_id_revoked_at_index` (`user_id`,`revoked_at`),
  CONSTRAINT `api_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.api_tokens: ~17 rows (approximately)
DELETE FROM `api_tokens`;
INSERT INTO `api_tokens` (`id`, `user_id`, `token_hash`, `refresh_token_hash`, `expires_at`, `refresh_expires_at`, `last_used_at`, `revoked_at`, `created_at`, `updated_at`, `device_id`, `device_name`, `device_type`, `device_fingerprint`, `ip_address`, `user_agent`, `location`, `biometric_enabled`, `biometric_key_id`, `last_activity_at`, `is_current`) VALUES
	(1, 2, '3ce8ac6fb420f2d4e50c07e1707168ca0c13829422946fbd0fa864c225439bc0', '37d96c7c53d20188a97263460ee3e0090196ebe24b7fe667b3e53b2aa349a79f', '2026-03-05 20:04:30', '2026-04-04 12:04:30', '2026-03-05 12:04:30', NULL, '2026-03-05 12:04:30', '2026-03-05 12:04:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(2, 2, '544dbc272f9bfe925a313ea3065016a218e9b66989ecd101c8e5f8e61a076d28', '953d451fa82cda37ccc84b32df6a45e18307279a49d3a05bf03b2f4f79e925cd', '2026-03-05 22:38:03', '2026-04-04 14:38:04', '2026-03-05 15:52:20', '2026-03-05 15:52:20', '2026-03-05 14:38:04', '2026-03-05 15:52:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(3, 3, '5f0bdc46553819e86e3b345b0bdd30ec9800c0fa6d91936b6cb0cc30e737a9a7', '9b16c01f74d18a1603b78214ade0270f21ea1a8860eaa99b589a7c129716db29', '2026-03-05 23:52:52', '2026-04-04 15:52:52', '2026-03-05 15:55:03', '2026-03-05 15:55:03', '2026-03-05 15:52:52', '2026-03-05 15:55:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(4, 1, 'b802ed0a76c0e119635bdf2f018d2c18cac0e85e90e09ef3ab32bf16bb925cef', 'ff689c9642005781fb7df8d0e61746e91fe59393053c04b68474bc3f70c2af0f', '2026-03-05 23:55:15', '2026-04-04 15:55:15', '2026-03-05 16:00:11', NULL, '2026-03-05 15:55:15', '2026-03-05 16:00:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(5, 2, 'f815970b92860774fc85cc6869a1c2bb9366f5ae49796c50b3df50f57f88b09e', '3ab5818ff1e15aa8ba98294a5693bc6881a1b8a62c8a02f14047627deb440e55', '2026-03-06 03:28:45', '2026-04-04 19:28:45', '2026-03-05 19:28:45', NULL, '2026-03-05 19:28:45', '2026-03-05 19:28:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(6, 2, '7e20ff3f0c4381a421177574e116ee84ebb9205d225dd0a5f3c87a23e0f0642d', '8fbb86a327bb50f9acb156d08eaa6aef0527b1f4209dea714cfc8bbe58d52ea6', '2026-03-08 22:24:58', '2026-04-07 14:24:58', '2026-03-08 15:53:40', '2026-03-08 15:53:40', '2026-03-08 14:24:58', '2026-03-08 15:53:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(7, 3, '96f2c30561bd7ffcf8a1aa43515344d8b157f6775ee2e8d9c53ce8f7f413d1cf', '6028c8eb7a77638f77797101f4d603baea33118493eea3ac5b9ae58805be4356', '2026-03-08 23:54:06', '2026-04-07 15:54:06', '2026-03-08 16:11:47', NULL, '2026-03-08 15:54:06', '2026-03-08 16:11:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(8, 2, '3512c1ccb9d2e59444b1c0dc5aab9333631fe499347e8b5a559f69b0a531a769', '3485ed07ef66c4e19be82d70794031d6f0ad8aad462bd452859bfd8ff0df16bb', '2026-03-08 23:56:44', '2026-04-07 15:56:44', '2026-03-08 15:57:05', NULL, '2026-03-08 15:56:44', '2026-03-08 15:57:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(9, 2, 'a547a0f6476e63919b92e3b00173e1a9e0ae434af65cdde6f570e5e06a09aef9', '28f5a02fb72de7ec37711e55a1e1d026bc629a1244cd129abf32fa537c13a585', '2026-03-09 00:09:20', '2026-04-07 16:09:20', '2026-03-08 16:11:22', NULL, '2026-03-08 16:09:20', '2026-03-08 16:11:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(10, 2, 'ca76af5eddc60f0b500afd5bcd33d08a1274b3b86cdaadb26076de755ef595de', '9c5b64f93de14efc756f1bb84f37c532fbb0bdb2ae7734cfd6baf116e3f78c6b', '2026-03-10 02:17:54', '2026-04-08 18:17:54', '2026-03-09 18:18:17', NULL, '2026-03-09 18:17:54', '2026-03-09 18:18:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(11, 2, 'f033c9d432c5cbf0f6ad6d99026fb56713a984afa5e0fe1520a6ef0d261a1095', '1216ba2578988c00d21d55be97687392af81dd13ceda60682fd38acdcf77f61d', '2026-03-11 17:34:24', '2026-04-10 09:34:24', '2026-03-11 09:34:33', '2026-03-11 09:34:33', '2026-03-11 09:34:24', '2026-03-11 09:34:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(12, 3, 'a90294a917f3611e03dbe6cb528fefb5ea10e666eb6bd5f503952ebb0d717674', '2b0c4d3c93ea8f517a2ac6cb5747c9b7df1372bdf331202921cda867a27d9b46', '2026-03-11 17:34:56', '2026-04-10 09:34:56', '2026-03-11 09:38:15', '2026-03-11 09:38:15', '2026-03-11 09:34:56', '2026-03-11 09:38:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(13, 1, '78eb59f294d5e961e4477a05e0d750cf34b5f26432626b1408cfb60bce30190e', 'aea1bb47662fee8169c7249e6c6c8fef5bd7f5c5d62cf1e401a67582ff2d60e2', '2026-03-11 17:38:41', '2026-04-10 09:38:41', '2026-03-11 09:43:55', '2026-03-11 09:43:55', '2026-03-11 09:38:41', '2026-03-11 09:43:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(14, 3, '4c640daf387f5683a23ed14ff800245ae4020663b29c0ba76ff39df586fd496d', 'c39106a08937fba8a45dfa6a00fca2ed5a8b6e89e60d45f2803838060682327a', '2026-03-11 17:44:20', '2026-04-10 09:44:20', '2026-03-11 09:46:14', '2026-03-11 09:46:14', '2026-03-11 09:44:20', '2026-03-11 09:46:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(15, 2, 'ff4cf68a3b7bb9e54bd6ff5f4a0cfd2e2e4eb250351eef5d26c771eb3acfd934', '1143a5f2540365c7b154fb0a26f74d4158b3c266dfdde4b35d28cceb6f08be04', '2026-03-11 17:46:33', '2026-04-10 09:46:33', '2026-03-11 10:44:02', NULL, '2026-03-11 09:46:33', '2026-03-11 10:44:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(16, 3, '28d7bd4016a9ab51be82b1b4ab13963dbdf53d84764d0865313931e8aa0e2539', 'cbd2483a180ce51d5ecbba2f535473fe8c5335ffb2f1be8adbc8b538852b9228', '2026-03-11 23:47:15', '2026-04-10 15:47:15', '2026-03-11 15:47:19', '2026-03-11 15:47:19', '2026-03-11 15:47:15', '2026-03-11 15:47:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(17, 2, 'de9696d23b14a40625546cbab8e1c35fb24b33a0adadbd6a265903ef50b4accf', '3d2a480e995ab398100e4c520fcb64848d014aa042502e03cab724d4344cf557', '2026-03-12 17:30:18', '2026-04-10 15:47:46', '2026-03-12 10:08:03', NULL, '2026-03-11 15:47:46', '2026-03-12 10:08:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0);

-- Dumping structure for table estate.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.cache: ~0 rows (approximately)
DELETE FROM `cache`;

-- Dumping structure for table estate.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.cache_locks: ~0 rows (approximately)
DELETE FROM `cache_locks`;

-- Dumping structure for table estate.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.failed_jobs: ~0 rows (approximately)
DELETE FROM `failed_jobs`;

-- Dumping structure for table estate.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.jobs: ~0 rows (approximately)
DELETE FROM `jobs`;

-- Dumping structure for table estate.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.job_batches: ~0 rows (approximately)
DELETE FROM `job_batches`;

-- Dumping structure for table estate.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `sender_id` bigint unsigned NOT NULL,
  `receiver_id` bigint unsigned NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  CONSTRAINT `messages_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.messages: ~5 rows (approximately)
DELETE FROM `messages`;
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `created_at`, `updated_at`) VALUES
	(1, 3, 2, 'Hello, I have a question about the parking situation.', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(2, 2, 3, 'Hi John, parking spot #12 is assigned to your unit. Let me know if you need anything else.', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(3, 4, 2, 'The kitchen sink is leaking. Can someone come take a look?', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(4, 2, 4, 'Maintenance will stop by tomorrow morning between 9-11am.', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(5, 5, 1, 'I need to update my emergency contact information.', '2026-02-23 17:46:14', '2026-02-23 17:46:14');

-- Dumping structure for table estate.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.migrations: ~19 rows (approximately)
DELETE FROM `migrations`;
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000001_create_cache_table', 1),
	(2, '0001_01_01_000002_create_jobs_table', 1),
	(3, '2026_01_30_115040_create_tenants_table', 1),
	(4, '2026_01_30_115721_create_users_table', 1),
	(5, '2026_01_30_115722_add_two_factor_columns_to_users_table', 1),
	(6, '2026_01_30_120134_create_units_table', 1),
	(7, '2026_01_30_120532_create_tenancies_table', 1),
	(8, '2026_01_30_120729_create_tenant_identifications_table', 1),
	(9, '2026_01_30_120843_create_utilities_table', 1),
	(10, '2026_01_30_120958_create_notifications_table', 1),
	(11, '2026_01_30_121057_create_messages_table', 1),
	(12, '2026_02_03_154927_create_payments_table', 1),
	(13, '2026_02_19_133943_create_sessions_table', 2),
	(15, '2026_02_20_114922_create_properties_table', 3),
	(16, '2026_02_20_115146_add_property_id_to_units_table', 4),
	(17, '2026_02_26_203809_add_rent_fields_to_tenancies_table', 5),
	(20, '2026_03_01_143000_add_tenancy_ending_fields', 6),
	(21, '2026_03_01_150000_create_laravel_notifications_table', 6),
	(23, '2026_03_02_153000_fix_tenancy_rent_values', 7),
	(24, '2026_03_02_182200_add_remaining_fields_to_properties_table', 8),
	(25, '2026_03_05_173200_create_api_tokens_table', 9),
	(26, '2026_03_07_200000_add_device_tracking_to_api_tokens_table', 10),
	(27, '2026_03_07_200100_create_security_events_table', 10);

-- Dumping structure for table estate.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`),
  KEY `notifications_read_at_index` (`read_at`),
  KEY `notifications_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.notifications: ~0 rows (approximately)
DELETE FROM `notifications`;

-- Dumping structure for table estate.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.password_reset_tokens: ~2 rows (approximately)
DELETE FROM `password_reset_tokens`;
INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
	('hashirama@estate.com', '$2y$12$2bxYVCdFRFU4ea.AytpFrusPAFzB4I6v0RWBL5ddNCFsbNpV1kAu2', '2026-02-26 17:51:16'),
	('luisosena2@gmail.com', '$2y$12$g84q92NCVoOcAPKwCxkcZO6ozT0jWq6UljaAJQc5ol/DlSruE9xmy', '2026-02-26 17:53:07');

-- Dumping structure for table estate.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `tenancy_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('rent','utility') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('paid','partial','overdue') COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `receipt_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_tenant_id_foreign` (`tenant_id`),
  KEY `payments_tenancy_id_foreign` (`tenancy_id`),
  CONSTRAINT `payments_tenancy_id_foreign` FOREIGN KEY (`tenancy_id`) REFERENCES `tenancies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.payments: ~8 rows (approximately)
DELETE FROM `payments`;
INSERT INTO `payments` (`id`, `tenant_id`, `tenancy_id`, `amount`, `payment_type`, `payment_method`, `status`, `paid_at`, `receipt_path`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 1200.00, 'rent', 'bank_transfer', 'partial', '2026-02-18 17:46:14', NULL, '2026-02-23 17:46:14', '2026-03-01 06:39:20'),
	(2, 1, 1, 85.50, 'utility', 'credit_card', 'paid', '2026-02-18 17:46:14', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(3, 1, 1, 1200.00, 'rent', 'bank_transfer', 'paid', '2026-01-25 17:46:14', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(4, 2, 2, 950.00, 'rent', 'cash', 'paid', '2026-02-21 17:46:14', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(5, 2, 2, 950.00, 'rent', 'bank_transfer', 'paid', '2026-01-23 17:46:14', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(6, 3, 3, 1500.00, 'rent', 'credit_card', 'partial', '2026-02-13 17:46:14', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(7, 3, 3, 120.75, 'utility', 'credit_card', 'overdue', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(8, 1, 1, 400.00, 'utility', 'M Pesa', 'paid', '2026-02-28 21:00:00', NULL, '2026-03-01 06:40:24', '2026-03-01 06:40:24');

-- Dumping structure for table estate.properties
CREATE TABLE IF NOT EXISTS `properties` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_units` int NOT NULL DEFAULT '0',
  `property_type` enum('apartment','house','commercial','mixed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `description` text COLLATE utf8mb4_unicode_ci,
  `amenities` json DEFAULT NULL,
  `policies` json DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `1` (`owner_id`),
  CONSTRAINT `1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.properties: ~4 rows (approximately)
DELETE FROM `properties`;
INSERT INTO `properties` (`id`, `owner_id`, `name`, `total_units`, `property_type`, `status`, `description`, `amenities`, `policies`, `address`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES
	(1, 2, 'Sunrise Apartments', 4, NULL, 'active', NULL, NULL, NULL, '12 Sunrise Avenue, Dar es Salaam', NULL, NULL, NULL, NULL, '2026-02-23 17:46:13', '2026-02-28 15:54:34'),
	(2, 2, 'Hilltop Residences', 4, NULL, 'active', NULL, NULL, NULL, '45 Hilltop Road, Arusha', NULL, NULL, NULL, NULL, '2026-02-23 17:46:13', '2026-03-02 09:06:47'),
	(3, 2, 'Safari', 8, 'apartment', 'active', NULL, '[]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-02 14:36:23', '2026-03-02 14:36:23'),
	(4, 15, 'Jangwani Hotel', 16, 'mixed', 'active', NULL, '[]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-03 12:41:17', '2026-03-03 12:41:17'),
	(5, 17, 'Forest Hill', 10, 'house', 'active', NULL, '["Swimming pool", "Gym"]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-03 12:42:52', '2026-03-03 12:42:52');

-- Dumping structure for table estate.security_events
CREATE TABLE IF NOT EXISTS `security_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `event_type` enum('password_changed','password_reset_requested','suspicious_activity','unusual_location','multiple_failed_attempts','token_revoked','session_terminated','biometric_enabled','biometric_disabled','device_added','device_removed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `device_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'low',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `security_events_user_id_index` (`user_id`),
  KEY `security_events_event_type_index` (`event_type`),
  KEY `security_events_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.security_events: ~0 rows (approximately)
DELETE FROM `security_events`;

-- Dumping structure for table estate.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.sessions: ~1 rows (approximately)
DELETE FROM `sessions`;
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('tuIBRjfCi2QrEace6be1idxR98VyDnsKf3QhLzO4', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiVTZkR0hIcExEMzZSdVJ3RmNrQU1rcEJGZjVMNG80TENhYkZpMExNViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sYW5kbG9yZC9ub3RpZmljYXRpb25zL3VucmVhZC1jb3VudCI7czo1OiJyb3V0ZSI7czozNToibGFuZGxvcmQubm90aWZpY2F0aW9ucy51bnJlYWQtY291bnQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToyO30=', 1772718432);

-- Dumping structure for table estate.tenancies
CREATE TABLE IF NOT EXISTS `tenancies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `unit_id` bigint unsigned NOT NULL,
  `move_in_date` date NOT NULL,
  `move_out_date` date DEFAULT NULL,
  `end_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deposit_return_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `final_meter_readings` text COLLATE utf8mb4_unicode_ci,
  `monthly_rent` decimal(10,2) NOT NULL,
  `security_deposit` decimal(10,2) DEFAULT NULL,
  `tenancy_agreement_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','ended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenancies_tenant_id_foreign` (`tenant_id`),
  KEY `tenancies_unit_id_foreign` (`unit_id`),
  CONSTRAINT `tenancies_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenancies_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.tenancies: ~5 rows (approximately)
DELETE FROM `tenancies`;
INSERT INTO `tenancies` (`id`, `tenant_id`, `unit_id`, `move_in_date`, `move_out_date`, `end_reason`, `deposit_return_status`, `final_meter_readings`, `monthly_rent`, `security_deposit`, `tenancy_agreement_path`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, 9, '2025-08-20', '2026-03-10', NULL, NULL, NULL, 120000.00, 300000.00, NULL, 'active', '2026-02-23 17:46:14', '2026-03-02 12:30:59'),
	(2, 2, 2, '2025-11-23', '2026-03-06', NULL, NULL, NULL, 150000.00, 0.00, NULL, 'active', '2026-02-23 17:46:14', '2026-03-02 12:30:59'),
	(3, 3, 3, '2026-01-23', NULL, NULL, NULL, NULL, 200000.00, NULL, NULL, 'active', '2026-02-23 17:46:14', '2026-03-02 12:30:59'),
	(4, 11, 5, '2026-02-27', NULL, NULL, NULL, NULL, 250000.00, NULL, NULL, 'active', '2026-02-26 17:41:36', '2026-03-02 12:30:59'),
	(5, 12, 4, '2026-02-28', NULL, NULL, NULL, NULL, 300000.00, NULL, NULL, 'active', '2026-02-27 12:24:56', '2026-03-02 12:30:59');

-- Dumping structure for table estate.tenants
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emergency_contact_phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emergency_contact_relation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_tenant_code_unique` (`tenant_code`),
  KEY `tenants_tenant_code_index` (`tenant_code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.tenants: ~5 rows (approximately)
DELETE FROM `tenants`;
INSERT INTO `tenants` (`id`, `tenant_code`, `full_name`, `phone`, `email`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 'TEN-00001', 'John Doe', '+1234567892', 'johndoe@estate.com', 'Jane Doe', '+0987654320', 'Spouse', '2026-02-23 17:46:13', '2026-02-28 05:58:13', NULL),
	(2, 'TEN-00002', 'Sarah Johnson', '+2345678901', 'sarah.j@example.com', 'Mike Johnson', '+1987654320', 'Brother', '2026-02-23 17:46:13', '2026-02-23 17:46:13', NULL),
	(3, 'TEN-00003', 'Michael Smith', '+3456789012', 'michael.smith@example.com', 'Emma Smith', '+1876543210', 'Mother', '2026-02-23 17:46:13', '2026-02-23 17:46:13', NULL),
	(11, 'TEN-00011', 'hashirama', '+123456789', 'hashirama@estate.com', 'madara', '+123456789', 'spouse', '2026-02-26 17:41:35', '2026-02-26 17:41:35', NULL),
	(12, 'TEN-00012', 'madara', '+123456789', 'madara@estate.com', 'hashirama', '+123456789', 'spouse', '2026-02-27 12:24:55', '2026-02-27 12:24:55', NULL);

-- Dumping structure for table estate.tenant_identifications
CREATE TABLE IF NOT EXISTS `tenant_identifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `id_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tenant_identifications_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `tenant_identifications_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.tenant_identifications: ~3 rows (approximately)
DELETE FROM `tenant_identifications`;
INSERT INTO `tenant_identifications` (`id`, `tenant_id`, `id_type`, `id_number`, `document_path`, `verified_at`, `created_at`, `updated_at`) VALUES
	(1, 1, 'passport', 'P123456789', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(2, 2, 'drivers_license', 'DL98765432', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(3, 3, 'national_id', 'NID45678901', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14');

-- Dumping structure for table estate.units
CREATE TABLE IF NOT EXISTS `units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `unit_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('available','occupied') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `property_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `units_unit_code_unique` (`unit_code`),
  KEY `units_property_id_foreign` (`property_id`),
  CONSTRAINT `units_property_id_foreign` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.units: ~8 rows (approximately)
DELETE FROM `units`;
INSERT INTO `units` (`id`, `unit_code`, `unit_name`, `status`, `created_at`, `updated_at`, `property_id`) VALUES
	(1, 'A101', 'Studio Apartment - Ground Floor', 'available', '2026-02-23 17:46:13', '2026-02-28 15:56:46', 1),
	(2, 'A102', '1 Bedroom - Ground Floor', 'occupied', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 1),
	(3, 'A201', '2 Bedroom - First Floor', 'occupied', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 1),
	(4, 'B101', '2 Bedroom - Ground Floor', 'occupied', '2026-02-23 17:46:13', '2026-02-27 12:24:56', 2),
	(5, 'B201', '3 Bedroom Penthouse', 'available', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 2),
	(8, '808', 'por', 'available', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 1),
	(9, 'A111', 'Rooftop', 'occupied', '2026-02-28 15:54:34', '2026-02-28 15:56:46', 1),
	(10, 'B109', 'Basement Villa', 'available', '2026-02-28 15:55:57', '2026-02-28 15:55:57', 2),
	(11, 'B112', 'Farside Villa', 'available', '2026-03-02 09:06:47', '2026-03-02 09:06:47', 2);

-- Dumping structure for table estate.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('tenant','landlord','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tenant_id_foreign` (`tenant_id`),
  KEY `users_role_index` (`role`),
  CONSTRAINT `users_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.users: ~10 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `tenant_id`, `name`, `username`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `role`, `last_login_at`, `created_at`, `updated_at`) VALUES
	(1, NULL, 'Admin User', 'admin', 'admin@example.com', NULL, '$2y$12$4XikjO0E1Ax3JjbQNxVcnO9CJIrorrYsWZebNqcQW94CDvijzwtXy', NULL, NULL, NULL, NULL, 'admin', '2026-03-11 09:38:41', '2026-02-23 17:46:13', '2026-03-11 09:38:41'),
	(2, NULL, 'Landlord User', 'landlord', 'landlord@example.com', '2026-03-02 15:53:43', '$2y$12$lw8i6swl18DkS3jVOrYsEuaLJs6sgoK8bGRG/OCd61DOPrhS9R3lS', NULL, NULL, NULL, NULL, 'landlord', '2026-03-11 15:47:46', '2026-02-23 17:46:13', '2026-03-11 15:47:46'),
	(3, 1, 'John Doe', 'johndoe', 'john.doe@example.com', NULL, '$2y$12$nDufGb8k1HD0IVnQU28GyeKvqvos2W6bHwK1Yn/uviSI2pALX354O', NULL, NULL, NULL, NULL, 'tenant', '2026-03-11 15:47:15', '2026-02-23 17:46:14', '2026-03-11 15:47:15'),
	(4, 2, 'Sarah Johnson', 'sarahj', 'sarah.j@example.com', NULL, '$2y$12$TgF6/ygBe.oNQniNuFQtv.DeY.HXs/bJapqG0LINvTnhQUg96V3cm', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(5, 3, 'Michael Smith', 'michaels', 'michael.smith@example.com', NULL, '$2y$12$D9pLbteiKMxFpHovmfLfZeAxIrquAVXaXsybdqutjD2Ev8LGrKktu', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(13, 11, 'hashirama', 'hashirama_4385', 'luisosena2@gmail.com', NULL, '$2y$12$yRXo6KCCSSnjLBsHl8SjSeNXlX6how69msejysbyWNg7NobRBqLT6', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-26 17:41:36', '2026-02-26 17:41:36'),
	(14, 12, 'madara', 'madara_7613', 'madara@estate.com', NULL, '$2y$12$L3hf2fca/Z4qgsJD6G50q.m8dFT6wWIpT4xs4D..M4LmsBBB6eBvq', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-27 12:24:56', '2026-02-27 12:24:56'),
	(15, NULL, 'Second Landlord', 'landlord2', 'landlord2@estate.com', NULL, '$2y$12$yIJ6axazgLWoptxJiJt72udghjR.auACFtgThJaEfkwsUF/UBgDHS', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:00:14', '2026-03-02 16:00:14'),
	(16, NULL, 'Third Landlord', 'landlord3', 'landlord3@estate.com', NULL, '$2y$12$MITaZ8So41DL3ClRIFSG6.88HogD8l7KMba.2lt0Wp6YEKBjuu4tm', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:15:28', '2026-03-02 16:15:28'),
	(17, NULL, 'Forth Landlord', 'landlord4', 'landlord4@estate.com', NULL, '$2y$12$qkSfba2DE0iy/IGy/l91FuFirOP1Y6J/1/QKcFJR70aeGAaYh1zUi', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:20:13', '2026-03-02 16:20:13');

-- Dumping structure for table estate.utilities
CREATE TABLE IF NOT EXISTS `utilities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenancy_id` bigint unsigned NOT NULL,
  `type` enum('water','electricity','gas','internet','security') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `billing_period` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('paid','unpaid') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `utilities_tenancy_id_foreign` (`tenancy_id`),
  CONSTRAINT `utilities_tenancy_id_foreign` FOREIGN KEY (`tenancy_id`) REFERENCES `tenancies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.utilities: ~8 rows (approximately)
DELETE FROM `utilities`;
INSERT INTO `utilities` (`id`, `tenancy_id`, `type`, `amount`, `billing_period`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, 'water', 45.50, 'March 2026', 'paid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(2, 1, 'electricity', 89.75, 'March 2026', 'paid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(3, 1, 'internet', 60.00, 'March 2026', 'paid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(4, 2, 'water', 38.25, 'March 2026', 'paid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(5, 2, 'electricity', 67.80, 'March 2026', 'paid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(6, 3, 'water', 52.30, 'March 2026', 'unpaid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(7, 3, 'electricity', 112.45, 'March 2026', 'unpaid', '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(8, 3, 'gas', 35.20, 'March 2026', 'unpaid', '2026-02-23 17:46:14', '2026-02-23 17:46:14');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
