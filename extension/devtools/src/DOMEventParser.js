export default class DOMEventParser {
  constructor() {
    this.componentCounts = {};
  }

  assignComponentId(tagName) {
    this.componentCounts[tagName] = (this.componentCounts[tagName] || 0) + 1;
    return tagName + this.componentCounts[tagName];
  }
}
