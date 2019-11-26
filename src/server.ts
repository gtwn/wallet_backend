'use strict';
require('dotenv').load();
require("reflect-metadata");
const Hapi = require('hapi');
import appConfig from './config/app'
import { createConnection, getManager } from "typeorm";
import jwtConfig from "./config/jwt";
import getRoutes from './routes';
import { User } from "./utils/User";
import {User as UserEntity} from './entities/V.2.0.0/User';
const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Vision = require('vision');
const Acl = require('./utils/plugins/acl');
const Pack = require('../package');
const { Client } = require('pg');
var socketio = require('socket.io');

/**
 * Create Extension
 */
const client = new Client({
    user: process.env.DB_MASTER_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_MASTER_PASSWORD,
    port: process.env.DB_PORT,
});
client.connect();
client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`, (err, res) => {
    client.end();
    if(err){
        console.log(err);
    } else {
        createConnection().then(async connection => {

            /**
             * Configuration
             */
            const port = process.env.PORT || appConfig.port;
            const host = process.env.HOST || appConfig.host;
            const basePath = process.env.BASE_PATH || appConfig.basePath;
            const swaggerUIPath = process.env.SWAGGER_UI_PATH || appConfig.swaggerUIPath;
            const documentationPath = process.env.DOCUMENTATION_PATH || appConfig.documentationPath;
            const jsonPath = process.env.JSON_PATH || appConfig.jsonPath;
            const schemes = process.env.SCHEMES || appConfig.schemes;

            const server = Hapi.server({
                port,
                host,
                routes: {
                    cors: {
                        origin: ["*"],
                        additionalHeaders: ["locale"]
                    }
                }
            });

            const init = async () => {
                try {

                    /**
                     * Swagger Option
                     */
                    const swaggerOptions = {
                        info: {
                            title: 'Wallet API Documentation',
                            version: Pack.version,
                        },
                        schemes: schemes === "http" ? ['http'] : ['https'],
                        basePath,
                        swaggerUIPath,
                        documentationPath,
                        jsonPath
                    };

                    /**
                     * Register Plugin
                     */
                    await server.register([
                        require('hapi-auth-jwt2'),
                        Inert,
                        Vision,
                        Acl,
                        {
                            plugin: HapiSwagger,
                            options: swaggerOptions
                        },
                        {
                            plugin: require('hapi-i18n'),
                            options: {
                                locales: ['th', 'en'],
                                directory: __dirname + '/../locales',
                                languageHeaderField: 'locale',
                                defaultLocale: 'en'
                            }
                        }
                    ]);

                    /**
                     * Register Authentication
                     */
                    server.auth.strategy('jwt', 'jwt',
                        {
                            key: jwtConfig.key,
                            validate: User.validateToken,
                            verifyOptions: {
                                algorithms: ['HS256'],
                                ignoreExpiration: true
                            }
                        });

                    //server.auth.default('jwt');

                    server.route(await getRoutes());

                    let io = socketio.listen(server.listener);

                    io.on('connection', async function (socket) {
                        console.log('user connected = ' + socket.id);

                        let token = socket.handshake.query.authorization;
                        let user: any = <any> await User.getUserByToken(token);
                        if(user){
                            user.status = UserEntity.STATUS.ONLINE;
                            await getManager().save(user);
                        }


                        socket.on('disconnect', async () => {
                            let user: any = <any> await User.getUserByToken(token);
                            if(user){
                                user.status = UserEntity.STATUS.OFFLINE;
                                await getManager().save(user);
                            }
                            console.log('user disconnected')
                        })

                    });


                    await server.start();
                    console.log(`Server running at: ${server.info.uri}`);
                } catch (err) {
                    console.error("Error starting server: ", err.message);
                    throw err;
                }
            };

            process.on('unhandledRejection', (err) => {
                console.log(err);
                process.exit(1);
            });

            init();
        }).catch(error => console.log("TypeORM connection error: ", error));
    }
});