import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


// query and infos
Template.skelelistInfo.helpers(SkeleUtils.GlobalHelpers.skelelistGeneralHelpers);
Template.skelelistInfo.helpers({
    showTotalNumber: function() {
        let instance = Template.instance();
        let listSchema = instance.data.schema.__listView;

        if (listSchema.info && listSchema.info.showTotalNumber === false) {
            return false;
        }
        return true;
    }
});


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


// list pagination
Template.skelelistPagination.helpers({
    loadMoreClass: function() {
        if (this.schema.__listView.options.autoLoad === true) {
            return 'zeroHeight';
        }
        return '';
    }
});


// list search bar
Template.skelelistSearch.helpers(SkeleUtils.GlobalHelpers.skelelistGeneralHelpers);
Template.skelelistSearch.helpers({
    searchOptions: function() {
        let instance = Template.instance();
        let listSchema = instance.data.schema.listView.get();
        let searchOptions = [];

        _.each(listSchema.search, function(value, key) {
            let searchOption = value;

            searchOption.name = key;
            searchOptions.push(searchOption);
        });

        return searchOptions;
    }
});
