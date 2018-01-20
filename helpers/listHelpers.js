Template.registerHelper('isPaginated', function(schemaName) {
    let listViewObject = Skeletor.Schemas[schemaName].__listView;

    if (!listViewObject) {
        return '';
    }

    let options = listViewObject.options;

    if (options && options.pagination) {
        return '&page=1';
    }
    return '';
});


// skelelist
Template.skelelist.helpers({
    listStyle: function(style) {
        return 'skelelist' + style.capitalize();
    },
    isDataReady: function(context) {
        if (context.skeleSubsReady.get() === false) {
            return false;
        }
        return true;
    },
});


// list table view
Template.skelelistTable.helpers(SkeleUtils.GlobalHelpers.skelelistGeneralHelpers);
Template.skelelistTable.helpers({
    actionsData: function(record) {
        const instance = Template.instance();

        let data = {
            schema: instance.data.schema,
            schemaName: instance.data.schemaName,
            record: record,
            skelelistInstance: instance.data.skelelistInstance
        };

        return data;
    }
});


// actions
// delete confirmation block
Template.skelelistActionDeleteTimerConfirm.helpers({
    secondsRemaining: function() {
        return Template.instance().confirmationCounter.get();
    }
});


// pagination template
Template.skelelistPagination.helpers({
    pages: function(data) {
        const instance = Template.instance();
        let collection = data.schema.__collection;
        let totalItems = Skeletor.Data[collection].find().count();
        let itemsPerPage = data.schema.__listView.options.itemsPerPage;
        let pages = Math.ceil(totalItems / itemsPerPage);

        instance.lastPage = pages;

        return _.range(1, pages + 1, 1);
    },
    isCurrentPage: function(pageNumber) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (pageNumber === currentPage) {
            return 'active';
        }
        return '';
    }
});


// list lang bar
Template.skelelistLangBar.helpers({
    langs: function() {
        var result = [];

        if (Skeletor.GlobalConf) {
            _.each(Skeletor.GlobalConf.langEnable, function(value, key) {
                if (value) {
                    result.push(key);
                }
            });

            return result;
        }
    },
    isActive: function(buttonLang) {
        if (FlowRouter.getParam('itemLang') === buttonLang) {
            return 'active';
        }
    }
});
