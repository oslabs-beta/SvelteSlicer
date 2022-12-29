/** Class responsible for storing and sharing data for snapshot production and state injections. */
export default class DataStore {
  /**
   * Creates a DataStore object.
   */
  constructor() {
    this.componentInstances = {};
    this.componentRepresentations = {};
  }

  /**
   * Adds a component instance to componentInstance map.
   * @param {string} id
   * @param {SvelteComponent} instance
   */
  insertComponentInstance(id, instance) {
    this.componentInstances[id] = instance;
  }

  /**
   * Adds a component representation to componentRepresentation map.
   * @param {string} id
   * @param {ComponentRepresentation} representation
   */
  insertComponentRepresentation(id, representation) {
    this.componentRepresentations[id] = representation;
  }

  /**
   * Gets componentInstance map
   * @returns
   */
  getComponentInstances() {
    return this.componentInstances;
  }

  /**
   * Gets componentRepresentations map.
   * @returns
   */
  getComponentRepresentations() {
    return this.componentRepresentations;
  }
}
