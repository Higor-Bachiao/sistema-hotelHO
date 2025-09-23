-- Adicionar tabela de usuários para autenticação
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar tabela de rooms para usar UUID
ALTER TABLE rooms ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE rooms ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Atualizar tabela de guests para usar UUID
ALTER TABLE guests ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE guests ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Atualizar tabela de reservations para usar UUID
ALTER TABLE reservations ALTER COLUMN id TYPE UUID USING id::UUID;
ALTER TABLE reservations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE reservations ALTER COLUMN room_id TYPE UUID USING room_id::UUID;
ALTER TABLE reservations ALTER COLUMN guest_id TYPE UUID USING guest_id::UUID;

-- Atualizar tabela de expenses para usar UUID nos relacionamentos
ALTER TABLE expenses ALTER COLUMN guest_id TYPE UUID USING guest_id::UUID;

-- Tornar email e cpf opcionais na tabela guests
ALTER TABLE guests ALTER COLUMN email DROP NOT NULL;
ALTER TABLE guests ALTER COLUMN cpf DROP NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_check_in ON guests(check_in);
CREATE INDEX IF NOT EXISTS idx_guests_check_out ON guests(check_out);
CREATE INDEX IF NOT EXISTS idx_expenses_guest_id ON expenses(guest_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users (email, password_hash, name, role) 
VALUES (
    'admin@hotel.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKTyiL3k/zUKd9K', -- admin123
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;