'use strict';

/* Controllers */

angular.module('myApp.applicationcontrollers', ['ui.bootstrap'])
    .controller('ApplicationCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Application', 'data', '$rootScope', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Application, data, $rootScope, VALID) {
            $scope.statusList = [
                {"id": "0", "name": "待审核的申请"},
                {"id": "1", "name": "已通过的申请"},
                {"id": "2", "name": "已拒绝的申请"}
            ];

            $scope.applicationlist = {
                show: true
            };

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Application.get(SPEC, function () {
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
                $scope.application = o;

                $scope.view.show = true;

                $scope.ok = function () {
                    $scope.view.show = false;
                    $scope.applicationlist.show = true;
                };
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit application:", o);
                $modal.open({
                    templateUrl: 'partials/application/application_audit.html',
                    controller: function ($scope, $modalInstance, application, page) {
                        $scope.application = application;
                        application.auditInfo = '通过';

                        $scope.application.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.application.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.application.statusd),
                                'auditInfo': $scope.application.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit application...:", o);
                            Application.audit.commit({id: application.id}, postData, function () {
                                Alert.alert('操作成功');
                                refresh(page);
                                $modalInstance.close();
                            }, function (res) {
                                Alert.alert('操作失败:' + res, true);
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        application: function () {
                            return Application.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }
        }]);
