/**
 * File that allows for quick testing of just the PIM View tests, without having to run the entire suite and application
 * @author Nathaniel Watson
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, jasmine, format*/

require.config({
    baseUrl: "../../../../../app",
    paths: {
        "test": "../tests/src/cases/pim-prototyping/views",
        "d3": "../lib/d3",
        "pvsioweb": "plugins/prototypebuilder",
        "imagemapper": "../lib/imagemapper",
        "text": "../lib/text",
        "lib": "../lib",
        "cm": "../lib/cm"
    }
});

require(["test/PIMViews"], function (PIMViews) {
    "use strict";
    format.extend(String.prototype);
    
    PIMViews.run();
    
    jasmine.getEnv().execute();
});
