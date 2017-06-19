'use strict';

/* Controllers */

angular.module('myApp.actcategorycontrollers', ['ui.bootstrap'])
    .controller('ActCategoryCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'data', '$modal', 'ActCategory', 'CONFIG',
        function ($scope, $stateParams, $log, Alert, ConfirmService, data, $modal, ActCategory, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = ActCategory.get(SPEC, function () {
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
                    templateUrl: 'partials/category/activity_category_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.category = {};
                        $scope.save = function () {
                            if (!$scope.category.name) {
                                Alert.alert("名称不能为空", true);
                                return;
                            }
                            ActCategory.save($scope.category, function () {
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
                    templateUrl: 'partials/category/activity_category_edit.html',
                    controller: function ($modalInstance, $scope, category) {
                        $scope.category = category;
                        $scope.categoryOriginal = {
                            name: category.name
                        };
                        $log.info(category);
                        $scope.save = function () {
                            ActCategory.update({id: category.id}, $scope.category, function () {
                                $log.info("save success");
                                $modalInstance.dismiss();
                            }, function (res) {
                                Alert.alert("操作失败：" + '名称已存在', true);
                                o.name = $scope.categoryOriginal.name;
                            });

                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss();
                        }
                    },
                    resolve: {
                        category: function () {
                            return o;
                        }

                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定要删除此分类吗?').then(function () {
                    ActCategory.remove({id: o.id}, function () {
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

