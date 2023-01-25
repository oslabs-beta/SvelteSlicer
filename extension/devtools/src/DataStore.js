/** Class responsible for storing and sharing data for snapshot production and state injections. */
export default class DataStore {
  #componentInstances;
  #componentRepresentations;
  #snapshotLabel;

  /**
   * Creates a DataStore object.
   */
  constructor() {
    this.#componentInstances = {}; // Map with keys of component ID's and values of references to component instances
    this.#componentRepresentations = {}; // Map with keys of component ID's and values of component representations
    this.#snapshotLabel = "Initial Load";
  }

  /**
   * Adds a component instance to componentInstance map.
   * @param {string} id                   The component's id (tagName + instance number)
   * @param {SvelteComponent} instance    The reference to the component instance.
   */
  insertComponentInstance(id, instance) {
    this.#componentInstances[id] = instance;
  }

  /**
   * Adds a component representation to componentRepresentation map.
   * @param {string} id                               The component's id (tagName + instance number)
   * @param {ComponentRepresentation} representation  The map of component properties to be sent to UI.
   */
  insertComponentRepresentation(id, representation) {
    this.#componentRepresentations[id] = representation;
  }

  /**
   * Gets componentInstance map
   * @returns { Object }  Map with keys of component ID's and value of component representations
   */
  getComponentInstances() {
    return this.#componentInstances;
  }

  /**
   * Gets componentRepresentations map.
   * @returns { Object }  Map with keys of component ID's and values of component representations
   */
  getComponentRepresentations() {
    return this.#componentRepresentations;
  }

  /**
   * Updates snapshot label to reflect most recent user interaction
   * @param {string} label Label for next snapshot
   */
  setLabel(label) {
    this.#snapshotLabel = label;
  }

  /**
   * Get the current snapshot label.
   * @returns {string}  The current label (data on most recent user interaction).
   */
  getLabel() {
    return this.#snapshotLabel;
  }
}
