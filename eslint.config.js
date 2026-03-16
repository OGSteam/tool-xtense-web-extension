export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Browser environment
        window: "readonly",
        document: "readonly",
        console: "readonly",
        location: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Node: "readonly",

        // DOM APIs
        XPathResult: "readonly",
        MutationObserver: "readonly",
        Event: "readonly",

        // Web Extensions APIs
        chrome: "readonly",
        browser: "readonly",
        GM_getValue: "readonly",
        GM_setValue: "readonly",
        GM_deleteValue: "readonly",
        GM_listValues: "readonly",
        GM_addStyle: "readonly",
        GM_getResourceText: "readonly",
        GM_getResourceURL: "readonly",
        GM_xmlhttpRequest: "readonly",
        GM_registerMenuCommand: "readonly",
        GM_notification: "readonly",
        GM_openInTab: "readonly",
        GM_setClipboard: "readonly",
        GM_info: "readonly",

        // Extension-specific globals
        log: "readonly",
        Xpath: "readonly",
        XtenseXpaths: "readonly",
        setStatus: "readonly",
        url: "readonly",
        
        // Logging levels
        XLOG_NORMAL: "readonly",
        XLOG_WARNING: "readonly",
        XLOG_ERROR: "readonly",
        XLOG_SUCCESS: "readonly",
        XLOG_COMMENT: "readonly",
        XLOG_SEND: "readonly",
        
        // Debug flags
        DEBUG_MESSAGES: "readonly",
        
        // Xtense specific
        XtenseDatabase: "readonly",
        initOGSpyCommunication: "readonly",
        handleResponse: "readonly",
        debugXPathResults: "readonly",
        debugStartShortMessages: "readonly",
        debugEndShortMessages: "readonly",
        debugMessageType: "readonly",
        debugUnknownMessage: "readonly",
        analyzeMessageStructure: "readonly",
        debugParseMessage: "readonly",
        
        // DOM manipulation
        $: "readonly",
        jQuery: "readonly",
        
        // Ogame specific
        Ogame: "readonly",
        OgameAPI: "readonly",
        
        // Utility functions
        xlang: "readonly",
        glang: "readonly",
        Xajax: "readonly",
        XtenseParseDate: "readonly",
        XLOG_COMMENT: "readonly",
        XLOG_SEND: "readonly",
        xlang: "readonly",
        glang: "readonly",
        storageGetValue: "readonly",
        storageSetValue: "readonly",
        storageDeleteValue: "readonly",
        XtenseRegexps: "readonly",
        XtenseParseDate: "readonly",
        XtenseRequest: "readonly",
        XtenseLocales: "readonly",
        XtenseMetas: "readonly",
        XtenseDatabase: "readonly",

        // Fonctions globales de votre extension
        initParsers: "readonly",
        initLocales: "readonly",
        initOGSpyCommunication: "readonly",
        displayXtense: "readonly",
        displayOptions: "readonly",
        handleResponse: "readonly",
        handle_current_page: "readonly",
        parse_messages: "readonly",
        getPlanetData: "readonly",
        getPlayerDetails: "readonly",
        getUniverseDetails: "readonly",
        parse_galaxy_system_inserted: "readonly",
        parse_ally_inserted: "readonly",
        parse_ranking_inserted: "readonly",
        parse_overview: "readonly",
        parse_buildings: "readonly",
        parse_ressource_settings: "readonly",
        parse_station: "readonly",
        parse_researchs: "readonly",
        parse_shipyard: "readonly",
        parse_fleet: "readonly",
        parse_defense: "readonly",
        parse_lfBuildings: "readonly",
        parse_lfResearch: "readonly",
        save_my_planets_coords: "readonly",
        get_ally_content: "readonly",
        setlogLevel: "readonly",
        Xajax: "readonly",

        // Variables globales utilisées
        delaytodisplay_overview: "writable",
        numUnivers: "writable",
        url: "readonly",

        // AMD/CommonJS (pour les bibliothèques)
        define: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    },
    files: ["extension/**/*.js"],
    ignores: [
      // Exclure les bibliothèques tierces
      "extension/contribs/**/*.js",
      "extension/**/*.min.js"
    ]
  }
];
