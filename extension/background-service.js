chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toolbar_icon") {
    chrome.action.setIcon({
      path: message.newIconPath,
      tabId: sender.tab.id
    });
    chrome.action.setTitle({
      title: message.newTooltip,
      tabId: sender.tab.id
    });
    sendResponse({success: true});
    return false;
  }

  if (message.action === "xhttp") {
    console.log("Service Worker - Send HTTP Request", message.messageId || "unknown");

    // Indicate we want to use sendResponse asynchronously
    const keepAlive = true;

    // Use a variable to keep reference to the fetch promise
    fetch(message.url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': message.dataType
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: message.data
    })
      .then(response => {
        console.log(`[${message.messageId}] Response status code:`, response.status);
        // Store the status code so we can use it in the next then block
        return {
          status: response.status,
          textPromise: response.text()
        };
      })
      .then(result => {
        // Wait for the text promise to resolve
        return result.textPromise.then(text => {
          console.log(`[${message.messageId}] Response Data:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
          // Send both the actual status code and text
          sendResponse({
            status: result.status,
            text: text
          });
        });
      })
      .catch(error => {
        console.error(`[${message.messageId}] Fetch error:`, error.message);
        sendResponse({
          status: 408, // Error status code
          error: error.message
        });
      });

    // This keeps the message channel open
    return keepAlive;
  }
});
