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
            clean: {
                keep: /^(server|preload)/,
            },
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
            'electron-squirrel-startup': 'commonjs electron-squirrel-startup',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'server.js',
            path: path.resolve(__dirname, 'build'),
            clean: {
                keep: /^(client|preload)/,
            },
        },
        plugins: [...optionalPlugins]
    },
    {
        name: 'preload',
        target: 'node',
        entry: './preload.js',
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
            'electron-squirrel-startup': 'commonjs electron-squirrel-startup',
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'preload.js',
            path: path.resolve(__dirname, 'build'),
            clean: {
                keep: /^(client|server)/,
            },
        },
        plugins: [...optionalPlugins]
    }
]