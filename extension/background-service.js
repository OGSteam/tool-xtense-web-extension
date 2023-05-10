
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "toolbar_icon") {
      // read `newIconPath` from request and read `tab.id` from sender
      chrome.action.setIcon({
        path: message.newIconPath,
        tabId: sender.tab.id
      });
      chrome.action.setTitle({
        title: message.newTooltip,
        tabId: sender.tab.id
      });
      return true;
    }
    if (message.action === "xhttp") {

      console.log("Service Worker - Send HTTP Request");
      // Example POST method implementation:

      // Default options are marked with *
      fetch(message.url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': message.dataType
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: message.data
      })
      .then(response => {
        console.log('Response status code:', response.status);
        return response.text();
      })
      .then(data =>{
          console.log( 'Response Data:', data);        
          sendResponse({ status: 200, text : data });
      })
      .catch(error => {
        console.error('Fetch error:', error.message);
        sendResponse({ error : error.message});
      });
    return true;
    }
  });