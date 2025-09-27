-- Script para atualizar constraints da tabela reservations
-- Permite novos status: active, future, completed, cancelled

-- Remover constraint antigo se existir
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Adicionar novo constraint com status atualizados
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('active', 'future', 'completed', 'cancelled', 'confirmed', 'checked_in', 'checked_out'));

-- Comentário sobre os status
COMMENT ON COLUMN reservations.status IS 'Status da reserva: active (ativa/ocupando), future (reserva futura), completed (finalizada), cancelled (cancelada)';

-- Opcional: Atualizar status existentes se necessário
-- UPDATE reservations SET status = 'active' WHERE status = 'checked_in';
-- UPDATE reservations SET status = 'completed' WHERE status = 'checked_out';