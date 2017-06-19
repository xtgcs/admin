'use strict';

/* Controllers */

angular.module('myApp.messagecontrollers', ['ui.bootstrap'])
    .controller('MessageCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Message', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Message, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.messagelist = {
                show: true
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Message.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });

            var clearData = function () {
                $log.info("clear data");
                $scope.message = {'resource': []};
            };

            $scope.clearData = function () {
                clearData();
            };

            $scope.create = function () {
                $log.info("create message");
                $scope.create.show = true;
                $scope.message = {
                    text:''
                };

                $scope.save = function () {
                    $log.info("save message");
                    var message = $scope.message;
                    if (!message.text || message.text.length == 0) {
                        Alert.alert("消息内容不能为空", true);
                        return;
                    }

                    var doSave = function () {
                        $scope.uploading = true;
                        Message.save($scope.message, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.messagelist.show = true;
                                $scope.uploading = false;
                                refresh($scope.grid.page);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    ConfirmService.confirm('消息发布后，用户立即可以看到，确定要发布此消息吗?').then(function () {
                        doSave();
                    });
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.messagelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此消息吗?').then(function () {
                    Message.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
        }]);
