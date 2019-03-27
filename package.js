Package.describe({
    name: 'cerealkiller:skelelist',
    version: '5.0.0',
    summary: 'list views for skeletor',
    // URL to the Git repository containing the source code for this package.
    git: '',
    documentation: 'README.md'
});

Package.onUse(function(api) {
    // namespace
    api.addFiles([
        'namespace.js'
    ],
    ['client', 'server']);


    api.versionsFrom('METEOR@1.8.0.2');


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
        'cerealkiller:skeletor',
        'cerealkiller:skeleform'
    ],
    ['client', 'server']);


    // styles
    api.addFiles([
        'styles/skelelist.scss'
    ],
    ['client']);


    // templates
    api.addFiles([
        'templates/list-layout.html',
        'templates/list-toolbars.html',
        'templates/list-actions.html',
        'templates/list-action-delete.html',
        'templates/list-action-change-password.html',
        'templates/list-common-assets.html'
    ],
    ['client']);


    // libraries
    api.addFiles([
        'events/list-layout-events.js',
        'events/list-toolbars-events.js',
        'events/list-actions-events.js',
        'events/list-action-delete-events.js',
        'events/list-action-change-password-events.js',

        'helpers/list-layout-helpers.js',
        'helpers/list-toolbars-helpers.js',
        'helpers/list-action-delete-helpers.js'
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
