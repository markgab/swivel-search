# Selecting Managed Properties

To get the expected search results, choosing the appropriate SharePoint search managed property is critical. However, there are some pitfalls, here is how to get the best results.

## SharePoint Online's Automatically Generated Managed Properties 

### TL;DR - Automatically Generated Managed Properties 

Be careful using SharePoint Online's automatically generated managed properties. These fields are best used for querying against: Text, Choice, Person or Yes / No values. They do not work well for querying Numeric or Date and Time values. And while they can be used to display results of any type, they cannot be used for sorting result sets. It is recommended that you create your own managed properties for these situations.

### Identifying Automatically Generated Managed Properties

SharePoint Online will automatically generate managed properties that correspond to the site or list columns that have been used. These properties can be identified because they adhere to a naming scheme.

```
[ColumnInternalName]OWS[DataType]
```

For example, if someone created a text column with the name of "Cake" and proceeded to populate a list full of cake types, SharePoint Online's search service would create a corresponding managed property for the purposes of searching against these cake types named "CakeOWSTEXT" and this property would work well for queries to match against the types of cake in the list or to retrieve the types of cake to display in a result set.

### Where Automatically Generated Managed Properties Don't Work

However, properties like these do not work well in every situation and it may be necessary to create your own managed properties for querying date and numeric values. Also, while automatically generated properties work well when retrieved in a result set for any data type, they cannot be used for the purposes of sorting that result set. This table illustrates their their limitations.

### Automatically Generated Columns Usefulness
| List Column Type | Operators: Equals, Contains | Operators: Less Than, Greater Than | Display in Result Set | Sortable |
| ---------------- | :-------------------------: | :--------------------------------: | :-------------------: | :------: |
| Text / Choice    |              Y              |                 N                  |           Y           |    N     |
| Person           |              Y              |                 N                  |           Y           |    N     |
| Number           |              Y              |                 N                  |           Y           |    N     |
| Date and Time    |              N              |                 N                  |           Y           |    N     |
| Yes / No         |              Y              |                 N                  |           Y           |    N     |

## Managed Property Pickers

Both the Swivel Search and Search Results web parts employ Managed Property Pickers. The autocomplete functionality of the picker can greatly assist the difficult process of finding the correct property to search against. However, it is important to understand that not all managed properties will appear in the autocomplete menu.

![Property Picker](/assets/Property.Picker.png)

If the managed property you are targeting does not appear in the autocomplete menu, simply type in the full name of the property. This will still work if the managed property is configured correctly.

## Creating a Managed Property

This topic is [covered in depth on Microsoft Docs](https://docs.microsoft.com/en-us/sharepoint/manage-search-schema#managed-properties-and-search). This is what is required For the purposes of working completely with Swivel Search and results web parts.

### Queryable

If you wish to query against a property in the search interface, the managed property must be marked as **Queryable**.

### Retrievable

If you wish to display a property in the search results web part, the managed property must be marked as **Retrievable**.

### Sortable

If you wish to sort a result set in the search results web part, the managed property must be marked as **Sortable**.

### Watch the Data Type

Many of the properties in the SharePoint Online search service are forced to the text type. This is fine for many situations, but trying to filter on a date column that has been marked as a text value will not work. Numeric values are also affected in this way. 

### Refinable Managed Properties

Want to cover all the bases? There is a collection of predefined managed properties available to use that meet all the requirements for the Swivel Search web parts.

[Refinable managed properties](https://docs.microsoft.com/en-us/sharepoint/manage-search-schema#refine-on-managed-properties) can be mapped to any existing crawled property and are queryable, retrievable, sortable and can be mapped to most data types. To review these, open the search schema in SharePoint Online and search the managed properties with the keyword "refinable". Pick a refinable managed property of the appropriate data type, then add the appropriate mapping to the corresponding crawled property that matches your list column.

### For more information

* [README](./README.md)
* [Swivel Search Customization](./Search-Customization.md)
* [Swivel Search Results Customization](./Results-Customization.md)
* [Selecting Managed Properties](./Selecting-Managed-Properties.md)