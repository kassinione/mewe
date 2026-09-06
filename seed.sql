INSERT INTO users (telegram_id, first_name, last_name, username) VALUES
(123456789, 'Лев', 'Федоренко', 'kassinione');

INSERT INTO categories (name, icon) VALUES
('Music', 'fa-music'),
('Sport', 'fa-futbol'),
('Наука', 'fa-flask'),
('Искусство', 'fa-palette'),
('Образование', 'fa-graduation-cap');

INSERT INTO events (title, description, location, creator_id, category_id, max_participants, event_date) VALUES
('Test', 'Test description', 'Test location', 1, 1, 40, DATE_ADD(NOW(), INTERVAL 3 DAY)),
('Утренняя пробежка на Русском', 'Совместная пробежка по кампусу', 'о. Русский, кампус ДВФУ', 1, 2, 20, DATE_ADD(NOW(), INTERVAL 5 DAY));