'use strict';

/* Controllers */

angular.module('myApp.usercontrollers', ['ui.bootstrap'])
    .controller('UserCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'User', 'CONFIG', 'data', 'FileUploader', 'user_black',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, User, CONFIG, data, FileUploader, user_black) {
            $scope.data = data;
            $scope.user_black = user_black;
            $scope.grid = {
                page: 1,
                sort: 0
            };

            var refresh = function (page, sort) {
                var SPEC = {page: page, size: CONFIG.limit, sort: sort, status: 0};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                SPEC.sort = $scope.grid.sort;

                var d = User.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page, $scope.grid.sort);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal, $scope.grid.sort);
                }
            });

            $scope.$watch('grid.sort', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh($scope.grid.page, newVal);
                }
            });

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/user/user_create.html',
                    controller: function ($scope, $modalInstance) {
                        $log.info('create user');
                        $scope.user = {"tp": 0};

                        // -- upload icon setting begin --//
                        var up = function (tp) {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data, tp);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up("icon");
                        $scope.coverUploader = up("cover");

                        var flag = 0;

                        var uploaded = function (tmpId, tp) {
                            flag = flag - 1;
                            if (tp == "icon") {
                                $log.info("uploaded iconId:", tmpId);
                                $scope.user.icon = tmpId;
                                if (flag > 0) {
                                    $scope.coverUploader.uploadAll();
                                }
                            } else {
                                $log.info("uploaded coverId:", tmpId);
                                $scope.user.cover = tmpId;
                                if (flag > 0) {
                                    $scope.iconUploader.uploadAll();
                                }
                            }
                            if (flag <= 0) {
                                save();
                            }
                        };

                        $scope.save = function () {
                            flag = $scope.iconUploader.queue.length + $scope.coverUploader.queue.length;
                            //如果有头像，则先上传头像
                            if ($scope.iconUploader.queue.length) {
                                $scope.iconUploader.uploadAll();
                            } else if ($scope.coverUploader.queue.length) {
                                $scope.coverUploader.uploadAll();
                            } else {
                                save();
                            }
                        };
                        // -- upload icon setting end --//


                        var save = function () {
                            $log.info('save user');
                            if (!$scope.user.nick) {
                                Alert.alert('请设置昵称', true);
                                return;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert('手机号错误', true);
                                return;
                            }
                            if (!$scope.user.password) {
                                Alert.alert('请设置密码', true);
                                return;
                            }
                            if (!$scope.user.confirmPassword) {
                                Alert.alert('请设置确认密码', true);
                                return;
                            }
                            if ($scope.user.password != $scope.user.confirmPassword) {
                                return;
                            }
                            User.save($scope.user, function (res) {
                                if (res.code == 1) {
                                    Alert.alert("操作成功");
                                    //refresh list
                                    refresh(1, 0);
                                    $modalInstance.close();
                                } else {
                                    // Alert.alert("操作失败：" + res.data, true);
                                    Alert.alert("操作失败：" + "手机号已存在", true);
                                }
                            }, function (res) {
                                $scope.updating = true;
                                var err = "";
                                angular.forEach(res.data, function (o) {
                                    err += o.message + ",";
                                });
                                Alert.alert("操作失败：" + err, true);
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                });
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/user/user_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $log.info("edit user:", user);
                        var wp = user.point;
                        $scope.user = user;

                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            User.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                User.get({'id': user.id}, {}, function (u) {
                                    o.icon = u.icon;
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var uploaded = function (imgId, tp) {
                            $log.info("uploaded user img:", imgId);
                            User.update({id: user.id}, {"key": tp, "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                User.get({'id': user.id}, {}, function (u) {
                                    o[tp] = u[tp];
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var up = function (tp) {
                            var opts = {
                                queueLimit: 1,
                                url: '/api/pub/up',
                                alias: 'bin',
                                removeAfterUpload: true
                            };

                            var uploader = new FileUploader(opts);

                            uploader.filters.push({
                                name: 'imageFilter',
                                fn: function (item) {
                                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                                    return '|jpg|png|jpeg|'.indexOf(type) !== -1;
                                }
                            });

                            uploader.onSuccessItem = function (fileItem, data) {
                                if (data.code == 0) {
                                    Alert.alert('上传失败: ' + data, true);
                                    return;
                                }
                                uploaded(data, tp);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up("icon");
                        $scope.coverUploader = up("cover")

                        $scope.upload = function (tp) {
                            $scope.uploading = true;
                            if (tp == "icon") {
                                $scope.iconUploader.uploadAll();
                            } else {
                                $scope.coverUploader.uploadAll();
                            }
                        };
                        // -- upload icon setting end --//

                        $scope.save = function (name, val) {
                            var SPEC = {"key": name, "val": val};
                            if (name == 'nick' && !val) {
                                return '内容不能为空';
                            } else if (name == 'point') {
                                User.point.update({id: user.id}, SPEC, function () {
                                    User.get({'id': user.id}, {}, function (u) {
                                        o.level = u.level;
                                    });
                                }, function (res) {
                                    $scope.user.point = wp;
                                    Alert.alert('积分修改失败');
                                })
                            } else if (name == 'mobile') {
                                if (!val.match(/^((13|15|18|99)[0-9]{9})|(145)[0-9]{8}$/)) {
                                    return '手机号码错误';
                                }
                                User.update({id: user.id}, SPEC, function () {
                                    //修改手机号成功
                                }, function (res) {
                                    Alert.alert('手机号已存在');
                                    User.get({'id': user.id}, {}, function (u) {
                                        $scope.user.mobile = u.mobile;
                                    });
                                })
                            } else {
                                return User.update({id: user.id}, SPEC, function () {
                                    if (name == "point") {
                                        User.get({'id': user.id}, {}, function (u) {
                                            o.level = u.level;
                                        });
                                    } else {
                                        //刷新列表
                                        o[name] = val;
                                    }
                                });
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return User.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.upgrade = function (idx) {
                var o = $scope.data.data[idx];
                ConfirmService.confirm('确定推荐该用户为生活家吗?').then(function () {
                    User.upgrade.update({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("del user:", u);
                ConfirmService.confirm('确定要删除此用户吗?').then(function () {
                    User.remove({id: u.id}, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        if (tmpStr == 'delete user successfully') {
                            $scope.data.data.splice(idx, 1);
                            $scope.data.total--;
                            $scope.data.size--;
                            Alert.alert("操作成功");
                        } else {
                            Alert.alert("操作失败：" + tmpStr, true);
                        }
                    }, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        Alert.alert("操作失败：" + tmpStr, true);
                    });
                });
            };
        }])
    .controller('BlackCtrl', ['$scope', '$stateParams', '$modal', '$log', 'Alert', 'ConfirmService', 'User', 'CONFIG', 'data', 'FileUploader', 'user_black',
        function ($scope, $stateParams, $modal, $log, Alert, ConfirmService, User, CONFIG, data, FileUploader, user_black) {
            $scope.data = data;
            $scope.user_black = user_black;
            $scope.grid = {
                page: 1,
                sort: 0
            };

            var refresh = function (page, sort) {
                var SPEC = {page: page, size: CONFIG.limit, sort: sort, status: 1};    //todo 黑名单筛选条件
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }

                var d = User.get(SPEC, function () {
                    $scope.data = d;
                });
            };

            $scope.search = function () {
                refresh($scope.grid.page, $scope.grid.sort);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal, $scope.grid.sort);
                }
            });

            $scope.$watch('grid.sort', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh($scope.grid.page, newVal);
                }
            });

            $scope.recover = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("recover user:", u);
                ConfirmService.confirm('确定要恢复此用户吗?').then(function () {
                    User.recover.update({id: u.id}, function (res) {
                        console.log(res);
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        console.log(res);
                        var tmpStr = '';
                        for (var k in res) {
                            if (k.match(/^\d+$/)) {
                                tmpStr += res[k];
                            }
                        }
                        console.log(tmpStr);
                        Alert.alert("操作失败：" + tmpStr, true);
                    });
                });
            };
        }]);
