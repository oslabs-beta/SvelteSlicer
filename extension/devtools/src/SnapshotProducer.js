/** Class that compiles current state data and packages and transmits snapshot. */
export default class SnapshotProducer {
  #dataStore;

  /**
   * Create a SnapshotProducer object
   * @param {DataStore} dataStore The instance of DataStore shared by the system.
   */
  constructor(dataStore) {
    this.#dataStore = dataStore;
  }

  /**
   * Respond to DOMUpdate events. (Still a work in progress! Comments outline future functionality...)
   */
  processDOMUpdate() {
    // verify that this is actually a new state
    // if it is...
    // create a new snapshot object
    this.#createSnapshot();
    // send snapshot object to devtool context
    // store copy of current state in DataStore's stateHistory
    // reset system to prepare for next snapshot capture
    this.#reset();
  }

  /**
   * Eventually... Package current state data into a snapshot object
   * Currently... Collects current state data and logs to console.
   */
  #createSnapshot() {
    const { instances, representations, label } = this.#getSnapshotData();

    console.log(instances);
    console.log(representations);
    console.log("capture snapshot - " + label);
  }

  /**
   * Get snapshot data from DataStore..
   */
  #getSnapshotData() {
    const instances = this.#dataStore.getComponentInstances();
    const representations = this.#dataStore.getComponentRepresentations();
    const label = this.#dataStore.getLabel();

    return { instances, representations, label };
  }

  /**
   * Reset system in preparation for the next snapshot capture.
   */
  #reset() {
    // set the default label for next snapshot
    this.#dataStore.setLabel("Application Event");
  }
}
