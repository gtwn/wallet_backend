const Joi = require('joi');
import userController from '../../controllers/clients/funcController'
import funcController from '../../controllers/clients/funcController';
export default [
    {
        method: 'POST',
        path: '/api/func/transfer',
        options: {
            handler: funcController.tranfer,
            description: 'Student register',
            notes: 'Student register',
            tags: ['api', 'client', 'register'],
            auth: false,
            validate: {
                headers: Joi.object({
                    locale: Joi.string().description('Language')
                }).options({ allowUnknown: true }),
                payload: {
                    Account: Joi.string().required().description('Account'),
                    accountts: Joi.string().required().description('accountts'),
                    amount: Joi.string().required().description('amount'),
                    typeT: Joi.string().required().description('typeT'),
                    oldAcc: Joi.string().required().description('oldAcc')
                },
                failAction: userController.tranfer
            },
        },
    },
    {
            method: 'POST',
            path: '/api/func/topup',
            options: {
                handler: funcController.topup,
                description: 'Student login',
                notes: 'Student login',
                tags: ['api', 'client', 'register'],
                auth: false,
                validate: {
                    headers: Joi.object({
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    payload: {
                        code: Joi.string().required().description('code'),
                        Account: Joi.string().required().description('Account'),
                    },
                    failAction: userController.topup
                },
            },
        },
        {
            method: 'GET',
            path: '/api/user/payment/{account}',
            options: {
                handler: funcController.payment,
                description: 'Validate Token',
                notes: 'Token Validation',
                tags: ['api', 'util', 'token','validate'],
                auth: "jwt",
                validate: {
                    headers: Joi.object({
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    params:{
                        account: Joi.string().required().description('account')
                    },
                    query:{
                        shopacc: Joi.string().required().description('shopacc'),
                        price: Joi.string().required().description('price'),
                    },
                    failAction: funcController.payment
                },
            },
        },
]