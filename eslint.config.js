export default [
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Environnement browser
        window: "readonly",
        document: "readonly",
        console: "readonly",
        location: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",

        // APIs DOM
        XPathResult: "readonly",
        MutationObserver: "readonly",

        // APIs Web Extensions
        chrome: "readonly",
        browser: "readonly",

        // Globales spécifiques à votre extension
        log: "readonly",
        Xpath: "readonly",
        XtenseXpaths: "readonly",
        setStatus: "readonly",
        XLOG_NORMAL: "readonly",
        XLOG_WARNING: "readonly",
        XLOG_ERROR: "readonly",
        XLOG_SUCCESS: "readonly",
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
