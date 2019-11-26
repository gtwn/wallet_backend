const Joi = require('joi');
import userController from '../../controllers/clients/userController'
export default [
    {
        method: 'POST',
        path: '/api/user/signup',
        options: {
            handler: async (request, h) => {
                request.userType = 'STUDENT';
                return await userController.register(request, h, null)
            },
            description: 'Student register',
            notes: 'Student register',
            tags: ['api', 'client', 'register'],
            auth: false,
            validate: {
                headers: Joi.object({
                    locale: Joi.string().description('Language')
                }).options({ allowUnknown: true }),
                payload: {
                    email: Joi.string().required().description('Email User').example('superder@kmitl.ac.th'),
                    username: Joi.string().required().description('username'),
                    password: Joi.string().required().description('User Password'),
                    fristName: Joi.string().required().description('name of User'),
                    lastName: Joi.string().required().description('surname of User'),
                    balance: Joi.string().required().description('balance'),
                    account: Joi.string().required().description('account')
                },
                failAction: userController.register
            },
        },
    },
    {
            method: 'POST',
            path: '/api/user/login',
            options: {
                handler: async (request, h) => {
                    request.userType = 'STUDENT';
                    return await userController.login(request, h, null)
                },
                description: 'Student login',
                notes: 'Student login',
                tags: ['api', 'client', 'register'],
                auth: false,
                validate: {
                    headers: Joi.object({
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    payload: {
                        email: Joi.string().required().description('Email User').example('superder@kmitl.ac.th'),
                        password: Joi.string().required().description('User Password'),
                    },
                    failAction: userController.login
                },
            },
        },
        {
            method: 'GET',
            path: '/api/user/{accountId}',
            options: {
                handler: userController.getProfile,
                description: 'Validate Token',
                notes: 'Token Validation',
                tags: ['api', 'util', 'token','validate'],
                auth: "jwt",
                validate: {
                    headers: Joi.object({
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    params:{
                        Account: Joi.string().required().description('Account')
                    },
                    failAction: userController.getProfile
                },
            },
        },
        {
            method: 'GET',
            path: '/api/user/transac/{accountts}',
            options: {
                 handler: userController.getTransaction,
                description: 'User login',
                notes: 'USER login',
                tags: ['api', 'client', 'register'],
                auth: "jwt",
                validate: {
                    headers: Joi.object({
                        Authorization: Joi.string().description('Authentication Token'),
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    params: {
                        accountts: Joi.string().required().description('accountts'),
                     },
                    failAction: userController.getTransaction
                },
            },
        },
        {
            method: 'POST',
            path: '/api/user/topup',
            options: {
                handler: userController.topup,
                description: 'Student register',
                notes: 'Student register',
                tags: ['api', 'client', 'register'],
                auth: false,
                validate: {
                    headers: Joi.object({
                        locale: Joi.string().description('Language')
                    }).options({ allowUnknown: true }),
                    payload: {
                        recode: Joi.string().required().description('recode'),
                        amount: Joi.string().required().description('amount')
                    },
                    failAction: userController.topup
                },
            },
        },
        
]