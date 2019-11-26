module.exports = {
    entry: './src/server.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'main.js'
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    }
}