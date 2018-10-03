Package.describe({
    name: 'cerealkiller:skelelist',
    version: '3.7.23',
    summary: 'collection views',
    // URL to the Git repository containing the source code for this package.
    git: '',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles(['namespace.js'], ['client', 'server']);

    api.versionsFrom('METEOR@1.6.1');

    // dependencies
    api.use([
        'jquery',
        'underscore@1.0.0',
        'fourseven:scss@4.5.4',
        'reactive-var',
        'blaze-html-templates@1.1.2'
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
    api.addFiles([
        'templates/listLayout.html',
        'templates/listToolbars.html',
        'templates/listActions.html',
        'templates/listActionDelete.html',
        'templates/listActionChangePassword.html',
        'templates/listCommonAssets.html'
    ],
    ['client']);

    // libraries
    api.addFiles([
        'events/listLayoutEvents.js',
        'events/listToolbarsEvents.js',
        'events/listActionsEvents.js',
        'events/listActionDeleteEvents.js',
        'events/listActionChangePasswordEvents.js',

        'helpers/listLayoutHelpers.js',
        'helpers/listToolbarsHelpers.js',
        'helpers/listActionDeleteHelpers.js'
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
