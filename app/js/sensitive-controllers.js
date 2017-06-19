'use strict';

/* Controllers */

angular.module('myApp.sensitivecontrollers', ['ui.bootstrap'])
    .controller('SensitiveCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'data', '$modal', 'Sensitive', 'CONFIG',
        function ($scope, $stateParams, $log, Alert, ConfirmService, data, $modal, Sensitive, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = Sensitive.get(SPEC, function () {
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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/sensitive/sensitive_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.sensitive = {};
                        $scope.save = function () {
                            if (!$scope.sensitive.name) {
                                Alert.alert("名称不能为空", true);
                                return;
                            }
                            Sensitive.save($scope.sensitive, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                                $modalInstance.close();
                            }, function (res) {
                                console.log(res);
                                Alert.alert("操作失败：" + '名称已存在', true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/sensitive/sensitive_edit.html',
                    controller: function ($modalInstance, $scope, sensitive) {
                        $scope.sensitive = sensitive;
                        $scope.sensitiveOriginal = {
                            name: sensitive.name
                        };
                        $log.info(sensitive);
                        $scope.save = function (name, val) {
                            if (name == 'name' && !val) {
                                return '名称不能为空';
                            }
                            var SPEC = {"key": name, "val": val};
                            Sensitive.update({id: sensitive.id}, SPEC, function () {
                                $log.info("save success");
                                o[name] = val;
                            }, function (res) {
                                Alert.alert("操作失败：" + '名称已存在', true);
                                o[name] = $scope.sensitiveOriginal.name;
                            });
                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss();
                        }
                    },
                    resolve: {
                        sensitive: function () {
                            return o;
                        }

                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此敏感词吗?').then(function () {
                    Sensitive.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res, true);
                    });
                });
            }
        }]);
