CREATE DATABASE IF NOT EXISTS mewe_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mewe_app;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    category_id INT,
    max_participants INT DEFAULT 0,
    event_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (name, icon) VALUES
('Музыка', 'fa-music'),
('Спорт', 'fa-futbol'),
('Наука', 'fa-flask'),
('Искусство', 'fa-palette'),
('Образование', 'fa-graduation-cap');

INSERT INTO events (title, description, location, category_id, max_participants, event_date) VALUES
('Джазовый вечер на набережной', 'Живая музыка от студенческого джаз-бэнда', 'Спортивная набережная', 1, 40, DATE_ADD(NOW(), INTERVAL 3 DAY)),
('Утренняя пробежка на Русском', 'Совместная пробежка по кампусу', 'о. Русский, кампус ДВФУ', 2, 20, DATE_ADD(NOW(), INTERVAL 5 DAY));
