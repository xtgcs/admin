'use strict';

/* Controllers */

angular.module('myApp.articlecontrollers', ['ui.bootstrap'])
    .controller('ArticleCtrl', ['$scope', '$modal', '$log', 'me', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Article', 'data','columns','$interval' ,'ResourceChecker', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', "ActivitySelectService", "GoodsSelectService", "UserSingleSelectService", "SensitiveReplaceService", 'Resource', 'Activity', 'Goods', 'User', '$rootScope', 'FileUploader', 'token', 'category', 'VALID','locals','Recommend',
        function ($scope, $modal, $log, me, $state, Alert, ConfirmService, CONFIG, Article, data,columns,$interval, ResourceChecker, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, ActivitySelectService, GoodsSelectService, UserSingleSelectService, SensitiveReplaceService, Resource, Activity, Goods, User, $rootScope, FileUploader, token, category, VALID,locals,Recommend) {
            console.log('loading article controller....');
            $scope.statusList = [
                {"id": "0", "name": "未发布的文章"},
                {"id": "1", "name": "已发布的文章"},
                {"id": "2", "name": "被拒绝的文章"},
                {"id": "3", "name": "自动抓取的文章"}
            ];
            $scope.recommendedList = [
                {"id": "0", "name": "未推荐的文章"},
                {"id": "1", "name": "已推荐的文章"}
            ];
            $scope.typeList = [
                {"id": "0", "name": "文章"},
                //{"id": "1", "name": "图集"},
                {"id": "2", "name": "视频"}
            ];

            //文章列表数据
            $scope.data = data;
            //文章类型
            $scope.category = category.data;
            //文章栏目
            $scope.columns = columns.data;
            $scope.grid = {
                page: 1
            };

            $scope.articlelist = {
                show: true
            };

            //发布方式选择
            $scope.someProperty = false;
            $scope.select = function () {
                $scope.someProperty = true;
            }
            // 是否为专题
            $scope.topic = false;
            $scope.selectTopic = function () {
                if (!$scope.topic){
                    $scope.topic = true;
                    $scope.article.isTopic = 1;
                }else{
                    $scope.topic = false;
                    $scope.article.isTopic = 0;
                }
            }

            // 是否为免费
            $scope.price = false;
            $scope.isFree=false;
            $scope.selectPrice = function () {
                if (!$scope.price){
                    $scope.price = true;
                    $scope.article.freeRead = 1;
                }else{
                    $scope.price = false;
                    $scope.article.freeRead = 0;
                }
            }

            $rootScope.isEditingArticle = false;

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.recommended) {
                    SPEC.recommended = $scope.grid.recommended;
                }
                if ($scope.grid.type) {
                    SPEC.type = $scope.grid.type;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Article.get(SPEC, function () {
                    console.log(d);
                    $scope.data = d;
                });
            };
            //搜索文章列表中的文章
            $scope.search = function () {
                refresh($scope.grid.page);
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            //查看文章列表文章的评论
            $scope.showCmt = function (idx, showOp) {
                var parentScope = $scope;
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/article/article_cmt.html',
                    controller: function ($scope, $modalInstance, cmt, user) {
                        $scope.cmt = cmt;
                        $scope.grid = {
                            page: 1
                        };

                        $scope.commentIds = [];
                        angular.forEach(parentScope.article.comments, function (c){
                            $scope.commentIds.push(c.id);
                        });

                        $scope.showCommentOp = showOp;

                        var refresh = function (page) {
                            var SPEC = {id: user.id, page: page, size: CONFIG.less};
                            if ($scope.grid.q) {
                                SPEC.q = $scope.grid.q;
                            }

                            var d = Article.cmt.get(SPEC, function () {
                                $scope.cmt = d;
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

                        $scope.recommendComment = function (comment) {
                            $log.info("recommend article comment:", o);
                            ConfirmService.confirm('确定要将此评论标记为精华吗?').then(function () {
                                Article.recommendComment.get({id: parentScope.article.id}, {ids: [comment.id]}, function (o) {
                                    parentScope.article = o;
                                    $scope.commentIds = [];
                                    angular.forEach(o.comments, function (c){
                                        $scope.commentIds.push(c.id);
                                    });

                                    Alert.alert("操作成功");
                                }, function (res) {
                                    Alert.alert("操作失败：" + res.data, true);
                                });
                            });
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                            delete $scope.showCommentOp;
                        };
                    },
                    resolve: {
                        cmt: function () {
                            return Article.cmt.get({'id': o.id, page: 1, size: CONFIG.less}).$promise;
                        },
                        user: function () {
                            return o;
                        }
                    }
                });
            };

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.linkArticle = [];
            $scope.linkArticleIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.linkGoods = [];
            $scope.linkGoodsIds = [];
            $scope.linkLive = [];
            $scope.linkLiveIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];
            $scope.coverImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.linkArticle = [];
                $scope.linkArticleIds = [];
                $scope.linkActivity = [];
                $scope.linkActivityIds = [];
                $scope.linkGoods = [];
                $scope.linkGoodsIds = [];
                $scope.linkLive = [];
                $scope.linkLiveIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.coverImg = [];
                $scope.article = {'resource': [], 'type': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingArticle = false;
                clearData();
            };


            $rootScope.geo = {};

            $scope.map = function () {
                $modal.open({
                    templateUrl: 'partials/article/article_map.html',
                    controller: function ($scope, $modalInstance) {

                        $scope.ok = function () {
                            var map = document.getElementById("myIFrame").contentWindow;
                            var location = map.document.getElementById("location").value;
                            var address = map.document.getElementById("address").value;
                            var city = map.document.getElementById("city").value;
                            var lat = map.document.getElementById("lat").value;
                            var lng = map.document.getElementById("lng").value;
                            var city_lat = map.document.getElementById("city_lat").value;
                            var city_lng = map.document.getElementById("city_lng").value;
                            $log.info("location:", location, "address:", address, "city:", city, "lat:", lat, "lng:", lng);
                            var locationName;
                            if (location.indexOf(city) !== -1) {
                                locationName = location;
                            } else {
                                locationName = city + location;
                            }
                            $rootScope.address = locationName;
                            $log.info('root', $rootScope.address);
                            $rootScope.geo = {
                                "name": locationName,
                                "address": address,
                                "city": {
                                    "name": city,
                                    "longitude": parseFloat(city_lng),
                                    "latitude": parseFloat(city_lat)
                                },
                                "coordinates": {
                                    "longitude": parseFloat(lng),
                                    "latitude": parseFloat(lat)
                                }
                            };

                            $modalInstance.close();
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        }
                    }
                })
            };

            $scope.insertTextarea = function () {
                ResourceTextService.open('', 2000).then(function (txt) {
                    console.log('插入文本'+txt);
                    if (txt.length) {
                        Resource.getId.get(function (res) {
                            $scope.resources.push({id: res.id, tp: 2, txt: txt});
                        });
                    }
                });
            };

            $scope.selectResource = function () {
                var ids = $scope.resourceIds;
                ResourceSelectService.open(ids).then(function (selected) {
                    $scope.resourceIds = selected;

                    if (selected.length) {
                        Resource.batch.get({}, {'ids': selected}, function (data) {
                            angular.forEach(data.data, function (o) {
                                var currentIds = [];
                                angular.forEach($scope.resources, function (r) {
                                    currentIds.push(r.id)
                                });

                                if (currentIds.indexOf(o.id) == -1) {
                                    $scope.resources.push(o);
                                }
                                if (o.tp == 1) {
                                    $.hasVideo = true;
                                }
                            });
                        });
                    }
                });
            };

            $scope.selectAudio= function () {
                ResourceSingleSelectService.open('', "3").then(function (selected) {
                    if (selected) {
                        Resource.batch.get({}, {'ids': [selected.id]}, function (data) {
                            angular.forEach(data.data, function (o) {
                                var currentIds = [];
                                angular.forEach($scope.resources, function (r) {
                                    currentIds.push(r.id)
                                });

                                if (currentIds.indexOf(o.id) == -1) {
                                    $scope.resources.push(o);
                                }
                            });
                        });
                    }

                    $scope.hasAudio = false;
                    angular.forEach($scope.resources, function (r) {
                        if (r.tp == 3) {
                            $scope.hasAudio = true;
                        }
                    });
                });
            };

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 3).then(function (selected) {
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

            $scope.selectGoods = function () {
                console.log("选择物件");
                var ids = $scope.linkGoodsIds;
                $scope.goodsSelecting = true;
                GoodsSelectService.open(ids).then(function (selected) {
                    $scope.goodsSelecting = false;
                    $scope.linkGoodsIds = selected;
                    $scope.linkGoods = [];
                    if (selected.length) {
                        Goods.batch.get({}, {'ids': selected}, function (data) {
                            $scope.linkGoods = data.data;
                        });
                    }
                }, function () {
                    $scope.goodsSelecting = false;
                });
            };

            //选择作者
            $scope.name={
                author_name:""
            };
            $scope.results = false;
            $scope.myKeyup = function () {
                var kw = $scope.name.author_name;
                console.log(kw);
                if(kw == ""){
                    $scope.results = false;
                    return false;
                }
                var SPEC = {page: 1, size: 20, tp:1};
                if ($scope.name.author_name) {
                    SPEC.name = $scope.name.author_name;
                }
                var d = User.get(SPEC, function () {
                    $scope.authors = d.data;
                    if ($scope.authors.length!=0){
                        $scope.results = true;
                        $scope.noauthor=false;
                    }else{
                        $scope.noauthor=true;
                    }
                });
            $scope.getAuthor=function (index) {
                $scope.article.user = $scope.authors[index].id;
                $scope.name.author_name = $scope.authors[index].nick;
                $scope.results = false;
            }
        }
        $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight)
                    .then(function (o) {
                    if (!o) {
                        return;
                    }
                    $scope.previewImg.push(o);
                });
            };

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

                $scope.hasAudio = false;
                $scope.hasVideo = false;
                angular.forEach($scope.resources, function (r) {
                    if (r.tp == 3) {
                        $scope.hasAudio = true;
                    }
                    else if (r.tp == 1) {
                        $scope.hasVideo = true;
                    }
                });
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };

            // $scope.removeBannerImg = function (resource) {
            //     $log.info("remove resource:", resource);
            //     angular.forEach($scope.bannerImg, function (r) {
            //         if (r.id === resource.id) {
            //             $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
            //         }
            //     });
            // };
            //
            // $scope.removeCoverImg = function (resource) {
            //     $log.info("remove resource:", resource);
            //     angular.forEach($scope.coverImg, function (r) {
            //         if (r.id === resource.id) {
            //             $scope.coverImg.splice($scope.coverImg.indexOf(resource), 1);
            //         }
            //     });
            // };
            //
            // $scope.removeArticle = function (id) {
            //     angular.forEach($scope.linkArticle, function (r) {
            //         if (r.id === id) {
            //             $scope.linkArticle.splice($scope.linkArticle.indexOf(r), 1);
            //             $scope.linkArticleIds.splice($scope.linkArticleIds.indexOf(id), 1)
            //         }
            //     });
            // };
            //
            // $scope.removeActivity = function (id) {
            //     angular.forEach($scope.linkActivity, function (r) {
            //         if (r.id === id) {
            //             $scope.linkActivity.splice($scope.linkActivity.indexOf(r), 1);
            //             $scope.linkActivityIds.splice($scope.linkActivityIds.indexOf(id), 1)
            //         }
            //     });
            // };
            //
            // $scope.removeGoods = function (id) {
            //     angular.forEach($scope.linkGoods, function (r) {
            //         if (r.id === id) {
            //             $scope.linkGoods.splice($scope.linkGoods.indexOf(r), 1);
            //             $scope.linkGoodsIds.splice($scope.linkGoodsIds.indexOf(id), 1)
            //         }
            //     });
            // };

            // datepicker begin
            function newDate() {
                return {
                    date: new Date(),
                    time: new Date(),
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
                    opened: false
                }
            }
            $scope.hstep = 1;
            $scope.mstep = 5;
            $scope.dateFormat = "yyyy-MM-dd";

            $scope.startDate = newDate();
            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDate.opened = true;
            };

            $scope.publishDate = newDate();
            $scope.openPublishDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.publishDate.opened = true;
            };

            String.prototype.trim=function()
            {
                return this.replace(/(^\s*)|(\s*$)/g,'');
            };

            function validateArticle() {
                if ($scope.article.type == 2) {
                    var videoCount = 0;
                    var imageCount = 0;

                    angular.forEach($scope.resources, function (r) {
                        if (r.tp == 0) {
                            imageCount++;
                        } else if (r.tp == 1) {
                            videoCount++;
                        }
                    });
                    if (imageCount > 0) {
                       Alert.alert("视频文章不能含有图片，请移除后重试", true);
                       return false;
                    }
                    if (videoCount > 1) {
                        Alert.alert("视频文章只能包含一个视频，请移除多余的视频后重试", true);
                        return false;
                    }

                    if (videoCount === 0) {
                        Alert.alert("请选择视频后重试", true);
                        return false;
                    }
                }
                if (!$scope.article.desc) {
                    Alert.alert("请输入文章摘要", true);
                    return false;
                }

                if (!ResourceChecker.check($scope.resources)) {
                    return false;
                }

                return true;
            }

            $scope.publishTypes = [
                {"id": "0", "name": "手工发布"},
                {"id": "1", "name": "定时发布"}
            ];


            $scope.pushSetting = [
                {"id": "0", "name": "不发送推送消息"},
                {"id": "1", "name": "发送推送消息"}
            ];

            $scope.stripFormat = ResourceTranslator.stripFormat;


            $scope.create = function (type) {
                if (!type) {
                    type = 0;
                }
                type = parseInt(type);
                $log.log('type:' + type);
                $log.info("create article");
                $rootScope.isEditingArticle = true;
                $scope.create.show = true;
                $scope.article = {'resource': [], tags:'', type:type, autoPublishString: '0', needPushString: '0',freeRead:0};
                $rootScope.geo = {};
                $rootScope.address = "";
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                $scope.topImg = {};
                $scope.hasAudio = false;
                $scope.hasVideo = false;
                $scope.author_name = '';

                // $scope.startDate = newDate();
                $scope.publishDate = newDate();

                // $scope.articleContent = '';
                //读取数据
                // console.log(locals.get("username",""));
                // $scope.articleContent = locals.get("username","");
                // console.log($scope.articleContent);
                $log.log($scope.articleContent);
                delete $rootScope.geo;

                $scope.$watch('article.columns',function(newValue,oldValue, scope){
                    if (newValue){
                        $scope.isFree=true;
                        console.log($scope.isFree);
                    }
                });

                // 编辑内容检查
                function check(publish) {
                    if (!$scope.article.title || $scope.article.title.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }
                    $scope.resources = ResourceTranslator.fromHtml('#content-editor');
                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });
                    if (previewImg.length == 0) {
                        Alert.alert("请设置文章头图", true);
                        return false;
                    }

                    $scope.article.resource = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    $scope.article.column ={
                        id:$scope.article.columns
                    };

                    $scope.article.activityIds = $scope.linkActivityIds;
                    $scope.article.goodsIds = $scope.linkGoodsIds;
                    $scope.article.LiveIds = $scope.linkLiveIds;

                    $scope.article.type = Number($scope.article.type);
                    $scope.article.geo = $rootScope.geo;

                    $scope.article.ct = parseDate($scope.startDate);
                    $scope.article.pt = parseDate($scope.publishDate);
                    $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                    $scope.article.needPush = parseInt($scope.article.needPushString);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    if($scope.article.tags  instanceof Array){
                        var newTags = $scope.article.tags;

                    }else{
                        var tags = $scope.article.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    $scope.article.tags = newTags;
                    $log.info("save article", $scope.article);
                    console.log("保存信息"+$scope.article);
                    $scope.article.publish = publish ? 1 : 0;
                }
                //文章保存
                $scope.save = function (publish) {
                     // check(publish);

                    if (!$scope.article.title || $scope.article.title.length == 0) {
                        Alert.alert("标题不能为空", true);
                        return false;
                    }
                    $scope.resources = ResourceTranslator.fromHtml('#content-editor');
                    var previewImg = [];
                    angular.forEach($scope.previewImg, function (r) {
                        if (r.tp == 0 && previewImg.length < 1) {
                            previewImg.push(r);
                        }
                    });
                    if (previewImg.length == 0) {
                        Alert.alert("请设置文章头图", true);
                        return false;
                    }

                    $scope.article.resource = $scope.resources;
                    $scope.article.topImage = previewImg[0];
                    $scope.article.column ={
                        id:$scope.article.columns
                    };
                    if (!$scope.article.columns) {
                        $scope.article.freeRead = 1;
                    }
                    $scope.article.activityIds = $scope.linkActivityIds;
                    $scope.article.goodsIds = $scope.linkGoodsIds;
                    $scope.article.LiveIds = $scope.linkLiveIds;

                    $scope.article.type = Number($scope.article.type);
                    $scope.article.geo = $rootScope.geo;

                    $scope.article.ct = parseDate($scope.startDate);
                    $scope.article.pt = parseDate($scope.publishDate);
                    $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                    $scope.article.needPush = parseInt($scope.article.needPushString);

                    if (!validateArticle()) {
                        return false;
                    }
                    console.log($scope.article.tags);
                    if($scope.article.tags  instanceof Array){
                        var newTags = $scope.article.tags;

                    }else{
                        var tags = $scope.article.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    $scope.article.tags = newTags;
                    $log.info("save article", $scope.article);
                    console.log("保存信息"+$scope.article);
                    $scope.article.publish = publish ? 1 : 0;

                    var createCheck = function () {
                        $scope.uploading = true;
                        Article.save($scope.article, function (data) {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.articlelist.show = true;
                                    $scope.uploading = false;
                                    document.location.reload(true);
                                });
                        }, function (res) {
                            // $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                // 文章创建好预览
                $scope.preview = function (publish) {
                    check(publish);
                    var createCheck = function () {
                    $scope.uploading = true;
                    Article.save($scope.article, function (data) {
                        $scope.uploading =false;
                        var o = data;
                        $modal.open({
                            templateUrl: 'partials/article/article_view.html',
                            controller: function ($scope, $modalInstance, article) {
                                $scope.article = article;
                                $scope.wordsd = article.sensitive.join('|');
                                SensitiveReplaceService.replaceArticle(article);
                                $scope.ok = function () {
                                    $modalInstance.close();
                                };
                            },
                            resolve: {
                                article: function () {
                                    return Article.get({id: o.id}).$promise;
                                }
                            }
                        });
                    }, function (res) {
                        // $scope.updating = true;
                        $scope.uploading = false;
                        $log.info(res.data);
                        Alert.alert("操作失败：" + res.data, true);
                    });
                    };
                    createCheck();

                };
                
                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.articlelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };

                // var timer=$interval(function(){
                //     var str = '';
                // $scope.Keyup = function (articleContent) {
                //     str = articleContent;
                //     console.log(str);
                //     console.log(str.length);
                //
                // if(str.length>20 && (str.indexOf("。")>-1 || str.indexOf("，")>-1)){ /*有内容才保存 且有句号或逗号*/
                //     //存储数据
                //     locals.set("username",str);
                //     console.log("获取数据:"+locals.get("username",""));
                //
                //     var d = new Date();
                //
                //     var YMDHMS = d.getFullYear() + "-" +(d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                //     // spanObj.innerText='（数据保存于: '+YMDHMS+'）';
                //     console.log(YMDHMS);
                //     // setTimeout(function(){ spanObj.innerText=''; },5000);
                // }
                //
                //     console.log('hello world')
                // }
                // },2000);

            };


            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Article.get({id: n.id}, function (o) {
                    $log.info("edit article:", o);
                    $rootScope.geo = o.geo;
                    $rootScope.isEditingArticle = true;
                    $scope.article = o;
                    console.log(o);
                    $scope.editArticleContent = ResourceTranslator.toHtml(o.resource);
                    console.log($scope.editArticleContent);

                    SensitiveReplaceService.replaceArticle(o);

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;

                    $scope.startDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    o.category = o.category.id;
                    if (o.column!==null){
                        o.columns = o.column.id;
                    }
                    $scope.edit.show = true;

                    $scope.article.autoPublishString = '' + $scope.article.autoPublish;
                    $scope.article.needPushString = '' + $scope.article.needPush;

                    if (o.tags) {
                        o.tags = o.tags.join(',');
                    } else {
                        o.tags = '';
                    }
                    //todo, why $rootScope
                    if (o.geo && o.geo.name) {
                        $rootScope.address = o.geo.name;
                    }
                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    $scope.hasAudio = false;
                    $scope.hasVideo = false;
                    angular.forEach($scope.article.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                        if (o.tp == 3) {
                            $scope.hasAudio = true;
                        } else if (o.tp == 1) {
                            $scope.hasVideo = true;
                        }
                    });
                    $scope.resources = o.resource;

                    $scope.linkActivityIds = [];
                    $scope.linkActivity = o.activities;
                    angular.forEach(o.activities, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    $scope.linkGoodsIds = [];
                    $scope.linkGoods = o.goods;
                    angular.forEach(o.goods, function (o) {
                        $scope.linkGoodsIds.push(o.id);
                    });
                    $scope.linkLiveIds = [];
                    $scope.linkLive = o.lives;
                    angular.forEach(o.lives, function (o) {
                        $scope.linkLiveIds.push(o.id);
                    });
                    $scope.previewImg = [o.topImage];
                    // $scope.bannerImg = [o.bannerImage];
                    // $log.log($scope.bannerImg);
                    // $scope.coverImg = [];
                    // if (o.cover) {
                    //     if (o.cover.w) {
                    //         o.cover.url += '?imageMogr2/crop/!' + o.cover.w + 'x' + o.cover.h + 'a' + o.cover.x + 'a' + o.cover.y;
                    //     }
                    //     $scope.coverImg.push(o.cover);
                    // }

                    $scope.$watch('article.columns',function(newValue,oldValue, scope){
                        if (newValue){
                            $scope.isFree=true;
                            console.log($scope.isFree);
                        }
                    });

                    // 是否为专题
                        if (o.isTopic == 0){
                            $scope.topic = false;
                        }else{
                            $scope.topic = true;
                        }

                    // 是否为免费
                        if (o.freeRead == 0){
                            $scope.price = false;
                        }else{
                            $scope.price = true;
                        }
                    // 文章编辑检查
                     function updateCheck(publish) {
                         if (!$scope.article.title || $scope.article.title.length == 0) {
                             Alert.alert("标题不能为空", true);
                             return;
                         }
                         $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                         var previewImg = [];
                         angular.forEach($scope.previewImg, function (r) {
                             if (r.tp == 0 && previewImg.length < 1) {
                                 previewImg.push(r);
                             }
                         });
                         if (previewImg.length == 0) {
                             Alert.alert("请设置文章头图", true);
                             return;
                         }
                         $scope.article.topImage = previewImg[0];
                         $scope.article.resource = $scope.resources;
                         $scope.article.column ={
                             id:$scope.article.columns
                         };
                         $scope.article.activityIds = $scope.linkActivityIds;
                         $scope.article.goodsIds = $scope.linkGoodsIds;
                         $scope.article.liveIds = $scope.linkLiveIds;

                         $scope.article.geo = $rootScope.geo;
                         $scope.article.type = Number($scope.article.type);
                         // $scope.article.ct = parseDate($scope.startDate);
                         $scope.article.pt = parseDate($scope.publishDate);
                         $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                         $scope.article.needPush = parseInt($scope.article.needPushString);
                         $scope.article.publish = publish ? 1 : 0;
                         $log.info("article:", $scope.article);
                         if (!validateArticle()) {
                             return;
                         }
                         if($scope.article.tags  instanceof Array){
                             var newTags = $scope.article.tags;

                         }else{
                             var tags = $scope.article.tags.replace('，', ',').split(',');
                             var newTags = [];
                             angular.forEach(tags, function (r) {
                                 newTags.push(r.trim());
                             });
                         }
                         $scope.article.tags = newTags;

                     }

                    $scope.update = function (publish) {
                        $log.info("update article");
                        // updateCheck(publish);

                        if (!$scope.article.title || $scope.article.title.length == 0) {
                            Alert.alert("标题不能为空", true);
                            return;
                        }
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });
                        if (previewImg.length == 0) {
                            Alert.alert("请设置文章头图", true);
                            return;
                        }
                        $scope.article.topImage = previewImg[0];
                        $scope.article.resource = $scope.resources;
                        $scope.article.column ={
                            id:$scope.article.columns
                        };

                        if (!$scope.article.columns) {
                            $scope.article.freeRead = 1;
                        }

                        $scope.article.activityIds = $scope.linkActivityIds;
                        $scope.article.goodsIds = $scope.linkGoodsIds;
                        $scope.article.liveIds = $scope.linkLiveIds;

                        $scope.article.geo = $rootScope.geo;
                        $scope.article.type = Number($scope.article.type);
                        // $scope.article.ct = parseDate($scope.startDate);
                        $scope.article.pt = parseDate($scope.publishDate);
                        $scope.article.autoPublish = parseInt($scope.article.autoPublishString);
                        $scope.article.needPush = parseInt($scope.article.needPushString);
                        $scope.article.publish = publish ? 1 : 0;
                        $log.info("article:", $scope.article);
                        if (!validateArticle()) {
                            return;
                        }
                        if($scope.article.tags  instanceof Array){
                            var newTags = $scope.article.tags;

                        }else{
                            var tags = $scope.article.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.article.tags = newTags;

                        var editCheck = function () {
                            $scope.uploading = true;
                            console.log($scope.article);
                            Article.update({id: o.id}, $scope.article, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.articlelist.show = true;
                                    $scope.uploading = false;
                                    //refresh($scope.grid.page);
                                    document.location.reload(true);

                                });
                            }, function (res) {
                                // $scope.updating = true;
                                $scope.uploading = false;
                                $log.info(res.data);
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        editCheck();
                    };

                    // 文章编辑好预览
                    $scope.updatePreview = function (publish){
                       updateCheck(publish);
                        var createCheck = function () {
                            $scope.uploading = true;
                            Article.save($scope.article, function (data) {
                                $scope.uploading =false;
                                var o = data;
                                $modal.open({
                                    templateUrl: 'partials/article/article_view.html',
                                    controller: function ($scope, $modalInstance, article) {
                                        $scope.article = article;
                                        $scope.wordsd = article.sensitive.join('|');
                                        SensitiveReplaceService.replaceArticle(article);
                                        $scope.ok = function () {
                                            $modalInstance.close();
                                        };
                                    },
                                    resolve: {
                                        article: function () {
                                            return Article.get({id: o.id}).$promise;
                                        }
                                    }
                                });
                            }, function (res) {
                                // $scope.updating = true;
                                $scope.uploading = false;
                                $log.info(res.data);
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        createCheck();

                    };


                    $scope.cancel = function () {
                        $scope.create.show = false;
                        $scope.articlelist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.listRecommendComment = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                Article.get({id: n.id}, function (o) {
                    $log.info("recommend comment:", o);
                    $scope.article = o;

                    $scope.commentIds = [];
                    angular.forEach(o.comments, function (c) {
                        $scope.commentIds.push(c.id);
                    });

                    $scope.listRecommendComment.show = true;
                    $scope.cancel = function () {
                        $scope.listRecommendComment.show = false;
                        $scope.articlelist.show = true;
                    };
                });
            };

            $scope.removeRecommendComment = function (comment) {
                ConfirmService.confirm('确定要取消此精华评论吗?').then(function () {
                    Article.removeRecommendComment.get({id: $scope.article.id}, {ids: [comment.id]}, function (o) {
                        $scope.article = o;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del article:", o);
                ConfirmService.confirm('确定要删除此文章吗?').then(function () {
                    Article.remove({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view article:", o);
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;
                       console.log(article);
                        $scope.wordsd = article.sensitive.join('|');
                        SensitiveReplaceService.replaceArticle(article);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish article:", o);
                ConfirmService.confirm('确定要发布此文章吗?').then(function () {
                    Article.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到feed流吗?').then(function () {
                    Recommend.update({article:{id: o.id},type:1,image:o.cover,title:o.title}, function () {
                        o.recommended = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.recommendBanner = function (idx) {
                var o = $scope.data.data[idx];
                var id = [];
                     id.push(o.id);
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到banner吗?').then(function () {
                    Article.batch.get({}, {'ids':id}, function () {
                        o.recommendedBanner = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };


            $scope.cancelRecommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("cancel recommend article:", o);
                ConfirmService.confirm('确定要取消推荐此文章吗?').then(function () {
                    Recommend.remove({id: o.id}, function () {
                        o.recommended = 0;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };


            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit article:", o);
                $modal.open({
                    templateUrl: 'partials/article/article_audit.html',
                    controller: function ($scope, $modalInstance, article, page) {
                        $scope.article = article;
                        article.auditInfo = '通过';

                        $scope.article.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.article.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.article.statusd),
                                'auditInfo': $scope.article.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit article...:", o);
                            Article.check.get({id: article.id}, function (res) {
                                if (res.words.length != 0 && $scope.article.statusd == 1) {
                                    ConfirmService.confirm('文章含有敏感词，确定提交吗?').then(function () {
                                        auditCheck();
                                    });
                                } else {
                                    auditCheck();
                                }
                            }, function (res) {
                                Alert.alert('操作失败' + res.data, true);
                            });
                            var auditCheck = function () {
                                Article.audit.commit({id: article.id}, postData, function () {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            }
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }

        }])
    .controller('DeletedArticleCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Article', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Article, VALID) {
            $scope.data = data;
            console.log("cascas");
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
                var d = Article.get(SPEC, function () {
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
                $log.info("view article:", o);
                console.log("cavcqwvq");
                $modal.open({
                    templateUrl: 'partials/article/article_view.html',
                    controller: function ($scope, $modalInstance, article) {
                        $scope.article = article;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        article: function () {
                            return Article.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover article:", o);
                ConfirmService.confirm('确定要恢复此文章吗?').then(function () {
                    Article.recover.commit({id: o.id}, function () {
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
