"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const extension_accelerate_1 = require("@prisma/extension-accelerate");
const prisma_1 = require("@shared/prisma");
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new prisma_1.PrismaClient().$extends((0, extension_accelerate_1.withAccelerate)());
exports.prisma = prisma;
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
//# sourceMappingURL=prisma.js.map