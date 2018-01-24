Package.describe({
    name: 'cerealkiller:skelelist',
    version: '1.40.0',
    summary: 'collection views',
    // URL to the Git repository containing the source code for this package.
    git: '',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles(['namespace.js'], ['client', 'server']);

    // dependencies
    api.use([
        'jquery',
        'underscore@1.0.0',
        'fourseven:scss',
        'blaze-html-templates'
    ],
    ['client']);

    api.use([
        'check',
        'ecmascript',
        'cerealkiller:skeleutils',
        'cerealkiller:skeletor',
        'cerealkiller:skeleform'
    ],
    ['client', 'server']);

    // styles
    api.addFiles(['styles/skelelist.scss'], ['client']);

    // templates
    api.addFiles(['templates/skelelist.html'], ['client']);

    // libraries
    api.addFiles([
        'helpers/listHelpers.js',
        
        'events/listEvents.js',
        'events/changePasswordEvents.js'
    ],
    ['client']);


    // exports
    api.export(['Skelelist']);

});

Package.onTest(function(api) {
    api.use([
        'tinytest',
        'cerealkiller:skelelist'
    ]);

    api.addFiles(['skeleform-tests.js']);
});
