'use strict';

/* Controllers */

angular.module('myApp.ordercontrollers', ['ui.bootstrap'])
    .controller('OrderCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Order', 'data', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'Resource', '$rootScope', 'FileUploader', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Order, data, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, Resource, $rootScope, FileUploader, VALID) {
            $scope.statusList = [
                {"id": "0", "name": "待支付的订单"},
                {"id": "1", "name": "已取消的订单"},
                {"id": "2", "name": "已支付的订单"},
                {"id": "3", "name": "待收货的订单"},
                {"id": "4", "name": "已完成的订单"},
                {"id": "5", "name": "申请退款的订单"},
                {"id": "6", "name": "已退款的订单"}
            ];

            $scope.typeList = [
                {"id": "0", "name": "物件订单"},
                {"id": "1", "name": "活动订单"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.orderlist = {
                show: true
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.type = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Order.get(SPEC, function () {
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

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view order:", o);
                $modal.open({
                    templateUrl: 'partials/order/order_view.html',
                    controller: function ($scope, $modalInstance, order) {
                        $scope.order = order;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        order: function () {
                            return Order.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.deliver = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("deliver order:", o);
                ConfirmService.confirm('确定订单已发货吗?').then(function () {
                    Order.deliver.commit({id: o.id}, function () {
                        o.status = 3;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.refunding = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("refunding order:", o);
                ConfirmService.confirm('确定订单要申请退款吗?').then(function () {
                    Order.status.update({id: o.id, status: 5}, function () {
                        o.status = 5;
                        Alert.alert("操作成功");
                    }, function (res) {
                        $log.log(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.refunded = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("refunded order:", o);
                ConfirmService.confirm('确定订单已退款吗?').then(function () {
                    Order.status.update({id: o.id, status: 6}, function () {
                        o.status = 6;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };
        }]);
