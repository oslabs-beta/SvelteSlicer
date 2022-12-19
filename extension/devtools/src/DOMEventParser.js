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

  getNodeComponents(node, target) {
    // get the component id of the target node
    const targetComponentId = this.nodeComponents.get(target);
    
    // determine the component id of the new node
    let nodeComponentId;
  
      console.log('Node: ' + node.__svelte_meta.loc.file);
      console.log('Target: ' + target.__svelte_meta.loc.file);
      const nodeTagName = this.getComponentTagName(node);
      
      // check if the current node instance for this tagName has been assigned a node from this line of code
      const nodeLine = node.__svelte_meta.loc.line;
      const currentInstance = this.unassignedComponentInstances[nodeTagName][0];
      const { id, lines } = currentInstance;
      // if this is the first element from this line of code for this instance, we're still in the same instance
      if (!lines.includes(nodeLine)) {
        nodeComponentId = id;
        lines.push(nodeLine);
      }
      // otherwise this element is from the next instance of this tagName, so remove current instance and get new id
      else {
        const newInstance = this.unassignedComponentInstances[nodeTagName].shift();
        nodeComponentId = newInstance.id;
      }

    // store node/component relationship for later use
    this.nodeComponents.set(node, nodeComponentId);

    const nodeComponents = { nodeComponent: nodeComponentId, targetComponent: targetComponentId }
    return nodeComponents;
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
