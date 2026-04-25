-- Run this file in your MySQL client
-- mysql -u root -p < schema.sql
CREATE DATABASE IF NOT EXISTS movie_tracker;
USE movie_tracker;
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS content (
  content_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content_type ENUM('movie', 'series') NOT NULL,
  release_year YEAR,
  genre VARCHAR(100),
  poster_url VARCHAR(500),
  overview TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS user_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content_id INT NOT NULL,
  status ENUM('watchlist', 'watching', 'completed', 'dropped') NOT NULL,
  rating TINYINT CHECK (
    rating BETWEEN 1 AND 10
  ),
  platform VARCHAR(100),
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_content (user_id, content_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (content_id) REFERENCES content(content_id) ON DELETE CASCADE
);