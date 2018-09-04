/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50722
 Source Host           : localhost:3306
 Source Schema         : cnloop

 Target Server Type    : MySQL
 Target Server Version : 50722
 File Encoding         : 65001

 Date: 03/09/2018 03:10:45
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int(11) NULL DEFAULT NULL,
  `topic_id` int(11) NULL DEFAULT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 76 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comments_like
-- ----------------------------
DROP TABLE IF EXISTS `comments_like`;
CREATE TABLE `comments_like`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comments_son
-- ----------------------------
DROP TABLE IF EXISTS `comments_son`;
CREATE TABLE `comments_son`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_comment_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comments_son_like
-- ----------------------------
DROP TABLE IF EXISTS `comments_son_like`;
CREATE TABLE `comments_son_like`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment_son_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for loggers
-- ----------------------------
DROP TABLE IF EXISTS `loggers`;
CREATE TABLE `loggers`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_collection_topic
-- ----------------------------
DROP TABLE IF EXISTS `notices_collection_topic`;
CREATE TABLE `notices_collection_topic`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_comment_parent_comment
-- ----------------------------
DROP TABLE IF EXISTS `notices_comment_parent_comment`;
CREATE TABLE `notices_comment_parent_comment`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_comment_topic
-- ----------------------------
DROP TABLE IF EXISTS `notices_comment_topic`;
CREATE TABLE `notices_comment_topic`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_like_comment
-- ----------------------------
DROP TABLE IF EXISTS `notices_like_comment`;
CREATE TABLE `notices_like_comment`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_like_comment_son
-- ----------------------------
DROP TABLE IF EXISTS `notices_like_comment_son`;
CREATE TABLE `notices_like_comment_son`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for notices_like_topic
-- ----------------------------
DROP TABLE IF EXISTS `notices_like_topic`;
CREATE TABLE `notices_like_topic`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_user_id` int(11) NOT NULL,
  `sender_avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `sender_username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `receiver_user_id` int(11) NOT NULL,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `topic_id` int(11) NOT NULL,
  `isRead` tinyint(1) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for reports
-- ----------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports`  (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `evidence` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for topics
-- ----------------------------
DROP TABLE IF EXISTS `topics`;
CREATE TABLE `topics`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `browsed` int(11) NULL DEFAULT 1,
  `createdAt` bigint(20) NULL DEFAULT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 83 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for topics_collection
-- ----------------------------
DROP TABLE IF EXISTS `topics_collection`;
CREATE TABLE `topics_collection`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for topics_like
-- ----------------------------
DROP TABLE IF EXISTS `topics_like`;
CREATE TABLE `topics_like`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `nickname` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `password` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `github_email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `motto` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `grade` int(11) NULL DEFAULT 0,
  `last_login` bigint(20) NULL DEFAULT NULL,
  `createdAt` bigint(20) NULL DEFAULT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 93 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users_follow
-- ----------------------------
DROP TABLE IF EXISTS `users_follow`;
CREATE TABLE `users_follow`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `following_user_id` int(11) NOT NULL,
  `createdAt` bigint(20) NOT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 84 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users_message
-- ----------------------------
DROP TABLE IF EXISTS `users_message`;
CREATE TABLE `users_message`  (
  `id` int(11) NOT NULL,
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `status` tinyint(1) NULL DEFAULT 0,
  `createdAt` bigint(20) NULL DEFAULT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users_status
-- ----------------------------
DROP TABLE IF EXISTS `users_status`;
CREATE TABLE `users_status`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NULL DEFAULT NULL,
  `createdAt` bigint(20) NULL DEFAULT NULL,
  `updatedAt` bigint(20) NULL DEFAULT NULL,
  `deletedAt` bigint(20) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 48 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
