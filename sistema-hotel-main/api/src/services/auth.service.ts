import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/config/database';
import { config } from '@/config/database';
import { User, AuthResponse } from '@/types';

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Buscar usuário por email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      },
      token
    };
  }

  static async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'staff';
  }): Promise<User> {
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      throw new Error('Usuário já existe com este email');
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    // Criar usuário
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email: userData.email,
        password_hash: passwordHash,
        name: userData.name,
        role: userData.role
      }])
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }

    return newUser;
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    return user;
  }

  static async getAllUsers(): Promise<User[]> {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    return users || [];
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }

    return user;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  static async changePassword(
    id: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    // Buscar usuário atual
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Erro ao alterar senha: ${updateError.message}`);
    }
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}