'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ui.bootstrap'])
    .controller('AppCtrl', ['$rootScope', '$scope', '$state', 'User', 'Alert', 'AUTH_EVENTS',
        function ($rootScope, $scope, $state, User, Alert, AUTH_EVENTS) {
            $scope.setMe = function (me) {
                $rootScope.me = me;
            };
            $scope.$on(AUTH_EVENTS.loginNeeded, function () {
                $state.go("login");
            });
            $scope.$on(AUTH_EVENTS.loginSuccess, function () {
                User.me.get(function (me) {
                    if (me.tp == 3) {
                        $state.go("home.editor");
                    } else if (me.tp == 1) {
                        $state.go("home.activity");
                    } else {
                        $state.go("home.article");
                    }
                })
            });
            $scope.$on(AUTH_EVENTS.httpForbidden, function () {
                //Alert.alert('权限不足，禁止操作', true);

                User.me.get(function (me) {
                    if (me.tp == 3) {
                        $state.go("home.editor");
                    } else if (me.tp == 1) {
                        $state.go("home.activity");
                    } else {
                        $state.go("home.article");
                    }
                })
            });
        }])
    .controller('IndexCtrl', ['$scope', '$state',
        function ($scope, $state) {
            if ($scope.me.tp == 1){
                $state.go('home.activity');
            } else {
                $state.go('home.article');
            }
        }])
    .controller('LoginCtrl', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', 'Alert',
        function ($scope, $rootScope, AUTH_EVENTS, AuthService, Alert) {
            $scope.credentials = {};

            $scope.login = function () {
                $scope.loading = true;
                AuthService.login($scope.credentials).success(function () {
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.loading = false;
                }).error(function () {
                    $scope.loading = false;
                    Alert.alert('登录失败', true);
                });
            };
        }])
    .controller('HomeCtrl', ['$scope', '$rootScope', '$interval', 'AUTH_EVENTS', 'AuthService', 'me', 'Badge', 'badge',
        function ($scope, $rootScope, $interval, AUTH_EVENTS, AuthService, me, Badge, badge) {
            if (!$scope.me) {
                $scope.setMe(me);
            }
            $scope.logout = function () {
                var cb = function () {
                    $scope.setMe(null);
                    $rootScope.$broadcast(AUTH_EVENTS.loginNeeded);
                };
                AuthService.logout().success(cb).error(cb);
            };

            $scope.badge = badge;
            $interval(function () {
                Badge.get(function (res) {
                    $scope.badge = res;
                });
            }, 5000);

            $rootScope.menuOpen = true;
        }])
    .controller('AboutCtrl', ['$scope', '$stateParams', '$log', 'Alert', 'ConfirmService', 'CONFIG', 'data', 'About',
        function ($scope, $stateParams, $log, Alert, ConfirmService, CONFIG, data, About) {
            $scope.data = data;
            $scope.save = function (name, val) {
                var SPEC = {"key": name, "val": val};
                About.update(SPEC, function () {
                    Alert.alert("操作成功");
                }, function (res) {
                    Alert.alert("操作失败：" + res, true);
                })
            };
        }])
    .controller('AdCtrl', ['$scope', '$stateParams', '$log', 'Alert', "Resource", 'ConfirmService', 'CONFIG', 'data', 'Ad', 'FileUploader',
        function ($scope, $stateParams, $log, Alert, Resource, ConfirmService, CONFIG, data, Ad, FileUploader) {
            if (!data) {
                data = {}
            }
            $scope.ad = data;

            // -- upload icon setting begin --//
            var uploaded = function (imgId) {
                Resource.get({id: imgId}, function (r){
                    $scope.ad.image = r.url;
                    $scope.uploading = false;
                    $log.info(data.image);
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

                uploader.onAfterAddingFile = function (fileItem) {
                    console.info('onAfterAddingFile', fileItem);
                    $scope.uploading = true;
                    fileItem.upload();
                };

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
            $scope.adUploader = up();

            $scope.upload = function () {
                $scope.uploading = true;
                $scope.adUploader.uploadAll();
            };

            $scope.save = function (){
                if (!$scope.ad.image) {
                    Alert.alert("请选择广告图");
                    return
                }

                ConfirmService.confirm('广告保存后，将自动发布给所有用户，确定保存吗?').then(function () {
                    Ad.save($scope.ad, function () {
                        Alert.alert("操作成功");
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            };

            $scope.del = function (){
                ConfirmService.confirm('确定要移除广告吗?').then(function () {
                    Ad.remove({}, function () {
                        Alert.alert("操作成功");
                        $scope.ad = {};
                    }, function (res) {
                        Alert.alert("操作失败：" + res.data, true);
                    });
                });
            }

        }])
    .controller('MsgCtrl', ['$scope', '$modal', '$log', '$state', 'Alert', 'ConfirmService', 'CONFIG', 'User', 'Msg', 'data', '$rootScope',
        function ($scope, $modal, $log, $state, Alert, ConfirmService, CONFIG, User, Msg, data, $rootScope) {
            $scope.data = data;
            $scope.grid = {
                page: 1
            };
            $log.info('here');
            $log.info(data);

            var refresh = function (page) {
                $log.info('refresh');
                var SPEC = {page: page, size: CONFIG.limit};
                if ($scope.grid.name) {
                    SPEC.name = $scope.grid.name;
                }
                var d = MsgRecord.get(SPEC, function () {
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
        }])
    .controller('SettingCtrl', ['$scope', '$log', 'Alert', 'me', 'User', 'FileUploader',
        function ($scope, $log, Alert, me, User, FileUploader) {
//            -- upload icon setting begin --//
            $scope.meOriginal = {
                nick: me.nick
            };
            $scope.tab = function(id) {
                console.log('-------', id);
                $scope.tabId = id;
            };
            var uploaded = function (imgId) {
                $log.info("uploaded user img:", imgId);
                User.me.update({id: me.id}, {"key": "icon", "val": imgId}, function () {
                    Alert.alert('操作成功！');
                    User.me.get({'id': me.id}, {}, function (u) {
                        me.icon = u.icon;
                        me = u;
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
                    return '手机号码错误';
                }
                var SPEC = {"key": name, "val": val};
                $log.info(me.id);
                User.me.update({id: me.id}, SPEC, function () {
                    Alert.alert('操作成功');
                }, function (res) {
                    me.nick = $scope.meOriginal.nick;
                    Alert.alert('操作失败: ' + res.data, true);
                });
            };

            $scope.passwd = {};

            $scope.changePasswd = function () {
                $log.info("passwd:", $scope.passwd);
                if (!$scope.passwd.oldPassword) {
                    Alert.alert('原始密码不能为空', true);
                    return;
                }
                if (!$scope.passwd.newPassword) {
                    Alert.alert('新密码不能为空', true);
                    return;
                }
                if (!$scope.passwd.confirmPassword) {
                    Alert.alert('确认密码不能为空', true);
                    return;
                }
                if ($scope.passwd.confirmPassword != $scope.passwd.newPassword) {
                    Alert.alert('确认密码和新密码不一致', true);
                    return;
                }
                User.me.passwd.update($scope.passwd, function () {
                    Alert.alert('操作成功');
                    $scope.tabId = false;
                }, function (res) {
                    $log.info('err', res);
                    Alert.alert('操作失败: ' + res.data, true);
                });
            };

        }])
    .controller('MediaCtrl', ['$scope', '$log', 'resource', 'goods','lives','articles','activities',
        function ($scope, $log, resource, goods,lives,articles,activities) {
            $log.log('resource' + resource);
            $log.log('goods' + goods);
            $log.log('lives' + lives);
            $log.log('articles' + articles);
            if (resource) {
                $scope.resource = resource;
            }else if(lives){
                $scope.resource = {id:'', tp: 8, lives: lives, gid:lives.id};
            }else if(articles){
                $scope.resource = {id:'', tp: 6, articles: articles, gid: articles.id};
            } else if(activities){
                $scope.resource = {id:'', tp: 7, activities: activities, gid:activities.id};
            } else if (goods){
                $scope.resource = {id: '', tp: 4, goods: goods, gid:goods.id};
            }
        }])
    .controller('TestEditorCtrl', ['$scope', '$sce', '$log', 'ResourceTranslator', 'article',
        function ($scope, $sce, $log, ResourceTranslator, article) {
            var text = ResourceTranslator.toHtml(article.data[0].resource);
            $scope.text = text;

            $scope.ok = function () {
                var resources = ResourceTranslator.fromHtml('#this-editor');
                $log.log(resources);
            };

            $scope.stripFormat = ResourceTranslator.stripFormat;

            function test(s) {
                $log.log('-------------------------------');
                $(s).each(function (index) {
                    $log.log($(this).text());
                    $(this).contents().each(function (i) {
                        $log.log(this);
                    });
                });
            }

            $log.log(ResourceTranslator.stripFormat('aaa\nbbbb\r\ncccc\rddddd'));
            $log.log(ResourceTranslator.stripFormat('<div>this is a test</div>'));
            $log.log(ResourceTranslator.stripFormat('<div>haha<p>test</p>bbb</p>aaaaa</div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe></iframe></div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe class="ta-app-media ta-insert-video"></iframe></div>'));
            $log.log(ResourceTranslator.stripFormat('<div><iframe class="ta-app-media ta-insert-video"></iframe><h6>测试视频</h6></div>'));
            $log.log(ResourceTranslator.stripFormat('<h1>标题</h1><div>正文</div>'));
            $log.log(ResourceTranslator.stripFormat('<p>aaa<span>bbbb</span>cccc<span>eeeeeeeee</span>ddddd</p>'));

            var s = '<p><a></p><p><area></p><p><audio></p><p><base></p><p><body></p><p><blockquote></p><p><button></p><p><canvas></p><p><col></p><p><colgroup></p><p><datalist></p><p><del></p><p><details></p><p><dialog></p><p><embed></p><p><fieldset></p><p><form></p><p><frame></p><p><frameset></p><p><iframe></p><p><img></p><p><ins></p><p><input> button</p><p><input> checkbox</p><p><input> color</p><p><input> date</p><p><input> datetime</p><p><input> datetime-local</p><p><input> email</p><p><input> file</p><p><input> hidden</p><p><input> image</p><p><input> month</p><p><input> number</p><p><input> password</p><p><input> range</p><p><input> radio</p><p><input> reset</p><p><input> search</p><p><input> submit</p><p><input> text</p><p><input> time</p><p><input> url</p><p><input> week</p><p><keygen></p><p><label></p><p><legend></p><p><li></p><p><link></p><p><map></p><p><menu></p><p><menuitem></p><p><meta></p><p><meter></p><p><object></p><p><ol></p><p><optgroup></p><p><option></p><p><param></p><p><progress></p><p><q></p><p><script></p><p><select></p><p><source></p><p><style></p><p><table></p><p><td></p><p><th></p><p><tr></p><p><textarea></p><p><time></p><p><title></p><p><track></p><p><video></p><p>建站手册</p><p>网站构建</p><p>万维网联盟 (W3C)</p><p>浏览器信息</p><p>网站品质</p><p>语义网</p><p>职业规划</p><p>网站主机</p><p>关于 W3School</p><p>帮助 W3School</p><h1>HTML DOM className 属性</h1><p>HTML DOM Element 对象</p><p>定义和用法</p><p>className 属性设置或返回元素的 class 属性。</p><p>语法</p><p>HTMLElementObject.className=classname</p><p>浏览器支持</p><p>IE</p><p>Firefox</p><p>Chrome</p><p>Safari</p><p>Opera</p><p>所有主流浏览器都支持 className 属性。</p><p>实例</p><p>返回 body 元素的 class 属性：</p><p><html></p><p> <body id="myid" class="mystyle"></p><p></p><p> <script></p><p> var x=document.getElementsByTagName("body")[0];</p><p> document.write("Body CSS class: " + x.className);</p><p> document.write("<br>");</p><p> document.write("An alternate way: ");</p><p> document.write(document.getElementById("myid").className);</p><p> </script></p><p></p><p> </body></p><p></html> </p><p></p><p>输出：</p><p>Body CSS class: mystyle</p><p>An alternate way: mystyle </p><p></p><p>亲自试一试</p><p>HTML DOM Element 对象</p><p>SEARCH:</p><p> </p><p>JavaScript 参考手册</p><p>JavaScript 实例</p><p>JavaScript 测验</p><p>W3School 提供的内容仅用于培训。我们不保证内容的正确性。通过使用本站内容随之而来的风险与本站无关。W3School 简体中文版的所有内容仅供测试，对任何法律问题及风险不承担任何责任。</p><p>当使用本站时，代表您已接受了本站的使用条款和隐私条款。版权所有，保留一切权利。 赞助商：上海赢科投资有限公司。 蒙ICP备06004630号</p>';
            $log.log(s);
            $log.log(ResourceTranslator.stripFormat(s));


        }]);
