chrome.devtools.inspectedWindow.eval(
    `                      
    domNodes = inspect($$('body'));
    console.log(domNodes);
    `, );