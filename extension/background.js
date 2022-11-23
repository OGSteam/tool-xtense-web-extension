/**
 * Created by Anthony on 12/05/2016.
 */

chrome.runtime.onMessage.addListener(

    async function (request, sender, callback) {

        if (request.action === "toolbar_icon") {
            // read `newIconPath` from request and read `tab.id` from sender
            chrome.browserAction.setIcon({
                path: request.newIconPath,
                tabId: sender.tab.id
            });
            chrome.browserAction.setTitle({
                title: request.newTooltip,
                tabId: sender.tab.id
            });

        }
        if (request.action === "xhttp") {

        // Example POST method implementation:

            // Default options are marked with *
            const response = (callback) => fetch(request.url, {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              mode: 'cors', // no-cors, *cors, same-origin
              cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
              credentials: 'same-origin', // include, *same-origin, omit
              headers: {
                'Content-Type': request.dataType
              },
              redirect: 'follow', // manual, *follow, error
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              body: request.data
            });
            return response; // parses JSON response into native JavaScript objects
          }
        }
    );
