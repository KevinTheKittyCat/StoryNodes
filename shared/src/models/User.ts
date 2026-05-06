import { type User as PrismaUser, PublicUser } from "@shared/prisma";

export class UserModel {
    id: number;
    username: string;
    //email: string;
    name?: string | null;
    password: string;
    readonly publicFields: (keyof PublicUser)[] = ['id', 'username', 'name'];
    
    constructor(prismaUser: PrismaUser) {
        this.id = prismaUser.id;
        this.username = prismaUser.username;
        this.name = prismaUser.name;
        //this.email = prismaUser.email;
        this.password = prismaUser.password;
    }

    toPublic: () => PublicUser = () => {
        let publicUser: PublicUser = this.publicFields.reduce((acc: PublicUser, key: keyof PublicUser) => {
            if (this[key] === undefined) return acc;
            (acc as any)[key] = (this as any)[key];
            return acc;
        }, {} as PublicUser);
        return publicUser;
    };
}