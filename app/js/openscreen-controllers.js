'use strict';

/* Controllers */

angular.module('myApp.openscreencontrollers', ['ui.bootstrap'])
    .controller('OpenScreenCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Openscreen', 'data', 'Article', 'Activity', 'Live', 'Ad', 'Topic','Column','ArticleSelectService', 'ActivitySelectService', 'LiveSelectService', 'AdSelectService', 'TopicSelectService', '$rootScope','ImageSelectService','reviseTimeService','reviseUrlService','ColumnSingleSelectService',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Openscreen, data, Article, Activity, Live, Ad, Topic,Column, ArticleSelectService, ActivitySelectService, LiveSelectService, AdSelectService, TopicSelectService, $rootScope,ImageSelectService,reviseTimeService,reviseUrlService,ColumnSingleSelectService) {

            $scope.data = data;
            $scope.origData = data.slice(0, data.length);

            $scope.state = true;

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
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
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
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
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
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                        });
                    }
                }, function () {
                    $scope.liveSelecting = false;
                });
            };

            $scope.selectAd = function () {
                var o = {ad:{type: 4,bannerImage:{},st:'',et:'',url:''},type:4};
                $scope.data.unshift(o);
                setTime();
                console.log($scope.data);
                console.log(o);
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
                                $scope.data.unshift(o);
                                $scope.changed = true;
                                setTime();
                            });
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };
            $scope.selectColumn = function () {
                var columnIds = [];
                angular.forEach($scope.data,  function (r) {
                    if (r.type == 5) {
                        columnIds.push(r.column.id);
                    }
                });

                $scope.topicSelecting = true;
                ColumnSingleSelectService.open([], 1).then(function (selected) {
                    $scope.topicSelecting = false;

                        if (!columnIds.contains(selected)) {
                           var  id=selected;
                        }else{
                            Alert.alert("该课堂已存在", true);
                            return ;
                        }

                    if (id) {
                        Column.get({id: id}, function (data) {
                            console.log(data);
                                var o = {type: 5, column: data};
                                $scope.data.unshift(o);
                                setTime();
                        });
                    }
                }, function () {
                    $scope.topicSelecting = false;
                });
            };

            //默认时间设置
            function setTime() {

                var t =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000);
                var e =   new Date(new Date(new Date().toLocaleDateString()).getTime()+24*60*60*1000*3-1);

                $scope.startDate = fromTimestamp(t);
                $scope.endDate = fromTimestamp(e);

                angular.forEach($scope.data,function (t,index) {
                    if (t.type ==0){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else if (t.type ==1){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else  if (t.type ==2){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else if (t.type ==3){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);

                    }else  if (t.type ==4){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }else  if (t.type ==5){
                        $scope.data[index].st = parseDate($scope.startDate);
                        $scope.data[index].et = parseDate($scope.endDate);
                    }
                })
            }
            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
                    minDate: new Date(),
                    opened: false
                }
            }

            function parseDate(date) {
                return Date.UTC(date.date.getFullYear(), date.date.getMonth(), date.date.getDate(), date.time.getHours(), date.time.getMinutes()) +
                    date.date.getTimezoneOffset() * 60 * 1000;
            }

            function fromTimestamp(ts) {
                var d = new Date(ts);
                return {
                    date: d,
                    time: d,
                    minDate: new Date(),
                    opened: false
                }
            }

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
                            $scope.data[index].image = bannerImage[0].url;
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
                            $scope.data[index].image = bannerImage[0].url;
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
                            $scope.data[index].image = bannerImage[0].url;
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
                            $scope.data[index].image = bannerImage[0].url;
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
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }else  if (t.type ==5){
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
                            $scope.data[index].image = bannerImage[0].url;
                        });
                }


            };
            $scope.reviseUrl =function (index) {
                var t= $scope.data[index];
                reviseUrlService.open('').then(function (txt) {
                    if (txt.length) {
                        $scope.data[index].url = txt;
                    }
                });
            }
            $scope.reviseTime = function (index){
                var t= $scope.data[index];
                reviseTimeService.open('').then(function (time) {
                    if (time.st) {
                        $scope.data[index].st = time.st;
                        $scope.data[index].et = time.et;
                    }
                });

            };

            $scope.save = function (index) {
                    var ids = {};
                    var o = $scope.data[index];
                        if (o.type == 0) {
                            ids={type: o.type, gid: o.article.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 1) {
                            ids={type: o.type, gid: o.activity.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 2) {
                            ids={type: o.type, gid: o.topic.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 3) {
                            ids={type: o.type, gid: o.live.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        } else if (o.type == 4) {
                            ids={type: o.type, gid: '',image:o.image,st:o.st,et:o.et,url:o.url,advertkind:0};
                        } else if (o.type == 5) {
                            ids={type: o.type, gid: o.column.id,image:o.image,st:o.st,et:o.et,advertkind:0};
                        }

                    $log.log(ids);
                    Openscreen.save(ids, function () {
                        Alert.alert("操作成功").then(function () {
                            $scope.upading = false;
                            $scope.origData = $scope.data.slice(0, $scope.data.length);
                            $scope.state = false;
                        });
                    }, function (res) {
                        $scope.updating = true;
                        $log.info(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                };

                $scope.update = function (index) {
                    var ids = {};
                    var o = $scope.data[index];
                    if (o.type == 0) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 1) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 2) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 3) {
                        ids={type: o.type, id:o.id, gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    } else if (o.type == 4) {
                        ids={type: o.type, id: o.id,gid: o.gid,image:o.image,st:o.st,et:o.et,url:o.url,advertkind:0};
                    }else if (o.type == 5) {
                        ids={type: o.type, id: o.id,gid: o.gid,image:o.image,st:o.st,et:o.et,advertkind:0};
                    }
                    Openscreen.editor.update({id: o.id}, ids, function () {
                    Alert.alert("操作成功").then(function () {
                          $scope.state = false;
                    });
                }, function (res) {
                    $scope.updating = true;
                    $scope.uploading = false;
                    $log.info(res.data);
                    Alert.alert("操作失败：" + res.data, true);
                });
            };
               $scope.delete = function (index) {
                   var u = $scope.data[index];
                   ConfirmService.confirm('确定要删除此广告吗?').then(function () {
                       Openscreen.remove({id: u.id}, function () {
                           $scope.data.splice(index, 1);
                           Alert.alert("操作成功");
                       }, function (res) {
                           Alert.alert("操作失败：" + res.data, true);
                       });
                   });
               }

        }]);
