-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 17, 2025 at 05:38 PM
-- Server version: 5.7.23-23
-- PHP Version: 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jayamdes_nyraabackend`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'Administrator',
  `avatar` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `joinDate` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8_unicode_ci DEFAULT 'Active',
  `lastLogin` datetime DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `name`, `role`, `avatar`, `phone`, `department`, `joinDate`, `status`, `lastLogin`, `permissions`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', 'admin@nyraa.com', '$2a$10$WIHIgeXII5jHFoXyw4voKOriwANRg9.1zFA1JUyJAy6oqznB9GzKW', 'Admin ', 'Administrator', 'http://localhost:5000/uploads/avatars/1750485183249-450812933-admin profile.jpg', '+91 98765 43210', 'Administration', '2025-06-19', 'Active', '2025-07-17 04:37:01', NULL, '2025-06-19 11:11:38', '2025-07-17 04:37:01');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `cat_slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8_unicode_ci DEFAULT 'active',
  `parentId` bigint(20) UNSIGNED DEFAULT NULL,
  `sortOrder` int(11) DEFAULT '0',
  `seoTitle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `seoDescription` text COLLATE utf8_unicode_ci,
  `featured` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category`, `description`, `cat_slug`, `image`, `status`, `parentId`, `sortOrder`, `seoTitle`, `seoDescription`, `featured`, `createdAt`, `updatedAt`) VALUES
(15, 'Tops', 'Elevate your style with this Elegant Rose Gold Dress', 'tops', NULL, 'active', NULL, 0, NULL, NULL, 0, '2025-07-14 06:42:11', '2025-07-15 11:54:37'),
(17, 'Pants', 'test', 'pants', NULL, 'active', NULL, 0, NULL, NULL, 0, '2025-07-15 08:54:08', '2025-07-17 09:39:30');

-- --------------------------------------------------------

--
-- Table structure for table `colors`
--

CREATE TABLE `colors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `sortOrder` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `colors`
--

INSERT INTO `colors` (`id`, `name`, `isActive`, `createdAt`, `updatedAt`, `sortOrder`) VALUES
(4, 'blue', 1, '2025-06-24 08:25:52', '2025-06-28 12:21:49', 10),
(5, 'grey', 1, '2025-06-24 08:26:26', '2025-06-28 12:25:39', 1),
(8, 'Black', 1, '2025-06-24 11:25:09', '2025-07-14 04:45:40', 6),
(13, 'Maroon', 1, '2025-06-24 11:25:45', '2025-06-30 05:55:13', 2),
(14, 'Sky Blue', 1, '2025-06-24 11:25:56', '2025-06-28 12:01:38', 8),
(15, 'red', 1, '2025-06-25 11:32:22', '2025-07-14 04:45:40', 5),
(16, 'royalblue', 1, '2025-06-27 06:25:01', '2025-06-28 12:01:31', 7);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `shortDescription` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `discount` int(11) DEFAULT '0',
  `categoryId` bigint(20) UNSIGNED DEFAULT NULL,
  `brand` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `material` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `style` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` json DEFAULT NULL,
  `stock` int(11) DEFAULT '0',
  `lowStockThreshold` int(11) DEFAULT '10',
  `availability` enum('in_stock','out_of_stock','pre_order','discontinued') COLLATE utf8_unicode_ci DEFAULT 'in_stock',
  `status` enum('active','inactive','draft') COLLATE utf8_unicode_ci DEFAULT 'active',
  `featured` tinyint(1) DEFAULT '0',
  `rating` decimal(3,2) DEFAULT '0.00',
  `reviewCount` int(11) DEFAULT '0',
  `seoTitle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `seoDescription` text COLLATE utf8_unicode_ci,
  `metaKeywords` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `variants` json NOT NULL,
  `specifications` json DEFAULT NULL,
  `shippingInfo` json DEFAULT NULL,
  `warranty` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `returnPolicy` text COLLATE utf8_unicode_ci,
  `viewCount` int(11) DEFAULT '0',
  `salesCount` int(11) DEFAULT '0',
  `lastStockUpdate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `cat_slug` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `shortDescription`, `slug`, `discount`, `categoryId`, `brand`, `tags`, `images`, `material`, `style`, `weight`, `dimensions`, `stock`, `lowStockThreshold`, `availability`, `status`, `featured`, `rating`, `reviewCount`, `seoTitle`, `seoDescription`, `metaKeywords`, `variants`, `specifications`, `shippingInfo`, `warranty`, `returnPolicy`, `viewCount`, `salesCount`, `lastStockUpdate`, `createdAt`, `updatedAt`, `cat_slug`) VALUES
(22, 'Casual Denim Shirt', 'Elevate your style with this Elegant Rose Gold Dress, crafted from premium silk for comfort and durability. Its elegant design is perfect for formal or casual occasions. Easy to care for: dry clean only.', NULL, 'casual-denim-shirt', 0, 15, 'GlamCove', '\"maxi\"', '[\"http://localhost:5000/uploads/products/1752475535116-318123409-01.avif?cb=1752574376014?cb=1752575571741?cb=1752575581527?cb=1752575614556?cb=1752575785389?cb=1752576499814?cb=1752576846339?cb=1752577030191?cb=1752577699182?cb=1752577915789?cb=1752580245499?cb=1752580257296?cb=1752742681977?cb=1752742703352?cb=1752743669327?cb=1752743778577?cb=1752746144340?cb=1752747644961?cb=1752747658284?cb=1752747774222?cb=1752747784530?cb=1752749591674?cb=1752749601909?cb=1752753761459?cb=1752753798423\", \"http://localhost:5000/uploads/products/1752475535119-908362673-02.webp?cb=1752574376014?cb=1752575571741?cb=1752575581527?cb=1752575614556?cb=1752575785389?cb=1752576499814?cb=1752576846339?cb=1752577030191?cb=1752577699182?cb=1752577915789?cb=1752580245499?cb=1752580257296?cb=1752742681977?cb=1752742703352?cb=1752743669327?cb=1752743778577?cb=1752746144340?cb=1752747644961?cb=1752747658284?cb=1752747774222?cb=1752747784530?cb=1752749591674?cb=1752749601909?cb=1752753761459?cb=1752753798423\", \"http://localhost:5000/uploads/products/1752475535120-745653752-03 - Copy.webp?cb=1752574376014?cb=1752575571741?cb=1752575581527?cb=1752575614556?cb=1752575785389?cb=1752576499814?cb=1752576846339?cb=1752577030191?cb=1752577699182?cb=1752577915789?cb=1752580245499?cb=1752580257296?cb=1752742681977?cb=1752742703352?cb=1752743669327?cb=1752743778577?cb=1752746144340?cb=1752747644961?cb=1752747658284?cb=1752747774222?cb=1752747784530?cb=1752749591674?cb=1752749601909?cb=1752753761459?cb=1752753798423\"]', 'Denim', NULL, NULL, NULL, 4, 10, 'in_stock', 'active', 0, 0.00, 0, 'Cotton T-Shirt - Casual Wear', 'Elevate your style with this Elegant Rose Gold Dress', 't-shirt, cotton, casual, red, blue', '[{\"size\": \"S\", \"color\": \"grey\", \"price\": 3400, \"originalPrice\": 4500}]', '[{\"Type\": \"cardigon\", \"Detail\": \"front design\", \"Fabric\": \"wool blend\", \"Quantity\": 2}]', NULL, NULL, NULL, 266, 0, NULL, '2025-07-14 06:45:35', '2025-07-17 12:04:17', 'tops');

-- --------------------------------------------------------

--
-- Table structure for table `sizes`
--

CREATE TABLE `sizes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `sizes`
--

INSERT INTO `sizes` (`id`, `name`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'S', 1, '2025-06-27 10:14:22', '2025-06-27 10:33:47'),
(2, 'L', 1, '2025-06-27 10:33:40', '2025-06-27 10:33:40'),
(3, 'M', 1, '2025-07-01 10:45:27', '2025-07-01 10:45:27'),
(4, 'XL', 1, '2025-07-01 10:45:34', '2025-07-01 10:45:34'),
(5, 'XXL', 1, '2025-07-01 10:45:38', '2025-07-01 10:45:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `joinDate` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'user',
  `provider` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `otp` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `otpExpires` bigint(20) DEFAULT NULL,
  `status` enum('Active','Inactive','Blocked') COLLATE utf8_unicode_ci DEFAULT 'Active',
  `dateOfBirth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8_unicode_ci DEFAULT NULL,
  `addresses` json DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `totalOrders` int(11) DEFAULT '0',
  `totalSpent` decimal(10,2) DEFAULT '0.00',
  `loyaltyPoints` int(11) DEFAULT '0',
  `referralCode` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `source` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastOrderDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `avatar`, `joinDate`, `role`, `provider`, `otp`, `otpExpires`, `status`, `dateOfBirth`, `gender`, `addresses`, `preferences`, `totalOrders`, `totalSpent`, `loyaltyPoints`, `referralCode`, `source`, `lastOrderDate`, `createdAt`, `updatedAt`) VALUES
(1, 'jayamweb.developer2@gmail.com', NULL, 'JayamWeb Developer2', '9876543210', 'https://lh3.googleusercontent.com/a/ACg8ocJ4W6yPAoavL5pdo6KDpzBxGVOOv3EDqjmmLuoe-3Uph9F3DA=s96-c', '2025-06-19', 'user', 'google', NULL, NULL, 'Active', NULL, NULL, NULL, NULL, 0, 0.00, 0, NULL, NULL, NULL, '2025-06-19 11:07:00', '2025-06-20 10:36:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `username_14` (`username`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `username_15` (`username`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `username_16` (`username`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `username_17` (`username`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `username_18` (`username`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `username_19` (`username`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `username_20` (`username`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `username_21` (`username`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `username_22` (`username`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `username_23` (`username`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `username_24` (`username`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `username_25` (`username`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `username_26` (`username`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `username_27` (`username`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `username_28` (`username`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `username_29` (`username`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `username_30` (`username`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `username_31` (`username`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `username_32` (`username`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`cat_slug`),
  ADD UNIQUE KEY `slug_2` (`cat_slug`),
  ADD UNIQUE KEY `slug_3` (`cat_slug`),
  ADD UNIQUE KEY `slug_4` (`cat_slug`),
  ADD UNIQUE KEY `slug_5` (`cat_slug`),
  ADD UNIQUE KEY `slug_6` (`cat_slug`),
  ADD UNIQUE KEY `slug_7` (`cat_slug`),
  ADD UNIQUE KEY `slug_8` (`cat_slug`),
  ADD UNIQUE KEY `slug_9` (`cat_slug`),
  ADD UNIQUE KEY `slug_10` (`cat_slug`),
  ADD UNIQUE KEY `slug_11` (`cat_slug`),
  ADD UNIQUE KEY `slug_12` (`cat_slug`),
  ADD UNIQUE KEY `slug_13` (`cat_slug`),
  ADD UNIQUE KEY `slug_14` (`cat_slug`),
  ADD UNIQUE KEY `slug_15` (`cat_slug`),
  ADD UNIQUE KEY `slug_16` (`cat_slug`),
  ADD UNIQUE KEY `slug_17` (`cat_slug`),
  ADD UNIQUE KEY `slug_18` (`cat_slug`),
  ADD UNIQUE KEY `slug_19` (`cat_slug`),
  ADD UNIQUE KEY `slug_20` (`cat_slug`),
  ADD UNIQUE KEY `slug_21` (`cat_slug`),
  ADD UNIQUE KEY `slug_22` (`cat_slug`),
  ADD UNIQUE KEY `slug_23` (`cat_slug`),
  ADD UNIQUE KEY `slug_24` (`cat_slug`),
  ADD UNIQUE KEY `slug_25` (`cat_slug`),
  ADD UNIQUE KEY `slug_26` (`cat_slug`),
  ADD UNIQUE KEY `slug_27` (`cat_slug`),
  ADD UNIQUE KEY `slug_28` (`cat_slug`),
  ADD UNIQUE KEY `slug_29` (`cat_slug`),
  ADD KEY `categories_slug` (`cat_slug`),
  ADD KEY `categories_status` (`status`),
  ADD KEY `categories_parent_id` (`parentId`),
  ADD KEY `categories_featured` (`featured`),
  ADD KEY `categories_sort_order` (`sortOrder`),
  ADD KEY `categories_name` (`category`),
  ADD KEY `categories_category` (`category`),
  ADD KEY `categories_cat_slug` (`cat_slug`);

--
-- Indexes for table `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `slug_2` (`slug`),
  ADD UNIQUE KEY `slug_3` (`slug`),
  ADD UNIQUE KEY `slug_4` (`slug`),
  ADD UNIQUE KEY `slug_5` (`slug`),
  ADD UNIQUE KEY `slug_6` (`slug`),
  ADD UNIQUE KEY `slug_7` (`slug`),
  ADD UNIQUE KEY `slug_8` (`slug`),
  ADD UNIQUE KEY `slug_9` (`slug`),
  ADD UNIQUE KEY `slug_10` (`slug`),
  ADD UNIQUE KEY `slug_11` (`slug`),
  ADD UNIQUE KEY `slug_12` (`slug`),
  ADD UNIQUE KEY `slug_13` (`slug`),
  ADD UNIQUE KEY `slug_14` (`slug`),
  ADD UNIQUE KEY `slug_15` (`slug`),
  ADD UNIQUE KEY `slug_16` (`slug`),
  ADD UNIQUE KEY `slug_17` (`slug`),
  ADD UNIQUE KEY `slug_18` (`slug`),
  ADD UNIQUE KEY `slug_19` (`slug`),
  ADD UNIQUE KEY `slug_20` (`slug`),
  ADD UNIQUE KEY `slug_21` (`slug`),
  ADD UNIQUE KEY `slug_22` (`slug`),
  ADD UNIQUE KEY `slug_23` (`slug`),
  ADD UNIQUE KEY `slug_24` (`slug`),
  ADD UNIQUE KEY `slug_25` (`slug`),
  ADD UNIQUE KEY `slug_26` (`slug`),
  ADD KEY `products_slug` (`slug`),
  ADD KEY `products_category_id` (`categoryId`),
  ADD KEY `products_brand` (`brand`),
  ADD KEY `products_status` (`status`),
  ADD KEY `products_featured` (`featured`),
  ADD KEY `products_rating` (`rating`),
  ADD KEY `products_availability` (`availability`),
  ADD KEY `products_category` (`categoryId`),
  ADD KEY `products_cat_slug` (`cat_slug`);

--
-- Indexes for table `sizes`
--
ALTER TABLE `sizes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_unique` (`email`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `referralCode` (`referralCode`),
  ADD UNIQUE KEY `referralCode_2` (`referralCode`),
  ADD UNIQUE KEY `referralCode_3` (`referralCode`),
  ADD UNIQUE KEY `referralCode_4` (`referralCode`),
  ADD UNIQUE KEY `referralCode_5` (`referralCode`),
  ADD UNIQUE KEY `referralCode_6` (`referralCode`),
  ADD UNIQUE KEY `referralCode_7` (`referralCode`),
  ADD UNIQUE KEY `referralCode_8` (`referralCode`),
  ADD UNIQUE KEY `referralCode_9` (`referralCode`),
  ADD UNIQUE KEY `referralCode_10` (`referralCode`),
  ADD UNIQUE KEY `referralCode_11` (`referralCode`),
  ADD UNIQUE KEY `referralCode_12` (`referralCode`),
  ADD UNIQUE KEY `referralCode_13` (`referralCode`),
  ADD UNIQUE KEY `referralCode_14` (`referralCode`),
  ADD UNIQUE KEY `referralCode_15` (`referralCode`),
  ADD UNIQUE KEY `referralCode_16` (`referralCode`),
  ADD UNIQUE KEY `referralCode_17` (`referralCode`),
  ADD UNIQUE KEY `referralCode_18` (`referralCode`),
  ADD UNIQUE KEY `referralCode_19` (`referralCode`),
  ADD UNIQUE KEY `referralCode_20` (`referralCode`),
  ADD UNIQUE KEY `referralCode_21` (`referralCode`),
  ADD UNIQUE KEY `referralCode_22` (`referralCode`),
  ADD UNIQUE KEY `referralCode_23` (`referralCode`),
  ADD UNIQUE KEY `referralCode_24` (`referralCode`),
  ADD UNIQUE KEY `referralCode_25` (`referralCode`),
  ADD UNIQUE KEY `referralCode_26` (`referralCode`),
  ADD UNIQUE KEY `referralCode_27` (`referralCode`),
  ADD UNIQUE KEY `referralCode_28` (`referralCode`),
  ADD KEY `users_email` (`email`),
  ADD KEY `users_phone` (`phone`),
  ADD KEY `users_status` (`status`),
  ADD KEY `users_total_spent` (`totalSpent`),
  ADD KEY `users_last_order_date` (`lastOrderDate`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `colors`
--
ALTER TABLE `colors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `sizes`
--
ALTER TABLE `sizes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
