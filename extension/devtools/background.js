var connections = {};

// Set up listeniing connection with devtool
chrome.runtime.onConnect.addListener(function (port) {
  // Listen to messages sent from the DevTools page
    
  var extensionListener = function (message) {
    // Store tabID from initial message from devtool
    if (message.name == "init") {
      connections[message.tabId] = port;
      return;
    }

    // Forward messages from devtool on to the content script
    if (message.name === "jumpState" || message.name === "clearSnapshots") {
      chrome.tabs.sendMessage(message.tabId, message);
    }
  };

  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    var tabs = Object.keys(connections);
    for (var i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// Receive messages from content script and relay to the devtool
chrome.runtime.onMessage.addListener(function (message, sender) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id;
    // If valid message, forward to devtool
    if (tabId in connections) {
      connections[tabId].postMessage(message);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});
