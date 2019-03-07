import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Counts } from 'meteor/ros:publish-counts';


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skelelist pagination
Template.skelelistPagination.onCreated(function() {
    let schema = this.data.schema;
    let collection = schema.__collection;
    let itemsPerPage = schema.__listView.options.itemsPerPage;
    this.currentPage = new ReactiveVar();

    this.data.appendLoadMore = new ReactiveVar(true);

    // initialize currentPage
    this.autorun(() => {
        if (this.data.skeleSubsReady.get() === true) {
            let numberOfLoadedDocuments = Skeletor.Data[collection].find().count();
            let currentPage = Math.ceil(numberOfLoadedDocuments / itemsPerPage);

            this.currentPage.set(currentPage);
            this.isLoading = false;
        }
        else {
            this.currentPage.set(1);
            this.isLoading = true;
        }
    });

    // autoload (infinite-scroll pagination)
    if (schema.__listView.options.autoLoad === true) {
        let instance = this;

        $(window).on('scroll.skeleLoadMore', function() {
            if (instance.isLoading) {
                return false;
            }
            let $loadMore = $('.skeleLoadMore');

            if ($loadMore.length === 0) {
                // all loaded -> unbind event handler
                $(window).off('scroll.skeleLoadMore');
                return false;
            }

            let triggeringOffset = schema.__listView.options.triggeringOffset || 500;
            let pageTop = $(window).scrollTop();
            let pageBottom = pageTop + $(window).height() + triggeringOffset;
            let elementTop = $loadMore.offset().top;
            let elementBottom = elementTop + $loadMore.height();

            if ((elementTop <= pageBottom)) {
                SkeleUtils.GlobalUtilities.logger('triggering autoLoad ->', 'skelelist');
                skeleLoadMore(this, instance);
            }
        });
    }
});

Template.skelelistPagination.events({
    'click .skeleLoadMore': function(event, instance) {
        skeleLoadMore(event, instance);
    }
});


function skeleLoadMore(event, instance) {
    let data = instance.data;
    let schema = data.schema;
    let collection = schema.__collection;
    let subManager = schema.__subManager;
    let listSchema = schema.__listView;
    let itemsPerPage = listSchema.options.itemsPerPage;
    let currentPage = instance.currentPage.get();
    let numberOfLoadedDocuments;
    let totalNumberOfDocuments;
    let options = {
        fields: {}
    };
    let currentLang = FlowRouter.getParam('itemLang');

    currentPage++;

    function handleFieldOption(fieldName) {
        let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(schema.fields, fieldName);

        if (fieldSchema) {
            if (fieldSchema.i18n === false) {
                options.fields[fieldName] = 1;
            }
            else {
                options.fields[`${currentLang}---${fieldName}`] = 1;
            }
        }
    }

    for (let field of listSchema.itemFields) {
        handleFieldOption(field.name);
    }
    for (let param of listSchema.detailLink.params) {
        handleFieldOption(param);
    }

    SkeleUtils.GlobalUtilities.logger(`Loading page ${currentPage}`, 'skelelist');

    function loadMoreDocuments() {
        totalNumberOfDocuments = Counts.get(`${collection}Counter`);
        numberOfLoadedDocuments = Skeletor.Data[collection].find().count();

        if ((totalNumberOfDocuments - numberOfLoadedDocuments) === 0) {
            SkeleUtils.GlobalUtilities.logger('All documents loaded...', 'skelelist');

            instance.data.appendLoadMore.set(false);
        }
    }

    let documentsList;

    if (subManager) {
        documentList = Skeletor.subsManagers[subManager].subscribe(
            'rawFindDocuments',
            collection,
            {},
            options,
            data.schemaName,
            currentPage,
            currentLang,
            loadMoreDocuments
        );
    }
    else {
        documentList = Meteor.subscribe(
            'rawFindDocuments',
            collection,
            {},
            options,
            data.schemaName,
            currentPage,
            currentLang,
            loadMoreDocuments
        );
    }

    instance.currentPage.set(currentPage);
}


// skelelist search
Template.skelelistSearch.events({
    'click .skelelistUndoBtn': function(event, instance) {
        instance.data.listQuery.set({});
    },

    'click .skelelistSearchBtn': function(event, instance) {
        let data = instance.data;
        let schema = data.schema;
        let collection = schema.__collection;
        let subManager = schema.__subManager;
        let listSchema = schema.__listView;
        let options = {
            fields: {},
            caseInsensitiveQuery: true
        };
        let query = {};
        let currentLang = FlowRouter.getParam('itemLang');

        function handleField(fieldName) {
            let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(schema.fields, fieldName);

            if (fieldSchema.i18n === false) {
                options.fields[fieldName] = 1;
            }
            else {
                options.fields[`${currentLang}---${fieldName}`] = 1;
            }
        }

        for (let field of listSchema.itemFields) {
            handleField(field.name);
        }
        for (let param of listSchema.detailLink.params) {
            handleField(param);
        }

        // build query
        let $searchOptions = instance.$('.skelelistSearchInput');

        for (let searchOption of $searchOptions) {
            let $searchOption = $(searchOption);
            let name = $searchOption.data('name');
            let fieldName = name;
            let value = $searchOption.val();
            let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(schema.fields, name);

            if (fieldSchema.i18n !== false) {
                fieldName = `${currentLang}---${name}`;
            }

            if (value.length > 0) {
                if (listSchema.search[name].caseInsensitive) {
                    query[fieldName] = {
                        '$regex': value,
                        '$options': 'i'
                    }
                }
                else {
                    query[fieldName] = value;
                }
            }
        }

        if (subManager) {
            documentList = Skeletor.subsManagers[subManager].subscribe(
                'rawFindDocuments',
                collection,
                query,
                options,
                data.schemaName,
                null
            );
        }
        else {
            documentList = Meteor.subscribe(
                'rawFindDocuments',
                collection,
                query,
                options,
                data.schemaName,
                null
            );
        }

        instance.autorun(() => {
            if (documentList.ready()) {
                instance.data.listQuery.set(query);
            }
        });
    }
})
