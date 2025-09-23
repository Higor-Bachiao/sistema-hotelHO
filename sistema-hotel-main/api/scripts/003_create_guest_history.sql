-- Tabela para histórico de hóspedes
CREATE TABLE IF NOT EXISTS guest_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  guest_document VARCHAR(50),
  guest_guests INTEGER DEFAULT 1,
  room_id VARCHAR(50) REFERENCES rooms(id) ON DELETE SET NULL,
  room_number VARCHAR(10) NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  expenses JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_guest_history_status ON guest_history(status);
CREATE INDEX IF NOT EXISTS idx_guest_history_room_number ON guest_history(room_number);
CREATE INDEX IF NOT EXISTS idx_guest_history_dates ON guest_history(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_guest_history_guest_name ON guest_history(guest_name);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_guest_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guest_history_updated_at
    BEFORE UPDATE ON guest_history
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_history_updated_at();

-- Comentários para documentação
COMMENT ON TABLE guest_history IS 'Histórico completo de hospedagens no hotel';
COMMENT ON COLUMN guest_history.guest_name IS 'Nome do hóspede principal';
COMMENT ON COLUMN guest_history.guest_guests IS 'Número total de hóspedes na reserva';
COMMENT ON COLUMN guest_history.expenses IS 'Despesas extras em formato JSON';
COMMENT ON COLUMN guest_history.status IS 'Status da hospedagem: active, completed, cancelled';