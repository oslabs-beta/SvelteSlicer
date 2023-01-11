/** Class that compiles current state data and packages and transmits snapshot. */
export default class SnapshotProducer {
  /**
   * Create a SnapshotProducer object
   * @param {DataStore} dataStore The instance of DataStore shared by the system.
   */
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Collect data from DataStore to create snapshot.
   */
  processDOMUpdate() {
    this.createSnapshot();
  }

  /**
   * Eventually... Package current state data into a snapshot object
   * Currently... Collects current state data and logs to console.
   */
  createSnapshot() {
    const { instances, representations, label } = this.getSnapshotData();

    console.log(instances);
    console.log(representations);
    console.log("capture snapshot - " + label);
  }

  /**
   * Collect data from DataStore to create snapshot.
   */
  getSnapshotData() {
    const instances = this.dataStore.getComponentInstances();
    const representations = this.dataStore.getComponentRepresentations();
    const label = this.dataStore.getLabel();

    return { instances, representations, label };
  }
}
