chrome.devtools.inspectedWindow.eval(
    `                      
    domNodes = inspect($$('body'));

    console.log(domNodes);

    function print(element) {
      if (element.nodeType === 8) {
        const internal = inspect(element);
        console.log(internal.nodeType);
      }

      for (const child of element.childNodes) {
        print(child);
      }

    }

    print(domNodes[0]);
    `, );