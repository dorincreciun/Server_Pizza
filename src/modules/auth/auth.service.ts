import { prisma } from '../../db/client.js';
import { comparePassword, generateEmailToken, hashPassword, signAccessToken, signRefreshToken } from './auth.utils.js';
import { sendMail } from '../../config/mailer.js';
import { env } from '../../config/env.js';

export async function registerUser(input: { email: string; password: string; name: string; phone?: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err: any = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({ data: { email: input.email, passwordHash, name: input.name, phone: input.phone } });
  // email token
  const { token, expiresAt } = generateEmailToken();
  await prisma.emailVerificationToken.create({ data: { userId: user.id, token, expiresAt } });
  const verifyUrl = `http://localhost:${env.PORT}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail(user.email, 'Verifică adresa de email', `<p>Salut ${user.name},</p><p>Te rugăm să îți confirmi emailul: <a href="${verifyUrl}">Verifică email</a></p>`);
  return { id: user.id, email: user.email };
}

export async function verifyEmail(token: string) {
  const rec = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!rec || rec.expiresAt < new Date()) {
    const err: any = new Error('Invalid or expired token');
    err.statusCode = 400;
    throw err;
  }
  await prisma.user.update({ where: { id: rec.userId }, data: { emailVerifiedAt: new Date() } });
  await prisma.emailVerificationToken.delete({ where: { id: rec.id } });
  return true;
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  const ok = await comparePassword(input.password, user.passwordHash);
  if (!ok) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  if (!user.emailVerifiedAt) {
    const err: any = new Error('Email not verified');
    err.statusCode = 403;
    throw err;
  }
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);
  return { user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken };
}

export async function refresh(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  const accessToken = signAccessToken(user.id);
  return { accessToken };
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  const ok = await comparePassword(oldPassword, user.passwordHash);
  if (!ok) {
    const err: any = new Error('Invalid old password');
    err.statusCode = 400;
    throw err;
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
