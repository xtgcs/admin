'use strict';

/* Controllers */

angular.module('myApp.topiccontrollers', ['ui.bootstrap'])
    .controller('TopicCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ResourceTranslator', 'ConfirmService', 'CONFIG', 'Topic', 'data', 'ImageSelectService', 'ResourceSelectService', 'ArticleSelectService', 'ResourceSingleSelectService', "ActivitySelectService", "GoodsSelectService", "UserSingleSelectService", 'Resource', 'Article', 'Activity', 'Goods', 'User', '$rootScope', 'FileUploader', 'token', 'VALID',
        function ($scope, $modal, $log, $state, Alert, ResourceTranslator, ConfirmService, CONFIG, Topic, data, ImageSelectService, ResourceSelectService, ArticleSelectService, ResourceSingleSelectService, ActivitySelectService, GoodsSelectService, UserSingleSelectService, Resource, Article, Activity, Goods, User, $rootScope, FileUploader, token, VALID) {
            console.log('loading topic controller....');

            $scope.statusList = [
                {"id": "0", "name": "未发布的专题"},
                {"id": "1", "name": "已发布的专题"}
            ];

            $scope.typeList = [
                {"id": "0", "name": "文章专题"},
                {"id": "1", "name": "活动专题"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.topiclist = {
                show: true
            };

            $rootScope.isEditingTopic = false;

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
                var d = Topic.get(SPEC, function () {
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

            $scope.linkArticle = [];
            $scope.linkArticleIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.linkArticle = [];
                $scope.linkArticleIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.topic = {};
            };

            $scope.clearData = function () {
                $rootScope.isEditingTopic = false;
                clearData();
            };

            $scope.selectArticle = function () {
                var ids = $scope.linkArticleIds;
                $scope.articleSelecting = true;
                ArticleSelectService.open(ids, 10).then(function (selected) {
                    $scope.articleSelecting = false;
                    $scope.linkArticleIds = selected;
                    $scope.linkArticle = [];
                    if (selected.length) {
                        Article.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkArticle = data.data;
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 10).then(function (selected) {
                    $scope.activitySelecting = false;
                    $scope.linkActivityIds = selected;
                    $scope.linkActivity = [];
                    if (selected.length) {
                        Activity.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkActivity = data.data;
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.previewImg.push(o);
                });
            };

            $scope.selectBannerImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.bannerImg.push(o);
                });
            };

            $scope.removeArticle = function (id) {
                angular.forEach($scope.linkArticle, function (r) {
                    if (r.id === id) {
                        $scope.linkArticle.splice($scope.linkArticle.indexOf(r), 1);
                        $scope.linkArticleIds.splice($scope.linkArticleIds.indexOf(id), 1)
                    }
                });
            };

            $scope.removeActivity = function (id) {
                angular.forEach($scope.linkActivity, function (r) {
                    if (r.id === id) {
                        $scope.linkActivity.splice($scope.linkActivity.indexOf(r), 1);
                        $scope.linkActivityIds.splice($scope.linkActivityIds.indexOf(id), 1)
                    }
                });
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove preview image:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.removeBannerImg = function (resource) {
                $log.info("remove banner image:", resource);
                angular.forEach($scope.bannerImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.create = function (type) {
                $log.info("create topic");
                $rootScope.isEditingTopic = true;
                $scope.create.show = true;
                $scope.topic = {type: parseInt(type)};
                $scope.topImg = {};

                $scope.save = function () {
                    $log.info("save topic");
                    if (!$scope.topic.title || $scope.topic.title.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return;
                    }

                    if ($scope.topic.type == 0 && $scope.linkArticle.length == 0) {
                        Alert.alert("请添加文章!", true);
                        return;
                    }

                    if ($scope.topic.type == 1 && $scope.linkActivity.length == 0) {
                        Alert.alert("请添加活动!", true);
                        return;
                    }

                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });

                    if (previewImg.length == 0) {
                        Alert.alert("请选择预览图", true);
                        return;
                    }

                    var bannerImg = [];
                    angular.forEach($scope.bannerImg, function (r) {
                        if (r.tp == 0 && bannerImg.length < 1) {
                            bannerImg.push(r);
                        }
                    });

                    if (bannerImg.length == 0) {
                        Alert.alert("请选择banner图", true);
                        return;
                    }

                    $scope.topic.topImage = previewImg[0];
                    if (bannerImg.length > 0) {
                        $scope.topic.bannerImage = bannerImg[0];
                    }

                    $scope.topic.articleIds = $scope.linkArticleIds;
                    $scope.topic.activityIds = $scope.linkActivityIds;
                    $log.info("topic:", $scope.topic);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Topic.save($scope.topic, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.topiclist.show = true;
                                $scope.uploading = false;
                                //refresh($scope.grid.page);
                                document.location.reload(true);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.topiclist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Topic.get({id: n.id}, function (o) {
                    $log.info("edit topic:", o);
                    $rootScope.isEditingTopic = true;
                    $scope.topic = o;

                    $scope.edit.show = true;

                    $scope.previewImg = [o.topImage];
                    $scope.bannerImg = [o.bannerImage];

                    $scope.linkArticleIds = [];
                    $scope.linkArticle = o.articles;
                    angular.forEach(o.articles, function (o) {
                        $scope.linkArticleIds.push(o.id);
                    });

                    $scope.linkActivityIds = [];
                    $scope.linkActivity = o.activities;
                    angular.forEach(o.activities, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    $log.info($scope.linkArticle);
                    $log.info($scope.previewImg);

                    $scope.update = function () {
                        $log.info("update topic");

                        var previewImg = $scope.previewImg;
                        if (previewImg.length == 0) {
                            Alert.alert("请选择预览图", true);
                            return;
                        }

                        var bannerImg = $scope.bannerImg;
                        if (bannerImg.length == 0) {
                            Alert.alert("请选择banner图", true);
                            return;
                        }

                        if ($scope.topic.type == 0 && $scope.linkArticle.length == 0) {
                            Alert.alert("请添加文章!", true);
                            return;
                        }

                        if ($scope.topic.type == 1 && $scope.linkActivity.length == 0) {
                            Alert.alert("请添加活动!", true);
                            return;
                        }

                        $scope.topic.topImage = previewImg[0];
                        if (bannerImg.length > 0) {
                            $scope.topic.bannerImage = bannerImg[0];
                        }

                        $scope.topic.articleIds = $scope.linkArticleIds;
                        $scope.topic.activityIds = $scope.linkActivityIds;
                        $log.info("topic:", $scope.topic);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Topic.update({id: o.id}, $scope.topic, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.edit.show = false;
                                    $scope.topiclist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    $scope.cancel = function () {
                        $scope.edit.show = false;
                        $scope.topiclist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del topic:", o);
                ConfirmService.confirm('确定要删除此专题吗?').then(function () {
                    Topic.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        //Alert.alert("操作成功");
                        var dom = document.getElementById("delete_success");
                        dom.style.display = "block";
                        setTimeout(function () {
                            dom.style.display = "none";
                        },2000)
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view topic:", o);
                $modal.open({
                    templateUrl: 'partials/topic/topic_view.html',
                    controller: function ($scope, $modalInstance, topic) {
                        $scope.topic = topic;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        topic: function () {
                            return Topic.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish topic:", o);
                ConfirmService.confirm('确定要发布此专题吗?').then(function () {
                    Topic.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }])
    .controller('DeletedTopicCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Topic', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Topic, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.type) {
                    SPEC.tp = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Topic.get(SPEC, function () {
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
                $log.info("view topic:", o);
                $modal.open({
                    templateUrl: 'partials/topic/topic_view.html',
                    controller: function ($scope, $modalInstance, topic) {
                        $scope.topic = topic;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        topic: function () {
                            return Topic.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover topic:", o);
                ConfirmService.confirm('确定要恢复此专题吗?').then(function () {
                    Topic.recover.commit({id: o.id}, function () {
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
