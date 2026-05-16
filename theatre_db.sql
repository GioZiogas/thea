-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Εξυπηρετητής: 127.0.0.1
-- Χρόνος δημιουργίας: 26 Απρ 2026 στις 20:02:34
-- Έκδοση διακομιστή: 10.4.32-MariaDB
-- Έκδοση PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `theatre_db`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `reservations`
--

CREATE TABLE `reservations` (
  `reservations_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `showtime_id` int(11) DEFAULT NULL,
  `seats_count` int(11) DEFAULT NULL,
  `reservation_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` enum('card','paypal','apple_pay','google_pay') DEFAULT 'card',
  `total_price` decimal(10,2) DEFAULT 0.00,
  `status` enum('confirmed','cancel requested','confirm cancel') DEFAULT 'confirmed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `reservations`
--

INSERT INTO `reservations` (`reservations_id`, `user_id`, `showtime_id`, `seats_count`, `reservation_date`, `payment_method`, `total_price`, `status`) VALUES
(14, 1, 57, 1, '2026-04-25 11:42:10', 'card', 10.00, 'confirm cancel'),
(15, 1, 58, 3, '2026-04-25 15:07:45', 'card', 36.00, 'confirm cancel'),
(16, 1, 58, 2, '2026-04-25 15:38:31', 'card', 24.00, 'confirm cancel'),
(17, 1, 58, 1, '2026-04-25 17:03:12', 'card', 12.00, 'confirmed'),
(19, 1, 57, 2, '2026-04-26 11:25:08', 'card', 20.00, 'confirmed'),
(20, 1, 58, 2, '2026-04-26 11:48:40', 'card', 24.00, 'confirmed'),
(21, 1, 58, 2, '2026-04-26 12:02:27', 'card', 24.00, 'confirmed'),
(22, 1, 58, 2, '2026-04-26 12:34:16', 'card', 24.00, 'confirmed'),
(23, 1, 58, 2, '2026-04-26 12:38:03', 'card', 24.00, 'confirmed'),
(24, 1, 58, 2, '2026-04-26 13:15:33', 'card', 24.00, 'confirmed'),
(25, 1, 58, 3, '2026-04-26 13:15:46', 'card', 36.00, 'confirmed'),
(26, 1, 58, 2, '2026-04-26 14:27:13', 'paypal', 24.00, 'confirmed'),
(27, 1, 58, 1, '2026-04-26 14:27:32', 'google_pay', 12.00, 'confirmed'),
(28, 1, 58, 1, '2026-04-26 14:29:24', 'paypal', 12.00, 'confirm cancel'),
(29, 1, 58, 1, '2026-04-26 14:32:46', 'card', 12.00, 'confirmed'),
(30, 1, 58, 1, '2026-04-26 14:34:07', 'card', 12.00, 'confirmed'),
(31, 1, 58, 1, '2026-04-26 14:37:21', 'card', 12.00, 'confirmed'),
(32, 1, 58, 1, '2026-04-26 14:38:10', 'card', 12.00, 'confirmed'),
(33, 1, 58, 1, '2026-04-26 14:41:27', 'card', 12.00, 'confirm cancel'),
(34, 1, 58, 1, '2026-04-26 14:59:02', 'card', 12.00, 'confirm cancel'),
(35, 1, 58, 1, '2026-04-26 15:02:34', 'card', 12.00, 'confirm cancel'),
(36, 1, 58, 1, '2026-04-26 15:05:23', 'card', 12.00, 'confirm cancel');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `reservation_seats`
--

CREATE TABLE `reservation_seats` (
  `res_seat_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `showtime_id` int(11) NOT NULL,
  `seat_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `reservation_seats`
--

INSERT INTO `reservation_seats` (`res_seat_id`, `reservation_id`, `showtime_id`, `seat_id`) VALUES
(1, 22, 58, 46),
(2, 22, 58, 47),
(3, 23, 58, 33),
(4, 23, 58, 34),
(5, 24, 58, 38),
(6, 24, 58, 37),
(7, 25, 58, 40),
(8, 25, 58, 41),
(9, 25, 58, 42),
(10, 26, 58, 53),
(11, 26, 58, 54),
(12, 27, 58, 51),
(13, 28, 58, 52),
(14, 29, 58, 55),
(15, 30, 58, 56),
(16, 31, 58, 26),
(17, 32, 58, 35),
(18, 33, 58, 48);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `seats`
--

CREATE TABLE `seats` (
  `seat_id` int(11) NOT NULL,
  `theatre_id` int(11) NOT NULL,
  `row_label` varchar(5) NOT NULL,
  `seat_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `seats`
--

INSERT INTO `seats` (`seat_id`, `theatre_id`, `row_label`, `seat_number`) VALUES
(1, 1, 'A', 1),
(2, 1, 'A', 2),
(3, 1, 'A', 3),
(4, 1, 'A', 4),
(5, 1, 'A', 5),
(6, 1, 'A', 6),
(7, 1, 'A', 7),
(8, 1, 'A', 8),
(9, 1, 'A', 9),
(10, 1, 'A', 10),
(11, 1, 'B', 1),
(12, 1, 'B', 2),
(13, 1, 'B', 3),
(14, 1, 'B', 4),
(15, 1, 'B', 5),
(16, 1, 'B', 6),
(17, 1, 'B', 7),
(18, 1, 'B', 8),
(19, 1, 'B', 9),
(20, 1, 'B', 10),
(21, 1, 'C', 1),
(22, 1, 'C', 2),
(23, 1, 'C', 3),
(24, 1, 'C', 4),
(25, 1, 'C', 5),
(26, 1, 'C', 6),
(27, 1, 'C', 7),
(28, 1, 'C', 8),
(29, 1, 'C', 9),
(30, 1, 'C', 10),
(31, 1, 'D', 1),
(32, 1, 'D', 2),
(33, 1, 'D', 3),
(34, 1, 'D', 4),
(35, 1, 'D', 5),
(36, 1, 'D', 6),
(37, 1, 'D', 7),
(38, 1, 'D', 8),
(39, 1, 'D', 9),
(40, 1, 'D', 10),
(41, 1, 'E', 1),
(42, 1, 'E', 2),
(43, 1, 'E', 3),
(44, 1, 'E', 4),
(45, 1, 'E', 5),
(46, 1, 'E', 6),
(47, 1, 'E', 7),
(48, 1, 'E', 8),
(49, 1, 'E', 9),
(50, 1, 'E', 10),
(51, 1, 'F', 1),
(52, 1, 'F', 2),
(53, 1, 'F', 3),
(54, 1, 'F', 4),
(55, 1, 'F', 5),
(56, 1, 'F', 6),
(57, 1, 'F', 7),
(58, 1, 'F', 8),
(59, 1, 'F', 9),
(60, 1, 'F', 10),
(61, 1, 'G', 1),
(62, 1, 'G', 2),
(63, 1, 'G', 3),
(64, 1, 'G', 4),
(65, 1, 'G', 5),
(66, 1, 'G', 6),
(67, 1, 'G', 7),
(68, 1, 'G', 8),
(69, 1, 'G', 9),
(70, 1, 'G', 10),
(71, 1, 'H', 1),
(72, 1, 'H', 2),
(73, 1, 'H', 3),
(74, 1, 'H', 4),
(75, 1, 'H', 5),
(76, 1, 'H', 6),
(77, 1, 'H', 7),
(78, 1, 'H', 8),
(79, 1, 'H', 9),
(80, 1, 'H', 10),
(81, 1, 'I', 1),
(82, 1, 'I', 2),
(83, 1, 'I', 3),
(84, 1, 'I', 4),
(85, 1, 'I', 5),
(86, 1, 'I', 6),
(87, 1, 'I', 7),
(88, 1, 'I', 8),
(89, 1, 'I', 9),
(90, 1, 'I', 10),
(91, 1, 'J', 1),
(92, 1, 'J', 2),
(93, 1, 'J', 3),
(94, 1, 'J', 4),
(95, 1, 'J', 5),
(96, 1, 'J', 6),
(97, 1, 'J', 7),
(98, 1, 'J', 8),
(99, 1, 'J', 9),
(100, 1, 'J', 10),
(101, 2, 'A', 1),
(102, 2, 'A', 2),
(103, 2, 'A', 3),
(104, 2, 'A', 4),
(105, 2, 'A', 5),
(106, 2, 'A', 6),
(107, 2, 'A', 7),
(108, 2, 'A', 8),
(109, 2, 'A', 9),
(110, 2, 'A', 10),
(111, 2, 'B', 1),
(112, 2, 'B', 2),
(113, 2, 'B', 3),
(114, 2, 'B', 4),
(115, 2, 'B', 5),
(116, 2, 'B', 6),
(117, 2, 'B', 7),
(118, 2, 'B', 8),
(119, 2, 'B', 9),
(120, 2, 'B', 10),
(121, 2, 'C', 1),
(122, 2, 'C', 2),
(123, 2, 'C', 3),
(124, 2, 'C', 4),
(125, 2, 'C', 5),
(126, 2, 'C', 6),
(127, 2, 'C', 7),
(128, 2, 'C', 8),
(129, 2, 'C', 9),
(130, 2, 'C', 10),
(131, 2, 'D', 1),
(132, 2, 'D', 2),
(133, 2, 'D', 3),
(134, 2, 'D', 4),
(135, 2, 'D', 5),
(136, 2, 'D', 6),
(137, 2, 'D', 7),
(138, 2, 'D', 8),
(139, 2, 'D', 9),
(140, 2, 'D', 10),
(141, 2, 'E', 1),
(142, 2, 'E', 2),
(143, 2, 'E', 3),
(144, 2, 'E', 4),
(145, 2, 'E', 5),
(146, 2, 'E', 6),
(147, 2, 'E', 7),
(148, 2, 'E', 8),
(149, 2, 'E', 9),
(150, 2, 'E', 10),
(151, 2, 'F', 1),
(152, 2, 'F', 2),
(153, 2, 'F', 3),
(154, 2, 'F', 4),
(155, 2, 'F', 5),
(156, 2, 'F', 6),
(157, 2, 'F', 7),
(158, 2, 'F', 8),
(159, 2, 'F', 9),
(160, 2, 'F', 10),
(161, 2, 'G', 1),
(162, 2, 'G', 2),
(163, 2, 'G', 3),
(164, 2, 'G', 4),
(165, 2, 'G', 5),
(166, 2, 'G', 6),
(167, 2, 'G', 7),
(168, 2, 'G', 8),
(169, 2, 'G', 9),
(170, 2, 'G', 10),
(171, 2, 'H', 1),
(172, 2, 'H', 2),
(173, 2, 'H', 3),
(174, 2, 'H', 4),
(175, 2, 'H', 5),
(176, 2, 'H', 6),
(177, 2, 'H', 7),
(178, 2, 'H', 8),
(179, 2, 'H', 9),
(180, 2, 'H', 10),
(181, 2, 'I', 1),
(182, 2, 'I', 2),
(183, 2, 'I', 3),
(184, 2, 'I', 4),
(185, 2, 'I', 5),
(186, 2, 'I', 6),
(187, 2, 'I', 7),
(188, 2, 'I', 8),
(189, 2, 'I', 9),
(190, 2, 'I', 10),
(191, 2, 'J', 1),
(192, 2, 'J', 2),
(193, 2, 'J', 3),
(194, 2, 'J', 4),
(195, 2, 'J', 5),
(196, 2, 'J', 6),
(197, 2, 'J', 7),
(198, 2, 'J', 8),
(199, 2, 'J', 9),
(200, 2, 'J', 10),
(201, 3, 'A', 1),
(202, 3, 'A', 2),
(203, 3, 'A', 3),
(204, 3, 'A', 4),
(205, 3, 'A', 5),
(206, 3, 'A', 6),
(207, 3, 'A', 7),
(208, 3, 'A', 8),
(209, 3, 'A', 9),
(210, 3, 'A', 10),
(211, 3, 'B', 1),
(212, 3, 'B', 2),
(213, 3, 'B', 3),
(214, 3, 'B', 4),
(215, 3, 'B', 5),
(216, 3, 'B', 6),
(217, 3, 'B', 7),
(218, 3, 'B', 8),
(219, 3, 'B', 9),
(220, 3, 'B', 10),
(221, 3, 'C', 1),
(222, 3, 'C', 2),
(223, 3, 'C', 3),
(224, 3, 'C', 4),
(225, 3, 'C', 5),
(226, 3, 'C', 6),
(227, 3, 'C', 7),
(228, 3, 'C', 8),
(229, 3, 'C', 9),
(230, 3, 'C', 10),
(231, 3, 'D', 1),
(232, 3, 'D', 2),
(233, 3, 'D', 3),
(234, 3, 'D', 4),
(235, 3, 'D', 5),
(236, 3, 'D', 6),
(237, 3, 'D', 7),
(238, 3, 'D', 8),
(239, 3, 'D', 9),
(240, 3, 'D', 10),
(241, 3, 'E', 1),
(242, 3, 'E', 2),
(243, 3, 'E', 3),
(244, 3, 'E', 4),
(245, 3, 'E', 5),
(246, 3, 'E', 6),
(247, 3, 'E', 7),
(248, 3, 'E', 8),
(249, 3, 'E', 9),
(250, 3, 'E', 10),
(251, 3, 'F', 1),
(252, 3, 'F', 2),
(253, 3, 'F', 3),
(254, 3, 'F', 4),
(255, 3, 'F', 5),
(256, 3, 'F', 6),
(257, 3, 'F', 7),
(258, 3, 'F', 8),
(259, 3, 'F', 9),
(260, 3, 'F', 10),
(261, 3, 'G', 1),
(262, 3, 'G', 2),
(263, 3, 'G', 3),
(264, 3, 'G', 4),
(265, 3, 'G', 5),
(266, 3, 'G', 6),
(267, 3, 'G', 7),
(268, 3, 'G', 8),
(269, 3, 'G', 9),
(270, 3, 'G', 10),
(271, 3, 'H', 1),
(272, 3, 'H', 2),
(273, 3, 'H', 3),
(274, 3, 'H', 4),
(275, 3, 'H', 5),
(276, 3, 'H', 6),
(277, 3, 'H', 7),
(278, 3, 'H', 8),
(279, 3, 'H', 9),
(280, 3, 'H', 10),
(281, 3, 'I', 1),
(282, 3, 'I', 2),
(283, 3, 'I', 3),
(284, 3, 'I', 4),
(285, 3, 'I', 5),
(286, 3, 'I', 6),
(287, 3, 'I', 7),
(288, 3, 'I', 8),
(289, 3, 'I', 9),
(290, 3, 'I', 10),
(291, 3, 'J', 1),
(292, 3, 'J', 2),
(293, 3, 'J', 3),
(294, 3, 'J', 4),
(295, 3, 'J', 5),
(296, 3, 'J', 6),
(297, 3, 'J', 7),
(298, 3, 'J', 8),
(299, 3, 'J', 9),
(300, 3, 'J', 10);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `shows`
--

CREATE TABLE `shows` (
  `shows_id` int(11) NOT NULL,
  `theatre_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `base_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_kid_friendly` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `shows`
--

INSERT INTO `shows` (`shows_id`, `theatre_id`, `title`, `description`, `duration`, `category`, `base_price`, `is_kid_friendly`, `is_active`, `created_at`) VALUES
(50, NULL, 'Ρομαιος και Ιουλιετα', 'Σεξ πιρ', 90, 'Δράμα', 12.00, 1, 1, '2026-04-24 15:33:26'),
(51, NULL, 'Αντιγονη', 'Σοφοκλη', 90, 'Τραγωδία', 10.00, 0, 1, '2026-04-24 16:11:45'),
(52, NULL, 'Αγαμέμνων', 'Αισχύλος', 90, 'Τραγωδία', 10.00, 1, 1, '2026-04-25 12:03:42');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `showtimes`
--

CREATE TABLE `showtimes` (
  `showtimes_id` int(11) NOT NULL,
  `show_id` int(11) DEFAULT NULL,
  `theatre_id` int(11) NOT NULL,
  `date_time` datetime DEFAULT NULL,
  `available_seats` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `showtimes`
--

INSERT INTO `showtimes` (`showtimes_id`, `show_id`, `theatre_id`, `date_time`, `available_seats`) VALUES
(57, 51, 1, '2026-05-03 20:00:00', 98),
(58, 50, 1, '2026-05-01 21:00:00', 79),
(59, 50, 2, '2026-04-04 21:00:00', 100),
(61, 50, 2, '2026-04-06 21:00:00', 100),
(62, 50, 2, '2026-04-07 21:00:00', 100),
(63, 50, 2, '2026-04-08 22:00:00', 100),
(64, 52, 1, '2026-04-01 21:00:00', 100),
(65, 52, 1, '2026-04-02 20:00:00', 100);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `show_images`
--

CREATE TABLE `show_images` (
  `idshowimage` int(11) NOT NULL,
  `show_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `show_images`
--

INSERT INTO `show_images` (`idshowimage`, `show_id`, `image_path`) VALUES
(38, 50, 'uploads/1777118540632.jpeg'),
(39, 51, 'uploads/1777047105892.jpeg'),
(40, 52, 'uploads/1777118622376.jpeg');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `show_theatres`
--

CREATE TABLE `show_theatres` (
  `show_id` int(11) NOT NULL,
  `theatre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `show_theatres`
--

INSERT INTO `show_theatres` (`show_id`, `theatre_id`) VALUES
(50, 1),
(50, 2),
(50, 3),
(51, 1),
(51, 2),
(52, 1),
(52, 2);

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `theatres`
--

CREATE TABLE `theatres` (
  `theatres_id` int(11) NOT NULL,
  `theater_name` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `theatres`
--

INSERT INTO `theatres` (`theatres_id`, `theater_name`, `location`, `city`, `address`) VALUES
(1, 'Εθνικόέατρο', 'Αθήνα', 'Αθήνα', 'Αποστόλου 2'),
(2, 'Θέατρο Τέχνης Καρόλου Κουν', 'Αθήνα', 'Αθηνα ', 'Τριανταφυλου 5'),
(3, 'Βασιλικό Θέατρο', 'Θεσσαλονίκη', 'Αθήνα ', 'Πατρόκλου 12');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `users`
--

CREATE TABLE `users` (
  `users_id` int(11) NOT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee','user') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Άδειασμα δεδομένων του πίνακα `users`
--

INSERT INTO `users` (`users_id`, `firstname`, `lastname`, `username`, `email`, `telephone`, `password`, `role`) VALUES
(1, 'George', 'Ziogas', 'giozio', 'giozio@test.com', '56766886', '$2b$10$93cM4hyBPHfeXXIzk3GZxu6lV4QdYstklSEuW0Fgxf/.a7ug3rQAG', 'admin'),
(2, 'Soulis', 'Ziogas', 'soulisbee', 'soulis@test.com', NULL, '$2b$10$93cM4hyBPHfeXXIzk3GZxu6lV4QdYstklSEuW0Fgxf/.a7ug3rQAG', 'employee'),
(3, 'Melpomene', 'Koursoviti', 'Melpo', 'melpo@gmail.com', '855455', '$2b$10$tDnRWQDNHNDQCGzW/GaOle1DAechle8w151FSVnGQGtlKqP0Cs3wW', 'user'),
(6, 'Bee1', 'Bee', 'Bee', 'b@gmail.com', '584558445', '$2b$10$eoK8JhJy5MaFsYVCDj3XS.7g6EFOYBWTnl4kIyt4iNPdC25Fshqsi', 'employee');

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservations_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_showtime` (`showtime_id`);

--
-- Ευρετήρια για πίνακα `reservation_seats`
--
ALTER TABLE `reservation_seats`
  ADD PRIMARY KEY (`res_seat_id`),
  ADD KEY `fk_res_id` (`reservation_id`),
  ADD KEY `fk_res_showtime` (`showtime_id`),
  ADD KEY `fk_res_seat` (`seat_id`);

--
-- Ευρετήρια για πίνακα `seats`
--
ALTER TABLE `seats`
  ADD PRIMARY KEY (`seat_id`),
  ADD KEY `fk_seats_theatre_new` (`theatre_id`);

--
-- Ευρετήρια για πίνακα `shows`
--
ALTER TABLE `shows`
  ADD PRIMARY KEY (`shows_id`),
  ADD KEY `theatre_id` (`theatre_id`);

--
-- Ευρετήρια για πίνακα `showtimes`
--
ALTER TABLE `showtimes`
  ADD PRIMARY KEY (`showtimes_id`),
  ADD KEY `show_id` (`show_id`),
  ADD KEY `fk_showtimes_theatre` (`theatre_id`);

--
-- Ευρετήρια για πίνακα `show_images`
--
ALTER TABLE `show_images`
  ADD PRIMARY KEY (`idshowimage`),
  ADD KEY `fk_show_images` (`show_id`);

--
-- Ευρετήρια για πίνακα `show_theatres`
--
ALTER TABLE `show_theatres`
  ADD PRIMARY KEY (`show_id`,`theatre_id`),
  ADD KEY `fk_theatre` (`theatre_id`);

--
-- Ευρετήρια για πίνακα `theatres`
--
ALTER TABLE `theatres`
  ADD PRIMARY KEY (`theatres_id`);

--
-- Ευρετήρια για πίνακα `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`users_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservations_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT για πίνακα `reservation_seats`
--
ALTER TABLE `reservation_seats`
  MODIFY `res_seat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT για πίνακα `seats`
--
ALTER TABLE `seats`
  MODIFY `seat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=512;

--
-- AUTO_INCREMENT για πίνακα `shows`
--
ALTER TABLE `shows`
  MODIFY `shows_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT για πίνακα `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `showtimes_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT για πίνακα `show_images`
--
ALTER TABLE `show_images`
  MODIFY `idshowimage` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT για πίνακα `theatres`
--
ALTER TABLE `theatres`
  MODIFY `theatres_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT για πίνακα `users`
--
ALTER TABLE `users`
  MODIFY `users_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `fk_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`showtimes_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`users_id`);

--
-- Περιορισμοί για πίνακα `reservation_seats`
--
ALTER TABLE `reservation_seats`
  ADD CONSTRAINT `fk_res_id` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`reservations_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_res_seat` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`seat_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_res_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`showtimes_id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `seats`
--
ALTER TABLE `seats`
  ADD CONSTRAINT `fk_seats_theatre_new` FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`theatres_id`) ON DELETE CASCADE;

--
-- Περιορισμοί για πίνακα `shows`
--
ALTER TABLE `shows`
  ADD CONSTRAINT `shows_ibfk_1` FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`theatres_id`);

--
-- Περιορισμοί για πίνακα `showtimes`
--
ALTER TABLE `showtimes`
  ADD CONSTRAINT `fk_showtimes_theatre` FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`theatres_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `showtimes_ibfk_1` FOREIGN KEY (`show_id`) REFERENCES `shows` (`shows_id`);

--
-- Περιορισμοί για πίνακα `show_images`
--
ALTER TABLE `show_images`
  ADD CONSTRAINT `fk_show_images` FOREIGN KEY (`show_id`) REFERENCES `shows` (`shows_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Περιορισμοί για πίνακα `show_theatres`
--
ALTER TABLE `show_theatres`
  ADD CONSTRAINT `fk_show` FOREIGN KEY (`show_id`) REFERENCES `shows` (`shows_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_theatre` FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`theatres_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
