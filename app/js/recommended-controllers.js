'use strict';

/* Controllers */

angular.module('myApp.recommendedcontrollers', ['ui.bootstrap'])
    .controller('recommendedCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Recommend', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic', 'ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','VALID','ImageSelectService','reviseTitleService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Recommend, data, Article, Activity, Live, Ad, Topic, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,VALID,ImageSelectService,reviseTitleService) {
            $scope.data = data;
            // $scope.origData = data.slice(0, data.length);
            $scope.changed = false;
            $scope.bannerlist = {
                show: true
            };
            $scope.grid = {
                page: 1
            };
            $scope.recommendedType = [
                {"id": "0", "name": "活动"},
                {"id": "1", "name": "文章"},
                {"id": "2", "name": "专题"},
                {"id": "3", "name": "连线"},
                // {"id": "4", "name": "广告"},
            ];
            $scope.addType = [
                {"id": "0", "name": "添加活动"},
                {"id": "1", "name": "添加文章"},
                {"id": "2", "name": "添加专题"},
                {"id": "3", "name": "添加连线"},
                // {"id": "4", "name": "添加广告"},
            ];
            $scope.item=[false,false,false,false,false];
            $scope.name =  $scope.recommendedType[0].name;
            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Article.get(SPEC, function () {
                    $scope.data = d;
                });
            };
            //搜索推荐位列表
            $scope.search = function () {
                refresh($scope.grid.page);
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

            //编辑推荐位分类
            $scope.list = [];
            $scope.item[0]=true;
            angular.forEach($scope.data.data,  function (r) {
                if (r.type == 0) {
                    $scope.list=r.recommends;
                }
            });
            $scope.classify = function (type) {
                type = parseInt(type);
                $scope.name =  $scope.recommendedType[type].name;
                $scope.item=[false,false,false,false,false];
                $scope.item[type]=true;
                $scope.list = [];
                angular.forEach($scope.data.data,  function (r) {
                    if (r.type == type) {
                        $scope.list=r.recommends;
                    }
                });
                console.log($scope.list);

            }
            $scope.add = function (id) {
                if (id == 1){
                    $scope.selectArticle();
                }else if (id ==0){
                    $scope.selectActivity();
                }else if (id ==2){
                    $scope.selectTopic();
                }else if (id ==3){
                    $scope.selectLive();
                }else if (id ==4){
                    $scope.selectAd();
                }
            }

            $scope.selectArticle = function () {
                var articleIds = [];
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 1) {
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
                            Alert.alert("该文章已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            console.log(data);
                            angular.forEach(data.data, function(a) {
                                var o = {type: 1, article: a};
                                $scope.list.unshift(o);
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
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 0) {
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
                            Alert.alert("该活动已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Activity.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 0, activity: a};
                                $scope.list.unshift(o);
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
                angular.forEach($scope.list,  function (r) {
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
                            Alert.alert("该连线已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Live.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 3, live: a};
                                $scope.list.unshift(o);
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
                angular.forEach($scope.list,  function (r) {
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
                            Alert.alert("该广告已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Ad.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 4, ad: a};
                                $scope.list.unshift(o);
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
                angular.forEach($scope.list,  function (r) {
                    if (r.type == 2) {
                        topicIds.push(r.article.id);
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
                            Alert.alert("该专题已推荐", true);
                            return ;
                        }
                    });

                    if (ids.length) {
                        Article.batch.get({}, {'ids': ids}, function (data) {
                            angular.forEach(data.data, function(a) {
                                var o = {type: 2, article: a};
                                $scope.list.unshift(o);
                                $scope.changed = true;
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            $scope.sortOptions = {
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
                if (index < 0 || index >= $scope.list.length)
                    return;

                $scope.list.splice(index, 1);
            };

            $scope.edit = {
                show: false
            };

            $scope.coverImg = [];
            $scope.selectTopImage = function (index) {
                $scope.coverImg = [];
                var t= $scope.list[index];
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                    .then(function (o) {
                        if (!o) {
                            return;
                        }
                        $scope.coverImg.push(o);

                        var coverImg = [];
                        angular.forEach($scope.coverImg, function (r) {
                            if (r.tp == 0 && coverImg.length < 1) {
                                coverImg.push(r);
                            }
                        });
                        $scope.list[index].image = coverImg[0];
                    });


            };

            $scope.reviseTitle = function (index){
                var t= $scope.list[index];
                reviseTitleService.open('').then(function (txt) {
                    if (txt.length) {
                        $scope.list[index].title = txt;
                    }
                });

        };

            function validateArticle() {
                    var titleCount = 0;
                    var imageCount = 0;

                    angular.forEach($scope.list, function (r) {
                        if (r.image) {
                            imageCount++;
                        }
                        if (r.title) {
                            titleCount++;
                        }
                    });
                    if (titleCount <$scope.list.length) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }

                    if (imageCount <$scope.list.length) {
                        Alert.alert("头图不能为空", true);
                        return false;
                    }

                    if ($scope.list.length==0) {
                        Alert.alert("无推荐内容", true);
                        return false;
                    }

                return true;
            };

            $scope.editRecommended = function () {
                $scope.edit.show = true;
                console.log($scope.list);
                $scope.save = function () {
                    var ids = [];
                    if (!validateArticle()) {
                        return;
                    }
                    angular.forEach($scope.list, function(o,index){
                        console.log(o);
                            if (o.type == 1) {
                                ids.push({type:1, article:{id:o.article.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 0) {
                                ids.push({type: 0, activity:{id: o.activity.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 2) {
                                ids.push({type:2, article:{id: o.article.id},orderNo:index+1,title:o.title,image:o.image});
                            } else if (o.type == 3) {
                                ids.push({type:3,live:{id: o.live.id},orderNo:index+1,title:o.title,image:o.image});
                                // } else if (o.type == 4) {
                                //     ids.push({type: o.type, id: o.ad.id});
                            }

                    });

                    var Check = function () {
                        $log.log(ids);
                        Recommend.batch.query(ids, function (data) {
                            console.log(data);
                            Alert.alert("操作成功").then(function () {
                                $scope.edit.show = false;
                                $scope.data = data;
                                $scope.bannerlist.show = true;
                                document.location.reload(true);
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

                 Check();
                };
                $scope.cancel = function () {
                    $scope.edit.show = false;
                    $scope.bannerlist.show = true;
                    document.location.reload(true);
                    $scope.updating = false;
                    $scope.changed = false;
                    $scope.data = $scope.origData.slice(0, $scope.origData.length);
                };
            };

        }]);
