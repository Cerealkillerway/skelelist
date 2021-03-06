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
                Skeletor.SkeleUtils.GlobalUtilities.logger('tried to render ' + confirmTemplateName + ' as delete confirm template, but it does not exists', 'skeleError', false, true);
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
                        Materialize.toast(i18n.get('permissions_error'), 5000, 'permissionsError');
                        Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                    else {
                        Materialize.toast(i18n.get('serverError_error'), 5000, 'error');
                        Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                }
            });
        }
    }
});

// delete timer confirmation block
Template.skelelistActionDeleteTimerConfirm.onCreated(function() {
    let actionOptions = this.data.actionOptions;
    let confirmOptions = actionOptions.confirm;
    let timeoutSeconds = (actionOptions.timeout) / 1000 || 3;

    this.confirmationCounter = new ReactiveVar(timeoutSeconds);
});


Template.skelelistActionDeleteTimerConfirm.onRendered(function() {
    let barWidth = 0;
    let $timerBar = this.$('.determinate');
    let actionOptions = this.data.actionOptions;
    let confirmOptions = actionOptions.confirm;
    let timeout = actionOptions.timeout || 3000;
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
                        Materialize.toast(i18n.get('permissions_error'), 5000, 'permissionsError');
                        Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                    else {
                        Materialize.toast(i18n.get('serverError_error'), 5000, 'error');
                        Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                    }
                }
                else {
                    // fix for reactive aggregate not properly updating after delete
                    let id = $(event.target).closest('tr').data('id');

                    $(`*[data-id="${id}"]`).hide(0);
                }
            });
        }, 600);
    },

    'click .cancelDeletion': function(event, instance) {
        Meteor.clearTimeout(instance.restoreDeleteBtnTimeout);
        instance.cancelDeletion(instance);
    }
});


// delete buttons confirmation block
Template.skelelistActionDeleteConfirm.events({
    'click .confirmDeletion' : function(event, instance) {
        let data = instance.data;
        let id = data.record._id;
        let deleteMethod;

        if (data.schema._methods && data.schema._methods.delete) {
            deleteMethod = data.schema.__methods.delete
        }
        else {
            deleteMethod = Skeletor.configuration.defaultMethods.delete;
        }

        Meteor.call(deleteMethod, id, data.schemaName, function(error, result) {
            if (error) {
                if (result.error === 'unauthorized') {
                    Materialize.toast(i18n.get('permissions_error'), 5000, 'permissionsError');
                    Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                }
                else {
                    Materialize.toast(i18n.get('serverError_error'), 5000, 'error');
                    Skeletor.SkeleUtils.GlobalUtilities.logger(result, 'skeleWarning', false, true);
                }
            }
            else {
                // fix for reactive aggregate not properly updating after delete
                let id = $(event.target).closest('tr').data('id');

                $(`*[data-id="${id}"]`).hide(0);
            }
        });
    },

    'click .cancelDeletion': function(event, instance) {
        instance.$('.deleteConfirmation').addClass('hide');
        instance.$('.skelelistDelete').removeClass('hide');

        instance.data.actionContainerInstance.$('.skelelistActions').show(0);
        Blaze.remove(instance.view);
    }
});
