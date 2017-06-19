'use strict';

/* Controllers */

angular.module('myApp.authorcontrollers', ['ui.bootstrap'])
    .controller('AuthorCtrl', ['$scope', '$log', '$filter', 'Alert', 'ConfirmService', 'ResourceTranslator', 'ResourceTextService', '$modal', 'FileUploader', 'data','category','Author', 'User', 'Resource', 'author_black', 'CONFIG', 'token',
        function ($scope, $log, $filter, Alert, ConfirmService, ResourceTranslator, ResourceTextService, $modal, FileUploader, data,category, Author, User, Resource, author_black, CONFIG, token) {
            $scope.data = data;
            $scope.category = category.data;

            $scope.grid = {
                page: 1
            };

            $scope.authorlist = {
                show: true
            };
            $scope.author_black = author_black;


            var refresh = function (page) {
                var SPEC = {page: page, size: CONFIG.limit, status: 0};
                if ($scope.grid.nick) {
                    SPEC.nick = $scope.grid.nick;
                }

                var d = Author.get(SPEC, function () {
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
                $log.info("del author:", u);
                ConfirmService.confirm('确定要删除此作者吗?').then(function () {
                    Author.downgrade.update({id: u.id}, function () {
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
                $log.info("recover author:", u);
                ConfirmService.confirm('确定要恢复此作者吗?').then(function () {
                    Author.recover.update({id: u.id}, function () {
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
                            Author.update({id: id}, SPEC, function () {
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
                    templateUrl: 'partials/admin/author_edit.html',
                    controller: function ($scope, $modalInstance, user) {
                        $scope.category = category.data;
                        console.log($scope.category);
                        $log.info("edit user:", user);
                        $scope.authorTypes = [
                            {"id": "0", "name": "个人"},
                            {"id": "1", "name": "机构"}
                        ];
                        $scope.showAuthorType = function() {
                            var text = '点击编辑';
                            $log.log($scope.user.authorTpStr)
                            for (var i = 0; i < $scope.authorTypes.length; ++i) {
                                if ($scope.authorTypes[i].id == $scope.user.authorTpStr) {
                                    text = $scope.authorTypes[i].name;
                                    break;
                                }
                            }

                            return text;
                        };

                        user.authorTpStr = user.authorTp + '';
                        $scope.user = user;
                        user.category = user.category;
                        $scope.userOriginal = {
                            mobile: user.mobile
                        };

                        $scope.showAuthorCategory = function() {
                            var text = '点击编辑';
                            for (var j=0;j<$scope.category.length;++j){
                                if ($scope.user.category){
                                    if ($scope.category[j].id == $scope.user.category.id){

                                        text = $scope.category[j].name;
                                    }
                                }

                            }

                            return text;
                        };
                        // -- upload icon setting begin --//
                        var uploaded = function (imgId) {
                            $log.info("uploaded user img:", imgId);
                            Author.update({id: user.id}, {"key": "icon", "val": imgId}, function () {
                                Alert.alert('操作成功！');
                                Author.get({'id': user.id}, {}, function (u) {
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
                            $log.log(name + ':' + val);
                            if (!val) {
                                return '内容不能为空';
                            }
                            if (name == 'mobile' && !val.match(/^((13|15|18)[0-9]{9})|(145)[0-9]{8}$/)) {
                                return '手机号格式不正确';
                            }
                            var SPEC = {"key": name, "val": val};
                            Author.update({id: user.id}, SPEC, function () {
                                //刷新列表
                                $log.info("save success");
                                console.log(o);
                                if (name == "category"){
                                    o.category = val;
                                }else{
                                    o[name] = val;
                                }
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
                            return Author.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.resources = [];
            $scope.resourceIds = [];

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
            };

            var insertPic = function (preview, num) {
                $scope.uploadToken = token.token;
                $log.info("token:", $scope.uploadToken);

                var uploader = new FileUploader({
                    //url: 'http://upload.qiniu.com',
                    queueLimit: num,
                    url: 'http://uptx.qiniu.com',
                    alias: 'file',
                    formData: [
                        {"token": $scope.uploadToken}
                    ]
                });

                // FILTERS
                uploader.filters.push({
                    name: 'customFilter',
                    fn: function () {
                        return this.queue.length < num;
                    }
                });

                uploader.filters.push({
                    name: 'imageFilter',
                    fn: function (item) {
                        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
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
                        fileItem.formData.push({"key": res.id});
                        if (preview == "previewImg") {
                            $scope.previewUploading = true;
                        } else {
                            $scope.uploading = true;
                        }
                        fileItem.upload();
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
                uploader.onSuccessItem = function (fileItem, response, status, headers) {
                    console.info('onSuccessItem', fileItem, response, status, headers);
                    var type = fileItem.file.type.slice(0, fileItem.file.type.indexOf("/"));
                    $log.info("file type:", type);
                    var tp = 0;
                    if (type != "image") {
                        tp = 1;
                    }
                    var resource = {name: fileItem.file.name, tp: tp, key: response.key, hash: response.hash, source: 1};
                    $log.info('create resource:', resource);
                    Resource.save(resource, function () {
                        $log.info("create resource successfully");
                        if (resource.key) {
                            Resource.batch.get({}, {'ids': [resource.key]}, function (data) {
                                angular.forEach(data.data, function (o) {
                                    var currentIds = [];
                                    angular.forEach($scope.resources, function (r) {
                                        currentIds.push(r.id)
                                    });

                                    if (currentIds.indexOf(o.id) == -1) {
                                        if (preview == "previewImg") {
                                            $log.info(o);
                                            if ($scope.previewImg.length < 1) {
                                                $scope.previewImg.push(o);
                                                $log.info($scope.previewImg);
                                            }
                                        } else {
                                            $scope.resources.push(o);
                                        }
                                    }
                                });
                            });
                        }
                        $log.info($scope.previewImg);
                        if (preview == "previewImg") {
                            $scope.previewUploading = false;
                        } else {
                            $scope.uploading = false;
                        }
                    }, function (res) {
                        if (preview == "previewImg") {
                            $scope.previewUploading = false;
                        } else {
                            $scope.uploading = false;
                        }
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
                return uploader;
            };

            $scope.uploader = insertPic("resource", 50);

            $scope.sortOptions = {
                //restrict move across backlogs. move only within backlog.
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                },
                containment: '#board'
            };

            $scope.editResource = function (resource) {
                $log.info("edit resource:", resource);
                ResourceTextService.open(resource.txt, 2000).then(function (txt) {
                    angular.forEach($scope.resources, function (r) {
                        if (r.id === resource.id) {
                            r.txt = txt;
                        }
                    });
                });
            };

            $scope.removeResource = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.resources, function (r) {
                    if (r.id === resource.id) {
                        $scope.resources.splice($scope.resources.indexOf(resource), 1);
                    }

                });
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.updateDesc = function (idx) {
                var user = $scope.data.data[idx];
                User.get({id: user.id}, function (o) {
                    $log.info("edit user:", o);
                    $scope.user = o;

                    $scope.authorDescContent = ResourceTranslator.toHtml(o.resource);

                    $scope.edit.show = true;

                    $scope.save = function () {
                        $log.info("update user");

                        $scope.user.resource = ResourceTranslator.fromHtml('#content-editor');

                        $scope.uploading = true;
                        Author.desc.update({id: o.id}, $scope.user, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.authorlist.show = true;
                                $scope.uploading = false;
                                //$scope.authorDescContent = '';
                                //refresh($scope.grid.page);
                                document.location.reload();
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };

                    $scope.cancel = function () {
                        $scope.authorlist.show = true;
                        $scope.uploading = false;
                    };

                });

            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view author:", o);
                $modal.open({
                    templateUrl: 'partials/admin/author_view.html',
                    controller: function ($scope, $modalInstance, user) {
                        $scope.user = user;

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

            $scope.create = function () {
                $modal.open({
                    templateUrl: 'partials/admin/author_create.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.category = category.data;
                        console.log($scope.category);
                        $scope.user = {"tp": 1, authorTpStr: "1"};
                        $scope.authorTypes = [
                            {"id": "0", "name": "个人"},
                            {"id": "1", "name": "机构"}
                        ];

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
                        $scope.reader = new FileReader();   //创建一个FileReader接口
                        // $scope.form = {     //用于绑定提交内容，图片或其他数据
                        //     image:{},
                        // };

                        $scope.img_upload = function(files) {       //单次提交图片的函数
                            // $scope.guid = (new Date()).valueOf();   //通过时间戳创建一个随机数，作为键名使用
                            $scope.reader.readAsDataURL(files[0]);  //FileReader的方法，把图片转成base64
                            $scope.reader.onload = function (ev) {
                                $scope.$apply(function () {
                                    $scope.user = {
                                        icon: ev.target.result,  //接收base64
                                    }
                                });
                            };
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
                                console.log(fileItem);
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
                            $log.info($scope.user);
                            $scope.user.action = $scope.ids;
                            $scope.user.category = {id: $scope.user.category};
                            $scope.user.authorTp = parseInt($scope.user.authorTpStr);
                            if ($scope.user.confirmPassword != $scope.user.password) {
                                return false;
                            }
                            if (!$scope.user.mobile) {
                                Alert.alert("操作失败：" + '手机号码错误', true);
                                return false;
                            }
                            Author.save($scope.user, function () {
                                Alert.alert("操作成功");
                                //refresh list
                                $modalInstance.dismiss();
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
    ]).controller('RecommendAuthorCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', 'UserSelectService', 'User', '$modal', 'data', 'Author', 'CONFIG',
        function ($scope, $log, Alert, ConfirmService, UserSelectService, User, $modal, data, Author, CONFIG) {
            $scope.data = data;

            $scope.cancelRecommend = function (idx) {
                var u = $scope.data[idx];
                $log.info("cancel recommend author:", u);
                ConfirmService.confirm('确定要取消推荐此作者吗?').then(function () {
                    Author.recommendRemove.get({}, {ids: [u.id]}, function () {
                        $scope.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.selectAuthor = function () {
                $scope.authorSelecting = true;

                var ids = [];
                angular.forEach($scope.data, function (r) {
                   ids.push(r.id);
                });

                UserSelectService.open(ids, 1).then(function (selected) {
                    $scope.authorSelecting = false;
                    if (selected) {
                        Author.recommendAdd.get({}, {ids: selected}, function (){
                            Author.recommend.query(function (data) {
                                $scope.data = data;
                            });
                        }, function (res) {
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    }
                }, function () {
                    $scope.authorSelecting = false;
                });
            };
        }
    ]);
