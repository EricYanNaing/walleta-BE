import { prisma } from "../../db/client";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { type RegisterDTO, type LoginDTO, loginSchema } from "./auth.schema";

export class AuthService {
  static async register(data: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing)
      throw Object.assign(new Error("User already exist."), { status: 409 });

    const hash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: hash,
      },
    });

    return this.sign(user.id, user.email);
  }

  static async login(data: LoginDTO) {
    const parsed = loginSchema.safeParse(data);

    if (!parsed.success) {
      throw Object.assign(new Error("Invalid Credentials."), {
        status: 400,
        issues: parsed.error.issues,
      });
    }

    const { identifier, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user)
      throw Object.assign(new Error("Invalid Credentials."), { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok)
      throw Object.assign(new Error("Invalid Credentials."), { status: 401 });

    return this.sign(user.id, user.email);
  }

  static async getUser(userId : string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        limitAmount: true,
        totalAmount: true,
      },
    });

    if (!user)
      throw Object.assign(new Error("User not found."), { status: 404 });

    return user;
  }

  private static sign(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
    };
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, options);

    return {token,userId};
  }
}
