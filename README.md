# SvelteSlicer

![Svelte Slicer logo](images/svelte_slicer_logo_64x64.png)

# About The Project
Svelte Slicer is an open-source Chrome Developer Tool for visualizing component and state changes in Svelte applications. Svelte Slicer allows users to capture, store and traverse detailed snapshots of application state to aid in debugging.

# Key features include:
- Visualization of component relationships
- Moment-by-moment tracking of state variables
- Snapshot diffing to identify specific state changes
- Dynamic time travel through past state snapshots

# Built With
- [Svelte](https://svelte.dev/)
- [D3.js](https://d3js.org/)
- [Chrome Extension API’s](https://developer.chrome.com/docs/extensions/reference/)
- [Webpack](https://webpack.js.org/)

# Getting Started
Install Svelte Slicer from the Chrome Web Store
Run your Svelte application in development mode.
Open Chrome Developer Tools (Cmd + Option + I) & navigate to the “Slicer” panel

# Using Svelte Slicer
After opening the tool, you will see two panels. With each DOM update in your application, the panel on the left will populate a new snapshot with a *Data* and a *Jump* button. Clicking on the Data button for a particular snapshot will display in the right hand panel data about the application’s state at the moment the selected snapshot was captured.

Snapshots that result from a specific user interaction are labeled with the component, event and event handler that triggered its state changes. Users can also use the *Filter* feature to identify specific snapshots based on their labels.

Each snapshot can be explored in several ways. While in the *State* view, selecting the *Tree* button will display a list of all components with stateful variables that were part of the DOM when the snapshot was captured. Clicking on the name of a component will show it’s stateful variables and their values at the moment of snapshot capture. Clicking the Chart button will display a graphical visualization of the component relationships on the DOM for the selected snapshot. Clicking the *Diff* button will present a list of the specific components and variables that changed from the previous snapshot.

The *Component* view displays the relationship between user-defined components in the file structure of the application. The *Tree*button displays this information as a collapsible tree, while the *Chart* button shows a hierarchical graphical representation.

Using the *Jump* buttons allows the user to not only see the data for a chosen snapshot, but also to actually re-render their application as it was at the moment the snapshot was captured. After jumping, the user can choose to start a new timeline by continuing to interact with their application. This will result in new snapshots that build off application state at the last jump. 

Snapshots outside the timeline of the currently rendered snapshot are retained and can still be viewed and jumped to, but are washed out in the snapshot panel to indicate that they are not related to the current snapshot. Using the *Path* button will clear out these washed out snapshots, leaving only the current timeline in the panel. 

The *Previous* and *Forward* buttons also clear out unwanted snapshots, removing all snapshots respectively before or after the currently rendered one.

# Contributing
Found a bug or have suggestions for improvement? We would love to hear from you!

Please open an issue to submit feedback or problems you come across.

# Authors
- Heather Barney - [LinkedIn](https://www.linkedin.com/in/heather-barney-81ab2834/)
- Rachel Collins - [LinkedIn](https://www.linkedin.com/in/rachel-c-bb5b0346/)
- Lynda Labranche - [LinkedIn](https://www.linkedin.com/in/lynda-labranche-854184146/)
- Anchi Teng - [LinkedIn](https://www.linkedin.com/in/anchiteng/)

# License
This project is licensed under the MIT [License](https://github.com/oslabs-beta/svelte-sight/blob/master/LICENSE) - see the LICENSE file for details
 
 
 

