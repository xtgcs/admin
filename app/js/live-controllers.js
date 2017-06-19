'use strict';

/* Controllers */

angular.module('myApp.livecontrollers', ['ui.bootstrap'])
    .controller('LiveCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'Live', 'Order', 'data','category', 'ResourceTranslator', 'ImageSelectService', 'ResourceSelectService', 'ResourceTextService', 'ResourceSingleSelectService', 'UserSingleSelectService', 'Resource', '$rootScope', 'FileUploader', 'token', 'VALID','User',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, Live, Order, data,category, ResourceTranslator, ImageSelectService, ResourceSelectService, ResourceTextService, ResourceSingleSelectService, UserSingleSelectService, Resource, $rootScope, FileUploader, token, VALID,User) {
            $scope.statusList = [
                {"id": "0", "name": "未发布的活动"},
                {"id": "1", "name": "已发布的活动"}
            ];

            $scope.data = data;
            $scope.category = category.data;
            $scope.grid = {
                page: 1
            };

            $scope.livelist = {
                show: true
            };

            $rootScope.isEditingLive = false;

            function processLives(lives) {
                angular.forEach(lives.data, function(live) {
                    var st = new Date(live.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    live._start_date = year + '.' + month + '.' + date;
                });
            }
            processLives(data);

            var refresh = function (page) {
                var SPEC = {page: page, size: 20, valid: VALID.TRUE};
                if ($scope.grid.status) {
                    SPEC.status = $scope.grid.status;
                }
                if ($scope.grid.name) {
                    SPEC.q = $scope.grid.name;
                }
                var d = Live.get(SPEC, function () {
                    $scope.data = d;
                    processLives(d);
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

            $scope.resources = [];
            $scope.resourceIds = [];
            $scope.previewImg = [];
            $scope.bannerImg = [];

            var clearData = function () {
                $log.info("clear data");
                $scope.resources = [];
                $scope.resourceIds = [];
                $scope.previewImg = [];
                $scope.bannerImg = [];
                $scope.live = {'resource': [], 'tp': 0};
            };

            $scope.clearData = function () {
                $rootScope.isEditingLive = false;
                clearData();
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

            // $scope.selectAuthor = function () {
            //     $scope.authorSelecting = true;
            //     UserSingleSelectService.open($scope.live.user, 1).then(function (selected) {
            //         $scope.authorSelecting = false;
            //         if (selected) {
            //             $scope.live.user = selected.id;
            //             $scope.author_name = selected.nick;
            //         }
            //     }, function () {
            //         $scope.authorSelecting = false;
            //     });
            // };

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
                    $scope.live.user = $scope.authors[index].id;
                    $scope.name.author_name = $scope.authors[index].nick;
                    $scope.results = false;
                }
            }

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
                $log.info("remove previewImg:", resource);
                angular.forEach($scope.previewImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.previewImg.splice($scope.previewImg.indexOf(resource), 1);
                    }
                });
            };

            $scope.removeBannerImg = function (resource) {
                $log.info("remove bannerImg:", resource);
                angular.forEach($scope.bannerImg, function (r) {
                    if (r.id === resource.id) {
                        $scope.bannerImg.splice($scope.bannerImg.indexOf(resource), 1);
                    }
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
                $log.info("create live");
                $rootScope.isEditingLive = true;
                $scope.create.show = true;
                $scope.live = {'resource': [], autoPublishString: '0', needPushString: '0'};
                $scope.keywordNames = "";
                $scope.keywordIds = [];
                $scope.keywordId = [];
                var names = '';
                var ids = [];

                $scope.liveContent = '';
                $scope.author_name = '';
                $scope.startDate = newDate();
                $scope.endDate = newDate();
                $scope.createDate = newDate();
                $scope.deadlineDate = newDate();
                $scope.publishDate = newDate();

                $scope.save = function () {
                    $log.info("save live");
                    var live = $scope.live;
                    if (!live.title || live.title.length == 0) {
                        Alert.alert("连线名称不能为空", true);
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
                        Alert.alert("请设置连线头图", true);
                        return;
                    }

                    var bannerImg = [];
                    angular.forEach($scope.bannerImg, function (r) {
                        if (r.tp == 0 && bannerImg.length < 1) {
                            bannerImg.push(r);
                        }
                    });

                    if (bannerImg.length == 0) {
                        Alert.alert("请设置连线banner图", true);
                        return;
                    }


                    live.resource = $scope.resources;
                    live.topImage = previewImg[0];
                    if (bannerImg.length > 0) {
                        live.bannerImage = bannerImg[0];
                    }
                    live.category = {
                        id:$scope.live.category
                    }
                    live.maxAttendees = Number(live.maxAttendees);
                    live.maxAskAttendees = Number(live.maxAskAttendees);
                    live.price = Number(live.price);

                    live.st = parseDate($scope.startDate);
                    live.et = parseDate($scope.endDate);
                    live.dt = parseDate($scope.deadlineDate);
                    live.ct = parseDate($scope.createDate);
                    live.pt = parseDate($scope.publishDate);
                    live.autoPublish = parseInt(live.autoPublishString);
                    live.needPush = parseInt(live.needPushString);

                    $log.info("live:", live);

                    var createCheck = function () {
                        $scope.uploading = true;
                        Live.save($scope.live, function () {
                            Alert.alert("操作成功").then(function () {
                                $scope.create.show = false;
                                $scope.livelist.show = true;
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

                $scope.cancel = function () {
                    $scope.create.show = false;
                    $scope.livelist.show = true;
                    $scope.uploading = false;

                    clearData();
                };
            };

            $scope.edit = function (idx) {
                var n = $scope.data.data[idx];
                Live.get({id: n.id}, function (o) {
                    $log.info("edit live:", o);
                    $rootScope.isEditingLive = true;
                    $scope.live = o;

                    $scope.name.author_name = o.user.nick;
                    o.user = o.user.id;
                    o.category = o.category.id;
                    $scope.editorLiveContent = ResourceTranslator.toHtml(o.resource);

                    $log.log('init:' + o.st);
                    $scope.startDate = fromTimestamp(o.st);
                    $scope.endDate = fromTimestamp(o.et);
                    $scope.deadlineDate = fromTimestamp(o.dt);
                    $scope.createDate = fromTimestamp(o.ct);
                    $scope.publishDate = fromTimestamp(o.pt);

                    $scope.edit.show = true;

                    $scope.live.autoPublishString = '' + $scope.live.autoPublish;
                    $scope.live.needPushString = '' + $scope.live.needPush;

                    //todo, who use resourceIds ??
                    $scope.resourceIds = [];
                    angular.forEach($scope.live.resource, function (o) {
                        $scope.resourceIds.push(o.id);
                    });

                    $scope.resources = o.resource;
                    $scope.previewImg = [o.topImage];
                    $scope.bannerImg = [o.bannerImage];

                    o.maxAttendees = Number(o.maxAttendees);
                    o.maxAskAttendees = Number(o.maxAskAttendees);
                    o.price = Number(o.price);

                    $scope.update = function () {
                        $log.info("update live");
                        $scope.resources = ResourceTranslator.fromHtml('#content-editor');

                        var previewImg = [];
                        angular.forEach($scope.previewImg, function (r) {
                            if (r.tp == 0 && previewImg.length < 1) {
                                previewImg.push(r);
                            }
                        });

                        if (previewImg.length == 0) {
                            Alert.alert("请设置连线头图", true);
                            return;
                        }

                        var bannerImg = [];
                        angular.forEach($scope.bannerImg, function (r) {
                            if (r.tp == 0 && bannerImg.length < 1) {
                                bannerImg.push(r);
                            }
                        });

                        if (bannerImg.length == 0) {
                            Alert.alert("请设置连线banner图", true);
                            return;
                        }

                        $scope.live.resource = $scope.resources;
                        $scope.live.topImage = previewImg[0];
                        if (bannerImg.length > 0) {
                            $scope.live.bannerImage = bannerImg[0];
                        }
                        $scope.live.category = {
                            id:$scope.live.category
                        };
                        $scope.live.maxAttendees = Number($scope.live.maxAttendees);
                        $scope.live.maxAskAttendees = Number($scope.live.maxAskAttendees);
                        $scope.live.price = Number($scope.live.price);

                        $scope.live.st = parseDate($scope.startDate);
                        $log.log('update st: ' + $scope.live.st);
                        $scope.live.et = parseDate($scope.endDate);
                        $scope.live.dt = parseDate($scope.deadlineDate);
                        $scope.live.ct = parseDate($scope.createDate);
                        $scope.live.pt = parseDate($scope.publishDate);
                        $scope.live.autoPublish = parseInt($scope.live.autoPublishString);
                        $scope.live.needPush = parseInt($scope.live.needPushString);

                        $log.info("live:", $scope.live);


                        var editCheck = function () {
                            $scope.uploading = true;
                            Live.update({id: o.id}, $scope.live, function () {
                                Alert.alert("操作成功").then(function () {
                                    $scope.create.show = false;
                                    $scope.livelist.show = true;
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
                        $scope.create.show = false;
                        $scope.livelist.show = true;
                        $scope.uploading = false;
                        $scope.edit.show = false;

                        clearData();
                    };

                });
            };

            $scope.listOrders = function (idx) {
                var n = $scope.data.data[idx];
                $scope.currentIndex = idx;

                $scope.orderGrid = {page: 1};
                $scope.orders = {};

                $scope.orderStatusList = [
                    {"id": "0", "name": "待支付的订单"},
                    {"id": "1", "name": "已取消的订单"},
                    {"id": "2", "name": "已支付的订单"}
                ];

                var refresh = function (page) {
                    // TODO: update type?
                    var SPEC = {gid: n.id, type: 2, page: page, size: 20, valid: VALID.TRUE};
                    if ($scope.orderGrid.status) {
                        SPEC.status = $scope.orderGrid.status;
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
                    $scope.livelist.show = true;
                    orderPageWatch();
                };
            };

            $scope.del = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("del live:", o);
                ConfirmService.confirm('确定要删除此连线吗?').then(function () {
                     Live.remove({id: o.id}, function () {
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
                $log.info("view live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_view.html',
                    controller: function ($scope, $modalInstance, live) {
                        $scope.live = live;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.publish = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("publish live:", o);
                ConfirmService.confirm('确定要发布此连线吗?').then(function () {
                    Live.publish.commit({id: o.id}, function () {
                        o.status = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.audit = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("audit live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_audit.html',
                    controller: function ($scope, $modalInstance, live, page) {
                        $scope.live = live;
                        live.auditInfo = '通过';

                        $scope.live.statusd = 1;
                        $scope.audit = function () {
                            if (!$scope.live.auditInfo) {
                                Alert.alert('必须设置审核意见', true);
                                return;
                            }
                            var postData = {
                                'status': Number($scope.live.statusd),
                                'auditInfo': $scope.live.auditInfo
                            };
                            $log.info("audit:", postData);
                            $log.info("audit live...:", o);

                            var auditCheck = function () {
                                Live.audit.commit({id: live.id}, postData, function () {
                                    Alert.alert('操作成功');
                                    refresh(page);
                                    $modalInstance.close();
                                }, function (res) {
                                    Alert.alert('操作失败:' + res, true);
                                });
                            }();
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        },
                        page: function () {
                            return $scope.grid.page;
                        }
                    }
                });
            }

        }])
    .controller('DeletedLiveCtrl', ['$scope', '$modal', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'Live', 'VALID',
        function ($scope, $modal, $log, Alert, ConfirmService, CONFIG, data, Live, VALID) {
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
                var d = Live.get(SPEC, function () {
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
                $log.info("view live:", o);
                $modal.open({
                    templateUrl: 'partials/live/live_view.html',
                    controller: function ($scope, $modalInstance, live) {
                        $scope.live = live;

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                    },
                    resolve: {
                        live: function () {
                            return Live.get({id: o.id}).$promise;
                        }
                    }
                });
            };

            $scope.recover = function (idx) {
                var o = $scope.data.data[idx];
                $log.info("recover live:", o);
                ConfirmService.confirm('确定要恢复此连线吗?').then(function () {
                     Live.recover.commit({id: o.id}, function () {
                        $scope.data.data.splice(idx, 1);
                        $scope.data.total--;
                        $scope.data.size--;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

        }])
    .controller('LiveBillCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'me', 'CONFIG', 'lives', 'Live',
        function ($scope, $stateParams, $log, Alert, ConfirmService, me, CONFIG, lives, Live) {
            $scope.lives = lives;
             console.log(lives);
            if (me.bankCard.length >= 4) {
                $scope.bankCardSuffix = me.bankCard.substr(me.bankCard.length - 4, 4);
            } else {
                $scope.bankCardSuffix = '';
            }

            $scope.grid = {
                page: 1
            };

            function processLives(lives) {
                angular.forEach(lives.data, function(live) {
                    var st = new Date(live.st);
                    var year = st.getFullYear();
                    var month = st.getMonth() + 1;
                    var date = st.getDate();
                    live._start_date = year + '.' + month + '.' + date;
                });
            }

            processLives(lives);

            var refreshLives = function (page) {
                var SPEC = {status:2, page: page, size: 5, valid:0};
                Live.get(SPEC, function (data){
                    $scope.lives = data;
                    processLives(data);
                });

            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshLives(newVal);
                }
            });

            $scope.updateStatus = function ($index) {
                var live = $scope.lives.data[$index];

                ConfirmService.confirm('确定已经打款了吗?').then(function () {
                    Live.updateBill.update({id: live.id}, function (data) {
                        live.billStatus = 1;
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });

            };

        }]);
