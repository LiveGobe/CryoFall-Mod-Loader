const path = require('node:path')
const { IgnorePlugin } = require('webpack')

const optionalPlugins = [];
if (process.platform !== "darwin") { // don't ignore on OSX
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
}

exports.default = [
    {
        name: 'client',
        target: 'web',
        entry: './src/client/index.ts',
        devtool: 'source-map',
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'client.js',
            path: path.resolve(__dirname, 'build'),
            asyncChunks: true,
            chunkFilename: '[name].[id].js',
            chunkLoading: 'import',
        },
        plugins: [...optionalPlugins]
    },
    {
        name: 'server',
        target: 'node',
        entry: './src/server/index.ts',
        devtool: 'source-map',
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        externals: {
            electron: 'commonjs electron',
            'electron-reloader': 'commonjs electron-reloader',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname, 'build'),
        },
        plugins: [...optionalPlugins]
    }
]