function type_of(value) {
  let type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  if (type === "object") {
    // check if it's a store variable
    if (value.hasOwnProperty("subscribe")) {
      // check if it's a writable store
      if (value.hasOwnProperty("set") && value.hasOwnProperty("update")) {
        type = "writable_store";
      } else {
        type = "non-writable_store";
      }
    } else {
      if (value.constructor.name !== "Object") {
        type = "unknown";
      }
    }
  }
  return type;
}

const deepClone = (inObject) => {
  let outObject, value, key;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  if (
    inObject.constructor.name !== "Object" &&
    inObject.constructor.name !== "Array"
  ) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = inObject[key];

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepClone(value);
  }

  return outObject;
};

export { type_of, deepClone };
