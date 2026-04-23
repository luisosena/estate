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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.api_tokens: ~50 rows (approximately)
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
	(17, 2, 'de9696d23b14a40625546cbab8e1c35fb24b33a0adadbd6a265903ef50b4accf', '3d2a480e995ab398100e4c520fcb64848d014aa042502e03cab724d4344cf557', '2026-03-12 17:30:18', '2026-04-10 15:47:46', '2026-03-12 10:08:03', NULL, '2026-03-11 15:47:46', '2026-03-12 10:08:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(18, 2, 'd82edbbb8195929da035fa4090fcdfe7e71dcd44a97cca74b6563510f0482bc4', '859f7fefdfe606a0eecabaef734cf70e35b866066b973e360671c114c1c275c7', '2026-03-13 16:46:32', '2026-04-12 08:46:32', '2026-03-13 08:46:45', '2026-03-13 08:46:45', '2026-03-13 08:46:32', '2026-03-13 08:46:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(19, 1, 'a73a6a7272bd63a211c5c3fc693b4bc9f5efa1fee7f24c7ef9e490304bd90084', 'f672c78449c80c521c5ac876d7371b63f9a90ca7241cc2b0a6d9f69563d63831', '2026-03-13 16:47:06', '2026-04-12 08:47:06', '2026-03-13 09:08:13', '2026-03-13 09:08:13', '2026-03-13 08:47:06', '2026-03-13 09:08:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(20, 2, 'd0fbcf04a965281891b9c1a9f298fd03af3ccd3b0871577b8b528d3b5e9f5e77', '1e470c7da93a71fa5173a4add2e2c7040f0c0d7fcab01491bfac51f42478a225', '2026-03-15 11:22:23', '2026-04-12 09:08:34', '2026-03-15 03:22:30', '2026-03-15 03:22:30', '2026-03-13 09:08:34', '2026-03-15 03:22:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(21, 3, 'a733d78bb57573d6340efb696aef8ab314e36406b9d4c88676359eb0065fc8fb', '1e030a17465680161a6d10f6b34bd18d9b22d1f06d0493e154336a93c5eef3a7', '2026-03-15 11:24:29', '2026-04-14 03:24:29', '2026-03-15 03:58:06', '2026-03-15 03:58:06', '2026-03-15 03:24:29', '2026-03-15 03:58:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(22, 2, '4a29730e1e5f46964de2de02f816fd60b1dc8c630d6464d52d06653630bb7853', '9eb1511148f11722a6247521bc965b0185545ab503d18a10529afb9e76e946c6', '2026-03-15 11:58:17', '2026-04-14 03:58:17', '2026-03-15 03:58:37', '2026-03-15 03:58:38', '2026-03-15 03:58:17', '2026-03-15 03:58:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(23, 3, '4131f1bd3f3c8627f494aa73958ed8ef16f7cfc786f7536dc9b06caf4d7a851c', 'bbbd32059dd4daefb9d2b0200034bd65b4290628f84e943c527c9a790dcb7f67', '2026-03-20 00:12:09', '2026-04-14 03:58:55', '2026-03-19 19:11:53', '2026-03-19 19:11:53', '2026-03-15 03:58:55', '2026-03-19 19:11:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(24, 2, '275cb8d04dc189685f456f3282d6140319a8bf71d4a3a6f92559c145a8f5e546', '57749d421d41504ad71e03c998912be1954d777bb1bebdd8699adcbd7ac9899c', '2026-03-20 03:12:05', '2026-04-18 19:12:05', '2026-03-19 19:12:40', NULL, '2026-03-19 19:12:05', '2026-03-19 19:12:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(25, 2, 'e993580243d7edff28f64dc8f063c79563d52edfec617877c738ad174beeca1f', 'fff6f69ebe565cacc522dd6eb4499b07ef9bd50ca3aebcbae961cd66a910ac00', '2026-03-20 12:11:31', '2026-04-19 04:11:31', '2026-03-20 05:28:06', '2026-03-20 05:28:06', '2026-03-20 04:11:31', '2026-03-20 05:28:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(26, 3, '245e73984899f9d1a514f3d984e24093f205eb786c44af2097946e67d81972a8', '598e40d4532f79f18970e41d2ee32a96d0c65ae62cc3c38abf7f06b6facd8665', '2026-03-20 13:28:17', '2026-04-19 05:28:17', '2026-03-20 05:31:06', '2026-03-20 05:31:06', '2026-03-20 05:28:17', '2026-03-20 05:31:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(27, 2, '1bd50db3b2e1a1a53a696b68889485a2b3aafed74c795bbda45d15ec6b2f893a', 'd135242237bb0aaf4e89a461be5e028d9c8f38534d26277e317b45d2f12764e8', '2026-03-20 13:31:15', '2026-04-19 05:31:15', '2026-03-20 05:43:57', '2026-03-20 05:43:57', '2026-03-20 05:31:15', '2026-03-20 05:43:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(28, 3, '5dad8af5b49faae0019fdcdc804e52bb37825df52ca87d0523a9eaa12d4bb105', '4e792f7f1354fdcfa2f0814ce5a9311ac7a9d72178fbf24be72a54925a97c593', '2026-03-20 13:44:05', '2026-04-19 05:44:05', '2026-03-20 05:56:10', '2026-03-20 05:56:10', '2026-03-20 05:44:05', '2026-03-20 05:56:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(29, 2, '5fad098200878ac9606e7e3600f0c3369a338d229b5fd275523e76ed8ebbfaef', 'a2f4d2671cb09ccb236ab6e3ed3b3901ca21f02462cfb5607e41c84ec57740db', '2026-03-20 13:56:17', '2026-04-19 05:56:17', '2026-03-20 05:58:42', '2026-03-20 05:58:43', '2026-03-20 05:56:17', '2026-03-20 05:58:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(30, 3, '963d13fb42489f9b68ea2b73241eb04932cde7478176681946fadfbb201d6f1c', '4ed0c1a1e744013977419e6257c223379d2eaf10eaa890d7d47ae2c561e3b7db', '2026-03-20 13:58:54', '2026-04-19 05:58:54', '2026-03-20 05:59:32', '2026-03-20 05:59:32', '2026-03-20 05:58:54', '2026-03-20 05:59:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(31, 2, '11d458a03c73f1eb78ea4e4c4b58c313ebc36d305cc6d110b6c03b43743be4ea', '820135adde5cb2373227ec12b37d19ab3e4d818cfecf1a61bdaaedea420f7e58', '2026-03-20 13:59:42', '2026-04-19 05:59:42', '2026-03-20 06:10:04', '2026-03-20 06:10:04', '2026-03-20 05:59:42', '2026-03-20 06:10:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(32, 3, 'c256fa834125f45625d1ebff686f38ee382e665cab211fd0add5fbcca9de66e2', '565797f1addbddaf0b2efcc57a7e73ac1a3c848e41689f4db84a33926ee3f279', '2026-03-20 14:10:10', '2026-04-19 06:10:10', '2026-03-20 06:10:23', '2026-03-20 06:10:23', '2026-03-20 06:10:10', '2026-03-20 06:10:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(33, 2, '3e4e9bfccb63ebcafaddc6a5f4a85f1da9ad6cbfd4d0ec4dd08d1f4b1fab93d5', '4e762689c1b14e571b1cb6877fa39aa86212459a12ba1a79f6d7580b9c50cf5d', '2026-03-20 14:10:33', '2026-04-19 06:10:33', '2026-03-20 06:51:22', '2026-03-20 06:51:22', '2026-03-20 06:10:33', '2026-03-20 06:51:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(34, 3, '74a257ef3a47403685fe9643f27b21f592de4c888e97fcd2caa76d42dcef8e5c', '59fb6f1602fc7764220a2011cf9e34eb051f3b5add74f32491ae343dbc5b262c', '2026-03-20 14:51:30', '2026-04-19 06:51:30', '2026-03-20 07:53:27', '2026-03-20 07:53:27', '2026-03-20 06:51:30', '2026-03-20 07:53:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(35, 2, '451e694a11bae800fb0bc039a055b72d7112999d117306c93acdc6ac892fbd84', 'f08f071603f01e6a4f6eaf35e0ae463f4dbf03a0b520b7d2c0c6a89c929ad730', '2026-03-21 03:14:43', '2026-04-19 07:53:39', '2026-03-20 19:19:47', '2026-03-20 19:19:47', '2026-03-20 07:53:39', '2026-03-20 19:19:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(36, 3, '67c77ae097a724793ecd396c97f09fb76e52d28b63e3bb0f48f17ff776ec0952', '3f5dcf154348713cd67fd72e21ba329da867c38433b28118216d4646d3c4fb47', '2026-03-21 03:19:57', '2026-04-19 19:19:57', '2026-03-20 19:26:50', '2026-03-20 19:26:50', '2026-03-20 19:19:57', '2026-03-20 19:26:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(37, 2, 'db583bd4e3887b3889cc9116bdd448660c475e1f41d4b59fcbb2bcea2f82b592', '8b5c9d9c1666baa51a9ab7e0809b4ee327e2f796466b6535b4007139c2e398e7', '2026-03-21 18:09:31', '2026-04-19 19:27:14', '2026-03-21 10:32:47', '2026-03-21 10:32:47', '2026-03-20 19:27:14', '2026-03-21 10:32:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(38, 3, '21d370376f00367d8e1d1e303680c2a9bcb245bba04a0003fc3fef5265b90415', '8cdeca02d1f8d46c51ee961f9417fba7b96a9e672b9a05cfe59ebe605835804d', '2026-03-21 18:32:56', '2026-04-20 10:32:56', '2026-03-21 10:33:04', '2026-03-21 10:33:04', '2026-03-21 10:32:56', '2026-03-21 10:33:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(39, 2, '17ae2d6cdf4396bf4458301ba54e7c9c0376edfbbc2019af97a9df71e0b26ace', '1e0aa4e13cd51f43a292ffd973b5fbf8abb901fe82e23bd8cce9fd28d2e59f06', '2026-03-21 18:33:14', '2026-04-20 10:33:14', '2026-03-21 12:40:08', '2026-03-21 12:40:08', '2026-03-21 10:33:14', '2026-03-21 12:40:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(40, 3, 'dee04d9aa1007a073ad72dcddf235884594d70c20107c9493fb31a8bceefce2b', 'ec468a335cb53b92c0aa7154f30d93120e0c4090c62dcc6ce356588e748453be', '2026-03-21 20:40:24', '2026-04-20 12:40:24', '2026-03-21 12:40:55', '2026-03-21 12:40:56', '2026-03-21 12:40:24', '2026-03-21 12:40:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(41, 5, '314200d41dd97b97eb1fb17a622b4ed40c1d1cda31113259e84379328aff49a3', '4cb947543a8490addf72547809578107ced86ebf56d1c4bbe86df74b13dc1263', '2026-03-21 20:43:05', '2026-04-20 12:43:05', '2026-03-21 12:47:48', '2026-03-21 12:47:48', '2026-03-21 12:43:05', '2026-03-21 12:47:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(42, 2, '2c23b369fdbc978e8d336465a337ce2b21b8f68d297f9b2ed6dbe7b3f571ff45', 'ee3fa2113a3dd36e25bc8481ee3ef87670258360f20dcba513d75a9f1ffc21dc', '2026-03-21 20:47:55', '2026-04-20 12:47:55', '2026-03-21 17:08:14', '2026-03-21 17:08:14', '2026-03-21 12:47:55', '2026-03-21 17:08:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(43, 3, '25ee08886cd37ee5d196166ccf4cea7ff6f98a706611d83fe50db2a57806d2fe', 'd0acc9578112b1aa4b70300c1f9f6db71abf4789ee215ef2d93f4d9dee6927c9', '2026-03-22 01:08:22', '2026-04-20 17:08:22', '2026-03-21 17:28:43', '2026-03-21 17:28:43', '2026-03-21 17:08:22', '2026-03-21 17:28:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(44, 3, '97d2b22eeff8b71fdb021e1b17c2645c6547e16f1947c3231bfebd1269fd10da', 'fc40876f2cec11358b2b6c65ef0c6f2129849832da58aa447c7c74c528edd58b', '2026-03-22 01:28:45', '2026-04-20 17:28:45', '2026-03-21 17:28:51', '2026-03-21 17:28:51', '2026-03-21 17:28:45', '2026-03-21 17:28:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(45, 2, '3459f562ce86f37123ce56cd4d1dc14d460cf328d1e4124698fc71821a724803', '44a1acaae9d9cc4d946ebf388a952a68648d762322962495c0d8f90e2e217763', '2026-03-22 13:20:35', '2026-04-20 17:29:01', '2026-03-22 08:02:31', '2026-03-22 08:02:31', '2026-03-21 17:29:01', '2026-03-22 08:02:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(46, 5, '271bcbc3f87e31ff46f5447d0b790cdf9f910e7b283312c873b2684d292d635a', '439764081dbe812525e7253de6f282a11269e6b0aa642440b84a8ade6cbb39fe', '2026-03-22 16:02:48', '2026-04-21 08:02:48', '2026-03-22 08:09:56', '2026-03-22 08:09:56', '2026-03-22 08:02:48', '2026-03-22 08:09:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(47, 2, '5737c8543a0a1783a6bd28e88292f6ea8c3fefd6a33b298188faf2a6e52ea6e7', 'ef97a01b749b2af7c7717372fb045e7ccc9543b9e40b14b1eb8d40a732891458', '2026-03-22 16:10:04', '2026-04-21 08:10:04', '2026-03-22 09:52:00', '2026-03-22 09:52:00', '2026-03-22 08:10:04', '2026-03-22 09:52:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(48, 5, '37e9e2a274b6bd440ed092cb5b734b8517f8a47b02b72f467fe8d0bcd11dfbae', 'cf9c45fdde33190cf49e359e79f7c96d48314ee0901b18d79e9156d3fbda1e7b', '2026-03-22 17:52:17', '2026-04-21 09:52:17', '2026-03-22 14:23:15', '2026-03-22 14:23:15', '2026-03-22 09:52:17', '2026-03-22 14:23:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(49, 2, '9b486ceeb8bebb7a82d271ce57a728672c6dbee128361fc741966dc88a0adfb0', 'be3bfe9526571da16957e2d2bd460bef94223ce0c11f7f501d74c1312e4dab5b', '2026-03-22 22:23:24', '2026-04-21 14:23:24', '2026-03-22 14:26:48', '2026-03-22 14:26:48', '2026-03-22 14:23:24', '2026-03-22 14:26:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0),
	(50, 5, 'd1feb172d2637c896bb50ce98a2de8647b3b9afc8440182edac7b515cdd3562d', 'd7fe2dbfa51f991c736aedef2e765d8409c422d7f4d483fc6aa40c07896e6c8a', '2026-03-22 22:27:00', '2026-04-21 14:27:00', '2026-03-22 14:28:11', '2026-03-22 14:28:11', '2026-03-22 14:27:00', '2026-03-22 14:28:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0);

-- Dumping structure for table estate.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.cache: ~0 rows (approximately)

-- Dumping structure for table estate.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.cache_locks: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.jobs: ~8 rows (approximately)
INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
	(1, 'default', '{"uuid":"fd89264a-6b7c-4013-abf3-430b0eb6f7c2","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:17:\\"App\\\\Models\\\\Tenant\\";s:2:\\"id\\";a:1:{i:0;i:1;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:1;s:9:\\"relations\\";a:3:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:1;s:2:\\"id\\";s:36:\\"f4fae2ba-c5dc-4bb5-b29d-5991bc825a3c\\";}s:8:\\"channels\\";a:1:{i:0;s:4:\\"mail\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(2, 'default', '{"uuid":"765c8195-f7aa-4a1d-bf97-c23a34691a0c","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:17:\\"App\\\\Models\\\\Tenant\\";s:2:\\"id\\";a:1:{i:0;i:1;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:1;s:9:\\"relations\\";a:3:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:1;s:2:\\"id\\";s:36:\\"f4fae2ba-c5dc-4bb5-b29d-5991bc825a3c\\";}s:8:\\"channels\\";a:1:{i:0;s:8:\\"database\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(3, 'default', '{"uuid":"6cc80e93-801a-42a8-acfa-793e404c25ab","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:1;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:0;s:2:\\"id\\";s:36:\\"afa7e0c5-ffac-43f8-ac8c-29e13e73bd4a\\";}s:8:\\"channels\\";a:1:{i:0;s:4:\\"mail\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(4, 'default', '{"uuid":"688e8af0-5efb-4757-8e71-879c0f3e0e4c","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:1;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:0;s:2:\\"id\\";s:36:\\"afa7e0c5-ffac-43f8-ac8c-29e13e73bd4a\\";}s:8:\\"channels\\";a:1:{i:0;s:8:\\"database\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(5, 'default', '{"uuid":"9d1f720d-1596-455e-821f-2c6a37664c6a","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:17:\\"App\\\\Models\\\\Tenant\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:2;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:1;s:2:\\"id\\";s:36:\\"1cd70778-d9c6-44ca-82e6-9a081eea321e\\";}s:8:\\"channels\\";a:1:{i:0;s:4:\\"mail\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(6, 'default', '{"uuid":"e0d47695-aff4-4262-b275-1f9102a751ee","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:17:\\"App\\\\Models\\\\Tenant\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:2;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:1;s:2:\\"id\\";s:36:\\"1cd70778-d9c6-44ca-82e6-9a081eea321e\\";}s:8:\\"channels\\";a:1:{i:0;s:8:\\"database\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(7, 'default', '{"uuid":"e0096ca1-9108-48cb-a022-fcddfea65a87","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:2;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:0;s:2:\\"id\\";s:36:\\"393600b1-ebfb-45ee-b91b-2b6358f4b6c9\\";}s:8:\\"channels\\";a:1:{i:0;s:4:\\"mail\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149),
	(8, 'default', '{"uuid":"a4ea0748-cb36-4a96-8ba1-22ab88a38ed8","displayName":"App\\\\Notifications\\\\TenancyEndedNotification","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"data":{"commandName":"Illuminate\\\\Notifications\\\\SendQueuedNotifications","command":"O:48:\\"Illuminate\\\\Notifications\\\\SendQueuedNotifications\\":3:{s:11:\\"notifiables\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";a:1:{i:0;i:2;}s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:12:\\"notification\\";O:42:\\"App\\\\Notifications\\\\TenancyEndedNotification\\":3:{s:7:\\"tenancy\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Tenancy\\";s:2:\\"id\\";i:2;s:9:\\"relations\\";a:4:{i:0;s:6:\\"tenant\\";i:1;s:4:\\"unit\\";i:2;s:13:\\"unit.property\\";i:3;s:19:\\"unit.property.owner\\";}s:10:\\"connection\\";s:5:\\"mysql\\";s:15:\\"collectionClass\\";N;}s:11:\\"isForTenant\\";b:0;s:2:\\"id\\";s:36:\\"393600b1-ebfb-45ee-b91b-2b6358f4b6c9\\";}s:8:\\"channels\\";a:1:{i:0;s:8:\\"database\\";}}"},"createdAt":1773882149,"delay":null}', 0, NULL, 1773882149, 1773882149);

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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.migrations: ~19 rows (approximately)
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
	(27, '2026_03_07_200100_create_security_events_table', 10),
	(28, '2026_03_14_184940_add_payment_fields', 11),
	(29, '2026_03_14_185000_add_payment_indexes_and_cancelled_status', 11),
	(30, '2026_03_20_000001_create_utility_types_table', 11),
	(31, '2026_03_20_000002_create_tenancy_utilities_table', 11),
	(32, '2026_03_20_000003_create_utility_bills_table', 11),
	(33, '2026_03_20_000004_add_utility_bill_id_to_payments_table', 11),
	(34, '2026_03_19_120000_drop_deprecated_utilities_table', 12),
	(35, '2026_03_20_000005_add_pending_status_to_payments_table', 13),
	(36, '2026_03_21_000001_create_rent_bills_table', 14),
	(37, '2026_03_21_000002_add_rent_bill_id_to_payments_table', 14);

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

-- Dumping structure for table estate.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.password_reset_tokens: ~2 rows (approximately)
INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
	('hashirama@estate.com', '$2y$12$2bxYVCdFRFU4ea.AytpFrusPAFzB4I6v0RWBL5ddNCFsbNpV1kAu2', '2026-02-26 17:51:16'),
	('luisosena2@gmail.com', '$2y$12$g84q92NCVoOcAPKwCxkcZO6ozT0jWq6UljaAJQc5ol/DlSruE9xmy', '2026-02-26 17:53:07');

-- Dumping structure for table estate.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint unsigned NOT NULL,
  `tenancy_id` bigint unsigned NOT NULL,
  `rent_bill_id` bigint unsigned DEFAULT NULL,
  `utility_bill_id` bigint unsigned DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('rent','utility') COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('paid','partial','overdue','cancelled','pending') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `receipt_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_tenant_id_index` (`tenant_id`),
  KEY `payments_tenancy_id_index` (`tenancy_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_paid_at_index` (`paid_at`),
  KEY `payments_utility_bill_id_index` (`utility_bill_id`),
  KEY `payments_rent_bill_id_index` (`rent_bill_id`),
  CONSTRAINT `payments_rent_bill_id_foreign` FOREIGN KEY (`rent_bill_id`) REFERENCES `rent_bills` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_tenancy_id_foreign` FOREIGN KEY (`tenancy_id`) REFERENCES `tenancies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_utility_bill_id_foreign` FOREIGN KEY (`utility_bill_id`) REFERENCES `utility_bills` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.payments: ~8 rows (approximately)
INSERT INTO `payments` (`id`, `tenant_id`, `tenancy_id`, `rent_bill_id`, `utility_bill_id`, `amount`, `payment_type`, `payment_method`, `status`, `reference_number`, `notes`, `paid_at`, `due_date`, `receipt_path`, `created_at`, `updated_at`, `deleted_at`) VALUES
	(1, 1, 1, NULL, NULL, 1200.00, 'rent', 'bank_transfer', 'partial', NULL, NULL, '2026-02-18 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-03-01 06:39:20', NULL),
	(2, 1, 1, NULL, NULL, 85.50, 'utility', 'credit_card', 'overdue', NULL, NULL, '2026-02-18 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(3, 1, 1, NULL, NULL, 1200.00, 'rent', 'bank_transfer', 'paid', NULL, NULL, '2026-01-25 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(4, 2, 2, NULL, NULL, 950.00, 'rent', 'cash', 'paid', NULL, NULL, '2026-02-21 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(5, 2, 2, NULL, NULL, 950.00, 'rent', 'bank_transfer', 'paid', NULL, NULL, '2026-01-23 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(6, 3, 3, NULL, NULL, 1500.00, 'rent', 'credit_card', 'partial', NULL, NULL, '2026-02-13 17:46:14', NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(7, 3, 3, NULL, NULL, 120.75, 'utility', 'credit_card', 'overdue', NULL, NULL, NULL, NULL, NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14', NULL),
	(8, 1, 1, NULL, NULL, 400.00, 'utility', 'M Pesa', 'paid', NULL, NULL, '2026-02-28 21:00:00', NULL, NULL, '2026-03-01 06:40:24', '2026-03-01 06:40:24', NULL);

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

-- Dumping data for table estate.properties: ~5 rows (approximately)
INSERT INTO `properties` (`id`, `owner_id`, `name`, `total_units`, `property_type`, `status`, `description`, `amenities`, `policies`, `address`, `city`, `state`, `postal_code`, `country`, `created_at`, `updated_at`) VALUES
	(1, 2, 'Sunrise Apartments', 4, NULL, 'active', NULL, NULL, NULL, '12 Sunrise Avenue, Dar es Salaam', NULL, NULL, NULL, NULL, '2026-02-23 17:46:13', '2026-02-28 15:54:34'),
	(2, 2, 'Hilltop Residences', 4, NULL, 'active', NULL, NULL, NULL, '45 Hilltop Road, Arusha', NULL, NULL, NULL, NULL, '2026-02-23 17:46:13', '2026-03-02 09:06:47'),
	(3, 2, 'Safari', 8, 'apartment', 'active', NULL, '[]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-02 14:36:23', '2026-03-02 14:36:23'),
	(4, 15, 'Jangwani Hotel', 16, 'mixed', 'active', NULL, '[]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-03 12:41:17', '2026-03-03 12:41:17'),
	(5, 17, 'Forest Hill', 10, 'house', 'active', NULL, '["Swimming pool", "Gym"]', '[]', '143 Main Street', 'Dar Es Salaam', 'Dar', '10056', 'Tanzania', '2026-03-03 12:42:52', '2026-03-03 12:42:52');

-- Dumping structure for table estate.rent_bills
CREATE TABLE IF NOT EXISTS `rent_bills` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenancy_id` bigint unsigned NOT NULL,
  `billing_month` date NOT NULL,
  `amount_due` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT '0.00',
  `due_date` date NOT NULL,
  `status` enum('pending','paid','partial','overdue','waived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rent_bill_month` (`tenancy_id`,`billing_month`),
  KEY `rent_bills_tenancy_id_index` (`tenancy_id`),
  KEY `rent_bills_billing_month_index` (`billing_month`),
  KEY `rent_bills_status_index` (`status`),
  KEY `rent_bills_due_date_index` (`due_date`),
  CONSTRAINT `rent_bills_tenancy_id_foreign` FOREIGN KEY (`tenancy_id`) REFERENCES `tenancies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.rent_bills: ~0 rows (approximately)

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

-- Dumping data for table estate.sessions: ~3 rows (approximately)
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
	('3DeR47XzTAQxklR0PKH1C7QWYnF4xL2d0Vv9BvVV', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoieGxCelhqWXdMYXp1YXgyUm40VmY0b3M3eExqQUxrNEltR1NuT2lXWSI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czo1NzoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2xhbmRsb3JkL25vdGlmaWNhdGlvbnMvdW5yZWFkLWNvdW50Ijt9czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sYW5kbG9yZC9ub3RpZmljYXRpb25zL3VucmVhZC1jb3VudCI7czo1OiJyb3V0ZSI7czozNToibGFuZGxvcmQubm90aWZpY2F0aW9ucy51bnJlYWQtY291bnQiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1774165229),
	('Rvs7hXg7syuZOLRjtfhvu15vfOOlkp6HyUJoGrmP', NULL, NULL, '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieU54MUFzWW5wMGRGSjVQSWZ3YVNSY3ZFVll0OThzaG9TeWtIdDI2ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6ODoiaHR0cDovLzoiO3M6NToicm91dGUiO3M6Nzoid2VsY29tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1774183278),
	('VaNFu1knBPe4E5YI4lMkYbMLLTPDyZr6qGhmsd0k', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiOGZlQUxja3lHOThtQTd0elRFT1JJUmE0T0NmMEdSN3U0TnpYUERLRiI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozOToiaHR0cDovL2xvY2FsaG9zdDo4MDAwL2xhbmRsb3JkL3BheW1lbnRzIjt9czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7czo1OiJyb3V0ZSI7czo1OiJsb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1774169106);

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
INSERT INTO `tenancies` (`id`, `tenant_id`, `unit_id`, `move_in_date`, `move_out_date`, `end_reason`, `deposit_return_status`, `final_meter_readings`, `monthly_rent`, `security_deposit`, `tenancy_agreement_path`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, 9, '2025-08-20', '2026-03-10', 'automatic_expiry', 'pending', 'Automatically ended - no readings recorded', 120000.00, 300000.00, NULL, 'ended', '2026-02-23 17:46:14', '2026-03-18 22:02:29'),
	(2, 2, 2, '2025-11-23', '2026-03-06', 'automatic_expiry', 'pending', 'Automatically ended - no readings recorded', 150000.00, 0.00, NULL, 'ended', '2026-02-23 17:46:14', '2026-03-18 22:02:29'),
	(3, 3, 3, '2026-01-23', NULL, NULL, NULL, NULL, 200000.00, NULL, NULL, 'active', '2026-02-23 17:46:14', '2026-03-02 12:30:59'),
	(4, 11, 5, '2026-02-27', NULL, NULL, NULL, NULL, 250000.00, NULL, NULL, 'active', '2026-02-26 17:41:36', '2026-03-02 12:30:59'),
	(5, 12, 4, '2026-02-28', NULL, NULL, NULL, NULL, 300000.00, NULL, NULL, 'active', '2026-02-27 12:24:56', '2026-03-02 12:30:59');

-- Dumping structure for table estate.tenancy_utilities
CREATE TABLE IF NOT EXISTS `tenancy_utilities` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenancy_id` bigint unsigned NOT NULL,
  `utility_type_id` bigint unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `billing_cycle` enum('monthly','quarterly','annual') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meter_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','suspended','disconnected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenancy_utility` (`tenancy_id`,`utility_type_id`),
  KEY `tenancy_utilities_tenancy_id_index` (`tenancy_id`),
  KEY `tenancy_utilities_utility_type_id_index` (`utility_type_id`),
  KEY `tenancy_utilities_status_index` (`status`),
  CONSTRAINT `tenancy_utilities_tenancy_id_foreign` FOREIGN KEY (`tenancy_id`) REFERENCES `tenancies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenancy_utilities_utility_type_id_foreign` FOREIGN KEY (`utility_type_id`) REFERENCES `utility_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.tenancy_utilities: ~0 rows (approximately)
INSERT INTO `tenancy_utilities` (`id`, `tenancy_id`, `utility_type_id`, `amount`, `billing_cycle`, `provider`, `account_number`, `meter_number`, `status`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 4, 1, 10000.00, 'monthly', NULL, NULL, NULL, 'active', NULL, '2026-03-22 14:25:29', '2026-03-22 14:25:29');

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

-- Dumping data for table estate.units: ~9 rows (approximately)
INSERT INTO `units` (`id`, `unit_code`, `unit_name`, `status`, `created_at`, `updated_at`, `property_id`) VALUES
	(1, 'A101', 'Studio Apartment - Ground Floor', 'available', '2026-02-23 17:46:13', '2026-02-28 15:56:46', 1),
	(2, 'A102', '1 Bedroom - Ground Floor', 'available', '2026-02-23 17:46:13', '2026-03-18 22:02:29', 1),
	(3, 'A201', '2 Bedroom - First Floor', 'occupied', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 1),
	(4, 'B101', '2 Bedroom - Ground Floor', 'occupied', '2026-02-23 17:46:13', '2026-02-27 12:24:56', 2),
	(5, 'B201', '3 Bedroom Penthouse', 'available', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 2),
	(8, '808', 'por', 'available', '2026-02-23 17:46:13', '2026-02-23 17:46:13', 1),
	(9, 'A111', 'Rooftop', 'available', '2026-02-28 15:54:34', '2026-03-18 22:02:29', 1),
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
INSERT INTO `users` (`id`, `tenant_id`, `name`, `username`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `role`, `last_login_at`, `created_at`, `updated_at`) VALUES
	(1, NULL, 'Admin User', 'admin', 'admin@example.com', NULL, '$2y$12$4XikjO0E1Ax3JjbQNxVcnO9CJIrorrYsWZebNqcQW94CDvijzwtXy', NULL, NULL, NULL, NULL, 'admin', '2026-03-13 08:47:06', '2026-02-23 17:46:13', '2026-03-13 08:47:06'),
	(2, NULL, 'Landlord User', 'landlord', 'landlord@example.com', '2026-03-02 15:53:43', '$2y$12$lw8i6swl18DkS3jVOrYsEuaLJs6sgoK8bGRG/OCd61DOPrhS9R3lS', NULL, NULL, NULL, NULL, 'landlord', '2026-03-22 14:23:24', '2026-02-23 17:46:13', '2026-03-22 14:23:24'),
	(3, 1, 'John Doe', 'johndoe', 'john.doe@example.com', NULL, '$2y$12$nDufGb8k1HD0IVnQU28GyeKvqvos2W6bHwK1Yn/uviSI2pALX354O', NULL, NULL, NULL, NULL, 'tenant', '2026-03-21 17:28:45', '2026-02-23 17:46:14', '2026-03-21 17:28:45'),
	(4, 2, 'Sarah Johnson', 'sarahj', 'sarah.j@example.com', NULL, '$2y$12$TgF6/ygBe.oNQniNuFQtv.DeY.HXs/bJapqG0LINvTnhQUg96V3cm', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-23 17:46:14', '2026-02-23 17:46:14'),
	(5, 3, 'Michael Smith', 'michaels', 'michael.smith@example.com', NULL, '$2y$12$D9pLbteiKMxFpHovmfLfZeAxIrquAVXaXsybdqutjD2Ev8LGrKktu', NULL, NULL, NULL, NULL, 'tenant', '2026-03-22 14:27:00', '2026-02-23 17:46:14', '2026-03-22 14:27:00'),
	(13, 11, 'hashirama', 'hashirama_4385', 'luisosena2@gmail.com', NULL, '$2y$12$yRXo6KCCSSnjLBsHl8SjSeNXlX6how69msejysbyWNg7NobRBqLT6', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-26 17:41:36', '2026-02-26 17:41:36'),
	(14, 12, 'madara', 'madara_7613', 'madara@estate.com', NULL, '$2y$12$L3hf2fca/Z4qgsJD6G50q.m8dFT6wWIpT4xs4D..M4LmsBBB6eBvq', NULL, NULL, NULL, NULL, 'tenant', NULL, '2026-02-27 12:24:56', '2026-02-27 12:24:56'),
	(15, NULL, 'Second Landlord', 'landlord2', 'landlord2@estate.com', NULL, '$2y$12$yIJ6axazgLWoptxJiJt72udghjR.auACFtgThJaEfkwsUF/UBgDHS', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:00:14', '2026-03-02 16:00:14'),
	(16, NULL, 'Third Landlord', 'landlord3', 'landlord3@estate.com', NULL, '$2y$12$MITaZ8So41DL3ClRIFSG6.88HogD8l7KMba.2lt0Wp6YEKBjuu4tm', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:15:28', '2026-03-02 16:15:28'),
	(17, NULL, 'Forth Landlord', 'landlord4', 'landlord4@estate.com', NULL, '$2y$12$qkSfba2DE0iy/IGy/l91FuFirOP1Y6J/1/QKcFJR70aeGAaYh1zUi', NULL, NULL, NULL, NULL, 'landlord', NULL, '2026-03-02 16:20:13', '2026-03-02 16:20:13');

-- Dumping structure for table estate.utility_bills
CREATE TABLE IF NOT EXISTS `utility_bills` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tenancy_utility_id` bigint unsigned NOT NULL,
  `billing_month` date NOT NULL,
  `units_consumed` decimal(10,3) DEFAULT NULL,
  `amount_due` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT '0.00',
  `due_date` date NOT NULL,
  `status` enum('pending','paid','partial','overdue','waived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_utility_bill_month` (`tenancy_utility_id`,`billing_month`),
  KEY `utility_bills_tenancy_utility_id_index` (`tenancy_utility_id`),
  KEY `utility_bills_billing_month_index` (`billing_month`),
  KEY `utility_bills_status_index` (`status`),
  KEY `utility_bills_due_date_index` (`due_date`),
  CONSTRAINT `utility_bills_tenancy_utility_id_foreign` FOREIGN KEY (`tenancy_utility_id`) REFERENCES `tenancy_utilities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.utility_bills: ~0 rows (approximately)

-- Dumping structure for table estate.utility_types
CREATE TABLE IF NOT EXISTS `utility_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_metered` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table estate.utility_types: ~8 rows (approximately)
INSERT INTO `utility_types` (`id`, `name`, `unit`, `description`, `is_metered`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'Water', 'cubic metres', 'Water consumption billed by meter reading', 1, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(2, 'Electricity', 'kWh', 'Electricity consumption billed by meter reading', 1, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(3, 'Gas', 'cubic metres', 'Gas consumption billed by meter reading', 1, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(4, 'Internet', 'flat rate', 'Fixed monthly internet subscription', 0, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(5, 'Security', 'flat rate', 'Monthly security/guard service fee', 0, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(6, 'Janitor', 'flat rate', 'Monthly cleaning and maintenance fee', 0, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(7, 'Garbage', 'flat rate', 'Monthly refuse collection fee', 0, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51'),
	(8, 'Parking', 'flat rate', 'Monthly parking fee', 0, 1, '2026-03-18 19:07:51', '2026-03-18 19:07:51');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
