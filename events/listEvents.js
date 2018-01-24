// skelelist
Template.skelelist.onRendered(function() {
    let options = this.data.schema.__listView.options;

    SkeleUtils.GlobalUtilities.scrollTo(0, Skeletor.configuration.animations.onRendered);

    // set page query param
    if (options && options.pagination) {
        if (!FlowRouter.getQueryParam('page')) {
            FlowRouter.setQueryParams({page: 1});
        }
    }
});
Template.skelelist.events({
    'click .skelelistLink': function(event, instance) {
        let documentId = $(event.target).closest('tr').data('id');

        // set document id in order to let skeletor find it in case
        // it is not yet translated for current lang
        Session.set('currentItem', documentId);
    }
});



// skelelist actions container
Template.skelelistActions.onRendered(function() {
    let data = this.data;
    let record = data.record;
    let actions = data.schema.__listView.itemActions;
    let collection = data.schema.__collection;

    // check if current record has the "options" field and handle it
    if (record.skelelistOptions && record.skelelistOptions.actions) {
        actions = actions.filter(function(action) {
            if (record.skelelistOptions.actions[action.name] === false) {
                return false;
            }
            return true;
        });
    }

    // render all needed actions
    actions.forEach((action, index) => {
        let templateName = 'skelelistAction' + action.name.capitalize();
        let templateToRender = Template[templateName];

        // add the action options to the data context for the action template
        let actionData = {};

        _.extend(actionData, data);
        actionData.actionOptions = action;
        actionData.actionContainerInstance = this;

        // handle action's permission option
        if (actionData.actionOptions.permission) {
            if (!SkeleUtils.GlobalUtilities.checkPermissions(actionData.actionOptions.permission)) {
                SkeleUtils.GlobalUtilities.logger('No permissions for action ' + action.name, 'skelelist');
                return false;
            }
        }

        if (templateToRender !== undefined) {
            Blaze.renderWithData(templateToRender, actionData, this.$('.skelelistActions')[0]);
        }
        else {
            SkeleUtils.GlobalUtilities.logger('tried to render ' + action + ' action, but SkelelistAction' + action.capitalize() + ' template does not exists', 'skeleError', false, true);
        }
    });
});

// skelelist actions
// delete
Template.skelelistActionDelete.events({
    'click .skelelistDelete': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;
        let options = data.actionOptions;
        let deleteMethod;

        if (data.schema._methods && data.schema._methods.delete) {
            deleteMethod = data.schema.__methods.delete
        }
        else {
            deleteMethod = Skeletor.configuration.defaultMethods.delete;
        }

        if (options.confirm) {
            let confirmOptions = options.confirm;
            let $extrasContainer = data.actionContainerInstance.$('.skelelistActionExtras');
            let confirmTemplateName = confirmOptions.template || 'skelelistActionDeleteTimerConfirm';
            let confirmTemplate = Template[confirmTemplateName];

            // render delete confirmation block in the "action extras" wrapper in parent template (skelelistActions)
            if (confirmTemplate) {
                Blaze.renderWithData(confirmTemplate, data, $extrasContainer[0]);
            }
            else {
                SkeleUtils.GlobalUtilities.logger('tried to render ' + confirmTemplateName + ' as delete confirm template, but it does not exists', 'skeleError', false, true);
            }
            // hide action buttons block
            data.actionContainerInstance.$('.skelelistActions').hide(0);
            // show action extras block
            $extrasContainer.show(0);

            return false;
        }
        else {
            Meteor.call(deleteMethod, id, data.schemaName, function(error, result) {
                if (error) {
                    if (result.error === 'unauthorized') {
                        Materialize.toast(TAPi18n.__('permissions_error'), 5000, 'permissionsError');
                        SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                    else {
                        Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
                        SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                }
            });
        }
    }
});

// delete confirmation block
Template.skelelistActionDeleteTimerConfirm.onCreated(function() {
    let confirmOptions = this.data.actionOptions.confirm;
    let timeoutSeconds = (confirmOptions.timeout) / 1000 || 3;

    this.confirmationCounter = new ReactiveVar(timeoutSeconds);
});
Template.skelelistActionDeleteTimerConfirm.onRendered(function() {
    let barWidth = 0;
    let $timerBar = this.$('.determinate');
    let confirmOptions = this.data.actionOptions.confirm;
    let timeout = confirmOptions.timeout || 3000;
    let timeoutSeconds = timeout / 1000;
    let intervalTiming = timeout / 100;
    let step = Math.floor(100 / timeoutSeconds);
    let steps = [];
    let tmp = step;

    while (tmp <= 100) {
        steps.push(tmp);
        tmp = tmp + step;
    }

    $timerBar.css({width: '0'});
    this.$('.deleteConfirmation').removeClass('hide');
    this.$('.skelelistDelete').addClass('hide');

    this.cancelDeletion = function(instance) {
        Meteor.clearTimeout(instance.progressInterval);
        instance.$('.deleteConfirmation').addClass('hide');
        instance.$('.skelelistDelete').removeClass('hide');

        instance.data.actionContainerInstance.$('.skelelistActions').show(0);
        Blaze.remove(instance.view);
    };

    this.progressInterval = Meteor.setInterval(() => {
        // increase the timer bar
        barWidth++;
        $timerBar.css({width: barWidth + '%'});

        // update seconds countdown
        if (steps.indexOf(barWidth) >= 0) {
            this.confirmationCounter.set(this.confirmationCounter.get() - 1);
        }

        // when the bar is full, remove the confirmation block from "action extras" wrapper,
        // hide it and show  action buttons block
        if (barWidth === 100) {
            this.restoreDeleteBtnTimeout = Meteor.setTimeout(() => {
                this.cancelDeletion(this);
            }, 500);
        }
    }, intervalTiming);
});
Template.skelelistActionDeleteTimerConfirm.events({
    'click .deleteActionSwitch': function(event, instance) {
        let data = instance.data;
        let id = data.record._id;
        let deleteMethod;

        if (data.schema._methods && data.schema._methods.delete) {
            deleteMethod = data.schema.__methods.delete
        }
        else {
            deleteMethod = Skeletor.configuration.defaultMethods.delete;
        }

        Meteor.setTimeout(function() {
            Meteor.call(deleteMethod, id, data.schemaName, function(error, result) {
                if (error) {
                    if (result.error === 'unauthorized') {
                        Materialize.toast(TAPi18n.__('permissions_error'), 5000, 'permissionsError');
                        SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                    else {
                        Materialize.toast(TAPi18n.__('serverError_error'), 5000, 'error');
                        SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                }
            });
        }, 600);
    },
    'click .cancelDeletion': function(event, instance) {
        Meteor.clearTimeout(instance.restoreDeleteBtnTimeout);
        instance.cancelDeletion(instance);
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


Template.skelelistLangBar.events({
    'click .langFlag': function(event, instance) {
        let newLang = $(event.target).closest('.langFlag').data('lang');

        FlowRouter.setParams({'itemLang': newLang});
    }
});
