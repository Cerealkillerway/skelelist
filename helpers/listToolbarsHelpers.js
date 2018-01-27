// list lang bar
Template.skelelistLangBar.helpers({
    langs: function() {
        let result = [];

        // register dependency from configuration document
        Skeletor.Registry.configurationChanged.get();

        _.each(Skeletor.configuration.langEnable, function(value, key) {
            if (value) {
                result.push(key);
            }
        });

        return result;
    },
    isActiveLang: function(buttonLang) {
        if (TAPi18n.getLanguage() === buttonLang) {
            return 'active';
        }
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
