'use strict';

/* Controllers */

angular.module('myApp.resourcecontrollers', ['ui.bootstrap'])
    .controller('ResourceCtrl', ['$scope', '$log', '$modal', 'Alert', '$http', '$state', 'ConfirmService', 'CONFIG', 'FileUploader', 'Resource', 'data',
        function ($scope, $log, $modal, Alert, $http, $state, ConfirmService, CONFIG, FileUploader, Resource, data) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit, tp: '1,3', status: 1};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                var d = Resource.get(SPEC, function () {
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
                    templateUrl: 'partials/resource/resource_upload.html',
                    backdrop: "static",
                    controller: function ($scope, $modalInstance, token) {
                        $scope.uploadToken = token.token;
                        $log.info("token:", $scope.uploadToken);

                        var uploader = $scope.uploader = new FileUploader({
                            //url: 'http://upload.qiniu.com',
                            url: 'http://uptx.qiniu.com',
                            alias: 'file',
                            formData: [
                                {"token": $scope.uploadToken}
                            ]
                        });

                        // FILTERS
                        uploader.filters.push({
                            name: 'videoFilter',
                            fn: function (item) {
                                $log.info("item:", item);
                                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                if (type != '|mp4|' && type != '|mp3|') {
                                    Alert.alert('请确认上传视频格式为mp4，音频格式为mp3', true);
                                    return false;
                                }
                                return '|mp4|'.indexOf(type) !== -1 || '|mp3|'.indexOf(type) !== -1;
                            }
                        });

                        // CALLBACKS
                        uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                            console.info('onWhenAddingFileFailed', item, filter, options);
                        };
                        uploader.onAfterAddingFile = function (fileItem) {
                            console.info('onAfterAddingFile', fileItem);
                            $scope.fileName = fileItem.file.name;
                            Resource.getId.get(function (res) {
                                $log.info("resource id:", res.id);
                                fileItem.formData.push({"key": res.id})
                            }, function (res) {
                                $log.error("get resource id error:", res);
                            });
                        };
                        uploader.onAfterAddingAll = function (addedFileItems) {
                            console.info('onAfterAddingAll', addedFileItems);
                        };
                        uploader.onBeforeUploadItem = function (item) {
                            console.info('onBeforeUploadItem', item);
                        };
//                        uploader.onProgressItem = function (fileItem, progress) {
//                            console.info('onProgressItem', fileItem, progress);
//                        };
//                        uploader.onProgressAll = function (progress) {
//                            console.info('onProgressAll', progress);
//                        };
                        uploader.onSuccessItem = function (fileItem, response, status, headers) {
                            console.info('onSuccessItem', fileItem, response, status, headers);

                            var type = fileItem.file.type.slice(fileItem.file.type.indexOf("/") + 1);
                            $log.info("file type:", type);
                            var tp = 0;
                            if (type == "mp4") {
                                tp = 1;
                            } else {
                                tp = 3;
                            }
                            var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash};
                            $log.info('create resource:', resource);
                            Resource.save(resource, function () {
                                $log.info("create resource successfully")
                            }, function (res) {
                                Alert.alert("操作失败：" + res.data, true);
                            });

                        };
                        uploader.onErrorItem = function (fileItem, response, status, headers) {
                            console.info('onErrorItem', fileItem, response, status, headers);
                        };
                        uploader.onCancelItem = function (fileItem, response, status, headers) {
                            console.info('onCancelItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteItem = function (fileItem, response, status, headers) {
                            console.info('onCompleteItem', fileItem, response, status, headers);
                        };
                        uploader.onCompleteAll = function () {
                            console.info('onCompleteAll');
                        };

                        console.info('uploader', uploader);

                        $scope.close = function () {
                            refresh(1);
                            $modalInstance.close();
                            //todo refresh list
                        };
                    },
                    resolve: {
                        token: function () {
                            return Resource.token.get().$promise;
                        }
                    }
                });
            };

            $scope.video = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/resource/resource_video.html',
                    controller: function ($scope, $modalInstance, video) {
                        $log.info('=-=-=', video);
                        $scope.url = video.url;
                        $scope.poster = video.poster;
                        $scope.tp = video.tp;
                        $scope.ok = function () {
                            $modalInstance.close();
                        }
                    },
                    resolve: {
                        video: function () {
                            return o;
                        }
                    }
                })
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del resource:", o);
                ConfirmService.confirm('确定要删除此资源文件吗?').then(function () {
                    Resource.remove({id: o.id}, function () {
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
