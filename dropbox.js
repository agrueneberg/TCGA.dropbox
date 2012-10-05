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
            var dropboxClient, callbackQueue, creating, createClient;
            dropboxClient = null;
            callbackQueue = [];
            creating = false;
            createClient = function (callback) {
                var client;
                if (dropboxClient !== null) {
                    callback(null, dropboxClient);
                } else {
                    callbackQueue.push(callback);
                    if (creating === false) {
                        creating = true;
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
                                callbackQueue.forEach(function (callback) {
                                    callback(null, dropboxClient);
                                });
                            }
                        });
                    }
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
                    var key;
                    key = "dropbox-" + path;
                    TCGA.store.set(key, data, function () {
                        TCGA.ui.toast.success("File " + path + " was loaded into TCGA.store: " + key);
                    });
                });
            };
            dropbox.getUserInfo(function (err, userInfo) {
                $scope.$apply(function () {
                    $scope.username = userInfo.name;
                });
            });
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
            content: '<div ng-controller="fileList" ng-csp><div class="page-header"><h1>{{username}}\'s Dropbox</h1></div><table class="table table-striped"><thead><tr><th>File</th><th>Options</th></tr></thead><tbody><tr ng-repeat="item in items"><td>{{item}}</td><td><button class="btn" ng-click="loadFile(item)"><i class="icon-download"></i>&nbsp;Import</button></td></tr></tbody></table></div>',
            switchTab: true
        }, function (err, el) {
         // Bootstrap AngularJS.
            angular.bootstrap(el, ["dropbox"]);
        });

    });

}());