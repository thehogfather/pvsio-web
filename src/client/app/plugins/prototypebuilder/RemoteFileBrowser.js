/**
 * @module RemoteFileBrowser
 * @version 1.1
 * @description
 * Allows readonly access to the file system.

    var RemoteFileBrowser = require("plugins/prototypebuilder/RemoteFileBrowser");
    //create a new RemoteFileBrowser instance and open the default projects directory
    //you can pass in a directory relative to the projects directory to open a different directory
    new RemoteFileBrowser(null).open("")
        .then(function (files) {
            var paths = files.map(function (f) {
                return f.path;
            }).join(",");
            console.log(paths);
        });
 * @author Patrick Oladimeji, Paolo Masci
 * @date 3/17/15 22:30:00 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50*/
/*global define, Promise, Handlebars, $ */
define(function (require, exports, module) {
    "use strict";
    var TreeList = require("./TreeList"),
        WSManager = require("websockets/pvs/WSManager");

    var template = require("text!pvsioweb/forms/templates/fileBrowser.handlebars"),
        BaseDialog = require("pvsioweb/forms/BaseDialog");
    var timer, rfb;

    var OpenFilesView = BaseDialog.extend({
        render: function (data) {
            var t = Handlebars.compile(template);
            this.$el.html(t(data));
            $("body").append(this.el);
            return this;
        },
        events: {
            "click #btnOk": "ok",
            "click #btnCancel": "cancel",
            "input #baseDirectory": "onTextChanged",
            "input #currentPath": "onEdit",
            "click #btnHome": "selectHome",
            "click #btnEdit": "enableEdit"
        },
        onTextChanged: function (event) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                rfb.rebaseDirectory($("#baseDirectory").val());
            }, 100);
        },
        onEdit: function (event) {
            //TODO
        },
        selectHome: function (event) {
            rfb.rebaseDirectory("~");
            rfb._treeList.selectItem("~");
        },
        enableEdit: function (event) {
            if (document.getElementById("currentPath").readOnly) {
                document.getElementById("btnEdit").style.backgroundColor = "white";
                document.getElementById("currentPath").readOnly = false;
                document.getElementById("currentPath").focus();
            } else {
                document.getElementById("btnEdit").style.backgroundColor = "";
                document.getElementById("currentPath").readOnly = true;
            }
        }
    });

    /**
        Constructs a new instance of the RemoteFileBrowser
        @param {function} filterFunc a function to filter which file should be shown in the browser if null, then all files are shown
    */
    function RemoteFileBrowser(filterFunc) {
        rfb = this;
        timer = null;
        this.filterFunc = filterFunc || function (d) { return true; };
    }

    RemoteFileBrowser.prototype._treeList = null;

    function getRemoteDirectory(path) {
        var ws = WSManager.getWebSocket();
        return new Promise(function (resolve, reject) {
            ws.send({type: "readDirectory", path: path}, function (err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.files.filter(rfb.filterFunc));
                }
            });
        });
    }

    RemoteFileBrowser.prototype.rebaseDirectory = function (path) {
        var self = this;
        getRemoteDirectory(path)
            .then(function (files) {
                var data = {name: path, path: path, children: files, isDirectory: true};
                self._treeList.data = data;
                self._treeList.render(data);
            }).catch(function (err) {
                self._treeList.data = [];
            });
    };

    /**
     Opens a dialog to browse a remote directory.
     @param {string} path the path relative to the project directory whose content should be shown in the browser
     @returns {Promise} a Promise that settled (with an array containing selected files/folders [{path: <string>}]) when the user presses the ok or cancel button on the dialog
    */
    RemoteFileBrowser.prototype.open = function (path, opt) {
        path = path || "~";
        opt = opt || {};
        var view = new OpenFilesView({baseDirectory: path, title: (opt.title || "Open file")});
        var self = this;
        getRemoteDirectory(path)
            .then(function (files) {
                var data = {name: path, path: path, children: files, isDirectory: true};
                self._treeList = new TreeList(data, "#file-browser", true);
                self._treeList.addListener("SelectedItemChanged", function (event) {
                    var data = event.data;
                    document.getElementById("currentPath").value = data.path;
                    if (data.isDirectory && !data.children && !data._children) {
                        getRemoteDirectory(data.path)
                            .then(function (files) {
                                data.children = files;
                                self._treeList.render(data);
                            }).catch(function (err) {
                                console.log(err);
                            });
                    }
                });
            });
        return new Promise(function (resolve, reject) {
            view.on("cancel", function (event, view) {
                clearTimeout(timer);
                view.remove();
                reject();
            }).on("ok", function (event, view) {
                clearTimeout(timer);
                var selectedFiles = self._treeList.getSelectedItems();
                resolve(selectedFiles);
                view.remove();
            });
        });
    };


    module.exports = RemoteFileBrowser;
});
