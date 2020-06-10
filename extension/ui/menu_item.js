/**
 * Created by Anthony on 12/12/2015.
 */
/*eslint-env es6*/
/*eslint no-undef: "error"*/
/*eslint-env browser*/
/*global XLOG_SUCCESS,XLOG_NORMAL,XLOG_WARNING,XLOG_ERROR,XLOG_SEND  */

//Gestion de l'icone

function setStatus(type, message) {
    let img_url = null;
    let icone = Xpath.getSingleNode(document, '//img[@id=\'xtense.icone\']');
    if (icone != null) {
        switch (type){
            case XLOG_SUCCESS :
                img_url = 'images/icones/xtenseOk.png';
                log.info(message);
                break;
            case XLOG_NORMAL :
                img_url = 'images/icones/xtenseNo.png';
                log.info(message);
                break;
            case XLOG_WARNING :
                img_url = 'images/icones/xtenseWarn.png';
                log.warn(message);
                break;
            case XLOG_ERROR:
                img_url = 'images/icones/xtenseKo.png';
                log.error(message);
                break;
            case XLOG_SEND:
                img_url = 'images/icones/xtense-send.png';
                log.info(message);
                break;
            default:
                img_url = 'images/icones/xtenseNo.png';
        }
        icone.title = message;
        icone.src = chrome.extension.getURL(img_url);
        chrome.runtime.sendMessage({ "action" : "toolbar_icon", "newIconPath" : img_url, "newTooltip" : message});

    } else {
        log.error("Error: Cannot set icon " + message);
    }
}
//Fin Gestion de l'icone


// Affiche les Options Xtense

/* Displays Xtense Menu Entry point */

function displayXtense() {
    // Ajout du Menu Options (Barre latérale de Ogame)
    //Lien vers OGSpy
    var ogspy_link = storageGetValue('server.url.plugin', 'https://forum.ogsteam.fr');
    var aff_ogspy = ' ';

    // Page classique
    if ($("#playerName")) {
        var icone = chrome.extension.getURL('images/icones/xtense.png');
        var icone_planet = chrome.extension.getURL('images/icones/planet.png');

        var aAttrs = '';
        if (storageGetValue('manual.send', 'false').toString() === 'true') {
            aAttrs = 'onClick="window.location.reload()" target="_self"';
        } else {
            aAttrs = 'href="' + ogspy_link + '" target="blank_" ';
        }

        var aff_option = $("<li id='optionXtense'>" +
            "<span class='menu_icon'>" +
            "<a " + aAttrs + "><img id='xtense.icone' class='mouseSwitch' src='" + icone + "' height='27' width='27' /></a></span>" +
            "<a class='menubutton' href='" + url + "&xtense=Options' accesskey='' target='_self'><span class='textlabel'>Xtense</span></a>" +
            "</li>");

        if (storageGetValue('ogspy.link', 'true').toString() === 'true') {
            aff_ogspy = create_menu_button('optionOGSpy', icone_planet, ogspy_link, 'OGSpy');
        }

        if ($('#optionXtense').length) {
            $('#menuTableTools')[0].removeChild($('#optionXtense')[0]);
        }
        if ($('#optionOGSpy').length) {
            $('#menuTableTools')[0].removeChild($('#optionOGSpy')[0]);
        }

        $("#menuTableTools").append(aff_option);
        $("#optionXtense").after(aff_ogspy);

        if (storageGetValue('ogspy.link', 'true').toString() === 'true') {
            $("#optionOGSpy").after(aff_ogspy);
        }else{
            $("#optionXtense").after(aff_ogspy);
        }
    } else {

        log.info("Problem to display Menu entry point");

    }
}

function displayOptions() {
    // Variables : Serveur
    var server_check = ' ';
    // Variables : Pages
    // Variables recupération des pages
    var handle_overview = ' ';
    var handle_system = ' ';
    var handle_researchs = ' ';
    var handle_buildings = ' ';
    var handle_station = ' ';
    var handle_shipyard = ' ';
    var handle_defense = ' ';
    var handle_alliance = ' ';
    var handle_stats = ' ';
    // Variables recupération des messages
    var handle_msg_msg = ' ';
    var handle_msg_ally = ' ';
    var handle_msg_spy = ' ';
    var handle_msg_ennemy_spy = ' ';
    var handle_msg_rc = ' ';
    var handle_msg_rc_cdr = ' ';
    var handle_msg_expeditions = ' ';
    var handle_msg_commerce = ' ';
    // Variables : Options
    var opt_debug_mode = ' ';
    var opt_backup_link = ' ';
    var opt_ogspy_link = ' ';

    // Récupération des préférences  : Pages
    if (storageGetValue('handle.overview', 'false').toString() === 'true') {
        handle_overview += 'checked';
    }
    if (storageGetValue('handle.buildings', 'false').toString() === 'true') {
        handle_buildings += 'checked';
    }
    if (storageGetValue('handle.station', 'false').toString() === 'true') {
        handle_station += 'checked';
    }
    if (storageGetValue('handle.researchs', 'false').toString() === 'true') {
        handle_researchs += 'checked';
    }
    if (storageGetValue('handle.shipyard', 'false').toString() === 'true') {
        handle_shipyard += 'checked';
    }
    if (storageGetValue('handle.system', 'false').toString() === 'true') {
        handle_system += 'checked';
    }
    if (storageGetValue('handle.defense', 'false').toString() === 'true') {
        handle_defense += 'checked';
    }
    if (storageGetValue('handle.alliance', 'false').toString() === 'true') {
        handle_alliance += 'checked';
    }
    if (storageGetValue('handle.stats', 'false').toString() === 'true') {
        handle_stats += 'checked';
    }
    if (storageGetValue('handle.msg.msg', 'false').toString() === 'true') {
        handle_msg_msg += 'checked';
    }
    if (storageGetValue('handle.msg.ally', 'false').toString() === 'true') {
        handle_msg_ally += 'checked';
    }
    if (storageGetValue('handle.msg.spy', 'false').toString() === 'true') {
        handle_msg_spy += 'checked';
    }
    if (storageGetValue('handle.msg.ennemy.spy', 'false').toString() === 'true') {
        handle_msg_ennemy_spy += 'checked';
    }
    if (storageGetValue('handle.msg.rc', 'false').toString() === 'true') {
        handle_msg_rc += 'checked';
    }
    if (storageGetValue('handle.msg.rc.cdr', 'false').toString() ==='true') {
        handle_msg_rc_cdr += 'checked';
    }
    if (storageGetValue('handle.msg.expeditions', 'false').toString() === 'true') {
        handle_msg_expeditions += 'checked';
    }
    if (storageGetValue('handle.msg.commerce', 'false').toString() === 'true') {
        handle_msg_commerce += 'checked';
    }
    // Récupération des préférences  : Options

    if (storageGetValue('debug.mode', 'false').toString() === 'true') {
        opt_debug_mode += ' checked';
    }
	if (storageGetValue('backup.link', 'false').toString() === 'true') {
        opt_backup_link += ' checked';
    }
    if (storageGetValue('ogspy.link', 'false').toString() === 'true') {
        opt_ogspy_link += ' checked';
    }

    var options = '<div id="Xtense_Div" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;"><br><br>';
    // Serveur Univers
    options += '<img src="' + chrome.extension.getURL('images/xtense.png') + '" alt="' + chrome.i18n.getMessage("XtenseOptions") + '"/>';
    options += '<br><br>';
    options += '<table style="width:675px;">' +
        '<colgroup><col width="25%"/><col width="25%"/><col width="25%"/><col width="25%"/></colgroup>' +
        '<tbody>' +
        '<tr>' +
        '<td align="center"><span id="menu_servers" style="font-size: 20px; color: white;"><a style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/server.png') + '"/><b>' + chrome.i18n.getMessage("XtenseOptions_serveur") + '</b></a></span></td>' +
        '<td align="center"><span id="menu_pages"   style="font-size: 20px; color: orange;"><a style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/pages.png') + '"/><b>' + chrome.i18n.getMessage("XtenseOptions_pages") + '</b></a></span></td>' +
        '<td align="center"><span id="menu_options" style="font-size: 20px; color: orange;"><a style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/conf.png') + '"/><b>' + chrome.i18n.getMessage("XtenseOptions_settings") + '</b></a></span></td>' +
        '<td align="center"><span id="menu_about"   style="font-size: 20px; color: orange;"><a style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/about.png') + '"/><b>' + chrome.i18n.getMessage("XtenseOptions_about") + '</b></a></span></td>' +
        '</tr>' +
        '</tbody>' +
        '</table>';
    options += '<div id="Xtense_serveurs">';
    options += '<table id="Xtense_table_serveurs" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8; ">';
    options += '<colgroup><col width="20%"/><col/></colgroup>';
    options += '<thead><tr><th class="Xtense_th" colspan="2" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
    options += '<tbody>';
    options += '<tr>';
    options += '<td class="champ" colspan="2"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_Title") + " " + numUnivers + '</label></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td class="champ" colspan="2"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_MainServer") + '</label></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_URL") + '</label></td>';
    options += '<td class="value"><input class="speed" id="server.url.plugin" value="' + storageGetValue('server.url.plugin', 'https://VOTRESITE/VOTREOGSPY') + '" size="64" alt="24" type="text"/></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_password") + '</label></td>';
    options += '<td class="value"><input class="speed" id="server.pwd" value="' + storageGetValue('server.pwd', 'mot de passe') + '" size="64" alt="24" type="password"/></td>';
    options += '</tr>';
    options += '<tr class="server_url_backup"><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr class="server_url_backup">';
    options += '<td class="champ" colspan="2"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_BackupServer") + '</label></td>';
    options += '</tr>';
    options += '<tr class="server_url_backup"><td >&#160;</td><td>&#160;</td></tr>';
	options += '<tr class="server_url_backup">';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_URL") + '</label></td>';
    options += '<td class="value"><input class="speed" id="server_backup.url.plugin" value="' + storageGetValue('server_backup.url.plugin', 'https://VOTRESITE/VOTREOGSPY') + '" size="64" alt="24" type="text"/></td>';
    options += '</tr>';
    options += '<tr class="server_url_backup"><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr class="server_url_backup">';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseServer_password") + '</label></td>';
    options += '<td class="value"><input class="speed" id="server_backup.pwd" value="' + storageGetValue('server_backup.pwd', 'mot de passe') + '" size="64" alt="24" type="password"/></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td colspan="2"><img src="' + chrome.extension.getURL('images/icones/infos.png') + '"/>' + chrome.i18n.getMessage("XtenseServer_Example")+ '</td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td colspan="2"><a href="https://wiki.ogsteam.fr" target="_blank" >' + chrome.i18n.getMessage("XtenseServer_Example_2")+ '</a></td>';
    options += '</tr>';
    options += '</tbody></table>';
    options += '</div>';
    /*---------------------------- Pages -----------------------------------------------*/
    options += '<div id="Xtense_pages">';
    options += '<table id="Xtense_table_pages" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
    options += '<colgroup><col width="30%"/><col/><col width="30%"/><col/><col width="30%"/><col/></colgroup>';
    options += '<thead><tr><th class="Xtense_th" colspan="3" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
    options += '<tbody>';
    options += '<tr>';
    options += '<td  style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' + chrome.i18n.getMessage("XtenseSend_title") + '</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_general") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.overview" size="35" alt="24" type="checkbox"' + handle_overview + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_buildings") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.buildings" size="35" alt="24" type="checkbox"' + handle_buildings + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_station") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.station" size="35" alt="24" type="checkbox"' + handle_station + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_researchs") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.researchs" size="35" alt="24" type="checkbox"' + handle_researchs + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_shipyard") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.shipyard" size="35" alt="24" type="checkbox"' + handle_shipyard + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_defense") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.defense" size="35" alt="24" type="checkbox"' + handle_defense + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_systems") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.system" size="35" alt="24" type="checkbox"' + handle_system + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_allymembers") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.alliance" size="35" alt="24" type="checkbox"' + handle_alliance + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_rankings") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.stats" size="35" alt="24" type="checkbox"' + handle_stats + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' + chrome.i18n.getMessage("XtenseSend_title_messages") + '</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_playermessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.msg" size="35" alt="24" type="checkbox"' + handle_msg_msg + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_allymessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.ally" size="35" alt="24" type="checkbox"' + handle_msg_ally + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_spymessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.spy" size="35" alt="24" type="checkbox"' + handle_msg_spy + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_ennemyspymessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.ennemy.spy" size="35" alt="24" type="checkbox"' + handle_msg_ennemy_spy + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_combatmessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.rc" size="35" alt="24" type="checkbox"' + handle_msg_rc + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_debrismessages") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.rc.cdr" size="35" alt="24" type="checkbox"' + handle_msg_rc_cdr + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_Expeditions") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.expeditions" size="35" alt="24" type="checkbox"' + handle_msg_expeditions + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseSend_tradingmessage") + '</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.commerce" size="35" alt="24" type="checkbox"' + handle_msg_commerce + '/></td>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
    options += '</tr>';
    options += '</tbody></table>';
    options += '</div>';
    /*---------------------------- Options -----------------------------------------------*/
    options += '<div id="Xtense_options">';
    options += '<table id="Xtense_table_options" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
    options += '<colgroup><col width="30%"/><col/><col width="30%"/><col/><col width="30%"/><col/></colgroup>';
    options += '<thead><tr><th class="Xtense_th" colspan="3" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
    options += '<tbody>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' + chrome.i18n.getMessage("XtenseOptionsPage_menu_settings") + '</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseOptionsPage_ogspylink") + '</label></td>';
    options += '<td class="value" style="text-align:left;"><input class="speed" id="ogspy.link" size="35" alt="24" type="checkbox"' + opt_ogspy_link + '/></td>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' + chrome.i18n.getMessage("XtenseOptionsPage_title") + '</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseOptionsPage_debugmode") + '</label></td>';
    options += '<td class="value" style="text-align:left;"><input class="speed" id="debug.mode" size="35" alt="24" type="checkbox"' + opt_debug_mode + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseOptionsPage_backuplink") + '</label></td>';
    options += '<td class="value" style="text-align:left;"><input class="speed" id="backup.link" size="35" alt="24" type="checkbox"' + opt_backup_link + '/></td>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' + chrome.i18n.getMessage("XtenseOptionsPage_report") + '</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseOptionsPage_lastreportType") + '</label></td>';
    options += '<td colspan="5" class="value" style="text-align:left "><input class="speed" id="report.type" value="' + storageGetValue('report.type', 'none') + '" size="32" alt="24" type="text"/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6"><textarea class="speed" rows="15" cols="100" readonly style="margin: 0; width: 425px; height: 200px;">'+ storageGetValue('report.data', 'none') +'</textarea></td>';
    options += '</tr>';
    options += '</tbody></table>';
    options += '</div>';
    /*---------------------------- A propos -----------------------------------------------*/
    options += '<div id="Xtense_about">';
    options += '<table id="Xtense_table_about" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
    options += '<colgroup><col width="20%"/><col/></colgroup>';
    options += '<thead><tr><th class="Xtense_th" colspan="2" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
    options += '<tbody>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;">' + chrome.i18n.getMessage("XtenseAbout_version") + ' ' + VERSION + ':</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseAbout_authors") + '<br> ' + chrome.i18n.getMessage("XtenseAbout_support") + ' <a href="https://forum.ogsteam.fr" target="_blank">l\'OGSteam</a><br>' + chrome.i18n.getMessage("XtenseAbout_issue") + ': <a href="https://github.com/OGSteam/tool-xtense-web-extension/issues" target="_blank">Github</a></label></td>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<td class="champ"><label class="styled textBeefy">' + chrome.i18n.getMessage("XtenseAbout_ogsteam") + '</label></td>';
    options += '</tbody></table>';
    options += '</div>';
    options += '<br><br></div>';
    //fin Tableau
    let einhalt = $( "#middle" );
    if(einhalt.length === 0) einhalt = $('#inhalt');
    let escriptopt = $("<div id='xtenseScriptOpt' style='float: left;position: relative;width: 670px;border: 0' >" + options + "</div>");   //document.createElement('div');

    einhalt.hide(); //On masque le jeu pour afficher le menu

    $('#contentWrapper.with_chat_bar').css('padding-bottom','0px');
    einhalt.parent().after(escriptopt);
    displayOption('#Xtense_serveurs'); // Mise en place initiale du menu

    $('#menu_servers').click( function(){ displayOption('#Xtense_serveurs'); });
    $('#menu_pages').click( function(){ displayOption('#Xtense_pages'); });
    $('#menu_options').click( function(){ displayOption('#Xtense_options'); });
    $('#menu_about').click( function(){ displayOption('#Xtense_about'); });

    if(einhalt.visible) {

        log.info("Erreur Affichage menu");
    }

    function enregistreOptionsXtense() {
        // Sauvegarde des inputs
        let inputOptions = Xpath.getOrderedSnapshotNodes(document, '//div[@id=\'Xtense_Div\']//input[not(@type=\'checkbox\')]');
        //log.info("inputOptions.snapshotLength="+inputOptions.snapshotLength);
        if (inputOptions.snapshotLength > 0) {
            for (let i = 0; i < inputOptions.snapshotLength; i++) {
                let input = inputOptions.snapshotItem(i);
                storageSetValue(input.id, input.value);
            }
        }
        // Sauvegarde des checkbox

        let checkboxOptions = Xpath.getOrderedSnapshotNodes(document, '//div[@id=\'Xtense_Div\']//input[@type=\'checkbox\']');
        //log.info("checkboxOptions.snapshotLength="+checkboxOptions.snapshotLength);
        if (checkboxOptions.snapshotLength > 0) {
            for (let j = 0; j < checkboxOptions.snapshotLength; j++) {
                let checkbox = checkboxOptions.snapshotItem(j);
                //log.info('GM_setValue(prefix_GMData +'+checkbox.id+' , '+checkbox.checked+');');
                storageSetValue(checkbox.id, checkbox.checked);
            }
        }
    }

    setInterval(enregistreOptionsXtense, 200);
}

function displayOption(id) {

    $(id).show(); //On affiche le bloc courant

    if (id === '#Xtense_serveurs') {

        $('#Xtense_pages').hide();
        $('#Xtense_options').hide();
        $('#Xtense_about').hide();
        $('#menu_servers').css('color' , 'white');
        $('#menu_pages').css('color' , 'orange');
        $('#menu_options').css('color' , 'orange');
        $('#menu_about').css('color' , 'orange');
		if (storageGetValue('backup.link', 'false').toString() === 'true')
			$('.server_url_backup').show();
		else $('.server_url_backup').hide();
    }
    else if (id === '#Xtense_pages') {

        $('#Xtense_serveurs').hide();
        $('#Xtense_options').hide();
        $('#Xtense_about').hide();
        $('#menu_servers').css('color' , 'orange');
        $('#menu_pages').css('color' , 'white');
        $('#menu_options').css('color' , 'orange');
        $('#menu_about').css('color' , 'orange');
    } else if (id === '#Xtense_options') {

        $('#Xtense_serveurs').hide();
        $('#Xtense_pages').hide();
        $('#Xtense_about').hide();
        $('#menu_servers').css('color' , 'orange');
        $('#menu_pages').css('color' , 'orange');
        $('#menu_options').css('color' , 'white');
        $('#menu_about').css('color' , 'orange');
    } else if (id === '#Xtense_about') {

        $('#Xtense_serveurs').hide();
        $('#Xtense_pages').hide();
        $('#Xtense_options').hide();
        $('#menu_servers').css('color' , 'orange');
        $('#menu_pages').css('color' , 'orange');
        $('#menu_options').css('color' , 'orange');
        $('#menu_about').css('color' , 'white');
    }
}


function create_menu_button(item_id, icon, link, name) {

    let button = $("<li id='" + item_id +"'>" +
        "<span class='menu_icon'>" +
        "<img class='mouseSwitch' src='" + icon + "' height='27' width='27'></span>" +
        "<a class='menubutton' href='" + link + "' accesskey='' target='blank_'><span class='textlabel'>" + name + "</span></a>" +
        "</li>");
    return button;
}

