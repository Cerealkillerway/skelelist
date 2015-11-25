UI.registerHelper('isPaginated', function(schemaName) {
    var options = Skeletor.Schemas[schemaName].__listView.options;

    if (options && options.pagination) {
        return "&page=1"
    }
    return "";
});



skelelistGeneralHelpers = {
    label: function(name, options) {
        name = name.substring(name.lastIndexOf('.') + 1, name.length);

        switch(options) {

            default:
            return TAPi18n.__(name + "_lbl");
        }
    },
    field: function(name, data, schema) {
        if (FlowRouter.subsReady()) {
            var fieldSchema = schema[name];
            var lang = FlowRouter.getQueryParam("lang");
            var result = {};
            var value;
            var listOptions = fieldSchema.__listView;
            var link = schema.__listView.detailLink;
            var pathShards = name.split('.');

            if (fieldSchema.i18n === undefined) {
                if (data[lang] && data[lang][name]) {
                    value = data[lang];
                }
                else {
                    value = name + ' (' + TAPi18n.__('translationTitleNoHTML_missing').toUpperCase() + ')';
                }
            }
            else {
                value = data;
            }

            pathShards.forEach(function(shard, index) {
                value = value[shard];
            });

            // applies field's listview options
            if (listOptions) {
                if (listOptions.stripHTML) {
                    value = value.replace(/<(?:.|\n)*?>/gm, '');
                }
                if (listOptions.truncate) {
                    value = value.substr(0, listOptions.truncate);
                }
            }

            // check if the field should be a link to detail page
            if (link.params.indexOf(name) >= 0) {
                var params = {};

                link.params.forEach(function(param, index) {
                    params[param] = data[param];
                });

                result.link = FlowRouter.path(link.basePath, params, {lang: lang});
            }

            result.value = value;
            return result;
        }
    },
    paginate: function(data) {
        var options = data.schema.__listView.options;
        var sort = data.schema.__listView.sort;
        var collection = data.schema.__collection;
        var findOptions = {};
        var list;

        if (sort) {
            findOptions.sort = sort;
        }

        // get paginated data
        if (options && options.pagination) {
            var currentPage = FlowRouter.getQueryParam('page');
            var skip = parseInt(currentPage - 1) * options.itemsPerPage;

            findOptions.limit = options.itemsPerPage;
            findOptions.skip = skip;
            list = Skeletor.Data[collection].find({}, findOptions);
        }
        // get all data
        else {
            list = Skeletor.Data[collection].find({}, findOptions);
        }

        return list;
    },
    isPaginated: function(data) {
        var options = data.schema.__listView.options;

        if  (options && options.pagination) {
            return true;
        }
        return false;
    }
}


// skelelist
Template.skelelist.helpers({
    listStyle: function(style) {
        return 'skelelist' + style.capitalize();
    }
});

// list table view
Template.skelelistTable.helpers(skelelistGeneralHelpers);

// pagination template
Template.skelelistPagination.helpers({
    pages: function(data) {
        var collection = data.schema.__collection;
        var totalItems = Skeletor.Data[collection].find().count();
        var itemsPerPage = data.schema.__listView.options.itemsPerPage;
        var pages = Math.ceil(totalItems / itemsPerPage);

        Template.instance().lastPage = pages;

        return _.range(1, pages + 1, 1);
    },
    isCurrentPage: function(pageNumber) {
        var currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (pageNumber === currentPage) {
            return "active";
        }
        return "";
    }
});
