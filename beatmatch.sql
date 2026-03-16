-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: beatmatch
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `beatmatch`
--

-- CREATE DATABASE removed for Aiven compatibility

-- USE removed for Aiven compatibility

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (1,'Rhythm Beginner','Complete 10 total games'),(2,'Combo Starter','Achieve a 15+ streak in a single game'),(3,'Score Hunter','Score 5000+ points in one game'),(4,'Accuracy Master','Achieve 95%+ accuracy for 5 consecutive games'),(5,'Top Contender','Reach Top 3 on leaderboard'),(6,'BeatMatch Champion','Stay Rank #1 for 10 days'),(7,'Survival Pro','Survive 15 levels without losing both wrong attempts'),(8,'Rhythm Dominator','Achieve 20+ streak and 95% accuracy in same game');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_sessions`
--

DROP TABLE IF EXISTS `game_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `accuracy` float DEFAULT NULL,
  `level_reached` int DEFAULT NULL,
  `max_combo` int DEFAULT NULL,
  `played_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_score` (`score` DESC),
  CONSTRAINT `game_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_sessions`
--

LOCK TABLES `game_sessions` WRITE;
/*!40000 ALTER TABLE `game_sessions` DISABLE KEYS */;
INSERT INTO `game_sessions` VALUES (3,1,300,100,3,2,'2026-03-07 11:59:58'),(4,1,150,100,2,1,'2026-03-07 12:00:42'),(5,1,150,100,2,1,'2026-03-07 12:11:17'),(6,1,500,84.6,4,0,'2026-03-07 12:12:01'),(7,1,500,78.6,4,0,'2026-03-07 12:12:01'),(8,1,500,83.3,4,0,'2026-03-07 12:15:42'),(9,1,500,76.9,4,0,'2026-03-07 12:15:42'),(10,1,300,75,3,0,'2026-03-07 12:16:18'),(11,1,300,66.7,3,0,'2026-03-07 12:16:18'),(12,1,500,83.3,4,0,'2026-03-07 12:30:54'),(13,1,950,90.5,6,0,'2026-03-07 12:37:40'),(14,1,150,100,2,1,'2026-03-07 12:49:59'),(15,1,700,93.3,5,3,'2026-03-07 12:51:02'),(16,3,2700,94.7,12,9,'2026-03-07 12:59:25'),(17,1,300,100,3,2,'2026-03-07 16:21:04'),(18,4,950,88.5,6,3,'2026-03-07 18:45:36'),(19,5,700,88.9,5,3,'2026-03-07 19:16:43'),(20,5,3900,96.6,16,11,'2026-03-07 19:20:23'),(21,1,300,100,3,2,'2026-03-07 20:24:49'),(22,1,150,80,2,1,'2026-03-09 08:30:28'),(23,1,150,100,2,1,'2026-03-09 15:47:56'),(24,6,1500,92.1,8,4,'2026-03-09 18:21:37'),(25,7,2100,90.2,10,6,'2026-03-09 18:27:44'),(26,1,3600,92.5,15,6,'2026-03-09 19:43:40'),(27,7,2100,95.7,10,8,'2026-03-10 19:21:43'),(28,4,150,60,2,1,'2026-03-11 12:12:38'),(29,4,4500,91.3,18,5,'2026-03-11 12:18:26'),(30,4,150,100,2,1,'2026-03-11 12:26:29'),(31,8,2400,88.5,11,2,'2026-03-11 20:17:45'),(32,5,300,75,3,2,'2026-03-12 20:56:54'),(33,7,150,100,2,1,'2026-03-13 17:08:16'),(34,7,0,0,1,0,'2026-03-13 17:08:19'),(35,7,0,0,1,0,'2026-03-13 17:08:45'),(36,7,1200,89.7,7,3,'2026-03-13 17:10:35'),(37,5,500,81.3,4,3,'2026-03-13 18:07:49'),(38,5,500,76.5,4,3,'2026-03-13 18:07:49'),(39,5,500,72.2,4,3,'2026-03-13 18:07:50'),(40,7,150,100,2,1,'2026-03-13 18:26:10'),(41,7,150,100,2,1,'2026-03-13 18:26:11'),(42,7,150,100,2,1,'2026-03-13 18:27:07'),(43,7,150,60,2,1,'2026-03-13 18:33:14'),(44,7,150,75,2,1,'2026-03-13 18:33:45'),(45,1,300,100,3,2,'2026-03-13 19:43:43'),(46,1,500,90.9,4,3,'2026-03-13 19:45:30'),(47,1,300,100,3,2,'2026-03-13 20:06:02'),(48,1,300,100,3,2,'2026-03-13 20:06:03');
/*!40000 ALTER TABLE `game_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `player_stats`
--

DROP TABLE IF EXISTS `player_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_stats` (
  `user_id` int NOT NULL,
  `highest_score` int DEFAULT '0',
  `total_score` int DEFAULT '0',
  `avg_accuracy` float DEFAULT '0',
  `highest_level` int DEFAULT '0',
  `highest_combo` int DEFAULT '0',
  `games_played` int DEFAULT '0',
  `highest_accuracy` float DEFAULT '0',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `player_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player_stats`
--

LOCK TABLES `player_stats` WRITE;
/*!40000 ALTER TABLE `player_stats` DISABLE KEYS */;
INSERT INTO `player_stats` VALUES (1,3600,9800,85.1333,15,6,17,100),(3,2700,2700,47.35,12,9,1,94.7),(4,4500,5750,67.96,18,5,4,100),(5,3900,6400,70.0714,16,11,6,96.6),(6,1500,1500,46.05,8,4,1,92.1),(7,2100,6300,67.55,10,8,11,100),(8,2400,2400,44.25,11,2,1,88.5),(9,0,0,0,0,0,0,0);
/*!40000 ALTER TABLE `player_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `user_id` int NOT NULL,
  `achievement_id` int NOT NULL,
  `unlocked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
INSERT INTO `user_achievements` VALUES (1,1,'2026-03-13 19:43:43'),(1,4,'2026-03-13 19:43:43'),(1,7,'2026-03-13 19:43:43'),(5,4,'2026-03-12 20:56:55'),(5,7,'2026-03-12 20:56:55'),(7,1,'2026-03-13 18:33:14'),(7,4,'2026-03-13 17:08:17');
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Bhabs123','scrypt:32768:8:1$GXaBVLLCEoXcLMfk$deef5f48bbe0bcbb9c9647bd1548e6ba1cf5629786bafd11f9857480ceaa29229a0c7cf4fa4c34e4ff5f2c32e902109d5a54232b98ba23a30fb9e42765c5e470','2026-03-07 09:39:40','bhabani.panda2005@gmail.com'),(3,'Vinsmoke','scrypt:32768:8:1$A57XOcTD7q1Bm2kQ$0a323de4afb966387c20a58bf9db32aafa05867e06c1ff848e582de0b17669159ac37caa374f127d50656182e73006616fb6ecb612d126cc8a506d7a742600c7','2026-03-07 12:56:44','seenu@gmail.com'),(4,'Gupta','scrypt:32768:8:1$i1ZdHsrdLQ3N9au1$9896563034a62a6d57e69a3f674066eccda50fade3cd842a9faec073f09d335cf163ed4d189c6ad1428fd2cd2f2cd240c7d177c0e7624b29c0870f617f74ce3c','2026-03-07 18:43:39','gupta@123'),(5,'Sim','scrypt:32768:8:1$HgYKQ5fLstDWefJo$94a8fa512159f89084193645d796bcc1b97ed6804804d39cecb2b79c3bacb42f814c2884ca0ca717191554144e2d2c22c4ca91979d3ada727feafeebd63258c1','2026-03-07 19:08:28','sim@a.com'),(6,'Rohit','scrypt:32768:8:1$OfevRDFXvIIOezhQ$233b1e53aade03acef617ba58d89fef6893f57d09db439baccf68973f5b634d32ca1d341e0ca80be1c94bd95d9d9350c2b83b6afbe4354a37ae7bef914c9127f','2026-03-09 18:19:48','r@123.com'),(7,'adil32','scrypt:32768:8:1$29sh8XPjBGT6hqCd$406a9f7916a4656262d5ec4a1514ef11a7bea59b160ec14a5d3b26f031e05fe254d773f8f747793782a46d38b5cc3f9c8a3b5e592723bc932d348676035fbfae','2026-03-09 18:25:13','adil@.in'),(8,'Abhay','scrypt:32768:8:1$qu5L5xIQXd78CMNp$3544cb68790ce8ac45bd7baafb252808604225c30d1a03cd92724b5b5d27e2c2df96be953cc98e72f4bea72546cc814b859aab1644d417de409d740bf4f62a19','2026-03-11 20:11:29','a@123.com'),(9,'Shanks','scrypt:32768:8:1$a5fZT6GshoSrYpZb$bea4b89bd0f47d8b57219f5939c37c3d0103a7d584cc660d8378652e61bf308c3edbf918d3f59df5eb2cae8fe63fed7177a0362a373a943b52f20927d104effe','2026-03-13 20:07:47','shank@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-14  2:15:59
