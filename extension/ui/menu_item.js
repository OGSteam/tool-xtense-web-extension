/**
 * Xtense - Extension pour navigateur permettant la synchronisation avec OGSpy
 *
 * @author      OGSteam
 * @copyright   2025 OGSteam
 * @license     GNU GPL v2
 * @version     3.1.2
 */
/*global XLOG_SUCCESS,XLOG_NORMAL,XLOG_WARNING,XLOG_ERROR,XLOG_SEND,VERSION,$,log,Xpath  */

//Gestion de l'icone

function setStatus(type, message) {
  let img_url = null;
  let icone = Xpath.getSingleNode(document, "//img[@id='xtense.icone']");
  if (icone != null) {
    switch (type) {
      case XLOG_SUCCESS:
        img_url = "assets/icones/xtenseOk.png";
        log.info(message);
        break;
      case XLOG_NORMAL:
        img_url = "assets/icones/xtenseNo.png";
        log.info(message);
        break;
      case XLOG_WARNING:
        img_url = "assets/icones/xtenseWarn.png";
        log.warn(message);
        break;
      case XLOG_ERROR:
        img_url = "assets/icones/xtenseKo.png";
        log.error(message);
        break;
      case XLOG_SEND:
        img_url = "assets/icones/xtense-send.png";
        log.info(message);
        break;
      default:
        img_url = "assets/icones/xtenseNo.png";
    }
    icone.title = message;
    icone.src = chrome.runtime.getURL(img_url);
    chrome.runtime.sendMessage({
      action: "toolbar_icon",
      newIconPath: img_url,
      newTooltip: message,
    });
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
  const ogspy_link = storageGetValue("server.url.plugin", "https://forum.ogsteam.eu");
  const playerName = $("#playerName");
  if (!playerName.length) {
    log.info("Problem to display Menu entry point");
    return;
  }
  const icone = chrome.runtime.getURL("assets/icones/xtense.png");
  const icone_planet = chrome.runtime.getURL("assets/icones/planet.png");
  const aAttrs = storageGetValue("manual.send", "false").toString() === "true" ? 'onClick="window.location.reload()" target="_self"'
    : `href="${ogspy_link}" target="blank_"`;

  const aff_option = $(`
    <li id='optionXtense'>
      <span class='menu_icon'>
        <a ${aAttrs}><img id='xtense.icone' class='mouseSwitch' src='${icone}' height='27' width='27' /></a>
      </span>
      <a class='menubutton' href='${url}&xtense=Options' accesskey='' target='_self'>
        <span class='textlabel'>Xtense</span>
      </a>
    </li>
  `);

  const aff_ogspy = storageGetValue("ogspy.link", "true").toString() === "true" ? create_menu_button("optionOGSpy", icone_planet, ogspy_link, "OGSpy")
    : " ";

  $("#optionXtense, #optionOGSpy").remove();
  $("#menuTableTools").append(aff_option).append(aff_ogspy);

}

function displayOptions() {
  // variables : Serveur
  // variables : Pages
  // variables recupération des pages
  let handle_overview = " ";
  let handle_system = " ";
  let handle_researchs = " ";
  let handle_buildings = " ";
  let handle_resourceSettings = " ";
  let handle_station = " ";
  let handle_shipyard = " ";
  let handle_defense = " ";
  let handle_alliance = " ";
  let handle_stats = " ";
  let handle_msg_msg = " ";
  let handle_msg_ally = " ";
  let handle_msg_spy = " ";
  let handle_msg_ennemy_spy = " ";
  let handle_msg_rc = " ";
  let handle_msg_rc_cdr = " ";
  let handle_msg_expeditions = " ";
  let handle_msg_commerce = " ";
  let handle_lfbuildings = " ";
  let handle_lfresearch = " ";
  let opt_debug_mode = " ";
  let opt_backup_link = " ";
  let opt_ogspy_link = " ";

  // Récupération des préférences : Pages

  if (storageGetValue("handle.overview", "false").toString() === "true") {
    handle_overview += "checked";
  }
  if (storageGetValue("handle.buildings", "false").toString() === "true") {
    handle_buildings += "checked";
  }
  if (storageGetValue("handle.resourceSettings", "false").toString() === "true") {
    handle_resourceSettings += "checked";
  }
  if (storageGetValue("handle.station", "false").toString() === "true") {
    handle_station += "checked";
  }
  if (storageGetValue("handle.researchs", "false").toString() === "true") {
    handle_researchs += "checked";
  }
  if (storageGetValue("handle.shipyard", "false").toString() === "true") {
    handle_shipyard += "checked";
  }
  if (storageGetValue("handle.system", "false").toString() === "true") {
    handle_system += "checked";
  }
  if (storageGetValue("handle.defense", "false").toString() === "true") {
    handle_defense += "checked";
  }
  if (storageGetValue("handle.alliance", "false").toString() === "true") {
    handle_alliance += "checked";
  }
  if (storageGetValue("handle.stats", "false").toString() === "true") {
    handle_stats += "checked";
  }
  if (storageGetValue("handle.msg.msg", "false").toString() === "true") {
    handle_msg_msg += "checked";
  }
  if (storageGetValue("handle.msg.ally", "false").toString() === "true") {
    handle_msg_ally += "checked";
  }
  if (storageGetValue("handle.msg.spy", "false").toString() === "true") {
    handle_msg_spy += "checked";
  }
  if (storageGetValue("handle.msg.ennemy.spy", "false").toString() === "true") {
    handle_msg_ennemy_spy += "checked";
  }
  if (storageGetValue("handle.msg.rc", "false").toString() === "true") {
    handle_msg_rc += "checked";
  }
  if (storageGetValue("handle.msg.rc.cdr", "false").toString() === "true") {
    handle_msg_rc_cdr += "checked";
  }
  if (
    storageGetValue("handle.msg.expeditions", "false").toString() === "true") {
    handle_msg_expeditions += "checked";
  }
  if (storageGetValue("handle.msg.commerce", "false").toString() === "true") {
    handle_msg_commerce += "checked";
  }
  if (storageGetValue("handle.lfbuildings", "false").toString() === "true") {
    handle_lfbuildings += "checked";
  }
  if (storageGetValue("handle.lfresearch", "false").toString() === "true") {
    handle_lfresearch += "checked";
  }
  // Récupération des préférences: Options

  if (storageGetValue("debug.mode", "false").toString() === "true") {
    opt_debug_mode += " checked";
  }
  if (storageGetValue("backup.link", "false").toString() === "true") {
    opt_backup_link += " checked";
  }
  if (storageGetValue("ogspy.link", "false").toString() === "true") {
    opt_ogspy_link += " checked";
  }

  // HTML Content

  function createCheckboxRow(label, inputId, checked, style = '') {
    const baseStyle = style ? `text-align:left;${style}` : '';
    const styleAttr = style ? ` style="${baseStyle}"` : '';

    return `
    <td class="champ"><label class="styled textBeefy">${label}</label></td>
    <td class="value"${styleAttr}><input class="speed" id="${inputId}" size="35" alt="24" type="checkbox" ${checked}/></td>
  `;
  }

  // Helper function pour créer une cellule vide
  function createEmptyCell() {
    return '<td class="champ"></td><td class="value"></td>';
  }

  // Helper function pour créer une ligne d'espacement
  function createSpacingRow(colspan = 6) {
    return `<tr><td colspan="${colspan}">&nbsp;</td></tr>`;
  }

  // Helper function pour créer une ligne d'espacement simple (pour tableaux 2 colonnes)
  function createSimpleSpacingRow() {
    return '<tr><td>&#160;</td><td>&#160;</td></tr>';
  }

  // Helper function pour créer un titre de section
  function createSectionTitle(message, colspan = 6) {
    return `<tr><td colspan="${colspan}" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">${message}</td></tr>`;
  }


  let options =
    '<div id="Xtense_Div" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;"><br><br>';
  // Serveur Univers
  options +=
    '<img src="' +
    chrome.runtime.getURL("assets/images/xtense.png") +
    '" alt="' +
    chrome.i18n.getMessage("XtenseOptions") +
    '"/>';
  options += "<br><br>";
  options +=
    `
<table style="width:675px;">
  <colgroup>
    <col width="25%"/>
    <col width="25%"/>
    <col width="25%"/>
    <col width="25%"/>
  </colgroup>
  <tbody>
    <tr>
      <td align="center">
        <span id="menu_servers" style="font-size: 20px; color: white;">
          <a style="cursor:pointer;">
            <img src="${chrome.runtime.getURL("assets/images/server.png")}" />
            <b>${chrome.i18n.getMessage("XtenseOptions_serveur")}</b>
          </a>
        </span>
      </td>
      <td align="center">
        <span id="menu_pages" style="font-size: 20px; color: orange;">
          <a style="cursor:pointer;">
            <img src="${chrome.runtime.getURL("assets/images/pages.png")}" />
            <b>${chrome.i18n.getMessage("XtenseOptions_pages")}</b>
          </a>
        </span>
      </td>
      <td align="center">
        <span id="menu_options" style="font-size: 20px; color: orange;">
          <a style="cursor:pointer;">
            <img src="${chrome.runtime.getURL("assets/images/conf.png")}" />
            <b>${chrome.i18n.getMessage("XtenseOptions_settings")}</b>
          </a>
        </span>
      </td>
      <td align="center">
        <span id="menu_about" style="font-size: 20px; color: orange;">
          <a style="cursor:pointer;">
            <img src="${chrome.runtime.getURL("assets/images/about.png")}" />
            <b>${chrome.i18n.getMessage("XtenseOptions_about")}</b>
          </a>
        </span>
      </td>
    </tr>
  </tbody>
</table>
`;
  options += '<div id="Xtense_serveurs">';
  options += `
  <table id="Xtense_table_serveurs" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">
    <colgroup>
      <col width="20%"/>
      <col/>
    </colgroup>
    <thead>
      <tr>
        <th class="Xtense_th" colspan="2" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="champ" colspan="2">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_Title")} ${numUnivers}</label>
        </td>
      </tr>
      ${createSimpleSpacingRow()}
      <tr>
        <td class="champ" colspan="2">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_MainServer")}</label>
        </td>
      </tr>
      ${createSimpleSpacingRow()}
      <tr>
        <td class="champ">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_URL")}</label>
        </td>
        <td class="value">
          <input class="speed" id="server.url.plugin" value="${storageGetValue("server.url.plugin", "https://VOTRESITE/VOTREOGSPY")}" size="64" alt="24" type="text"/>
        </td>
      </tr>
      ${createSimpleSpacingRow()}
      <tr>
        <td class="champ">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_password")}</label>
        </td>
        <td class="value">
          <input class="speed" id="server.pwd" value="${storageGetValue("server.pwd", "mot de passe")}" size="64" alt="24" type="password"/>
        </td>
      </tr>
      <tr class="server_url_backup"><td>&#160;</td><td>&#160;</td></tr>
      <tr class="server_url_backup">
        <td class="champ" colspan="2">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_BackupServer")}</label>
        </td>
      </tr>
      <tr class="server_url_backup"><td>&#160;</td><td>&#160;</td></tr>
      <tr class="server_url_backup">
        <td class="champ">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_URL")}</label>
        </td>
        <td class="value">
          <input class="speed" id="server_backup.url.plugin" value="${storageGetValue("server_backup.url.plugin", "https://VOTRESITE/VOTREOGSPY")}" size="64" alt="24" type="text"/>
        </td>
      </tr>
      <tr class="server_url_backup"><td>&#160;</td><td>&#160;</td></tr>
      <tr class="server_url_backup">
        <td class="champ">
          <label class="styled textBeefy">${chrome.i18n.getMessage("XtenseServer_password")}</label>
        </td>
        <td class="value">
          <input class="speed" id="server_backup.pwd" value="${storageGetValue("server_backup.pwd", "mot de passe")}" size="64" alt="24" type="password"/>
        </td>
      </tr>
      ${createSpacingRow()}
      <tr>
        <td colspan="2">
          <img src="${chrome.runtime.getURL("assets/icones/infos.png")}" />
          ${chrome.i18n.getMessage("XtenseServer_Example")}
        </td>
      </tr>
      ${createSimpleSpacingRow()}
      <tr>
        <td colspan="2">
          <a href="https://wiki.ogsteam.eu" target="_blank">${chrome.i18n.getMessage("XtenseServer_Example_2")}</a>
        </td>
      </tr>
    </tbody>
  </table>
`;
  options += "</div>";
  /*---------------------------- Pages -----------------------------------------------*/
  options += '<div id="Xtense_pages">';
  options +=
    '<table id="Xtense_table_pages" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
  options +=
    '<colgroup><col width="30%"/><col/><col width="30%"/><col/><col width="30%"/><col/></colgroup>';
  options +=
    '<thead><tr><th class="Xtense_th" colspan="3" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
  options += "<tbody>";
  options += createSectionTitle(chrome.i18n.getMessage("XtenseSend_title"), 6);
  options += createSpacingRow();
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_general"), "handle.overview", handle_overview);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_buildings"), "handle.buildings", handle_buildings);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_resourceSettings"), "handle.resourceSettings", handle_resourceSettings);
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_station"), "handle.station", handle_station);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_researchs"), "handle.researchs", handle_researchs);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_shipyard"), "handle.shipyard", handle_shipyard);
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_defense"), "handle.defense", handle_defense);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_systems"), "handle.system", handle_system);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_allymembers"), "handle.alliance", handle_alliance);
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_rankings"), "handle.stats", handle_stats);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_lfBuildings"), "handle.lfbuildings", handle_lfbuildings);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_lfResearch"), "handle.lfresearch", handle_lfresearch);
  options += "</tr>";
  options += "<tr>";
  options += '<td colspan="6">&nbsp;</td>';
  options += "</tr>";
  options += "<tr>";
  options +=
    '<td colspan="6" style="color: white; font-size: 14px; font-weight: bold;text-align:left;">' +
    chrome.i18n.getMessage("XtenseSend_title_messages") +
    "</td>";
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_playermessages"), "handle.msg.msg", handle_msg_msg);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_allymessages"), "handle.msg.ally", handle_msg_ally);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_spymessages"), "handle.msg.spy", handle_msg_spy);
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_ennemyspymessages"), "handle.msg.ennemy.spy", handle_msg_ennemy_spy);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_combatmessages"), "handle.msg.rc", handle_msg_rc);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_debrismessages"), "handle.msg.rc.cdr", handle_msg_rc_cdr);
  options += "</tr>";
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_Expeditions"), "handle.msg.expeditions", handle_msg_expeditions);
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseSend_tradingmessage"), "handle.msg.commerce", handle_msg_commerce);
  options += '<td class="champ"></td>';
  options += '<td class="value"></td>';
  options += "</tr>";
  options += "</tbody></table>";
  options += "</div>";
  /*---------------------------- Options -----------------------------------------------*/
  options += '<div id="Xtense_options">';
  options +=
    '<table id="Xtense_table_options" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
  options +=
    '<colgroup><col width="30%"/><col/><col width="30%"/><col/><col width="30%"/><col/></colgroup>';
  options +=
    '<thead><tr><th class="Xtense_th" colspan="3" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
  options += "<tbody>";
  options += createSpacingRow();
  options += createSectionTitle(chrome.i18n.getMessage("XtenseOptionsPage_menu_settings"), 6);
  options += createSpacingRow();
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseOptionsPage_ogspylink"), "ogspy.link", opt_ogspy_link, 'text-align:left;');
  options += createEmptyCell();
  options += createEmptyCell();
  options += "</tr>";
  options += "<tr>";
  options += '<td colspan="6">&nbsp;</td>';
  options += "</tr>";
  options += "<tr>";
  options += createSectionTitle(chrome.i18n.getMessage("XtenseOptionsPage_title"), 6);
  options += createSpacingRow();
  options += "<tr>";
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseOptionsPage_debugmode"), "debug.mode", opt_debug_mode, 'text-align:left;');
  options += createCheckboxRow(chrome.i18n.getMessage("XtenseOptionsPage_backuplink"), "backup.link", opt_backup_link, 'text-align:left;');
  options += createEmptyCell();
  options += "</tr>";
  options += createSpacingRow();
  options += createSectionTitle(chrome.i18n.getMessage("XtenseOptionsPage_report"), 6);
  options += createSpacingRow();
  options += "<tr>";
  options +=
    '<td class="champ"><label class="styled textBeefy">' +
    chrome.i18n.getMessage("XtenseOptionsPage_lastreportType") +
    "</label></td>";
  options +=
    '<td colspan="5" class="value" style="text-align:left "><input class="speed" id="report.type" value="' +
    storageGetValue("report.type", "none") +
    '" size="32" alt="24" type="text"/></td>';
  options += "</tr>";
  options += createSpacingRow();
  options += "<tr>";
  options +=
    '<td colspan="6"><textarea class="speed" rows="15" cols="100" readonly style="margin: 0; width: 425px; height: 200px;">' +
    storageGetValue("report.data", "none") +
    "</textarea></td>";
  options += "</tr>";
  options += "</tbody></table>";
  options += "</div>";
  /*---------------------------- A propos -----------------------------------------------*/
  options += '<div id="Xtense_about">';
  options +=
    '<table id="Xtense_table_about" style="width:675px; color: orange; background-color: black; text-align: center; font-size: 12px; opacity : 0.8;">';
  options += '<colgroup><col width="20%"/><col/></colgroup>';
  options +=
    '<thead><tr><th class="Xtense_th" colspan="2" style="font-size: 12px; text-align:center; font-weight: bold; color: #539fc8; line-height: 30px; height: 30px;"></th></tr></thead>';
  options += "<tbody>";
  options += createSpacingRow(2);
  options += "<tr>";
  options +=
    '<td colspan="2" style="color: white; font-size: 14px; font-weight: bold;">' +
    chrome.i18n.getMessage("XtenseAbout_version") +
    " " +
    VERSION +
    ":</td>";
  options += "</tr>";
  options += createSpacingRow(2);
  options +=
    '<tr><td class="champ"><label class="styled textBeefy">' +
    chrome.i18n.getMessage("XtenseAbout_authors") +
    "<br> " +
    chrome.i18n.getMessage("XtenseAbout_support") +
    ' <a href="https://forum.ogsteam.eu" target="_blank">l\'OGSteam</a><br>' +
    chrome.i18n.getMessage("XtenseAbout_issue") +
    ': <a href="https://github.com/OGSteam/tool-xtense-web-extension/issues" target="_blank">Github</a></label></td></tr>';
  options += createSpacingRow(2);
  options +=
    '<tr><td class="champ"><label class="styled textBeefy">' +
    chrome.i18n.getMessage("XtenseAbout_ogsteam") +
    "</label></td></tr>";
  options += "</tbody></table>";
  options += "</div>";
  options += "<br><br></div>";
  //fin Tableau
  let einhalt = $("#middle");
  if (einhalt.length === 0) einhalt = $("#inhalt");
  let escriptopt = $(
    "<div id='xtenseScriptOpt' style='float: left;position: relative;width: 670px;border: 0' >" +
    options +
    "</div>"
  );

  einhalt.hide(); //On masque le jeu pour afficher le menu

  $("#contentWrapper.with_chat_bar").css("padding-bottom", "0px");
  einhalt.parent().after(escriptopt);
  displayOption("#Xtense_serveurs"); // Mise en place initiale du menu

  $("#menu_servers").on("click", function () {
    displayOption("#Xtense_serveurs");
  });
  $("#menu_pages").on("click", function () {
    displayOption("#Xtense_pages");
  });
  $("#menu_options").on("click", function () {
    displayOption("#Xtense_options");
  });
  $("#menu_about").on("click", function () {
    displayOption("#Xtense_about");
  });

  if (einhalt.visible) {
    log.info("Erreur Affichage menu");
  }

  function enregistreOptionsXtense() {
    // Sauvegarde des inputs
    let inputOptions = Xpath.getOrderedSnapshotNodes(
      document,
      "//div[@id='Xtense_Div']//input[not(@type='checkbox')]"
    );
    if (inputOptions.snapshotLength > 0) {
      for (let i = 0; i < inputOptions.snapshotLength; i++) {
        let input = inputOptions.snapshotItem(i);
        storageSetValue(input.id, input.value);
      }
    }
    // Sauvegarde des checkbox

    let checkboxOptions = Xpath.getOrderedSnapshotNodes(
      document,
      "//div[@id='Xtense_Div']//input[@type='checkbox']"
    );
    if (checkboxOptions.snapshotLength > 0) {
      for (let j = 0; j < checkboxOptions.snapshotLength; j++) {
        let checkbox = checkboxOptions.snapshotItem(j);
        storageSetValue(checkbox.id, checkbox.checked);
      }
    }
  }

  setInterval(enregistreOptionsXtense, 200);
}

function displayOption(id) {
  const sections = ["#Xtense_serveurs", "#Xtense_pages", "#Xtense_options", "#Xtense_about"];
  const menuItems = ["#menu_servers", "#menu_pages", "#menu_options", "#menu_about"];

  sections.forEach(section => $(section).hide());
  menuItems.forEach(menu => $(menu).css("color", "orange"));

  $(id).show();
  $(`#menu_${id.split("_")[1]}`).css("color", "white");

  if (id === "#Xtense_serveurs") {
    const backupVisible = storageGetValue("backup.link", "false").toString() === "true";
    $(".server_url_backup").toggle(backupVisible);
  }
}

function create_menu_button(item_id, icon, link, name) {
  let button = $(
    "<li id='" +
    item_id +
    "'>" +
    "<span class='menu_icon'>" +
    "<img class='mouseSwitch' src='" +
    icon +
    "' height='27' width='27'></span>" +
    "<a class='menubutton' href='" +
    link +
    "' accesskey='' target='blank_'><span class='textlabel'>" +
    name +
    "</span></a>" +
    "</li>"
  );
  return button;
}
