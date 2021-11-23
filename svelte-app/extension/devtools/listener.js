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

  var message = JSON.stringify(event.data.data);

  chrome.runtime.sendMessage(message);
});

