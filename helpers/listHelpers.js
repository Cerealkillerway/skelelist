skelelistGeneralHelpers = {
    label: function(name, options) {
        switch(options) {

            default:
            return TAPi18n.__(name + "_lbl");
        }
    },
    field: function(name, data, schema) {
        var fieldSchema = schema[name];
        var lang = FlowRouter.getQueryParam("lang");
        var result = {};
        var value;
        var listOptions = fieldSchema.__listView;
        var link = schema.__listView.detailLink;

        if (fieldSchema.i18n === undefined) {
            if (data[lang] && data[lang][name]) {
                value = data[lang][name];
            }
            else {
                value = name + ' (' + TAPi18n.__('translationTitleNoHTML_missing').toUpperCase() + ')';
            }
        }
        else {
            value = data[name];
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
}


// skelelist
Template.skelelist.helpers({
    listStyle: function(style) {
        return 'skelelist' + style.capitalize();
    }
});

// list table view
Template.skelelistTable.helpers(skelelistGeneralHelpers);
