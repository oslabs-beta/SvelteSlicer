window.addEventListener('message', function(event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  // Only accept messages that we know are ours
  if (typeof event.data !== 'object' || event.data === null ||
      !event.data.source === 'panel.js') {
    return;
  }

  const data = event.data;

  chrome.runtime.sendMessage(JSON.stringify(data));
});

chrome.runtime.onMessage.addListener(message => {
  if (message.name === "jumpState") {
    window.postMessage({
      source: 'listener.js',
      type: 'jumpState',
      index: message.index,
      state: message.state,
      tree: message.tree
    });
  }

  else if (message.name === "clearSnapshots") {
    window.postMessage({
      source: 'listeneter.js',
      type: 'clearSnapshots',
      index: message.index,
      clearType: message.clearType,
      path: message.path
    })
  }
});

