//noinspection JSUnresolvedVariable
/**
 * Created by Anthony on 12/05/2016.
 */

/*eslint-env es6*/
/*global log,chrome */
/*eslint no-undef: "error"*/
/*eslint-env browser*/


chrome.runtime.onMessage.addListener(


    function(request, sender, callback) {

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

            let ajax_obj = $.ajax({
                type: request.method,
                url: request.url,
                data: request.data,
                dataType: request.dataType,
                crossDomain : true,
            });

            ajax_obj.always(function (jqXHR) {
                callback(jqXHR);
            });

            return true; // prevents the callback from being called too early on return
        }
    });
