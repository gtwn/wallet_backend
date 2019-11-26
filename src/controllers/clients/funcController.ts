import { User as UserEntity } from '../../entities/V.2.0.0/User'
import { getRepository, getManager } from 'typeorm';
import { Transactions } from '../../entities/V.2.0.0/Transactions';
import { Topup } from '../../entities/V.2.0.0/Topup';
const tranin = 'Transfer in'
export default {
    tranfer: async (request, h, err) => {
        try {
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                    question: "Question is invalid",
                    email: "Email is invalid",
                    password: "password is invalid"
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
            let { Account, accountts, amount, typeT, oldAcc } = request.payload;
            let user = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: Account })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if (!user) {
                return h.response({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: request.i18n.__("Data is invalid"),
                    payload: "Token is invalid"
                }).code(401).takeover();
            }
            let user2 = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: oldAcc })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if (!user2) {
                return h.response({
                    statusCode: 401,
                    error: "Unauthorized",
                    message: request.i18n.__("Data is invalid"),
                    payload: "Token is invalid"
                }).code(401).takeover();
            }
            if (user2.balance < amount) {
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Not enough money in the account"),
                }).code(400).takeover();
            } else {
                let balance2 = user2.balance;
                user2.balance = balance2 - amount;
                user.balance = balance2 + amount;
                let addtran = new Transactions();
                addtran.typeT = typeT;
                addtran.account = Account;
                addtran.accountts = accountts;
                addtran.amount = amount;
                await getManager().save(addtran);
                let addtranin = new Transactions();
                addtranin.typeT = tranin;
                addtran.account = accountts;
                addtran.accountts = Account;
                addtran.amount = amount;
                await getManager().save(addtranin);
                let response: any = await getManager().save(user2);
                await getManager().save(user);
                return h.response({
                    statusCode: 200,
                    success: 'OK',
                    message: request.i18n.__('Create Data Successfuly'),
                    balance: response.balance
                })

            }

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
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                    question: "Question is invalid",
                    email: "Email is invalid",
                    password: "password is invalid"
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
            let { code, Account, typeT } = request.payload;
            let topup = <any>await getRepository(Topup)
                .createQueryBuilder('u')
                .where('u.recode =:code', { code: code })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if (!topup) {
                return h.response({
                    statusCode: 404,
                    error: "Not Found",
                    message: request.i18n.__("This code can't use"),
                }).code(404).takeover();
            }
            topup.recode = topup.recode + 'used';
            await getManager().save(topup);
            let addtran = new Transactions();
            addtran.typeT = typeT;
            addtran.account = '-';
            addtran.accountts = Account;
            addtran.amount = topup.amount;
            await getManager().save(addtran);
            let user = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: Account })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            user.balance = user.balance + topup.amount;
            let respon: any = await getManager().save(addtran);
            return h.response({
                statusCode: 200,
                success: 'OK',
                message: request.i18n.__('Topup Successfuly'),
                balanced: respon.balance
            })
        } catch (e) {
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }

    },
    payment: async (request, h, err) => {
        try {
            if (err) {
                console.log(err.output.payload.validation.keys);
                let errorMessage = {
                    locale: "Locale is invalid",
                    question: "Question is invalid",
                    email: "Email is invalid",
                    password: "password is invalid"
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
            let { account } = request.params;
            let { shopacc, price } = request.query;
            price = parseFloat(price);
            let user = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: account })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
            if (!user) {
                return h.response({
                    statusCode: 404,
                    error: "Not Found",
                    message: request.i18n.__("Data is invalid"),
                    check: 0
                }).code(404).takeover();
            }
            if(user.balance<price){
                return h.response({
                    statusCode: 400,
                    error: "Bad Request",
                    message: request.i18n.__("Not enough money in the account"),
                    check: 0
                }).code(400).takeover();
            }else{
                user.balance=user.balance-price;
                
                let user2 = <any>await getRepository(UserEntity)
                .createQueryBuilder('u')
                .where('u.account =:account', { account: shopacc })
                .andWhere('u.deletedAt IS NULL')
                .getOne();
                if (!user2) {
                    return h.response({
                        statusCode: 404,
                        error: "Not Found",
                        message: request.i18n.__("Data is invalid"),
                        check: 0
                    }).code(404).takeover();
                }
                user2.balance=user2.balance+price;
                let addtran = new Transactions();
                addtran.typeT = "Payment";
                addtran.account = account;
                addtran.accountts = shopacc;
                addtran.amount = price;
                await getManager().save(addtran);
                let addtranin = new Transactions();
                addtranin.typeT = "Payment in";
                addtran.account = shopacc;
                addtran.accountts = account;
                addtran.amount = price;
                await getManager().save(addtranin);
                await getManager().save(user);
                await getManager().save(user2);
                return h.response({
                    statusCode: 200,
                    success: 'OK',
                    message: request.i18n.__('Payment Successfuly'),
                    check: 1
                })
            }
        } catch (e) {
            console.log(e);
            return h.response({
                statusCode: 500,
                error: "Internal Server Error",
                message: request.i18n.__("Internal Server Error")
            }).code(500);
        }
    }
}