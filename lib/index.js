// Load modules

var Glue = require('glue');
var Hapi = require('hapi');
var Config = require('../config.json');


// Internals
var internals = {
    manifest: {
        connections: [
        {
            port: Config.port || 8080,
            labels: ['http']
        },
        {
            port: Config.apiPort || 8088,
            labels: ['api']
        }
        ],
        registrations: [
        {
            plugin: 'bell', options: {select: ['http']}
        },
        {
            plugin: 'inert', options: {select: ['http']}
        },
        {
            plugin: 'vision', options: {select: ['http']}
        },
        {
            plugin: 'hapi-auth-cookie', options: {select: ['http']}
        },
        {
            plugin: './authentication', options: {select: ['http']}
        },
        {
            plugin: './controllers', options: {select: ['http', 'api']}
        },
        {
            plugin: './models', options: {select: ['http', 'api']}
        },
        {
            plugin: './routes', options: {select: ['http']}
        },
        {
            plugin: './api', options: {select: ['api']}
        },
        {
            plugin: {
                register: 'good',
                options: {
                    opsInterval: 5000,
                    reporters: [
                        { 'reporter': 'good-console', 'events': { 'log': '*' } }
                    ]
                }
            }
        },
        ]
    }
};
if (!process.env.PRODUCTION) {
    var registrations = internals.manifest.registrations;

    var blippPlugin = {
        plugin: {
            register: 'blipp',
            options: {
                showAuth: true
            }
        }
    };
    registrations.push(blippPlugin);

    var goodPlugin = registrations.find(e => e.plugin.register === 'good')
    goodPlugin.plugin.options.reporters[0].events['ops'] =  '*';
}


Glue.compose(internals.manifest, { relativeTo: __dirname }, function (err, pack) {

    if (err) {
        console.log('server.register err:', err);
    }

    var httpServer = pack.select('http');

    pack.start(function(){
        console.log('✅  Server is listening on ' + httpServer.info.uri.toLowerCase());
    });
});
