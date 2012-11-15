(function () {
    "use strict";

    /*jshint jquery:true browser:true */
    /*global TCGA:true, angular:true */

    TCGA.loadScript({
        registerModules: false,
        scripts: [
            "https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.6.1/dropbox.min.js"
        ]
    }, function () {

        var app;

     // Define AngularJS module.
        app = angular.module("app", []);

        app.factory("dropbox", function ($window) {
            var dropboxClientPromise, createClient;
            dropboxClientPromise = null;
            createClient = function () {
                var deferred, client;
                if (dropboxClientPromise === null) {
                    deferred = $.Deferred();
                    client = new $window.Dropbox.Client({
                        key: "qTVJODLWVyA=|c3a76Q3luVpQrPvdesLUGV0bqkIojZGvyDKna3RWyw==",
                        sandbox: true
                    });
                    client.authDriver(new $window.Dropbox.Drivers.Redirect());
                    client.authenticate(function (error, client) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve(client);
                        }
                    });
                    dropboxClientPromise = deferred.promise();
                }
                return dropboxClientPromise;
            };
            return {
                getUserInfo: function (callback) {
                    createClient().done(function (client) {
                        client.getUserInfo(callback);
                    }).fail(function (err) {
                        callback(err, null);
                    });
                },
                readDir: function (path, callback) {
                    createClient().done(function (client) {
                        client.readdir(path, callback);
                    }).fail(function (err) {
                        callback(err, null);
                    });
                },
                readFile: function (path, callback) {
                    createClient().done(function (client) {
                        client.readFile(path, callback);
                    }).fail(function (err) {
                        callback(err, null);
                    });
                },
                writeFile: function (path, data, callback) {
                    createClient().done(function (client) {
                        client.writeFile(name, data, callback);
                    }).fail(function (err) {
                        callback(err, null);
                    });
                }
            };
        });

        app.controller("fileList", function ($scope, $templateCache, dropbox) {
            $scope.loadFile = function (path) {
                dropbox.readFile(path, function (err, data) {
                    var key;
                    key = "dropbox:" + path;
                    TCGA.data.set(key, data, function () {
                        TCGA.ui.toast.success("File " + path + " was loaded into TCGA.data: " + key);
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
            angular.bootstrap(el, ["app"]);
        });

    });

}());