import { type User as PrismaUser, PublicUser } from "@shared/prisma";
export declare class UserModel {
    id: number;
    username: string;
    name?: string | null;
    password: string;
    readonly publicFields: (keyof PublicUser)[];
    constructor(prismaUser: PrismaUser);
    toPublic: () => PublicUser;
}
