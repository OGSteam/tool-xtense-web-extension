//noinspection JSUnresolvedVariable
/**
 * Created by Anthony on 12/05/2016.
 */

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // read `newIconPath` from request and read `tab.id` from sender
        chrome.browserAction.setIcon({
            path: request.newIconPath,
            tabId: sender.tab.id
        });
        chrome.browserAction.setTitle({
            title: request.newTooltip,
            tabId: sender.tab.id
        });

    });