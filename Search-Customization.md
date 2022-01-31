# Swivel Search Customization

## Include Keyword Search Box

Toggles the visibility of the keyword search textbox at the top of the Swivel Search web part

## Start Minimized

This field is contingent on the *Include Keyword Search Box* being toggled on.

When toggled on, the initial state of the web part will only display the keyword search box. The filtering controls will appear after the user clicks the **Advanced** button.

When toggled off, all the search controls are visible after page load.

## Choosing Search Fields

Clicking on the **Choose Search Fields** button will present the field picker interface. Use this to decide which fields will be visible. 

### Column Display Name

This is the text that will appear on the label for this search field

### Managed Property

This is the name of the property that will be included in a search query for this field. This topic is covered in depth in [Choosing Search Managed Properties](./Selecting-Managed-Properties.md).

### Data Type

This is the type of data that the chosen managed property represents. This field, combined with the Operator field, is involved in deciding which search control is rendered in the UI. For example, if you choose a Data Type of Date, a Date Range picker control will be rendered.

### Operator
This is the search operator that will be used when forming queries with this field. Although, in some cases, the actual operator will can be selected by the user with field control.

* Equals - matches exact but case-insensitive field values
* Contains - matches if the provided text is a subset of the field value
* Number Range - A number range picker control is rendered so a user can choose the operator at query time
* Date Range - A date range picker control is rendered so a user can choose the operator at query time

### Choices

The Choices textarea is optional. Some search controls can be rendered with a select box instead of a text input by populating the Choices option. Place each option on a new line within the text area.

For example, this would produce a select box with three options of: one, two, three.

```
one
two
three
```

Optionally, in the event that name value pairs are required, you can delineate display text from it's value with a pipe character: "|". For example, this would produce a similar select box as before, but the search query would match against the numeric values.

```
one|1
two|2
three|3
```

## Additional Search Criteria

Add any Keyword Query Language (KQL) criteria to this textbox. This will be appended to each search query at runtime.

[Please see more information about KQL](https://docs.microsoft.com/en-us/sharepoint/dev/general-development/keyword-query-language-kql-syntax-reference)

### For more information

* [README](./README.md)
* [Swivel Search Customization](./Search-Customization.md)
* [Swivel Search Results Customization](./Results-Customization.md)
* [Selecting Managed Properties](./Selecting-Managed-Properties.md)
* [Github Repositry](
https://github.com/markgab/swivel-search)