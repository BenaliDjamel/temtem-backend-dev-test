export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
};

export const SALT_OR_ROUNDS = Number(process.env.SALT_OR_ROUNDS ?? 10);
