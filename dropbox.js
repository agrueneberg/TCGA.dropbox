(function () {
    "use strict";

    /*global TCGA:true, angular:true */

    TCGA.loadScript({
        registerModules: false,
        scripts: [
            "https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.6.1/dropbox.min.js"
        ]
    }, function () {

        var dropbox;

     // Define AngularJS module.
        dropbox = angular.module("dropbox", []);

        dropbox.factory("dropbox", function ($window) {
            var dropboxClient, createClient;
            dropboxClient = null;
            createClient = function (callback) {
                var client;
                if (dropboxClient !== null) {
                    callback(null, dropboxClient);
                } else {
                    client = new $window.Dropbox.Client({
                        key: "qTVJODLWVyA=|c3a76Q3luVpQrPvdesLUGV0bqkIojZGvyDKna3RWyw==",
                        sandbox: true
                    });
                    client.authDriver(new $window.Dropbox.Drivers.Redirect());
                    client.authenticate(function (error, client) {
                        if (error) {
                            callback(error, null);
                        } else {
                            dropboxClient = client;
                            callback(null, dropboxClient);
                        }
                    });
                }
            };
            return {
                getUserInfo: function (callback) {
                    createClient(function (err, client) {
                        if (err !== null) {
                            callback(err, null);
                        } else {
                            client.getUserInfo(callback);
                        }
                    });
                },
                readDir: function (path, callback) {
                    createClient(function (err, client) {
                        if (err !== null) {
                            callback(err, null);
                        } else {
                            client.readdir(path, callback);
                        }
                    });
                },
                readFile: function (path, callback) {
                    createClient(function (err, client) {
                        if (err !== null) {
                            callback(err, null);
                        } else {
                            client.readFile(path, callback);
                        }
                    });
                },
                writeFile: function (path, data, callback) {
                    createClient(function (err, client) {
                        if (err !== null) {
                            callback(err, null);
                        } else {
                            client.writeFile(name, data, callback);
                        }
                    });
                }
            };
        });

        dropbox.controller("fileList", function ($scope, $templateCache, dropbox) {
            $scope.loadFile = function (path) {
                dropbox.readFile(path, function (err, data) {
                    TCGA.store.set("dropbox-" + path, data, function () {
                        TCGA.ui.toast.info("File " + path + " was loaded into TCGA.store.");
                    });
                });
            };
            dropbox.readDir("/", function (err, entries) {
                $scope.$apply(function () {
                    $scope.items = entries;
                });
            });
        });

     // Register tab.
        TCGA.ui.registerTab({
            id: "dropbox",
            title: "Dropbox",
            content: '<div ng-csp><div class="page-header"><h1>Dropbox</h1></div><div ng-controller="fileList"><ul><li ng-repeat="item in items"><a ng-click="loadFile(item)">{{item}}</a></li></ul></div></div>',
            switchTab: true
        }, function (err, el) {
         // Bootstrap AngularJS.
            angular.bootstrap(el, ["dropbox"]);
        });

    });

}());