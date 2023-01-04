/** Class responsible for storing and sharing data for snapshot production and state injections. */
export default class DataStore {
  /**
   * Creates a DataStore object.
   */
  constructor() {
    this.componentInstances = {}; // Map with keys of component ID's and values of references to component instances
    this.componentRepresentations = {}; // Map with keys of component ID's and values of component representations
  }

  /**
   * Adds a component instance to componentInstance map.
   * @param {string} id                   The component's id (tagName + instance number)
   * @param {SvelteComponent} instance    The reference to the component instance.
   */
  insertComponentInstance(id, instance) {
    this.componentInstances[id] = instance;
  }

  /**
   * Adds a component representation to componentRepresentation map.
   * @param {string} id                               The component's id (tagName + instance number)
   * @param {ComponentRepresentation} representation  The map of component properties to be sent to UI.
   */
  insertComponentRepresentation(id, representation) {
    this.componentRepresentations[id] = representation;
  }

  /**
   * Gets componentInstance map
   * @returns { Object }  Map with keys of component ID's and value of component representations
   */
  getComponentInstances() {
    return this.componentInstances;
  }

  /**
   * Gets componentRepresentations map.
   * @returns { Object }  Map with keys of component ID's and values of component representations
   */
  getComponentRepresentations() {
    return this.componentRepresentations;
  }
}
