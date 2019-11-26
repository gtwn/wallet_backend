module.exports = {
    "type": process.env.DB_CONNECTION,
    "host": process.env.DB_HOST,
    "port": process.env.DB_PORT,
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_DATABASE,
    // "dropSchema": process.env.DB_DROP_SCHEMA,
    "synchronize": process.env.DB_SYNCHRONIZE,
    "logging": process.env.DB_LOGGING,
    "charset": "UTF8_GENERAL_CI", 
    "timezone": "UTC+7",
    "entities": [
        "dist/entities/**/*.js"
    ],
    "migrations": [
        "dist/migrations/**/*.js"
    ],
    cli: {
        entitiesDir: "src/entities",
        migrationsDir: "src/migrations"
    }
 };