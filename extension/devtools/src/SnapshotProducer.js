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
  createSnapshot() {
    const instances = this.dataStore.getComponentInstances();
    const representations = this.dataStore.getComponentRepresentations();
    console.log(instances);
    console.log(representations);
    console.log("capture snapshot");
  }
}
