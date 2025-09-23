import { Router } from 'express';
import { supabaseAdmin } from '../config/database';

const router = Router();

// GET /api/guest-history - Buscar todo o histórico
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('guest_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Erro ao buscar histórico de hóspedes',
        details: error.message 
      });
    }

    console.log(`✅ Histórico carregado: ${data?.length || 0} entradas`);
    
    return res.json({ 
      success: true, 
      data: data || []
    });
  } catch (error: any) {
    console.error('Erro interno ao buscar histórico:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// POST /api/guest-history - Criar nova entrada no histórico
router.post('/', async (req, res) => {
  try {
    const historyData = req.body;
    
    console.log('📝 Criando entrada no histórico:', historyData);

    const { data, error } = await supabaseAdmin
      .from('guest_history')
      .insert([{
        guest_name: historyData.guest_name,
        guest_email: historyData.guest_email,
        guest_phone: historyData.guest_phone,
        guest_document: historyData.guest_document,
        guest_guests: historyData.guest_guests || 1,
        room_id: historyData.room_id,
        room_number: historyData.room_number,
        room_type: historyData.room_type,
        check_in_date: historyData.check_in_date,
        check_out_date: historyData.check_out_date,
        total_price: historyData.total_price || 0,
        expenses: historyData.expenses || [],
        status: historyData.status || 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar histórico:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Erro ao criar entrada no histórico',
        details: error.message 
      });
    }

    console.log('✅ Entrada no histórico criada:', data);

    return res.status(201).json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('Erro interno ao criar histórico:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/guest-history/:id - Atualizar entrada do histórico
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`📝 Atualizando histórico ${id}:`, updateData);

    const { data, error } = await supabaseAdmin
      .from('guest_history')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar histórico:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Erro ao atualizar histórico',
        details: error.message 
      });
    }

    console.log('✅ Histórico atualizado:', data);

    return res.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('Erro interno ao atualizar histórico:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// PUT /api/guest-history/:id/status - Atualizar apenas o status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`📝 Atualizando status do histórico ${id} para:`, status);

    const { data, error } = await supabaseAdmin
      .from('guest_history')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Erro ao atualizar status',
        details: error.message 
      });
    }

    console.log('✅ Status atualizado:', data);

    return res.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('Erro interno ao atualizar status:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// DELETE /api/guest-history/:id - Remover entrada do histórico
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Removendo entrada do histórico: ${id}`);

    const { error } = await supabaseAdmin
      .from('guest_history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover histórico:', error);
      return res.status(400).json({ 
        success: false, 
        error: 'Erro ao remover entrada do histórico',
        details: error.message 
      });
    }

    console.log('✅ Entrada removida do histórico');

    return res.json({ 
      success: true, 
      message: 'Entrada removida com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro interno ao remover histórico:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

export default router;