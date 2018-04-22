import { FlowRouter } from 'meteor/ostrio:flow-router-extra';


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});


// skelelist pagination
Template.skelelistPagination.onRendered(function() {
    let currentPage = parseInt(FlowRouter.getQueryParam('page'));
    let lastPage = this.lastPage;

    if (currentPage === lastPage) {
        this.$('.nextPage').addClass('disabled');
    }

    if (currentPage === 1) {
        this.$('.prevPage').addClass('disabled');
    }
});


Template.skelelistPagination.events({
    'click .skelelistPageBtn': function(event, instance) {
        let number = $(event.target).closest('li').data('number');

        FlowRouter.setQueryParams({page: number});

        // manage enabling disabling next button
        if (number === instance.lastPage) {
            instance.$('.nextPage').addClass('disabled');
        }
        else {
            instance.$('.nextPage').removeClass('disabled');
        }

        // manage enabling disabling prev button
        if (number === 1) {
            instance.$('.prevPage').addClass('disabled');
        }
        else {
            instance.$('.prevPage').removeClass('disabled');
        }

        SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .nextPage': function(event, instance) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));
        let lastPage = instance.lastPage;

        if (currentPage < lastPage) {
            FlowRouter.setQueryParams({page: currentPage + 1});
        }

        instance.$('.prevPage').removeClass('disabled');
        if ((currentPage + 1) === lastPage) {
            $(event.target).closest('li').addClass('disabled');
        }

        SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    },
    'click .prevPage': function(event, instance) {
        let currentPage = parseInt(FlowRouter.getQueryParam('page'));

        if (currentPage > 1) {
            FlowRouter.setQueryParams({page: currentPage - 1});
        }

        instance.$('.nextPage').removeClass('disabled');
        if ((currentPage - 1) === 1) {
            $(event.target).closest('li').addClass('disabled');
        }

        SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);
    }
});
