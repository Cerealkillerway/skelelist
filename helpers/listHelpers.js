UI.registerHelper('isPaginated', function(schemaName) {
    var options = Skeletor.Schemas[schemaName].__listView.options;

    if (options && options.pagination) {
        return "&page=1";
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
            var lang = FlowRouter.getParam("itemLang");
            var defaultLang = Skeletor.configuration.lang.default;
            var UIlang = FlowRouter.getQueryParam('lang');
            var result = {};
            var value;
            var listViewOptions = schema.__listView;
            var listOptions = fieldSchema.__listView;
            var link = schema.__listView.detailLink;
            var pathShards = name.split('.');
            var fieldMissingTranslation = false;

            if (fieldSchema.i18n === undefined) {
                if (data[lang] && data[lang][name]) {
                    value = data[lang];
                }
                else {
                    value = data[defaultLang];
                    fieldMissingTranslation = true;
                }
            }
            else {
                value = data;
            }

            pathShards.forEach(function(shard, index) {
                value = value[shard];
            });

            // if the value is a data source -> find the source attribute
            if (listViewOptions.sourcedFields && listViewOptions.sourcedFields[name] !== undefined) {
                var source = fieldSchema.source;
                var sourceOptions = listViewOptions.sourcedFields[name];
                var sourceDocument = Skeletor.Data[sourceOptions.collection].findOne({_id: value});

                if (sourceDocument) {
                    var nameAttr = sourceDocument;
                    var missingTranslation = false;

                    sourceOptions.mapTo.split('.').forEach(function(nameShard, index) {
                        switch (nameShard) {
                            case ':itemLang':
                            if (nameAttr[lang]) {
                                nameAttr = nameAttr[lang];
                            }
                            else {
                                nameAttr = nameAttr[defaultLang];
                                missingTranslation = true;
                            }
                            break;

                            default:
                            nameAttr = nameAttr[nameShard];
                        }
                    });

                    if (missingTranslation) {
                        value = '#(' + nameAttr + ')';
                    }
                    else {
                        value = nameAttr;
                    }
                }
                else {
                    value = TAPi18n.__('none_lbl');
                }
            }

            // check if the field should be a link to detail page
            if (link.params.indexOf(name) >= 0) {
                var params = {};

                link.params.forEach(function(param, index) {
                    switch (param) {
                        case 'itemLang':
                        params[param] = lang;
                        break;

                        default:
                        if (schema[param].i18n === undefined) {
                            if (data[lang]) {
                                params[param] = data[lang][param];
                            }
                            else {
                                params[param] = data[defaultLang][param];
                            }
                        }
                        else {
                            params[param] = data[param];
                        }
                    }
                });

                result.link = FlowRouter.path(link.basePath, params, {lang: UIlang});
            }

            // applies field's listview options
            if (listOptions) {
                if (listOptions.stripHTML) {
                    value = value.replace(/<(?:.|\n)*?>/gm, '');
                }
                if (listOptions.truncate) {
                    value = value.substr(0, listOptions.truncate);
                }
            }

            if (fieldMissingTranslation) {
                result.value = '#(' + value + ')';
            }
            else {
                result.value = value;
            }
            return result;
        }
    },
    paginate: function(data) {
        var options = data.schema.__listView.options;
        var sort = data.schema.__listView.sort;
        var collection = data.schema.__collection;
        var findOptions = {};
        var list;

        // build sort object managing lang dependant attributes
        if (sort) {
            findOptions.sort = {};

            _.keys(sort).forEach(function(sortOption, index) {
                if (data.schema[sortOption].i18n === undefined) {
                    findOptions.sort[FlowRouter.getParam('itemLang') + '.' + sortOption] = sort[sortOption];
                }
                else {
                    findOptions.sort[sortOption] = sort[sortOption];
                }
            });
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
    },
    isTranslatable: function() {
        if (FlowRouter.getParam('itemLang')) {
            return true;
        }
        return false;
    }
};


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
