/** Class responsible for processing data from Svelte produced events. */

export default class SvelteEventParser {
  /**
   * Creates a SvelteEventParser object.
   * @param {DataStore} dataStore The instance of DataStore shared by the system.
   */
  constructor(dataStore) {
    this.dataStore = dataStore; // dataStore instance to write to
    this.componentCounts = {}; // map of counts of instances for each component tagName
    this.newComponents = []; // sequence of component registrations (post-order traversal of overall component hierarchy)
  }

  /**
   * Processes data from SvelteRegisterComponent events  and stores representation and instance in DataStore.
   * @param {CustomEvent} event The SvelteRegisterComponent event.
   */
  handleRegisterComponent(event) {
    const { component, tagName } = event.detail;
    const instanceNumber = this.assignInstanceNumber(tagName);
    const id = this.assignComponentId(tagName, instanceNumber);

    this.componentCounts[tagName] = instanceNumber;
    this.dataStore.insertComponentInstance(id, component);
    this.dataStore.insertComponentRepresentation(id, {
      id,
      tagName,
      children: [],
    });
  }

  /** Assigns an id string for given component.
   *
   * @param {string}    tagName   The component's "tagName" e.g., the name of the source file where it is defined and exported.
   * @returns {string}            The id of the component - concatenation of tagName and instance number.
   */
  assignComponentId(tagName, instanceNumber) {
    const id = tagName + instanceNumber;
    return id;
  }

  /**
   * Assigns component sequential instance number for given tagName.
   *
   * @param {string} tagName  The component's "tagName" e.g., the name of the source file where it is defined and exported.
   * @return {number}         The instance number - one-indexed, based on how many components of same tagName have been registered previously.
   */
  assignInstanceNumber(tagName) {
    const instanceNumber = (this.componentCounts[tagName] || 0) + 1;
    return instanceNumber;
  }

  processAppEvent(node, event, handler) {
    const component = this.getComponentTagName(node);
    const handlerName = handler.name;
    const label = component + " - " + event + " -> " + handlerName;
    this.dataStore.setLabel(label);
  }

  getComponentTagName(node) {
    const fileName = node.__svelte_meta.loc.file;
    // if this is a Windows based file naming, ie. \ instead of /
    if (fileName.indexOf("/") === -1) {
      return fileName.slice(fileName.lastIndexOf("\\\\") + 1, -7);
    }

    // else Mac/Linux based file naming, use / as separator
    return fileName.slice(fileName.lastIndexOf("/") + 1, -7);
  }
}
