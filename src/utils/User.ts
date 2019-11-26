import { User as UserEntity } from "../entities/V.2.0.0/User";
import { Token as TokenEntity } from "../entities/V.2.0.0/Token";
import { getManager, getRepository } from "typeorm";
import { Token } from "../entities/V.2.0.0/Token";
const jwt = require("jsonwebtoken");
import jwtConfig from "../config/jwt";
const bcrypt = require('bcrypt');

export class User {
    userEntity;
    token;

    static STATUS = {
        ONLINE: 'ONLINE',
        OFFLINE: 'OFFLINE'
    }

    async saveUser() {
        let instance = this;
        return await getManager().save(this.userEntity)
            .then(() => {
                return instance;
            }).catch(e => console.log(e));
    }

    static async getUserByToken(token){
        try {
            let checkToken = await getManager().findOne(Token, {
                where:{token},
                relations: ["user"]
            });
            let checkUser;
            if (checkToken) {
                checkUser = await getManager().findOne(UserEntity, {
                    where: {
                        id: checkToken.user.id,
                        deletedAt: <any>null
                    }
                });
                if (checkUser) {
                    return checkUser;
                }
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async saveToken(tokenStr) {
        let token = new TokenEntity();
        token.token = tokenStr;
        token.user = this.userEntity;
        token.type = TokenEntity["TOKEN_TYPE_AUTH_" + this.userEntity.userType];

        return await getManager().save(token)
            .then(token => {
                return token;
            });
    }

    async generateToken() {
        if (!this.userEntity.id) {
            await this.saveUser();
        }
        let token = jwt.sign({
            userId: this.userEntity.id
        }, jwtConfig.key);
        await this.saveToken(token);

        this.token = token;

        return token;
    }
    static async login(request) {
        try {
            const user: UserEntity = <any>await getRepository(UserEntity)
            .createQueryBuilder('user')
            .select("user.id")
            .addSelect("user.email")
            .addSelect("user.password")
            .addSelect("user.account")
            .addSelect("user.balance")
            .addSelect( "user.fristName")
            .addSelect("user.lastName")
            .addSelect("user.userType")
            .where("LOWER(user.email) =:email AND user.deletedAt IS NULL",{email:(request.email).toLowerCase()})
            .getOne()
            if (user) {
                return await new Promise((resolve, reject) => {
                    bcrypt.compare(request.password, user.password, async function (err, res) {
                        if (res) {
                            let instance = new User();
                            instance.userEntity = user;
                            await instance.generateToken();
                            instance.userEntity.password = null;
                            resolve(instance);
                        } else {
                            console.log(err);
                            reject(err);
                        }
                    });
                });
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static async validateToken(decoded, request) {
        try {
            let { userId } = decoded;
            let token = request.headers.authorization.replace("Bearer ", "");
            let checkToken = await getManager().findOne(Token, { token }).catch(e => console.log(e));
            let checkUser;
            if (checkToken) {
                checkUser = await getManager().findOne(UserEntity, {
                    where: { 
                        id: userId,
                        deletedAt: <any>null
                    },
                }).catch(e => console.log(e));
                if (checkUser) {
                    return { isValid: true };
                }
            }
            return { isValid: false };
        } catch (e) {
            console.log(e);
            return { isValid: false };
        }

    }

    static async setStatus(userId, status) {
        try {
            let user = await getManager().findOne(UserEntity, {
                where: {
                    id: userId,
                    deletedAt: <any>null
                },
            })
            
            if (user) {
                // user.status = status;
                let response = await getManager().save(user);
            }else{
                
            }
            return { user }

        } catch (e) {
            console.log(e);
            return { isValid: false };
        }

    }


}
