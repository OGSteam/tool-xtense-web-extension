/**
 * Created by Anthony on 12/12/2015.
 */


//Gestion de l'icone

function setStatus(type, message) {
    var icone = Xpath.getSingleNode(document, '//img[@id=\'xtense.icone\']');
    if (icone != null) {
        if (type == XLOG_SUCCESS) {
            if (document.getElementById('messagebox') || document.getElementById('combatreport')) {
                icone.src = chrome.extension.getURL('images/icones/xtenseOk-small.gif');
            } else {
                icone.src = chrome.extension.getURL('images/icones/xtenseOk.gif');
            }
        } else if (type == XLOG_NORMAL) {
            if (document.getElementById('messagebox') || document.getElementById('combatreport')) {
                icone.src = chrome.extension.getURL('images/icones/xtenseNo-small.gif');
            } else {
                icone.src = chrome.extension.getURL('images/icones/xtenseNo.gif');
            }
        } else if (type == XLOG_WARNING) {
            if (document.getElementById('messagebox') || document.getElementById('combatreport')) {
                icone.src = chrome.extension.getURL('images/icones/xtenseWarn-small.gif');
            }  else {
                icone.src = chrome.extension.getURL('images/icones/xtenseWarn.gif');
            }
        } else if (type == XLOG_ERROR) {
            if (document.getElementById('messagebox') || document.getElementById('combatreport')) {
                icone.src = chrome.extension.getURL('images/icones/xtenseKo-small.gif');
            } else {
                icone.src = chrome.extension.getURL('images/icones/xtenseKo.gif');
            }
        } else if (type == XLOG_SEND) {
            icone.src = chrome.extension.getURL('images/icones/xtense-send.gif');
        }
        icone.title = message;
    } else {
        log(message);
    }
}
//Fin Gestion de l'icone


// Affiche les Options Xtense

/* Affichage d'Xtense dans le menu */

function displayXtense() {
    // Ajout du Menu Options (Barre latérale de Ogame)
    //Lien vers OGSpy
    var ogspy_link = GM_getValue('server.url.plugin', 'http://www.ogsteam.fr').split('mod')[0];
    //log(getElementByAttr(document, 'className', 'showmessage'));
    // Page classique
    if (document.getElementById('playerName') && !document.getElementById('ui-dialog-title-1') && !document.getElementById('combatreport')) {
        var icone = chrome.extension.getURL('images/icones/xtense-small.gif');
        var aAttrs = '';
        var urlIcone = '';
        var onClick = null;
        if (GM_getValue('manual.send', 'false').toString() == 'true') {
            aAttrs = 'onClick="window.location.reload()" target="_self"';
        } else {
            aAttrs = 'href="' + ogspy_link + '" target="blank_" ';
        }
        var aff_option = '<span class="menu_icon"><a ' + aAttrs + '><img id="xtense.icone" class="mouseSwitch" src="' + icone + '" height="29" width="38"></span><a class="menubutton " href="' + url + '&xtense=Options" accesskey="" target="_self">';
        aff_option += '<span class="textlabel">Xtense</span></a>';
        var li1 = document.createElement('li');
        li1.setAttribute('id', 'optionXtense');
        li1.innerHTML = aff_option;
        var menuAlliance = Xpath.getSingleNode(document, '//*[@id=\'menuTable\']/li[contains(a/@href,\'page=alliance\')]');
        if (document.getElementById('optionXtense') != null) {
            document.getElementById('menuTable').removeChild(document.getElementById('optionXtense'));
        }
        menuAlliance.parentNode.insertBefore(li1, menuAlliance.nextSibling);
    } else if (getElementByAttr(document, 'className', 'showmessage')) {
        // Dans les messages ?
        log('icon for messages');
        var toolbarMessage = Xpath.getSingleNode(document, '//div[contains(@id,\'messages\']');
        var icone = chrome.extension.getURL('images/icones/xtense-small.gif');
        var liXtense = document.createElement('li');
        var aXtense = document.createElement('a');
        aXtense.setAttribute('href', ogspy_link);
        aXtense.setAttribute('target', 'blank_');
        var imgXtense = document.createElement('img');
        imgXtense.setAttribute('id', 'xtense.icone');
        imgXtense.setAttribute('src', icone);
        imgXtense.setAttribute('height', '16');
        imgXtense.setAttribute('width', '16');
        aXtense.appendChild(imgXtense);
        liXtense.appendChild(aXtense);
        toolbarMessage.appendChild(liXtense);
    } else if (document.getElementById('combatreport')) {
        // Dans un rc ?
        var roundInfo = Xpath.getSingleNode(document, '//*[@id=\'combatreport\']//div[contains(@class,\'round_info\')]');
        var icone = chrome.extension.getURL('images/icones/xtense-small.gif');
        var pXtense = document.createElement('p');
        var aXtense = document.createElement('a');
        aXtense.setAttribute('href', ogspy_link);
        aXtense.setAttribute('target', 'blank_');
        var imgXtense = document.createElement('img');
        imgXtense.setAttribute('id', 'xtense.icone');
        imgXtense.setAttribute('src', icone);
        imgXtense.setAttribute('height', '16');
        imgXtense.setAttribute('width', '16');
        aXtense.appendChild(imgXtense);
        pXtense.appendChild(aXtense);
        roundInfo.appendChild(pXtense);
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
    // Récupération des préférences  : Serveur
    if (GM_getValue('server.check', 'false').toString() == 'true') {
        server_check += 'checked';
    }
    // Récupération des préférences  : Pages

    if (GM_getValue('handle.overview', 'false').toString() == 'true') {
        handle_overview += 'checked';
    }
    if (GM_getValue('handle.buildings', 'false').toString() == 'true') {
        handle_buildings += 'checked';
    }
    if (GM_getValue('handle.station', 'false').toString() == 'true') {
        handle_station += 'checked';
    }
    if (GM_getValue('handle.researchs', 'false').toString() == 'true') {
        handle_researchs += 'checked';
    }
    if (GM_getValue('handle.shipyard', 'false').toString() == 'true') {
        handle_shipyard += 'checked';
    }
    if (GM_getValue('handle.system', 'false').toString() == 'true') {
        handle_system += 'checked';
    }
    if (GM_getValue('handle.defense', 'false').toString() == 'true') {
        handle_defense += 'checked';
    }
    if (GM_getValue('handle.alliance', 'false').toString() == 'true') {
        handle_alliance += 'checked';
    }
    if (GM_getValue('handle.stats', 'false').toString() == 'true') {
        handle_stats += 'checked';
    }
    if (GM_getValue('handle.msg.msg', 'false').toString() == 'true') {
        handle_msg_msg += 'checked';
    }
    if (GM_getValue('handle.msg.ally', 'false').toString() == 'true') {
        handle_msg_ally += 'checked';
    }
    if (GM_getValue('handle.msg.spy', 'false').toString() == 'true') {
        handle_msg_spy += 'checked';
    }
    if (GM_getValue('handle.msg.ennemy.spy', 'false').toString() == 'true') {
        handle_msg_ennemy_spy += 'checked';
    }
    if (GM_getValue('handle.msg.rc', 'false').toString() == 'true') {
        handle_msg_rc += 'checked';
    }
    if (GM_getValue('handle.msg.rc.cdr', 'false').toString() == 'true') {
        handle_msg_rc_cdr += 'checked';
    }
    if (GM_getValue('handle.msg.expeditions', 'false').toString() == 'true') {
        handle_msg_expeditions += 'checked';
    }
    if (GM_getValue('handle.msg.commerce', 'false').toString() == 'true') {
        handle_msg_commerce += 'checked';
    }
    // Récupération des préférences  : Options

    if (GM_getValue('debug.mode', 'false').toString() == 'true') {
        opt_debug_mode += ' checked';
    }
    var options = '<div id="Xtense_Div" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;"><br/><br/>';
    // Serveur Univers
    options += '<img src="' + chrome.extension.getURL('images/xtense.png')+ '" alt="Options Xtense"/>';
    options += '<br/><br/>';
    options += '<table style="width:675px;">' +
        '<colgroup><col width="25%"/><col width="25%"/><col width="25%"/><col width="25%"/></colgroup>' +
        '<tbody>' +
        '<tr>' +
        '<td align="center"><a onclick="displayOption(\'Xtense_serveurs\')" style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/server.png')+ '"/><span id="menu_servers" style="font-size: 20px; color: white;"><b>&#160;Serveur</b></span></a></td>' +
        '<td align="center"><a onclick="displayOption(\'Xtense_pages\')" style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/pages.png')+ '"/><span id="menu_pages" style="font-size: 20px; color: orange;"><b>&#160;Pages</b></span></a></td>' +
        '<td align="center"><a onclick="displayOption(\'Xtense_options\')" style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/conf.png')+ '"/><span id="menu_options" style="font-size: 20px; color: orange;"><b>&#160;Options</b></span></a></td>' +
        '<td align="center"><a onclick="displayOption(\'Xtense_about\')" style="cursor:pointer;"><img src="' + chrome.extension.getURL('images/about.png')+ '"/><span id="menu_about" style="font-size: 20px; color: orange;"><b>&#160;A propos</b></span></a></td>' +
        '</tr>' +
        '</tbody>' +
        '</table>';
    options += '<div id="Xtense_serveurs">';
    options += '<table id="Xtense_table_serveurs" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
    options += '<colgroup><col width="20%"/><col/></colgroup>';
    options += '<thead><tr><th class="Xtense_th" colspan="2" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
    options += '<tbody>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">URL OGSpy</label></td>';
    options += '<td class="value"><input class="speed" id="server.url.plugin" value="' + GM_getValue('server.url.plugin', 'http://VOTRESITEPERSO/VOTREDOSSIEROGSPY/mod/xtense/xtense.php') + '" size="35" alt="24" type="text"/></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Utilisateur</label></td>';
    options += '<td class="value"><input class="speed" id="server.user" value="' + GM_getValue('server.user', 'utilisateur') + '" size="35" alt="24" type="text"/></td>';
    options += '</tr>';
    options += '<tr><td>&#160;</td><td>&#160;</td></tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Mot de passe</label></td>';
    options += '<td class="value"><input class="speed" id="server.pwd" value="' + GM_getValue('server.pwd', 'mot de passe') + '" size="35" alt="24" type="password"/></td>';
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
    options += '<td  style="color: white; font-size: 14px; font-weight: bold;text-align:left;">Envoi des données:</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Vue générale</label></td>';
    options += '<td class="value"><input class="speed" id="handle.overview" size="35" alt="24" type="checkbox"' + handle_overview + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Bâtiments</label></td>';
    options += '<td class="value"><input class="speed" id="handle.buildings" size="35" alt="24" type="checkbox"' + handle_buildings + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Installations</label></td>';
    options += '<td class="value"><input class="speed" id="handle.station" size="35" alt="24" type="checkbox"' + handle_station + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Recherches</label></td>';
    options += '<td class="value"><input class="speed" id="handle.researchs" size="35" alt="24" type="checkbox"' + handle_researchs + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Flotte</label></td>';
    options += '<td class="value"><input class="speed" id="handle.shipyard" size="35" alt="24" type="checkbox"' + handle_shipyard + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Défense</label></td>';
    options += '<td class="value"><input class="speed" id="handle.defense" size="35" alt="24" type="checkbox"' + handle_defense + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Systemes solaires</label></td>';
    options += '<td class="value"><input class="speed" id="handle.system" size="35" alt="24" type="checkbox"' + handle_system + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Liste des membres de l\'alliance</label></td>';
    options += '<td class="value"><input class="speed" id="handle.alliance" size="35" alt="24" type="checkbox"' + handle_alliance + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Tous classements</label></td>';
    options += '<td class="value"><input class="speed" id="handle.stats" size="35" alt="24" type="checkbox"' + handle_stats + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">Envoi des messages:</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Messages de joueurs</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.msg" size="35" alt="24" type="checkbox"' + handle_msg_msg + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Messages d\'alliance</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.ally" size="35" alt="24" type="checkbox"' + handle_msg_ally + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Rapports d\'espionnage</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.spy" size="35" alt="24" type="checkbox"' + handle_msg_spy + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Espionnages ennemis</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.ennemy.spy" size="35" alt="24" type="checkbox"' + handle_msg_ennemy_spy + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Rapports de combat</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.rc" size="35" alt="24" type="checkbox"' + handle_msg_rc + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Rapports de recyclage</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.rc.cdr" size="35" alt="24" type="checkbox"' + handle_msg_rc_cdr + '/></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Expéditions</label></td>';
    options += '<td class="value"><input class="speed" id="handle.msg.expeditions" size="35" alt="24" type="checkbox"' + handle_msg_expeditions + '/></td>';
    options += '<td class="champ"><label class="styled textBeefy">Livraisons de commerce</label></td>';
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
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;">Options Diverses</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"><label class="styled textBeefy">Mode débogage</label></td>';
    options += '<td class="value" style="text-align:left;"><input class="speed" id="debug.mode" size="35" alt="24" type="checkbox"' + opt_debug_mode + '/></td>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
    options += '<td class="champ"></td>';
    options += '<td class="value"></td>';
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
    options += '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;">A Propos de Xtense ' + VERSION + ':</td>';
    options += '</tr>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<td class="champ"><label class="styled textBeefy">Xtense GM par Jedinight et DarkNoon.<br /> Support disponible auprès de <a href="http://www.ogsteam.fr" target="_blank">l\'OGSteam</a></label></td>';
    options += '<tr>';
    options += '<td colspan="6">&nbsp;</td>';
    options += '</tr>';
    options += '<td class="champ"><label class="styled textBeefy">Xtense GM is an OGSteam Software © 2005-2016</label></td>';
    options += '</tbody></table>';
    options += '</div>';
    options += '<br/><br/></div>';
    //fin Tableau
    var einhalt = document.getElementById('inhalt');
    var escriptopt = document.createElement('div');
    escriptopt.id = 'xtenseScriptOpt';
    escriptopt.innerHTML = options;
    escriptopt.style.cssFloat = 'left';
    escriptopt.style.position = 'relative';
    escriptopt.style.width = '670px';
    einhalt.style.display = 'none';
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    var newscriptText = document.createTextNode('function displayOption(id){if(id==\'Xtense_serveurs\'){document.getElementById(id).style.display=\'block\';document.getElementById(\'Xtense_pages\').style.display=\'none\';document.getElementById(\'Xtense_options\').style.display=\'none\';document.getElementById(\'Xtense_about\').style.display=\'none\';document.getElementById(\'menu_servers\').style.color=\'white\';document.getElementById(\'menu_pages\').style.color=\'orange\';document.getElementById(\'menu_options\').style.color=\'orange\';document.getElementById(\'menu_about\').style.color=\'orange\';}else if(id==\'Xtense_pages\'){document.getElementById(id).style.display=\'block\';document.getElementById(\'Xtense_serveurs\').style.display=\'none\';document.getElementById(\'Xtense_options\').style.display=\'none\';document.getElementById(\'Xtense_about\').style.display=\'none\';document.getElementById(\'menu_servers\').style.color=\'orange\';document.getElementById(\'menu_pages\').style.color=\'white\';document.getElementById(\'menu_options\').style.color=\'orange\';document.getElementById(\'menu_about\').style.color=\'orange\';}else if(id==\'Xtense_options\'){document.getElementById(id).style.display=\'block\';document.getElementById(\'Xtense_serveurs\').style.display=\'none\';document.getElementById(\'Xtense_pages\').style.display=\'none\';document.getElementById(\'Xtense_about\').style.display=\'none\';document.getElementById(\'menu_servers\').style.color=\'orange\';document.getElementById(\'menu_pages\').style.color=\'orange\';document.getElementById(\'menu_options\').style.color=\'white\';document.getElementById(\'menu_about\').style.color=\'orange\';}else if(id==\'Xtense_about\'){document.getElementById(id).style.display=\'block\';document.getElementById(\'Xtense_serveurs\').style.display=\'none\';document.getElementById(\'Xtense_pages\').style.display=\'none\';document.getElementById(\'Xtense_options\').style.display=\'none\';document.getElementById(\'menu_servers\').style.color=\'orange\';document.getElementById(\'menu_pages\').style.color=\'orange\';document.getElementById(\'menu_options\').style.color=\'orange\';document.getElementById(\'menu_about\').style.color=\'white\';}}');
    script.appendChild(newscriptText);
    escriptopt.appendChild(script);
    einhalt.parentNode.insertBefore(escriptopt, einhalt);
    document.getElementById('Xtense_serveurs').style.display = 'block';
    document.getElementById('Xtense_pages').style.display = 'none';
    document.getElementById('Xtense_options').style.display = 'none';
    document.getElementById('Xtense_about').style.display = 'none';

    function enregistreOptionsXtense() {
        // Sauvegarde des inputs
        var inputOptions = Xpath.getOrderedSnapshotNodes(document, '//div[@id=\'Xtense_Div\']//input[not(@type=\'checkbox\')]');
        //log("inputOptions.snapshotLength="+inputOptions.snapshotLength);
        if (inputOptions.snapshotLength > 0) {
            for (var i = 0; i < inputOptions.snapshotLength; i++) {
                var input = inputOptions.snapshotItem(i);
                GM_setValue(input.id, input.value);
            }
        }
        // Sauvegarde des checkbox

        var checkboxOptions = Xpath.getOrderedSnapshotNodes(document, '//div[@id=\'Xtense_Div\']//input[@type=\'checkbox\']');
        //log("checkboxOptions.snapshotLength="+checkboxOptions.snapshotLength);
        if (checkboxOptions.snapshotLength > 0) {
            for (var j = 0; j < checkboxOptions.snapshotLength; j++) {
                var checkbox = checkboxOptions.snapshotItem(j);
                //log('GM_setValue(prefix_GMData +'+checkbox.id+' , '+checkbox.checked+');');
                GM_setValue(checkbox.id, checkbox.checked);
            }
        }
    }
    setInterval(enregistreOptionsXtense, 500);
}

