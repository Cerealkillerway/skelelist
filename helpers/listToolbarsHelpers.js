import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// list lang bar
Template.skelelistLangBar.helpers({
    isMultilingual: function() {
        let instance = Template.instance();

        if (FlowRouter.getParam('itemLang') === undefined) {
            return false;
        }

        for (const field of instance.data.schema.__listView.itemFields) {
            let fieldSchema = SkeleUtils.GlobalUtilities.fieldSchemaLookup(instance.data.schema.fields, field.name);

            if (fieldSchema.i18n !== false) {
                return true;
            }
        }

        return false;
    },
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
        if (FlowRouter.getParam('itemLang') === buttonLang) {
            return 'active';
        }
    }
});


// pagination template
Template.skelelistPagination.helpers({
    isCurrentPage: function(pageNumber) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (pageNumber === currentPage) {
            return 'active';
        }
        return '';
    }
});
