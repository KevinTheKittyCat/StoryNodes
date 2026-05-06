"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    id;
    username;
    name;
    password;
    publicFields = ['id', 'username', 'name'];
    constructor(prismaUser) {
        this.id = prismaUser.id;
        this.username = prismaUser.username;
        this.name = prismaUser.name;
        this.password = prismaUser.password;
    }
    toPublic = () => {
        let publicUser = this.publicFields.reduce((acc, key) => {
            if (this[key] === undefined)
                return acc;
            acc[key] = this[key];
            return acc;
        }, {});
        return publicUser;
    };
}
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map