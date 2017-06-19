'use strict';

/* Controllers */

angular.module('myApp.activitycontrollers', ['ui.bootstrap'])
    .controller('ActivityCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'DateFormatter', 'CONFIG', 'Activity', 'Order', 'data', 'defaultHint', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'UserSingleSelectService', 'SensitiveReplaceService', 'ActivitySelectService', 'Resource', '$rootScope', 'FileUploader', "category",'categoryextend','brandclass','token', 'VALID','User','Recommend',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, DateFormatter, CONFIG, Activity, Order, data, defaultHint, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, UserSingleSelectService, SensitiveReplaceService, ActivitySelectService, Resource, $rootScope, FileUploader, category,categoryextend,brandclass, token, VALID,User,Recommend) {
            $scope.statusList = [
                {"id": "0", "name": "未发布的活动"},
                {"id": "1", "name": "已发布的活动"}
            ];

            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            $scope.activitylist = {
                show: true
            };
            $scope.recommended=false;
            $scope.category = category.data;
            $scope.categoryextend = categoryextend.data;
            $scope.brandClass = brandclass.data;

            $rootScope.isEditingActivity = false;

            function processActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var st = new Date(activity.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    activity._start_date = year + '.' + month + '.' + date;
                    activity.exportUrl = '/portal/activity/' + activity.id + '/order/export';
                });
            }

            processActivities(data);

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Activity.get(SPEC, function () {
                    processActivities(data);
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

            $scope.showCmt = function (idx, showOp) {
                var parentScope = $scope;
                var o = $scope.data.data[idx];
                $modal.open({
                    templateUrl: 'partials/activity/activity_cmt.html',
                    controller: function ($scope, $modalInstance, cmt, user) {
                        $scope.cmt = cmt;
                        $scope.grid = {
                            page: 1
                        };

                        $scope.commentIds = [];
                        angular.forEach(parentScope.activity.comments, function (c) {
                            $scope.commentIds.push(c.id);
                        });

                        $scope.showCommentOp = showOp;

                        var refresh = function (page) {
                            var SPEC = {id: user.id, page: page, size: CONFIG.less};
                            if ($scope.grid.q) {
                                SPEC.q = $scope.grid.q;
                            }

                            var d = Activity.cmt.get(SPEC, function () {
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
                            $log.info("recommend activity comment:", o);
                            ConfirmService.confirm('确定要将此评论标记为精华吗?').then(function () {
                                Activity.recommendComment.get({id: parentScope.activity.id}, {ids: [comment.id]}, function (o) {
                                    parentScope.activity = o;
                                    $scope.commentIds = [];
                                    angular.forEach(o.comments, function (c) {
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
                            return Activity.cmt.get({'id': o.id, page: 1, size: CONFIG.less}).$promise;
                        },
                        user: function () {
                            return o;
                        }
                    }
                });
            };

            // // 是否为精品活动
            // $scope.boutique = false;
            // $scope.selectBoutique = function () {
            //     if (!$scope.boutique){
            //         $scope.boutique = true;
            //         $scope.activity.isboutique = 1;
            //     }else{
            //         $scope.boutique = false;
            //         $scope.activity.isboutique = 0;
            //     }
            // }

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.linkActivity = [];
            $scope.linkActivityIds = [];
            $scope.previewImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.linkActivity = [];
                $scope.linkActivityIds = [];
                $scope.previewImg = [];
                $scope.activity = {'resource': [], 'tp': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingActivity = false;
                clearData();
            };


            $rootScope.geo = {};

            $scope.map = function () {
                $modal.open({
                    templateUrl: 'partials/activity/activity_map.html',
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
                            });
                        });
                    }
                });
            };


            $scope.name={
                author_name:''
            };
            $scope.results = false;
            $scope.myKeyup = function () {
                var kw = $scope.name.author_name;
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
                    console.log($scope.authors);

                });
                $scope.getAuthor=function (index) {
                    $scope.activity.user = $scope.authors[index].id;
                    $scope.name.author_name = $scope.authors[index].nick;
                    $scope.results = false;
                }

            }



            $scope.selectTopImage = function () {
                ImageSelectService.open(CONFIG.topImageMinWidth, CONFIG.topImageMinHeight).then(function (o) {
                    if (!o) {
                        return;
                    }

                    $scope.previewImg.push(o);
                });
            };

            // datepicker begin
            $scope.hstep = 1;
            $scope.mstep = 5;
            $scope.dateFormat = "yyyy-MM-dd";

            $scope.startDate = newDate();
            $scope.openStartDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startDate.opened = true;
            };

            $scope.endDate = newDate();
            $scope.openEndDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.endDate.opened = true;
            };

            $scope.deadlineDate = newDate();
            $scope.openDeadlineDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.deadlineDate.opened = true;
            };

            $scope.createDate = newDate();
            $scope.openCreateDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.createDate.opened = true;
            };

            $scope.publishDate = newDate();
            $scope.openPublishDatePicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.publishDate.opened = true;
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
            };

            $scope.removePreviewImg = function (resource) {
                $log.info("remove resource:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
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

            $scope.selectActivity = function () {
                var ids = $scope.linkActivityIds;
                $scope.activitySelecting = true;
                ActivitySelectService.open(ids, 2, $scope.activity.id).then(function (selected) {
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

            $scope.formatActivityDate = function (ts) {
                return DateFormatter.formatActivityDate(ts);
            };

            $scope.publishTypes = [
                {"id": "0", "name": "手工发布"},
                {"id": "1", "name": "定时发布"}
            ];

            $scope.pushSetting = [
                {"id": "0", "name": "不发送推送消息"},
                {"id": "1", "name": "发送推送消息"}
            ];

            $scope.stripFormat = ResourceTranslator.stripFormat;
            $scope.create = function () {
                $log.info("create activity");
                $rootScope.isEditingActivity = true;
                $scope.create.show = true;
                $scope.activity = {
                    'resource': [], tags: '', autoPublishString: '0', needPushString: '0', items: [],
                    hint: defaultHint.txt
                };
                $rootScope.geo = {};
                $rootScope.address = "";
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                var names = '';
                var ids = [];

                $scope.activityContent = '';

                $scope.startDate = newDate();
                $scope.endDate = newDate();
                $scope.createDate = newDate();
                $scope.deadlineDate = newDate();
                $scope.publishDate = newDate();
                $scope.someProperty = false;
                $scope.select = function () {
                    $scope.someProperty = true;
                }
                // 创建活动检查
                function check(publish) {
                    var activity = $scope.activity;
                    if (!activity.name || activity.name.length == 0) {
                        Alert.alert("活动名称不能为空", true);
                        return;
                    }

                    if (!$rootScope.address || $rootScope.address.length == 0) {
                        Alert.alert("必须设置活动位置", true);
                        return;
                    }

                    if (activity.items.length == 0) {
                        Alert.alert("请添加活动项目", true);
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
                        Alert.alert("请设置活动头图", true);
                        return;
                    }

                    activity.resource = $scope.resources;
                    activity.topImage = previewImg[0];
                    // if (bannerImg.length > 0) {
                    //     activity.bannerImage = bannerImg[0];
                    // }
                    // activity.cover = coverImg[0];
                    $scope.activity.activityIds = $scope.linkActivityIds;

                    activity.maxAttendees = Number(activity.maxAttendees);
                    angular.forEach(activity.items, function (item) {
                        item.price = Number(item.price);
                    });

                    activity.st = parseDate($scope.startDate);
                    activity.et = parseDate($scope.endDate);
                    activity.dt = parseDate($scope.deadlineDate);
                    activity.ct = parseDate($scope.createDate);
                    activity.pt = parseDate($scope.publishDate);
                    activity.publish = publish ? 1 : 0;
                    activity.needPush = parseInt(activity.needPushString);

                    activity.geo = $rootScope.geo;
                    if($scope.activity.tags  instanceof Array){
                        var newTags = $scope.activity.tags;

                    }else{
                        var tags = activity.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    activity.tags = newTags;

                    $log.info("activity:", activity);
                }
                $scope.save = function (publish) {
                    $log.info("save activity");
                    // check(publish);

                    var activity = $scope.activity;
                    if (!activity.name || activity.name.length == 0) {
                        Alert.alert("活动名称不能为空", true);
                        return;
                    }

                    if (!$rootScope.address || $rootScope.address.length == 0) {
                        Alert.alert("必须设置活动位置", true);
                        return;
                    }

                    if (activity.items.length == 0) {
                        Alert.alert("请添加活动项目", true);
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
                        Alert.alert("请设置活动头图", true);
                        return;
                    }

                    activity.resource = $scope.resources;
                    activity.topImage = previewImg[0];
                    angular.forEach($scope.brandClass,function (n) {
                        if (n.id==$scope.activity.brandClass){
                            $scope.activity.brandClass = n
                        }

                    })

                    $scope.activity.activityIds = $scope.linkActivityIds;

                    activity.maxAttendees = Number(activity.maxAttendees);
                    angular.forEach(activity.items, function (item) {
                        item.price = Number(item.price);
                    });

                    activity.st = parseDate($scope.startDate);
                    activity.et = parseDate($scope.endDate);
                    activity.dt = parseDate($scope.deadlineDate);
                    activity.ct = parseDate($scope.createDate);
                    activity.pt = parseDate($scope.publishDate);
                    activity.publish = publish ? 1 : 0;
                    activity.needPush = parseInt(activity.needPushString);

                    activity.geo = $rootScope.geo;
                    if($scope.activity.tags  instanceof Array){
                        var newTags = $scope.activity.tags;

                    }else{
                        var tags = activity.tags.replace('，', ',').split(',');
                        var newTags = [];
                        angular.forEach(tags, function (r) {
                            newTags.push(r.trim());
                        });
                    }
                    activity.tags = newTags;

                    $log.info("activity:", activity);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Activity.save($scope.activity, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.activitylist.show = true;
                                $scope.uploading = false;
                                refresh($scope.grid.page);
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();
                };

                // 活动编辑好预览
                $scope.preview = function (publish) {
                    check(publish);
                    var createCheck = function () {
                        $scope.uploading = true;
                        Activity.save($scope.activity, function (data) {
                            $scope.uploading =false;
                            var o = data;
                            $modal.open({
                                templateUrl: 'partials/activity/activity_view.html',
                                controller: function ($scope, $modalInstance, activity) {
                                    $scope.activity = activity;
                                    $scope.wordsd = activity.sensitive.join('|');
                                    SensitiveReplaceService.replaceActivity(activity);
                                    $scope.ok = function () {
                                        $modalInstance.close();
                                    };
                                },
                                resolve: {
                                    activity: function () {
                                        return Activity.get({id: o.id}).$promise;
                                    }
                                }
                            });
                        }, function (res) {
                            $scope.updating = true;
                            $scope.uploading = false;
                            $log.info(res.data);
                            Alert.alert("操作失败：" + res.data, true);
                        });
                    };
                    createCheck();

                };


                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.activitylist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };


            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Activity.get({id: n.id}, function (o) {
                    $log.info("edit activity:", o);
                    $rootScope.geo = o.geo;
                    $rootScope.isEditingActivity = true;
                    $scope.activity = o;

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;
                    o.category = o.category.id;
                    if (o.brandClass){
                        o.brandClass = o.brandClass.id;
                    }
                    if (o.categoryextend){
                        o.categoryextend = o.categoryextend.id;
                    }
                    console.log(o.category);
                    $scope.editorActivityContent = ResourceTranslator.toHtml(o.resource);

                    SensitiveReplaceService.replaceActivity(o);

                    $log.log('init:' + o.st);
                    $scope.startDate = fromTimestamp(o.st);
                    $scope.endDate = fromTimestamp(o.et);
                    $scope.deadlineDate = fromTimestamp(o.dt);
                    $scope.createDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    $scope.edit.show = true;

                    $scope.activity.autoPublishString = '' + $scope.activity.autoPublish;
                    $scope.activity.needPushString = '' + $scope.activity.needPush;

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
                    angular.forEach($scope.activity.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                    });

                    $scope.resources = o.resource;
                    $scope.linkActivity = o.activities;
                    $scope.previewImg = [o.topImage];

                    o.maxAttendees = Number(o.maxAttendees);
                    o.price = Number(o.price);

                    o.st = parseDate($scope.startDate);
                    o.et = parseDate($scope.endDate);
                    o.dt = parseDate($scope.deadlineDate);
                    o.ct = parseDate($scope.createDate);

                    $scope.linkActivityIds = [];
                    angular.forEach($scope.linkActivity, function (o) {
                        $scope.linkActivityIds.push(o.id);
                    });

                    // // 是否为精品活动
                    // if (o.isboutique == 0){
                    //     $scope.boutique = false;
                    // }else{
                    //     $scope.boutique = true;
                    // }
                    // 编辑活动检查
                    function Check(publish) {
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var activity = $scope.activity;

                        if (!activity.name || activity.name.length == 0) {
                            Alert.alert("活动名称不能为空", true);
                            return;
                        }

                        if (!$rootScope.address || $rootScope.address.length == 0) {
                            Alert.alert("必须设置活动位置", true);
                            return;
                        }

                        if (activity.items.length == 0) {
                            Alert.alert("请添加活动项目", true);
                            return;
                        }

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置活动头图", true);
                            return;
                        }
                        $scope.activity.resource = $scope.resources;
                        $scope.activity.topImage = previewImg[0];
                        // if (bannerImg.length > 0) {
                        //     $scope.activity.bannerImage = bannerImg[0];
                        // }
                        // $scope.activity.cover = coverImg[0];
                        $scope.activity.activityIds = $scope.linkActivityIds;

                        $scope.activity.maxAttendees = Number($scope.activity.maxAttendees);

                        angular.forEach(activity.items, function (item) {
                            item.price = Number(item.price);
                        });

                        $scope.activity.st = parseDate($scope.startDate);
                        // $log.log('update st: ' + $scope.activity.st);
                        $scope.activity.et = parseDate($scope.endDate);
                        $scope.activity.dt = parseDate($scope.deadlineDate);
                        $scope.activity.ct = parseDate($scope.createDate);
                        $scope.activity.pt = parseDate($scope.publishDate);
                        $scope.activity.publish = publish ? 1 : 0;

                        $scope.activity.needPush = parseInt($scope.activity.needPushString);

                        $scope.activity.geo = $rootScope.geo;

                        if($scope.activity.tags  instanceof Array){
                            var newTags = $scope.activity.tags;

                        }else{
                            var tags = $scope.activity.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.activity.tags = newTags;

                        $log.info("activity:", $scope.activity);

                    }
                    $scope.update = function (publish) {
                        $log.info("update activity");
                        // Check(publish);

                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var activity = $scope.activity;

                        if (!activity.name || activity.name.length == 0) {
                            Alert.alert("活动名称不能为空", true);
                            return;
                        }

                        if (!$rootScope.address || $rootScope.address.length == 0) {
                            Alert.alert("必须设置活动位置", true);
                            return;
                        }

                        if (activity.items.length == 0) {
                            Alert.alert("请添加活动项目", true);
                            return;
                        }

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置活动头图", true);
                            return;
                        }
                        $scope.activity.resource = $scope.resources;
                        $scope.activity.topImage = previewImg[0];
                        angular.forEach($scope.brandClass,function (n) {
                            if (n.id==$scope.activity.brandClass){
                                $scope.activity.brandClass = n
                            }

                        })
                        // if (bannerImg.length > 0) {
                        //     $scope.activity.bannerImage = bannerImg[0];
                        // }
                        // $scope.activity.cover = coverImg[0];
                        $scope.activity.activityIds = $scope.linkActivityIds;

                        $scope.activity.maxAttendees = Number($scope.activity.maxAttendees);

                        angular.forEach(activity.items, function (item) {
                            item.price = Number(item.price);
                        });

                        $scope.activity.st = parseDate($scope.startDate);
                        // $log.log('update st: ' + $scope.activity.st);
                        $scope.activity.et = parseDate($scope.endDate);
                        $scope.activity.dt = parseDate($scope.deadlineDate);
                        $scope.activity.ct = parseDate($scope.createDate);
                        $scope.activity.pt = parseDate($scope.publishDate);
                        $scope.activity.publish = publish ? 1 : 0;

                        $scope.activity.needPush = parseInt($scope.activity.needPushString);

                        $scope.activity.geo = $rootScope.geo;

                        if($scope.activity.tags  instanceof Array){
                            var newTags = $scope.activity.tags;

                        }else{
                            var tags = $scope.activity.tags.replace('，', ',').split(',');
                            var newTags = [];
                            angular.forEach(tags, function (r) {
                                newTags.push(r.trim());
                            });
                        }
                        $scope.activity.tags = newTags;

                        $log.info("activity:", $scope.activity);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Activity.update({id: o.id}, $scope.activity, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.activitylist.show = true;
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

                    // 活动编辑好预览
                    $scope.updatePreview = function (publish) {
                        Check(publish);
                        var createCheck = function () {
                            $scope.uploading = true;
                            Activity.save($scope.activity, function (data) {
                                $scope.uploading =false;
                                var o = data;
                                $modal.open({
                                    templateUrl: 'partials/activity/activity_view.html',
                                    controller: function ($scope, $modalInstance, activity) {
                                        $scope.activity = activity;
                                        $scope.wordsd = activity.sensitive.join('|');
                                        SensitiveReplaceService.replaceActivity(activity);
                                        $scope.ok = function () {
                                            $modalInstance.close();
                                        };
                                    },
                                    resolve: {
                                        activity: function () {
                                            return Activity.get({id: o.id}).$promise;
                                        }
                                    }
                                });
                            }, function (res) {
                                $scope.updating = true;
                                $scope.uploading = false;
                                $log.info(res.data);
                                Alert.alert("操作失败：" + res.data, true);
                            });
                        };
                        createCheck();

                    };

                    $scope.cancel = function () {
                        $scope.create.show = false;
                        $scope.activitylist.show = true;
                        $scope.uploading = false;

                        clearData();
                    };

                });
            };

            $scope.listRecommendComment = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                Activity.get({id: n.id}, function (o) {
                    $log.info("recommend comment:", o);
                    $scope.activity = o;

                    $scope.commentIds = [];
                    angular.forEach(o.comments, function (c) {
                        $scope.commentIds.push(c.id);
                    });

                    $scope.listRecommendComment.show = true;
                    $scope.cancel = function () {
                        $scope.listRecommendComment.show = false;
                        $scope.activitylist.show = true;
                    };
                });
            };

            $scope.removeRecommendComment = function (comment) {
                ConfirmService.confirm('确定要取消此精华评论吗?').then(function () {
                    Activity.removeRecommendComment.get({id: $scope.activity.id}, {ids: [comment.id]}, function (o) {
                        $scope.activity = o;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.listOrders = function (idx, name) {
                $scope.kid = name;
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;
                $scope.currentGid = n.id;

                $scope.orderGrid = {page: 1};
                $scope.orders = {};

                $scope.orderStatusList = [
                    {"id": "0", "name": "待支付的订单"},
                    {"id": "1", "name": "已取消的订单"},
                    {"id": "2", "name": "已支付的订单"}
                ];

                var refresh = function (page) {
                    $scope.exportUrl = '/portal/activity/' + n.id + '/order/export';
                    var SPEC = {gid: n.id, type: 1, page: page, size: 20, valid: VALID.TRUE};
                    if ($scope.orderGrid.status) {
                        SPEC.status = $scope.orderGrid.status;
                        $scope.exportUrl += '?status=' + SPEC.status;
                    }
                    if ($scope.orderGrid.name) {
                        SPEC.q = $scope.orderGrid.name;
                    }
                    var d = Order.get(SPEC, function () {
                        $scope.orders = d;
                    });
                };

                refresh(1);

                $scope.search = function () {
                    refresh($scope.orderGrid.page);
                };

                var orderPageWatch = $scope.$watch('orderGrid.page', function (newVal, oldVal) {
                    if (newVal != oldVal) {
                        refresh(newVal);
                    }
                });

                $scope.listOrders.show = true;
                $scope.cancel = function () {
                    $scope.listOrders.show = false;
                    $scope.activitylist.show = true;
                    orderPageWatch();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del activity:", o);
                ConfirmService.confirm('确定要删除活动 [ ' + o.name + ' ] ?').then(function () {
                    Activity.remove({id: o.id}, function () {
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
            $scope.recommend = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到feed流吗?').then(function () {
                    Recommend.update({activity:{id: o.id},type:0,image:o.cover,title:o.name}, function () {
                        $scope.recommended = true;
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
            $scope.recommendBanner = function (idx) {
                var o = $scope.data.data[idx];
                var id = [];
                id.push(o.id);
                $log.info("recommend article:", o);
                ConfirmService.confirm('确定要推荐此文章到banner吗?').then(function () {
                    Activity.batch.get({}, {'ids':id}, function () {
                        o.recommendedBanner = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.view = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("view activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.wordsd = activity.sensitive.join('|');
                        SensitiveReplaceService.replaceActivity(activity);

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish activity:", o);
                ConfirmService.confirm('确定要发布此活动吗?').then(function () {
                    Activity.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_audit.html',
                    controller: function ($scope, $modalInstance, activity, page) {
                        $scope.activity = activity;
                        activity.auditInfo = '通过';

                        $scope.activity.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.activity.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.activity.statusd),
                                'auditInfo': $scope.activity.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit activity...:", o);
                            Activity.check.get({id: activity.id}, function (res) {
                                $log.info('length', res.words.length);
                                if (res.words.length != 0 && $scope.activity.statusd == 1) {
                                    ConfirmService.confirm('活动含有敏感词，确定提交吗?').then(function () {
                                        auditCheck();
                                    });
                                } else {
                                    auditCheck();
                                }
                            }, function (res) {
                                Alert.alert('操作失败' + res.data, true);
                            });
                            var auditCheck = function () {
                                Activity.audit.commit({id: activity.id}, postData, function () {
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
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            };

            $scope.removeItem = function (idx) {
                if (!$scope.activity) {
                    return;
                }

                if ($scope.activity.items.length <= idx) {
                    return;
                }

                $scope.activity.items.splice(idx, 1);
            };

            $scope.editItem = function (idx) {
                var activity = $scope.activity;
                if (!$scope.activity.items) {
                    $scope.activity.items = [];
                }

                $modal.open({
                    templateUrl: 'partials/activity/activity_item.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.hstep = 1;
                        $scope.mstep = 5;
                        $scope.dateFormat = "yyyy-MM-dd";

                        $scope.openStartDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.startDate.opened = true;
                        };


                        $scope.openEndDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.endDate.opened = true;
                        };

                        $scope.openDeadlineDatePicker = function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            $scope.deadlineDate.opened = true;
                        };
                        var item;
                        var creating = false;

                        if (idx === undefined) {
                            item = {title: '', price: 0.0};
                            creating = true;
                            $scope.startDate = newDate();
                            $scope.endDate = newDate();
                            $scope.deadlineDate = newDate();
                        } else {
                            var oItem = activity.items[idx];
                            $scope.startDate = fromTimestamp(oItem.st);
                            $scope.endDate = fromTimestamp(oItem.et);
                            $scope.deadlineDate = fromTimestamp(oItem.dt);

                            item = {title: oItem.title, price: oItem.price,maxAttendees:oItem.maxAttendees}
                        }

                        $scope.currentItem = item;
                        $scope.ok = function () {
                            $modalInstance.close();
                            if (creating) {
                                item.st = parseDate($scope.startDate);
                                item.et = parseDate($scope.endDate);
                                item.dt = parseDate($scope.deadlineDate);
                                activity.items.push(item);
                            } else {
                                activity.items[idx].title = item.title;
                                activity.items[idx].price = item.price;
                                activity.items[idx].maxAttendees = item.maxAttendees;
                                activity.items[idx].st = parseDate($scope.startDate);
                                activity.items[idx].et = parseDate($scope.endDate);
                                activity.items[idx].dt = parseDate($scope.deadlineDate);
                            }
                        };

                        $scope.cancel = function () {
                            $modalInstance.close();
                        };

                    }
                });
            }

        }])
    .controller('DeletedActivityCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Activity', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Activity, VALID) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.FALSE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Activity.get(SPEC, function () {
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
                $log.info("view activity:", o);
                $modal.open({
                    templateUrl: 'partials/activity/activity_view.html',
                    controller: function ($scope, $modalInstance, activity) {
                        $scope.activity = activity;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        activity: function () {
                            return Activity.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover activity:", o);
                ConfirmService.confirm('确定要恢复此活动吗?').then(function () {
                    Activity.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }]).controller('RecommendActivityCtrl', ['$scope', '$log', 'Alert', 'ConfirmService', 'ActivitySelectService', 'Activity', '$modal', 'data', 'Author', 'CONFIG',
    function ($scope, $log, Alert, ConfirmService, ActivitySelectService, Activity, $modal, data, Author, CONFIG) {
        $scope.data = data;

        $scope.del = function (idx) {
            var u = $scope.data[idx];
            $log.info("cancel recommend activity:", u);
            ConfirmService.confirm('确定要取消推荐此活动吗?').then(function () {
                Activity.recommendRemove.get({}, {ids: [u.id]}, function () {
                    $scope.data.splice(idx, 1);
                    $scope.data.total--;
                    $scope.data.size--;
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res.data, true);
                });
            });
        };

        $scope.selectActivity = function () {
            $scope.activitySelecting = true;

            var ids = [];
            angular.forEach($scope.data, function (r) {
                ids.push(r.id);
            });

            ActivitySelectService.open(ids, 100).then(function (selected) {
                $scope.activitySelecting = false;
                if (selected) {
                    Activity.recommendAdd.get({}, {ids: selected}, function () {
                        Activity.recommend.query(function (data) {
                            $scope.data = data;
                        });
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                }
            }, function () {
                $scope.activitySelecting = false;
            });
        };
    }
])
    .controller('ActivityHintCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, data, Activity) {
            $scope.data = data;
            $scope.save = function (name, val) {
                var SPEC = {"key": name, "val": val};
                Activity.hint.update(SPEC, function () {
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res, true);
                })
            };
        }])
    .controller('ActivityVerifyOrderCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'activities', 'vcodes', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, activities, vcodes, Activity) {
            $scope.activities = activities;
            $scope.vcodes = vcodes;

            $scope.code = '';

            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            };

            function refreshTodayActivities() {
                Activity.today.query({}, function (data) {
                    $scope.activities = data;
                });
            }

            function refreshVCodes() {
                Activity.vcode.query({}, function (data) {
                    $scope.vcodes = data;
                });
            }

            $scope.verifyCode = function () {
                $scope.code = $scope.code.trim();
                if (!$scope.code) {
                    return;
                }
                Activity.vcode.update({vcode: $scope.code}, function (data) {
                    $scope.code = "";
                    Alert.alert("操作成功");
                    refreshTodayActivities();
                    refreshVCodes();
                }, function (res) {
                    Alert.alert("操作失败：" + res.data, true);
                })
            };

        }])
    .controller('ActivityBillCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'me', 'CONFIG', 'bills', 'comingActivities', 'oldActivities', 'Activity',
        function ($scope, $stateParams, $log, Alert, ConfirmService, me, CONFIG, bills, comingActivities, oldActivities, Activity) {
            $scope.bills = bills;
            $scope.comingActivities = comingActivities;
            $scope.oldActivities = oldActivities;

            function processBills(bills) {
                angular.forEach(bills.data, function (bill) {
                    bill.exportUrl = '/portal/activity/bill/' + bill.id + '/export';
                });
            }

            function processComingActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var dayMillis = 1000 * 24 * 3600;
                    var dt = activity.dt % dayMillis * dayMillis;
                    var now = new Date().getUTCMilliseconds() % dayMillis * dayMillis;
                    activity._rdays = Math.max((now - dt) / dayMillis, 1);
                });
            }

            function processOldActivities(activities) {
                angular.forEach(activities.data, function (activity) {
                    var st = new Date(activity.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    activity._start_date = year + '.' + month + '.' + date;
                });
            }

            processBills(bills);
            processComingActivities(comingActivities);
            processOldActivities(oldActivities);

            if (me.bankCard.length >= 4) {
                $scope.bankCardSuffix = me.bankCard.substr(me.bankCard.length - 4, 4);
            } else {
                $scope.bankCardSuffix = '';
            }

            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            };

            $scope.billGrid = {
                page: 1
            };

            var refreshBills = function (page) {
                var SPEC = {page: page, size: 5};
                Activity.bill.get(SPEC, function (data) {
                    $scope.bills = data;
                    processBills(data);
                });

            };

            $scope.$watch('billGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshBills(newVal);
                }
            });

            $scope.comingGrid = {
                page: 1
            };

            var refreshComingActivities = function (page) {
                var SPEC = {page: page, size: 10};
                Activity.coming.get(SPEC, function (data) {
                    $scope.comingActivities = data;
                    processComingActivities(data);
                });

            };

            $scope.$watch('comingGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshComingActivities(newVal);
                }
            });

            $scope.oldGrid = {
                page: 1
            };

            var refreshOldActivities = function (page) {
                var SPEC = {page: page, size: 10};
                Activity.old.get(SPEC, function (data) {
                    $scope.oldActivities = data;
                    processOldActivities(data);
                });

            };

            $scope.$watch('oldGrid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshOldActivities(newVal);
                }
            });


            $scope.updateStatus = function ($index) {
                var bill = $scope.bills.data[$index];

                ConfirmService.confirm('确定已经打款了吗?').then(function () {
                    Activity.updateBill.update({id: bill.id}, function (data) {
                        bill.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });

            };

        }]);
