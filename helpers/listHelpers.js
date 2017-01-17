Template.registerHelper('isPaginated', function(schemaName) {
    let options = Skeletor.Schemas[schemaName].__listView.options;

    if (options && options.pagination) {
        return '&page=1';
    }
    return '';
});



Skeleltor.skelelist.skelelistGeneralHelpers = {
    label: function(listField, options) {
        let name = listField.name;
        name = listField.name.substring(name.lastIndexOf('.') + 1, name.length);

        switch(options) {

            default:
            return TAPi18n.__(name + '_lbl');
        }
    },
    listRecord: function(listRecord, listSchema) {
        // if necessary fire "beforeRendering" callback (defined on the current schema)
        if (listSchema.callbacks && listSchema.callbacks.beforeRendering) {
            listRecord = listSchema.callbacks.beforeRendering(listRecord);
        }

        return listRecord;
    },
    field: function(listField, data, schema, listTemplateinstance) {
        // recursive function to deeply traverse schema fields and group of fields
        // and get the current field' schema
        function fieldSchemaLookup(fields, name) {
            let schemaFound;

            _.find(fields, function(field) {
                //console.log(field);
                if (field.skeleformGroup) {
                    let schema = fieldSchemaLookup(field.fields, name);

                    if (schema) {
                        schemaFound = schema;
                        return schema;
                    }
                }

                schemaFound = field;
                return field.name === name;
            });

            return schemaFound;
        }

        if (listTemplateinstance.skeleSubsReady.get()) {
            let name = listField.name;
            let fieldSchema = fieldSchemaLookup(schema.fields, name);
            let lang = FlowRouter.getParam('itemLang');
            let defaultLang = Skeletor.configuration.lang.default;
            let UIlang = FlowRouter.getQueryParam('lang');
            let result = {};
            let value;
            let listViewOptions = schema.__listView;
            let listOptions = fieldSchema.__listView;
            let link = schema.__listView.detailLink;
            let pathShards = name.split('.');
            let fieldMissingTranslation = false;

            if (fieldSchema.i18n === undefined) {
                if (data[lang + '---' + name]) {
                    value = data[lang + '---' + name];
                }
                else {
                    value = data[defaultLang + '---' + name];
                    fieldMissingTranslation = true;
                }
            }
            else {
                value = data;

                pathShards.forEach(function(pathShard, index) {
                    value = value[pathShard];
                });
                //value = data[name];
            }

            // if the value is a data source -> find the source attribute
            if (listViewOptions.sourcedFields && listViewOptions.sourcedFields[name] !== undefined) {
                let sourceOptions = listViewOptions.sourcedFields[name];
                let values;
                let mappedValue = [];

                // value can be an array since the field can contain multiple values (like a multiple select)
                // to handle this properly, let's transform it into an array if it's a single value
                if (!Match.test(value, [Match.Any])) {
                    values = [value];
                }
                else {
                    values = value;
                }

                values.forEach(function(value) {
                    let sourceDocument = Skeletor.Data[sourceOptions.collection].findOne({_id: value});

                    if (sourceDocument) {
                        let nameAttr = sourceDocument;
                        let missingTranslation = false;

                        sourceOptions.mapTo.split('.').forEach(function(nameShard, index) {
                            if (nameShard.indexOf(':itemLang---') === 0) {
                                let nameOnly = nameShard.substring(12, nameShard.length);

                                if (nameAttr[lang + '---' + nameOnly]) {
                                    nameAttr = nameAttr[lang + '---' + nameOnly];
                                }
                                else {
                                    nameAttr = nameAttr[defaultLang + '---' + nameOnly];
                                    missingTranslation = true;
                                }
                            }
                            else {
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
                    mappedValue.push(value);
                });

                value = mappedValue.join(', ');
            }

            // check if the field should be a link to detail page
            if (listField.link) {
                let params = {};
                let segmentLang = FlowRouter.getParam('itemLang');

                link.params.forEach(function(param, index) {
                    switch (param) {
                        case 'itemLang':
                        params[param] = lang;
                        break;

                        default:
                        if (fieldSchema.i18n === undefined) {
                            if (data[lang + '---' + param]) {
                                params[param] = data[lang + '---' + param];
                            }
                            else {
                                params[param] = data[defaultLang + '---' + param];
                                segmentLang = defaultLang;
                            }
                        }
                        else {
                            params[param] = data[param];
                        }
                    }
                });

                result.link = FlowRouter.path(link.basePath, params, {lang: UIlang, sLang: segmentLang});
            }

            // applies field's listview options
            if (listOptions) {
                if (listOptions.stripHTML) {
                    value = value.replace(/<(?:.|\n)*?>/gm, '');
                }
                if (listOptions.truncate) {
                    if (value.length > listOptions.truncate.max) {
                        let truncateSuffix = listOptions.truncate.suffix || '[...]';

                        value = value.substr(0, listOptions.truncate.max) + truncateSuffix;
                    }
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
        let schema = data.schema;
        let listSchema = schema.__listView;
        let options = listSchema.options;
        let sort = listSchema.sort;
        let collection = schema.__collection;
        let findOptions = {};
        let list;

        // build sort object managing lang dependant attributes
        if (sort) {
            findOptions.sort = {};

            _.keys(sort).forEach(function(sortOption, index) {
                let fieldSchema = $.grep(schema.fields, function(field){
                    return field.name == sortOption;
                });

                if (fieldSchema[0].i18n === undefined) {
                    findOptions.sort[FlowRouter.getParam('itemLang') + '---' + sortOption] = sort[sortOption];
                }
                else {
                    findOptions.sort[sortOption] = sort[sortOption];
                }
            });
        }

        // get paginated data
        if (options && options.pagination) {
            let currentPage = FlowRouter.getQueryParam('page');
            let skip = parseInt(currentPage - 1) * options.itemsPerPage;

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
        let options = data.schema.__listView.options;

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
Template.skelelistTable.helpers(Skeleltor.skelelist.skelelistGeneralHelpers);
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


// change password
Template.skelelistActionChangePasswordModal.helpers({
    currentRecord: function() {
        if (Template.instance().data.changePasswordModalFormView) {
            console.log(Blaze.getData(Template.instance().data.changePasswordModalFormView));
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
