import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const jwtConstants = {
    secret: JWT_SECRET,
};