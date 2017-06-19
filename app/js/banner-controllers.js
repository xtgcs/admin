'use strict';

/* Controllers */

angular.module('myApp.bannercontrollers', ['ui.bootstrap'])
    .controller('BannerCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Banner', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic', 'ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','ImageSelectService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Banner, data, Article, Activity, Live, Ad, Topic, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,ImageSelectService) {

            $scope.data = data;
            $scope.origData = data.slice(0, data.length);

            $scope.changed = false;

            $scope.bannerlist = {
                show: true
            };

            function getId(o) {
                if (o.type == 0) {
                    return o.article.id;
                } else if (o.type == 1) {
                    return o.activity.id;
                } else if (o.type == 2) {
                    return o.topic.id;
                }
                return '';
            }

            Array.prototype.contains = function(v) {
                for (var i = 0; i < this.length; ++i) {
                    if (this[i] == v)
                        return true;
                }
                return false;
            };

            $scope.selectArticle = function () {
                var articleIds = [];
                angular.forEach($scope.data,  function (r) {
                   if (r.type == 0) {
                       articleIds.push(r.article.id);
                   }
                });

                $scope.articleSelecting = true;
                ArticleSelectService.open([], 1).then(function (selected) {
                    $scope.articleSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!articleIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该文章已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                               var o = {type: 0, article: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                            $log.log($scope.data);
                        });
                    }
                }, function () {
                    $scope.articleSelecting = false;
                });
            };

            $scope.selectActivity = function () {
                var activityIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 1) {
                        activityIds.push(r.activity.id);
                    }
                });

                $scope.activitySelecting = true;
                ActivitySelectService.open([], 1).then(function (selected) {
                    $scope.activitySelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!activityIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该活动已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Activity.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 1, activity: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.activitySelecting = false;
                });
            };

            $scope.selectLive = function () {
                var liveIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 3) {
                        liveIds.push(r.live.id);
                    }
                });

                $scope.liveSelecting = true;
                LiveSelectService.open([], 1).then(function (selected) {
                    $scope.liveSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!liveIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该连线已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Live.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 3, live: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.liveSelecting = false;
                });
            };

            $scope.selectAd = function () {
                var adIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 4) {
                        adIds.push(r.ad.id);
                    }
                });

                $scope.adSelecting = true;
                AdSelectService.open([], 1).then(function (selected) {
                    $scope.adSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!adIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该广告已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Ad.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 4, ad: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.adSelecting = false;
                });
            };

            $scope.selectTopic = function () {
                var topicIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 2) {
                        topicIds.push(r.topic.id);
                    }
                });

                $scope.topicSelecting = true;
                TopicSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                    var ids = [];
                    angular.forEach(selected, function (id) {
                        if (!topicIds.contains(id)) {
                            ids.push(id);
                        }else{
                            Alert.alert("该专题已存在", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Topic.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 2, topic: a};
                                $scope.data.push(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            $scope.sortOptions = {
                //restrict move across backlogs. move only within backlog.
                accept: function (sourceItemHandleScope, destSortableScope) {
                },
                itemMoved: function (event) {
                },
                orderChanged: function (event) {
                    $scope.changed = true;
                },
                containment: '#board'
            };

            $scope.removeBanner = function (index) {
                if (index < 0 || index >= $scope.data.length)
                    return;

                $scope.data.splice(index, 1);
            };

            $scope.bannerImage = [];
            $scope.selectTopImage = function (index) {
                $scope.bannerImage = [];
                var t= $scope.data[index];
                if (t.type ==0){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].article.bannerImage = bannerImage[0];
                        });
                }else if (t.type ==1){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].activity.bannerImage = bannerImage[0];
                        });
                }else  if (t.type ==2){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].topic.bannerImage = bannerImage[0];
                        });
                }else if (t.type ==3){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].live.bannerImage = bannerImage[0];
                        });
                }else  if (t.type ==4){
                    ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                        .then(function (o) {
                            if (!o) {
                                return;
                            }
                            $scope.bannerImage.push(o);

                            var bannerImage = [];
                            angular.forEach($scope.bannerImage, function (r) {
                                if (r.tp == 0 && bannerImage.length < 1) {
                                    bannerImage.push(r);
                                }
                            });
                            $scope.data[index].ad.bannerImage = bannerImage[0];
                        });
                }

            };


            $scope.edit = {
                show: false
            };

            function validateArticle() {
                var imageCount = 0;

                angular.forEach($scope.data, function (r) {
                    if (r.type==0 && r.article.bannerImage) {
                        imageCount++;
                    }else if (r.type==1 && r.activity.bannerImage){
                        imageCount++;
                    }else if (r.type==2 && r.topic.bannerImage){
                        imageCount++;
                    }else if (r.type==3 && r.live.bannerImage){
                        imageCount++;
                    }else if (r.type==4 && r.ad.bannerImage){
                        imageCount++;
                    }
                });
                if (imageCount <$scope.data.length) {
                    Alert.alert("头图不能为空", true);
                    return false;
                }

                if ($scope.data.length==0) {
                    Alert.alert("无推荐内容", true);
                    return false;
                }

                return true;
            };

            $scope.editBanner = function () {
                $scope.edit.show = true;
                $scope.save = function () {
                    var ids = [];
                    if (!validateArticle()) {
                        return;
                    }
                    angular.forEach($scope.data, function(o){
                        if (o.type == 0) {
                            ids.push({type: o.type, id: o.article.id,imageId:o.article.bannerImage.id});
                        } else if (o.type == 1) {
                            ids.push({type: o.type, id: o.activity.id,imageId:o.activity.bannerImage.id});
                        } else if (o.type == 2) {
                            ids.push({type: o.type, id: o.topic.id,imageId:o.topic.bannerImage.id});
                        } else if (o.type == 3) {
                            ids.push({type: o.type, id: o.live.id,imageId:o.live.bannerImage.id});
                        } else if (o.type == 4) {
                            ids.push({type: o.type, id: o.ad.id,imageId:o.ad.bannerImage.id});
                        }
                    });
                    $log.log(ids);
                    Banner.save({ids: ids}, function () {
                        Alert.alert("操作成功").then(function () {
                            $scope.edit.show = false;
                            $scope.bannerlist.show = true;
                            $scope.upading = false;
                            $scope.origData = $scope.data.slice(0, $scope.data.length);
                            $scope.changed = false;
                        });
                    }, function (res) {
                        $scope.updating = true;
                        $log.info(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                };

                $scope.cancel = function () {
                    $scope.edit.show = false;
                    $scope.bannerlist.show = true;
                    $scope.updating = false;
                    $scope.changed = false;
                    $scope.data = $scope.origData.slice(0, $scope.origData.length);
                };
            };

        }]);
