      ___________          .__         .__  .__          __
     /   _____/  | __ ____ |  |   ____ |  | |__| _______/  |_
     \ _____  \|  |/ // __ \|  | _/ __ \|  | |  |/  ___/\   __\
     /        \    <\  ___/|  |_\  ___/|  |_|  |\___ \  |  |
    /_______  /__|_ \\___  >____/\___  >____/__/____  > |__|
            \/     \/    \/          \/             \/

#### INTRO
**Skelelist** package is part of the **Skeletor** project and is not meant be used alone.

Inside a Skeletor app this package is used to build list views; it supports pagination and actions on each record; it has many different options and it's extensible

### SCHEMA OPTIONS

- **__listView**: *[object] (optional)* skelelist options
- - **style**: *[string] (mandatory)*type of list to create; default "table";
- - **classes**: *[string] (optional)* CSS classes to assign to the listView;
- - **itemFields**: *[array of strings] (mandatory)* list of fields to use in the listView;
- - **itemActions**: *[array of objects] (mandatory)* dictionary of actions to use for each document in the list; (built in actions: "delete", "changePassword"); please see below for detail infos about every action object;
- - **detailLink**: *[object] (mandatory)* definition of the link for detail view
- - - **basePath**: *[string] (mandatory)* the path definition for the link
- - - **params**: *[array of strings] (optional)* list of the params used in the previous *basePath*;
- - **sourceFields**: *[object] (optional)* dictionary of fields used in *itemFields* that are external links to other documents; each element is an [object] with the field's name as key and these properties:
- - - **mapTo**: *[string] (mandatory)* name of the attribute in the external document to use;
- - - **collection**: *[string] (mandatory)* name of the collection where to find the external document;


### ITEM ACTIONS

*"itemActions"* field is a dictionary of actions to display on every row.

#### Generic options (available for all actions)

- **name**: *[string] (required)* the name of the action to render; Skelelist will try to render the component named: *"skelelistAction" + name.capitalize()*;

#### Action specific options:

##### delete

- **confirm**: *[boolean/object] (optional)* defines if the delete action must ask a confirmation; can be set to *true* to use defaults or can be an object that can specify all the available options; (default to false);
- - **template**: *[string] (optional)* name of the component to use as confirmation UI; default to *skelelistActionDeleteTimerConfirm*;
- - **timeout**: *[number] (optional, available only if template = "skelelistActionDeleteTimerConfirm"); number of milliseconds to use as timeout to confirm deletion (default 3000); must be a multiple of 1000;


### SCHEMA FIELDS OPTIONS

#### Generic options (available for all kind of fields)

- **__listView**: *[object] (optional)* options for the field in the list view:
- - **stripHTML**: *[boolean] (optional)* set to true to strip out HTML from the value (default false);
- - **truncate**: *[integer] (optional)* number of characters to keep (default all);




### TROUBLESHOOTING

Experimenting errors in your list view? Try the followings:

- double check your schema structure and that you have included all required keys for every form and field objects.

- write an issue ;)
