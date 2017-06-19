'use strict';

/* Controllers */

angular.module('myApp.editorcontrollers', ['ui.bootstrap'])
    .controller('EditorCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', '$modal', 'FileUploader', 'data', 'Editor', 'editor_black', 'CONFIG',
        function ($scope, $log, Alert, ConfirmService, $modal, FileUploader, data, Editor, editor_black, CONFIG) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.editor_black = editor_black;

            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit, status: 0};
                if ($scope.grid.nick) {
                    SPEC.nick = $scope.grid.nick;
                }

                var d = Editor.get(SPEC, function () {
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


            $scope.del = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("del editor:", u);
                ConfirmService.confirm('确定要删除此编辑吗?').then(function () {
                    Editor.remove({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recover = function (idx) {
                var u = $scope.data.data[idx];
                $log.info("recover editor:", u);
                ConfirmService.confirm('确定要恢复此编辑吗?').then(function () {
                    Editor.recover.update({id: u.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.resetPwd = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/reset_pwd.html',
                    controller: function ($scope, $modalInstance, id) {
                        $scope.passwd = {};
                        $scope.save = function () {
                            if ($scope.passwd.confirmPassword != $scope.passwd.password) {
                                return false;
                            }
                            var SPEC = {'key': 'password', 'val': $scope.passwd.confirmPassword};
                            Editor.update({id: id}, SPEC, function () {
                                Alert.alert('修改成功');
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            })
                        };
                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        id: function () {
                            return o.id;
                        }
                    }
                })
            };

            $scope.edit = function (idx) {
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/admin/editor_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $log.info("edit user:", user);
                        $scope.user = user;
                        $scope.userOriginal = {
                            mobile: user.mobile
                        };

                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            Editor.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                Editor.get({'id': user.id}, {}, function (u) {
                                    o.icon = u.icon;
                                    $scope.user = u;
                                    $scope.uploading = false;
                                });
                            }, function (res) {
                                Alert.alert('操作失败！' + res, true);
                            });
                        };

                        var up = function () {
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
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        $scope.upload = function () {
                            $scope.uploading = true;
                            $scope.iconUploader.uploadAll();
                        };
                        // -- upload icon setting end --//

                        $scope.save = function (name, val) {
                            if (!val) {
                                return '内容不能为空';
                            }
                            if (name == 'mobile' && !val.match(/^((13|15|18)[0-9]{9})|(145)[0-9]{8}$/)) {
                                return '手机号格式不正确';
                            }
                            var SPEC = {"key": name, "val": val};
                            Editor.update({id: user.id}, SPEC, function () {
                                //刷新列表
                                $log.info("save success");
                                o[name] = val;
                            }, function () {
                                $log.info("save failed");
                                Alert.alert('手机号码已存在', true);
                                user.mobile = $scope.userOriginal.mobile;
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        user: function () {
                            return Editor.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/admin/editor_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.user = {"tp": 2};
                        $scope.ids = [];
                        $scope.toggleSelection = function (id) {
                            var idx = $scope.ids.indexOf(id);
                            if (idx > -1) {
                                $scope.ids.splice(idx, 1);
                            } else {
                                $scope.ids.push(id);
                            }
                        };
                        // -- upload icon setting begin --//
                        var up = function () {
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
                                uploaded(data);
                            };
                            uploader.onErrorItem = function (fileItem, res, status) {
                                Alert.alert('上传失败: ' + status + ',  ' + res, true);
                            };

                            return uploader;
                        };
                        $scope.iconUploader = up();

                        var uploaded = function (tmpId) {
                            $log.info("uploaded tmpId:", tmpId);
                            $scope.user.icon = tmpId;
                            save();
                        };

                        $scope.save = function () {
                            //如果有头像，则先上传头像
                            if ($scope.iconUploader.queue.length) {
                                $scope.iconUploader.uploadAll();
                            } else {
                                save();
                            }
                        };
                        // -- upload icon setting end --//


                        var save = function () {
                            $log.info($scope.ids);
                            $scope.user.action = $scope.ids;
                            if ($scope.user.confirmPassword != $scope.user.password) {
                                return false;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert("操作失败：" + '手机号码错误', true);
                                return false;
                            }
                            Editor.save($scope.user, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                refresh(1);
                            }, function (res) {
                                $scope.updating = true;
                                var err = "";
                                if (res.data instanceof Array) {
                                    angular.forEach(res.data, function (o) {
                                        err += o.message + ",";
                                    });
                                    Alert.alert("操作失败：" + err, true);
                                } else {
                                    err += res.data;
                                    Alert.alert("操作失败：" + err, true);
                                }
                            });
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss();
                        }
                    }
                });
            };
        }
    ]);
