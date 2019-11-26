'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').load();
require("reflect-metadata");
const Hapi = require('hapi');
const app_1 = require("./config/app");
const typeorm_1 = require("typeorm");
const jwt_1 = require("./config/jwt");
const routes_1 = require("./routes");
const User_1 = require("./utils/User");
const User_2 = require("./entities/V.2.0.0/User");
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
    if (err) {
        console.log(err);
    }
    else {
        typeorm_1.createConnection().then((connection) => __awaiter(void 0, void 0, void 0, function* () {
            /**
             * Configuration
             */
            const port = process.env.PORT || app_1.default.port;
            const host = process.env.HOST || app_1.default.host;
            const basePath = process.env.BASE_PATH || app_1.default.basePath;
            const swaggerUIPath = process.env.SWAGGER_UI_PATH || app_1.default.swaggerUIPath;
            const documentationPath = process.env.DOCUMENTATION_PATH || app_1.default.documentationPath;
            const jsonPath = process.env.JSON_PATH || app_1.default.jsonPath;
            const schemes = process.env.SCHEMES || app_1.default.schemes;
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
            const init = () => __awaiter(void 0, void 0, void 0, function* () {
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
                    yield server.register([
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
                    server.auth.strategy('jwt', 'jwt', {
                        key: jwt_1.default.key,
                        validate: User_1.User.validateToken,
                        verifyOptions: {
                            algorithms: ['HS256'],
                            ignoreExpiration: true
                        }
                    });
                    //server.auth.default('jwt');
                    server.route(yield routes_1.default());
                    let io = socketio.listen(server.listener);
                    io.on('connection', function (socket) {
                        return __awaiter(this, void 0, void 0, function* () {
                            console.log('user connected = ' + socket.id);
                            let token = socket.handshake.query.authorization;
                            let user = yield User_1.User.getUserByToken(token);
                            if (user) {
                                user.status = User_2.User.STATUS.ONLINE;
                                yield typeorm_1.getManager().save(user);
                            }
                            socket.on('disconnect', () => __awaiter(this, void 0, void 0, function* () {
                                let user = yield User_1.User.getUserByToken(token);
                                if (user) {
                                    user.status = User_2.User.STATUS.OFFLINE;
                                    yield typeorm_1.getManager().save(user);
                                }
                                console.log('user disconnected');
                            }));
                        });
                    });
                    yield server.start();
                    console.log(`Server running at: ${server.info.uri}`);
                }
                catch (err) {
                    console.error("Error starting server: ", err.message);
                    throw err;
                }
            });
            process.on('unhandledRejection', (err) => {
                console.log(err);
                process.exit(1);
            });
            init();
        })).catch(error => console.log("TypeORM connection error: ", error));
    }
});
