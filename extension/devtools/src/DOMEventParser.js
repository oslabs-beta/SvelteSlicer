export default class DOMEventParser {
  constructor() {
    this.componentCounts = {}; // map of counts of instances for each component tagName
    this.newComponents = []; // sequence of component registrations (post-order traversal of overall component hierarchy)
    //this.rootComponent = null;
    //this.nodeComponents = new Map();
  }

  /**
   * Assigns an id string for given component and adds to newComponents list.
   * @param {string} tagName
   * @returns {string} The id of the component - concatenation of tagName and instance number.
   */
  assignComponentId(tagName) {
    const instanceNumber = this.assignInstanceNumber(tagName);
    const id = tagName + instanceNumber;
    this.newComponents.push(id);
    return id;
  }

  /**
   * Determines component instance number and updates componentCounts for given tagName.
   * @param {string} tagName
   * @return {number} The instance number - one-indexed, based on how many components of same tagName have been registered previously.
   */
  assignInstanceNumber(tagName) {
    const instanceNumber = (this.componentCounts[tagName] || 0) + 1;
    this.componentCounts[tagName] = instanceNumber;
    return instanceNumber;
  }

  /*
  assignRootComponent(node) {
    const nodeTagName = this.getComponentTagName(node);
    const nodeComponentId = nodeTagName + '1';
    this.rootComponent = nodeComponentId;
    this.nodeComponents.add(node, nodeComponentId);

    return nodeComponentId;
  }

  getComponentTagName(node) {
    const fileName = node.__svelte_meta.loc.file
    // if this is a Windows based file naming, ie. \ instead of /
    if (fileName.indexOf("/") === -1) {
      return fileName.slice(fileName.lastIndexOf("\\\\") + 1, -7);
    }
  
    return fileName.slice(fileName.lastIndexOf("/") + 1, -7);
  }
  */
}
