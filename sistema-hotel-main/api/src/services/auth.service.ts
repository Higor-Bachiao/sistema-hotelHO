import { supabaseAdmin } from '@/config/database';
import { User, AuthResponse } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Usu�rio n�o encontrado');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      token: 'simple-auth-token'
    };
  }

  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erro ao buscar usu�rios: ' + error.message);
    }

    return data || [];
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Erro ao buscar usu�rio: ' + error.message);
    }

    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error('Erro ao atualizar usu�rio: ' + error.message);
    }

    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Erro ao deletar usu�rio: ' + error.message);
    }
  }

  static verifyToken(token: string): any {
    if (token === 'simple-auth-token') {
      return { valid: true };
    }
    throw new Error('Token inv�lido');
  }
}
