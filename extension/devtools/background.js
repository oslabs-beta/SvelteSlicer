// background.js
var connections = {};

chrome.runtime.onConnect.addListener(function (port) {

  var extensionListener = function (message, sender, sendResponse) {

    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name == "init") {
      connections[message.tabId] = port;
      return;
    }
    
    if (message.name === "jumpState" || message.name === "clearSnapshots") {
      chrome.tabs.sendMessage(message.tabId, message);
    }
  }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(message, sender) {
    // Messages from content scripts should have sender.tab set
    if (sender.tab) {
      var tabId = sender.tab.id;
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