chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === "svelteSite");
  port.onMessage.addListener(function(msg) {
    console.log(msg);
  });
});
