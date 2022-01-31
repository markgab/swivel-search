# Swivel Search Results Customization

## Search Query Source

To provide the results web part with a search query, you have a variety of options.

### Manual Query

Type a Keyword Query Language (KQL) query into the Search Query textbox to manually specify the query that the Swivel Search Results web part will use each time.

[Please see more information about KQL](https://docs.microsoft.com/en-us/sharepoint/dev/general-development/keyword-query-language-kql-syntax-reference)

### Swivel Search Web Part

To connect the Swivel Search Results web part to the Swivel Search web part, first, make sure the Swivel Search web part is already added to the page with the results web part.

* On the properties pane of the results web part, click the **[...]** button at the top of the property pane and select **Connect to source**

* Now, select **Swivel Search** for the source, followed by **Search Query** for the property

* **Click Apply** at the bottom of the properties pane to save the changes.

### Query String

Optionally, the Swivel Search Results web part is capable of receiving search queries from the page's url query string.

## First Column is Filename or Title

If toggled on, an additional column is rendered in addition to the columns that are selected in the **Choose Result Columns** interface. This column will display either the filename or title of the result item.

If toggle off, no additional column is included in the result interface.

## Choose Result Columns

Clicking on the **Choose Result Columns** button will display the column picker interface. Use this to decide which search result columns will be visible.

### Column Display Name

Choose the name of the column that will appear in the column header of the results interface.

### Managed Property

This is the name of the SharePoint managed property that will populate the value of each row for this column. Picking manged properties is covered in depth in [Choosing Search Managed Properties](./Selecting-Managed-Properties.md)

### Data Type

Choose the data type for the selected managed property. If you are unsure, selecting "Text" will work every time, however special formatting is provided to **DateTime** and **Boolean** data types when necessary.

### Sortable

Check this box if the selected managed property has been marked as Sortable. If unsure, leave this unchecked.

## Sort Property

Select the property to sort the result source by.

## Sort Direction

Select the direction of the sorting.


### For more information

* [README](./README.md)
* [Swivel Search Customization](./Search-Customization.md)
* [Swivel Search Results Customization](./Results-Customization.md)
* [Selecting Managed Properties](./Selecting-Managed-Properties.md)
* [Github Repositry](
https://github.com/markgab/swivel-search)