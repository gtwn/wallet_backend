import checkEmail from '../../utils/CheckMailFormat'
import {User as UserEntity} from '../../entities/V.2.0.0/User'
import { User } from "../../utils/User";
import { getRepository,getManager } from 'typeorm';
import appConfig from "../../config/app";
import { Pagination } from '../../utils/Pagination';
import { Transactions } from '../../entities/V.2.0.0/Transactions';
import { Topup } from '../../entities/V.2.0.0/Topup';

const bcrypt = require("bcrypt");
export default{
    register:async(request,h,err)=>{
        try{
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                    question:"Question is invalid",
                    email:"Email is invalid",
                    password:"password is invalid"
                };
                let payloadMessage = {};
                err.output.payload.validation.keys.map((value) => {
                    payloadMessage[value] = request.i18n.__(errorMessage[value])
                });
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Data is invalid"),
                    payload: payloadMessage
                }).code(400).takeover();
            } 
            let {Account,password,frisrtname,lastname,email,balance,username}= request.payload

            if (await checkEmail(email)) {
                return h
                    .response({
                        statusCode: 400,
                        error: "Bad Request",
                        message: request.i18n.__("The  email is invalid fomat")
                    })
                    .code(400);
            }
            let checkUser = await getRepository(UserEntity)
            .createQueryBuilder('u')
            .where('u.email =:email AND u.deletedAt IS NULL AND u.userType =:userType',{email:email,userType:request.userType})
            .getOne()
            if(checkUser){
                return h
                    .response({
                        statusCode: 409,
                        error: "Conflict",
                        message: request.i18n.__("อีเมลนี้มีผู้ใช้งานแล้ว")
                    })
                    .code(409);
            }
            let passwordHash = await new Promise((resolve, reject) => {
                bcrypt.hash(password, appConfig.salt, function (err, hash) {
                    if (err) reject(err);
                    resolve(hash);
                });
            });
            let user:any = new UserEntity();
            user.account=Account;
            user.email = email;
            user.username = username;
            user.fristName = frisrtname;
            user.lastName=lastname;
            user.balance=balance
            user.password = <any>passwordHash
            
            await getManager().save(user);
            user.password=null;
            return h.response({
                statusCode: 200,
                success: 'OK',
                message: request.i18n.__('Create Data Successfuly'),
                payload: user
            })
        }catch(e){
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    },
    login:async(request,h,err)=>{
        try{
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                    email:"Email is invalid",
                    password:"password is invalid"
                };
                let payloadMessage = {};
                err.output.payload.validation.keys.map((value) => {
                    payloadMessage[value] = request.i18n.__(errorMessage[value])
                });
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Data is invalid"),
                    payload: payloadMessage
                }).code(400).takeover();
            }
            
            let user = <any>await User.login(request.payload);
            if (user) {
                user.expiresId=3600;
                return h
                    .response({
                        statusCode: 200,
                        success: "OK",
                        message: request.i18n.__("Login Successfully"),
                        payload: {
                            user: {
                                ...user.userEntity,
                                token: user.token
                            }
                        }
                    })
                    .code(200);
            }
            return h
                .response({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: request.i18n.__("Email or Password is invalid")
                })
                .code(401);
        }catch(e){
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    },
    getProfile: async (request, h, err) => {
        try {
            /**
             * Error from route validation
             */
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                };
                let payloadMessage = {};
                err.output.payload.validation.keys.map((value) => {
                    payloadMessage[value] = request.i18n.__(errorMessage[value])
                });
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Data is invalid"),
                    payload: payloadMessage
                }).code(400).takeover();
            }
            /**
             * Prepare profile data
             */
            let { userId } = request.auth.credentials;
            let {account}=request.params;
            let user = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: account })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if(!user){
                return h.response({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: request.i18n.__("Data is invalid"),
                    payload: "Token is invalid"
                }).code(401).takeover();
            }
            user.password=null;

            return h.response({
                statusCode: 200,
                success: "OK",
                message: request.i18n.__("Data retrieved successfully"),
                payload: {
                    user
                }
            }).code(200);

        } catch (e) {
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    },
    getTransaction: async (request, h, err) => {
        try {
            /**
             * Error from route validation
             */
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                };
                let payloadMessage = {};
                err.output.payload.validation.keys.map((value) => {
                    payloadMessage[value] = request.i18n.__(errorMessage[value])
                });
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Data is invalid"),
                    payload: payloadMessage
                }).code(400).takeover();
            }
            /**
             * Prepare profile data
             */
            let { userId } = request.auth.credentials;
            let {accountts}=request.params;
            let user = <any>await getRepository(Transactions)
                .createQueryBuilder('u')
                .where('u.accountts =:accountts', { accountts: accountts })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if(!user){
                return h.response({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: request.i18n.__("Data is invalid"),
                    payload: "Token is invalid"
                }).code(401).takeover();
            }
            user.password=null;

            return h.response({
                statusCode: 200,
                success: "OK",
                message: request.i18n.__("Data retrieved successfully"),
                payload: {
                    user
                }
            }).code(200);

        } catch (e) {
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    },
    topup: async (request, h, err) => {
        try {
            /**
             * Error from route validation
             */
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                };
                let payloadMessage = {};
                err.output.payload.validation.keys.map((value) => {
                    payloadMessage[value] = request.i18n.__(errorMessage[value])
                });
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Data is invalid"),
                    payload: payloadMessage
                }).code(400).takeover();
            }
            /**
             * Prepare profile data
             */
            let {recode,amount}=request.payload;
            let topup= new Topup();
            topup.recode=recode;
            topup.amount=amount;
            await getManager().save(topup);

            return h.response({
                statusCode: 200,
                success: "OK",
                message: request.i18n.__("Data retrieved successfully"),
                payload: {
                    topup
                }
            }).code(200);

        } catch (e) {
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    },
    
}