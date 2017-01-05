// skelelist
Template.skelelist.onRendered(function() {
    var options = this.data.schema.__listView.options;

    skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);

    if (options && options.pagination) {
        if (!FlowRouter.getQueryParam('page')) {
            FlowRouter.setQueryParams({page: 1});
        }
    }
});
Template.skelelist.events({
    'click .skelelistLink': function(event, template) {
        var documentId = $(event.target).closest('tr').data('id');

        // set document id in order to let skeletor find it in case
        // it is not yet translated for current lang
        Session.set('currentItem', documentId);
    }
});


// skelelist actions container
Template.skelelistActions.onRendered(function() {
    var self = this;
    var data = self.data;
    var actions = data.schemaInfo.schema.__listView.itemActions;
    var dataContext = {
        record: data.record,
        schemaInfo: data.schemaInfo
    };

    actions.forEach(function(action, index) {
        var templateToRender = Template['skelelistAction' + action.capitalize()];

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, dataContext, self.$('.skelelistActions')[0]);
        }
        else {
            skeleUtils.globalUtilities.logger('tried to render ' + action + ' action, but SkelelistAction' + action.capitalize() + ' template does not exists', 'skeleError');
        }
    });
});

// skelelist actions
Template.skelelistActionDelete.events({
    'click .skelelistDelete': function(event, template) {
        var data = template.data;
        var id = data.record._id;

        Meteor.call('deleteDocument', id, data.schemaInfo.schemaName);
    }
});


// skelelist pagination
Template.skelelistPagination.onRendered(function() {
    var currentPage = parseInt(FlowRouter.getQueryParam('page'));
    var lastPage = this.lastPage;

    if (currentPage === lastPage) {
        this.$('.nextPage').addClass('disabled');
    }

    if (currentPage === 1) {
        this.$('.prevPage').addClass('disabled');
    }
});


Template.skelelistPagination.events({
    'click .skelelistPageBtn': function(event, template) {
        var number = $(event.target).closest('li').data('number');

        FlowRouter.setQueryParams({page: number});

        // manage enabling disabling next button
        if (number === template.lastPage) {
            template.$('.nextPage').addClass('disabled');
        }
        else {
            template.$('.nextPage').removeClass('disabled');
        }

        // manage enabling disabling prev button
        if (number === 1) {
            template.$('.prevPage').addClass('disabled');
        }
        else {
            template.$('.prevPage').removeClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .nextPage': function(event, template) {
        var currentPage = parseInt(FlowRouter.getQueryParam('page'));
        var lastPage = template.lastPage;

        if (currentPage < lastPage) {
            FlowRouter.setQueryParams({page: currentPage + 1});
        }

        template.$('.prevPage').removeClass('disabled');
        if ((currentPage + 1) === lastPage) {
            $(event.target).closest('li').addClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .prevPage': function(event, template) {
        var currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (currentPage > 1) {
            FlowRouter.setQueryParams({page: currentPage - 1});
        }

        template.$('.nextPage').removeClass('disabled');
        if ((currentPage - 1) === 1) {
            $(event.target).closest('li').addClass('disabled');
        }

        skeleUtils.globalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    }
});


Template.skelelistLangBar.events({
    'click .langFlag': function(event, template) {
        var newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});
