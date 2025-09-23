-- Script para popular a tabela de quartos com dados iniciais

INSERT INTO rooms (number, type, status, price, max_guests, amenities, description) VALUES
-- Quartos Standard
('101', 'standard', 'available', 150.00, 2, ARRAY['wifi', 'tv', 'ar_condicionado'], 'Quarto standard confortável com cama de casal'),
('102', 'standard', 'available', 150.00, 2, ARRAY['wifi', 'tv', 'ar_condicionado'], 'Quarto standard confortável com cama de casal'),
('103', 'standard', 'available', 150.00, 2, ARRAY['wifi', 'tv', 'ar_condicionado'], 'Quarto standard confortável com cama de casal'),
('104', 'standard', 'available', 150.00, 2, ARRAY['wifi', 'tv', 'ar_condicionado'], 'Quarto standard confortável com cama de casal'),
('105', 'standard', 'available', 150.00, 2, ARRAY['wifi', 'tv', 'ar_condicionado'], 'Quarto standard confortável com cama de casal'),

-- Quartos Deluxe
('201', 'deluxe', 'available', 250.00, 3, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda'], 'Quarto deluxe com varanda e vista para a cidade'),
('202', 'deluxe', 'available', 250.00, 3, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda'], 'Quarto deluxe com varanda e vista para a cidade'),
('203', 'deluxe', 'available', 250.00, 3, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda'], 'Quarto deluxe com varanda e vista para a cidade'),
('204', 'deluxe', 'available', 250.00, 3, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda'], 'Quarto deluxe com varanda e vista para a cidade'),
('205', 'deluxe', 'available', 250.00, 3, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda'], 'Quarto deluxe com varanda e vista para a cidade'),

-- Suítes
('301', 'suite', 'available', 400.00, 4, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda', 'banheira', 'sala_estar'], 'Suíte luxuosa com sala de estar e banheira'),
('302', 'suite', 'available', 400.00, 4, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda', 'banheira', 'sala_estar'], 'Suíte luxuosa com sala de estar e banheira'),
('303', 'suite', 'available', 400.00, 4, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda', 'banheira', 'sala_estar'], 'Suíte luxuosa com sala de estar e banheira'),

-- Quartos Premium
('401', 'premium', 'available', 600.00, 6, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda', 'banheira', 'sala_estar', 'cozinha', 'vista_mar'], 'Quarto premium com cozinha e vista para o mar'),
('402', 'premium', 'available', 600.00, 6, ARRAY['wifi', 'tv', 'ar_condicionado', 'minibar', 'varanda', 'banheira', 'sala_estar', 'cozinha', 'vista_mar'], 'Quarto premium com cozinha e vista para o mar')

ON CONFLICT (number) DO NOTHING;