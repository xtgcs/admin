'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.bootstrap',
    'ui.router',
    'angularFileUpload',
    'ui.select',
    'xeditable',
    'checklist-model',
    'ui.sortable',
    'checklist-model',
    'textAngular',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'myApp.articlecontrollers',
    'myApp.topiccontrollers',
    'myApp.activitycontrollers',
    'myApp.goodscontrollers',
    'myApp.ordercontrollers',
    'myApp.authorcontrollers',
    'myApp.editorcontrollers',
    'myApp.usercontrollers',
    'myApp.resourcecontrollers',
    'myApp.articlecmtcontrollers',
    'myApp.activitycmtcontrollers',
    'myApp.sensitivecontrollers',
    'myApp.categorycontrollers',
    'myApp.messagecontrollers',
    'myApp.actcategorycontrollers',
    'myApp.feedbackcontrollers',
    'myApp.applicationcontrollers',
    'myApp.financecontrollers',
    'myApp.livecontrollers',
    'myApp.bannercontrollers',
    'myApp.recommendedcontrollers',
    'myApp.columncontrollers',
    'myApp.openscreencontrollers'
])
    .constant('CONFIG', {
        limit: 10,
        less: 5,
        topImageMinWidth: 0,
        topImageMinHeight: 0,
        topImageAspectRatio: 4/3
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })
    .constant('MSG_AUTH', [
        {value: 1, text: '有'},
        {value: 0, text: '无'}
    ])
    .constant('VALID', {
        TRUE: 0,
        FALSE: 1
    })
    .constant('STATUS', {
        PENDING: 0,
        PUBLISHED: 1
    })
    .constant('API', {
        // url:'/songguoAPI',
        // url:'apis',
        url:''
    })
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/index");
        $stateProvider
            .state('login', {
                url: '/login',
                controller: 'LoginCtrl',
                templateUrl: 'partials/login.html'
            }).state('home', {
                abstract: true,
                resolve: {
                    me: function ($rootScope, User) {
                        if ($rootScope.me) {
                            return $rootScope.me;
                        } else {
                            return User.me.get().$promise;
                        }
                    },
                    badge: function (Badge) {
                        return Badge.get().$promise;
                    }
                },
                controller: 'HomeCtrl',
                templateUrl: 'partials/home.html'
            })
            .state('home.index', {
                url: '/index',
                controller: 'IndexCtrl',
                templateUrl: 'partials/index-placeholder.html'
            })
            .state('home.article', {
                resolve: {
                    data: function (CONFIG, Article, VALID) {
                        return Article.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                         return Category.get({version:2.1}).$promise;
                        // return Category.all.query().$promise;
                    },
                    columns: function (CONFIG, Columns, VALID) {
                        return Columns.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                },
                controller: 'ArticleCtrl',
                url: '/article',
                templateUrl: 'partials/article/article_list.html'
            }).state('home.deletedArticles', {
                resolve: {
                    data: function (CONFIG, Article, VALID) {
                        return Article.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedArticleCtrl',
                url: '/deletedArticle',
                templateUrl: 'partials/article/deleted_article_list.html'
            }).state('home.column', {
                 resolve: {
                data: function (CONFIG, Columns, VALID) {
                    return Columns.get({page: 1, size: 20,columnType:1}).$promise;
                },
                token: function (Resource) {
                    return Resource.token.get().$promise;
                },
               category: function(Category) {
                    return Category.get({version:2.1}).$promise;
                         // return Category.all.query().$promise;
                     },
            },
            controller: 'ColumnCtrl',
            url: '/column',
            templateUrl: 'partials/column/column_list.html'
        }).state('home.columnFree', {
            resolve: {
                data: function (CONFIG, Columns, VALID) {
                    return Columns.get({page: 1, size: 20,columnType:0}).$promise;
                },
                token: function (Resource) {
                    return Resource.token.get().$promise;
                },
                category: function(Category) {
                    return Category.get({version:2.1}).$promise;
                    // return Category.all.query().$promise;
                },
            },
            controller: 'ColumnCtrl',
            url: '/columnFree',
            templateUrl: 'partials/column/column_free_list.html'
        }).state('home.topic', {
                resolve: {
                    data: function (CONFIG, Topic, VALID) {
                        return Topic.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    }
                },
                controller: 'TopicCtrl',
                url: '/topic',
                templateUrl: 'partials/topic/topic_list.html'
            }).state('home.deletedTopics', {
                resolve: {
                    data: function (CONFIG, Topic, VALID) {
                        return Topic.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedTopicCtrl',
                url: '/deletedTopic',
                templateUrl: 'partials/topic/deleted_topic_list.html'
            }).state('home.activity', {
                resolve: {
                    data: function (CONFIG, Activity, VALID) {
                        return Activity.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    categoryextend: function(Category) {
                        return Category.get({version:2.1}).$promise;
                    },
                    category: function(Category) {
                        return Category.get().$promise;
                        // return Category.all.query().$promise;
                    },
                    defaultHint: function (Activity) {
                        return Activity.hint.get().$promise
                    },
                    brandclass: function(Brandclass) {
                        return Brandclass.get().$promise;
                    },
                },
                controller: 'ActivityCtrl',
                url: '/activity',
                templateUrl: 'partials/activity/activity_list.html'
            }).state('home.deletedActivities', {
                resolve: {
                    data: function (CONFIG, Activity, VALID) {
                        return Activity.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedActivityCtrl',
                url: '/deletedActivity',
                templateUrl: 'partials/activity/deleted_activity_list.html'
            }).state('home.recommendActivity', {
                resolve: {
                    data: function (Activity, CONFIG) {
                        return Activity.recommend.query().$promise;
                    }
                },
                controller: 'RecommendActivityCtrl',
                url: '/recommendActivity',
                templateUrl: 'partials/activity/recommend_activity_list.html'
            }).state('home.activityHint', {
                resolve: {
                    data: function (Activity) {
                        return Activity.hint.get().$promise
                    }
                },
                controller: 'ActivityHintCtrl',
                url: '/activityHint',
                templateUrl: 'partials/activity/activity_hint.html'
            }).state('home.activityVerify', {
                resolve: {
                    activities: function (Activity) {
                        return Activity.today.query().$promise
                    },
                    vcodes: function (Activity) {
                        return Activity.vcode.query().$promise
                    }
                },
                controller: 'ActivityVerifyOrderCtrl',
                url: '/activityVerify',
                templateUrl: 'partials/activity/activity_order_verify.html'
            }).state('home.activityBill', {
                resolve: {
                    bills: function (Activity) {
                        return Activity.bill.get({page:1, size:5}).$promise
                    },
                    comingActivities: function (Activity) {
                        return Activity.coming.get({page:1, size:10}).$promise
                    },
                    oldActivities: function (Activity) {
                        return Activity.old.get({page:1, size:20}).$promise
                    }
                },
                controller: 'ActivityBillCtrl',
                url: '/activityBill',
                templateUrl: 'partials/activity/activity_bill.html'
            }).state('home.actCategory', {
                resolve: {
                    data: function (CONFIG, ActCategory) {
                        return ActCategory.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ActCategoryCtrl',
                url: '/actCategory',
                templateUrl: 'partials/category/activity_category_list.html'
            }).state('home.goods', {
                resolve: {
                    data: function (CONFIG, Goods, VALID) {
                        return Goods.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    defaultHint: function (Goods) {
                        return Goods.hint.get().$promise
                    }
                },
                controller: 'GoodsCtrl',
                url: '/goods',
                templateUrl: 'partials/goods/goods_list.html'
            }).state('home.deletedGoods', {
                resolve: {
                    data: function (CONFIG, Goods, VALID) {
                        return Goods.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedGoodsCtrl',
                url: '/deletedGoods',
                templateUrl: 'partials/goods/deleted_goods_list.html'
            }).state('home.goodsHint', {
                resolve: {
                    data: function (Goods) {
                        return Goods.hint.get().$promise
                    }
                },
                controller: 'GoodsHintCtrl',
                url: '/goodsHint',
                templateUrl: 'partials/goods/goods_hint.html'
            }).state('home.order', {
                resolve: {
                    data: function (CONFIG, Order, VALID) {
                        return Order.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'OrderCtrl',
                url: '/order',
                templateUrl: 'partials/order/order_list.html'
            }).state('home.banner', {
                resolve: {
                    data: function (Banner) {
                        return Banner.query().$promise;
                    }
                },
                controller: 'BannerCtrl',
                url: '/banner',
                templateUrl: 'partials/banner/banner_list.html'
            }).state('home.openscreen', {
                resolve: {
                    data: function (Openscreen) {
                        return Openscreen.query({advertkind:0}).$promise;
                    }
                },
                controller: 'OpenScreenCtrl',
                url: '/openscreen',
                templateUrl: 'partials/openscreen/openscreen_edit.html'
        }).state('home.recommended', {
                resolve: {
                    data: function (Recommends) {
                        return Recommends.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'recommendedCtrl',
                url: '/recommended',
                templateUrl: 'partials/recommended/recommended_list.html'
        }).state('home.application', {
                resolve: {
                    data: function (CONFIG, Application, VALID) {
                        return Application.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'ApplicationCtrl',
                url: '/application',
                templateUrl: 'partials/application/application_list.html'
            }).state('home.feedback', {
                resolve: {
                    data: function (CONFIG, Feedback, VALID) {
                        return Feedback.get({page: 1, size: 20}).$promise;
                    }
                },
                controller: 'FeedbackCtrl',
                url: '/feedback',
                templateUrl: 'partials/feedback/feedback_list.html'
            }).state('home.keyword', {
                resolve: {
                    data: function (CONFIG, Keyword) {
                        return Keyword.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'KeywordCtrl',
                url: '/keyword',
                templateUrl: 'partials/keyword/keyword_list.html'
            }).state('home.articleComment', {
                resolve: {
                    data: function (CONFIG, ArticleComment) {
                        return ArticleComment.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ArticleCommentCtrl',
                url: '/articleComment',
                templateUrl: 'partials/comment/article_comment_list.html'
            }).state('home.sensitiveArticleComment', {
                resolve: {
                    data: function (CONFIG, ArticleComment) {
                        return ArticleComment.sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveArticleCommentCtrl',
                url: '/sensitiveArticleComment',
                templateUrl: 'partials/comment/article_comment_sensitive.html'
            }).state('home.activityComment', {
                resolve: {
                    data: function (CONFIG, ActivityComment) {
                        return ActivityComment.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'ActivityCommentCtrl',
                url: '/activityComment',
                templateUrl: 'partials/comment/activity_comment_list.html'
            }).state('home.sensitiveActivityComment', {
                resolve: {
                    data: function (CONFIG, ActivityComment) {
                        return ActivityComment.sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveActivityCommentCtrl',
                url: '/sensitiveActivityComment',
                templateUrl: 'partials/comment/activity_comment_sensitive.html'
            }).state('home.user', {
                resolve: {
                    user_black: function () {
                        return false;
                    },
                    data: function (CONFIG, User) {
                        return User.get({page: 1, size: CONFIG.limit, status: 0, sort: 0}).$promise;
                    }
                },
                controller: 'UserCtrl',
                url: '/user',
                templateUrl: 'partials/user/user_list.html'
            }).state('home.black', {
                resolve: {
                    user_black: function () {
                        return true;
                    },
                    data: function (CONFIG, User) {
                        return User.get({page: 1, size: CONFIG.limit, status: 1, sort: 0}).$promise;    //todo status 过滤黑名单字段
                    }
                },
                controller: 'BlackCtrl',
                url: '/black',
                templateUrl: 'partials/user/user_list.html' //user 和 black 共用一个list
            }).state('home.ad', {
                resolve: {
                    data: function (Ad) {
                        return Ad.get().$promise
                    }
                },
                controller: 'AdCtrl',
                url: '/ad',
                templateUrl: 'partials/ad/ad_edit.html'
            }).state('home.about', {
                resolve: {
                    data: function (About) {
                        return About.get().$promise
                    }
                },
                controller: 'AboutCtrl',
                url: '/about',
                templateUrl: 'partials/about.html'
            }).state('home.resource', {
                resolve: {
                    data: function (CONFIG, Resource) {
                        return Resource.get({page: 1, size: CONFIG.limit, tp: '1,3', status: 1}).$promise;
                    }
                },
                controller: 'ResourceCtrl',
                url: '/resource',
                templateUrl: 'partials/resource/resource_list.html'
            }).state('home.sensitive', {
                resolve: {
                    data: function (CONFIG, Sensitive) {
                        return Sensitive.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'SensitiveCtrl',
                url: '/sensitive',
                templateUrl: 'partials/sensitive/sensitive_list.html'
            }).state('home.category', {
                resolve: {
                    data: function (CONFIG, Category) {
                        return Category.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'CategoryCtrl',
                url: '/category',
                templateUrl: 'partials/category/category_list.html'
            }).state('home.setting', {
                resolve: {
                    one: function ($rootScope, User) {

                        return User.me.get().$promise;

                    }
                },
                controller: 'SettingCtrl',
                url: '/setting',
                templateUrl: 'partials/setting.html'
            }).state('home.editor', {
                resolve: {
                    editor_black: function () {
                        return false;
                    },
                    data: function (Editor, CONFIG) {
                        return Editor.get({page: 1, size: CONFIG.limit, status: 0}).$promise;
                    }
                },
                controller: 'EditorCtrl',
                url: '/editor',
                templateUrl: 'partials/admin/editor_list.html'
            }).state('home.editorBlack', {
                resolve: {
                    editor_black: function () {
                        return true;
                    },
                    data: function (Editor, CONFIG) {
                        return Editor.get({page: 1, size: CONFIG.limit, status: 1}).$promise;
                    }
                },
                controller: 'EditorCtrl',
                url: '/editorBlack',
                templateUrl: 'partials/admin/editor_list.html'
            }).state('home.author', {
                resolve: {
                    author_black: function () {
                        return false;
                    },
                    data: function (Author, CONFIG) {
                        return Author.get({page: 1, size: CONFIG.limit, status: 0}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                        return Category.get({version:2.1}).$promise;
                    }
                },
                controller: 'AuthorCtrl',
                url: '/author',
                templateUrl: 'partials/admin/author_list.html'
            }).state('home.authorBlack', {
                resolve: {
                    author_black: function () {
                        return true;
                    },
                    data: function (Author, CONFIG) {
                        return Author.get({page: 1, size: CONFIG.limit, status: 1}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    }
                },
                controller: 'AuthorCtrl',
                url: '/authorBlack',
                templateUrl: 'partials/admin/author_list.html'
            }).state('home.recommendAuthor', {
                resolve: {
                    data: function (Author, CONFIG) {
                        return Author.recommend.query().$promise;
                    }
                },
                controller: 'RecommendAuthorCtrl',
                url: '/recommendAuthor',
                templateUrl: 'partials/admin/recommend_author_list.html'
            }).state('home.msg', {
                resolve: {
                    data: function (CONFIG, Msg) {
                        return Msg.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'MsgCtrl',
                url: '/msg',
                templateUrl: 'partials/msg/msg_list.html'
            }).state('home.message', {
                resolve: {
                    data: function (CONFIG, Message) {
                        return Message.get({page: 1, size: CONFIG.limit}).$promise;
                    }
                },
                controller: 'MessageCtrl',
                url: '/message',
                templateUrl: 'partials/message/message_list.html'
            }).state('home.testEditor', {
                resolve: {
                    article: function (Article, VALID) {
                        return Article.get({page: 1, size: 20, status: 1, valid: VALID.TRUE}).$promise;
                    }
                },
                controller: 'TestEditorCtrl',
                url: '/testEditor',
                templateUrl: 'partials/test/editor.html'
            }).state('/media', {
                resolve: {
                    goods: function ($log, Goods, $stateParams) {
                        if ($stateParams.tp == '4')
                            return Goods.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    resource: function (Resource, $stateParams) {
                        if ($stateParams.tp == '0' || $stateParams.tp == '1' || $stateParams.tp == '2' || $stateParams.tp == '3')
                        return Resource.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    lives: function ($log,Live, $stateParams) {
                        if ($stateParams.tp == '8')
                            return Live.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    articles: function ($log,Article, $stateParams) {
                        if ($stateParams.tp == '6')
                            return Article.get({id: $stateParams.id}).$promise;
                        return null;
                    },
                    activities: function ($log,Activity, $stateParams) {
                        if ($stateParams.tp == '7')
                            return Activity.get({id: $stateParams.id}).$promise;
                        return null;
                    }

                },
                controller: 'MediaCtrl',
                url: '/media/:tp/:id',
                templateUrl: 'partials/resource/media.html'
            }).state('home.financeStat', {
                resolve: {
                    data: function (CONFIG, FinanceStat, VALID) {
                        return FinanceStat.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    }
                },
                controller: 'FinanceStatCtrl',
                url: '/finance',
                templateUrl: 'partials/finance/finance_stat_list.html'
            }).state('home.live', {
                resolve: {
                    data: function (CONFIG, Live, VALID) {
                        return Live.get({page: 1, size: 20, valid: VALID.TRUE}).$promise;
                    },
                    token: function (Resource) {
                        return Resource.token.get().$promise;
                    },
                    category: function(Category) {
                        return Category.get({version:2.1}).$promise;
                        // return Category.all.query().$promise;
                    }
                },
                controller: 'LiveCtrl',
                url: '/live',
                templateUrl: 'partials/live/live_list.html'
            }).state('home.liveBill', {
                resolve: {
                    lives: function (Live) {
                        return Live.get({page:1, size: 20}).$promise
                    }
                },
                controller: 'LiveBillCtrl',
                url: '/lvieBill',
                templateUrl: 'partials/live/live_bill.html'
            }).state('home.deletedLives', {
                resolve: {
                    data: function (CONFIG, Live, VALID) {
                        return Live.get({page: 1, size: 20, valid: VALID.FALSE}).$promise;
                    }
                },
                controller: 'DeletedLiveCtrl',
                url: '/deletedLive',
                templateUrl: 'partials/live/deleted_live_list.html'
            });
    }])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    }])
    .config(function (uiSelectConfig) {
        uiSelectConfig.theme = 'bootstrap';
    })
    .run(['$state', '$rootScope', 'ConfirmService', function ($state, $rootScope, ConfirmService) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.transfering = true;

            if (fromState.name.indexOf('news') > -1 && $rootScope.isEditingNews) {
//                ConfirmService.confirm('您确定要离开此页面么？').then(function () {
//                    console.log('go to: ' + toState.name);
//                }, function () {
//                    console.log('stay at state: ' + fromState.name);
//                    event.preventDefault();
//                });

                if (confirm("您确定要离开此页面么？")) {
                    console.log('go to: ' + toState.name);
                } else {
                    console.log('stay at state: ' + fromState.name);
                    event.preventDefault();
                    $rootScope.transfering = false;
                }

            }
        });
        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.transfering = false;
        });
    }]).run(['editableOptions', function (editableOptions) {
        editableOptions.theme = 'bs3';
    }]).run(['$log', '$timeout', 'taRegisterTool', 'taOptions', '$window', 'taTranslations', 'taSelection', 'ResourceSingleSelectService', 'ImageSelectService', 'GoodsSingleSelectService','LiveSingleSelectService','videoSelectService','audioSelectService','ArticleSingleSelectService','ActivitySingleSelectService','Resource', '$location',
        function ($log, $timeout, taRegisterTool, taOptions, $window, taTranslations, taSelection, ResourceSingleSelectService, ImageSelectService, GoodsSingleSelectService,LiveSingleSelectService,videoSelectService,audioSelectService,ArticleSingleSelectService,ActivitySingleSelectService,Resource, $location) {
            var _selection = null;
            $window.onUpdateEditorSelection = function () {
                $timeout(function (){
                    _selection = taSelection.getSelection();
                }, 0);
            };

            taOptions.toolbar.push(['appInsertImage', 'appInsertVideo', 'appInsertAudio','appInsertLive']);
            taRegisterTool('appInsertImage', {
                iconclass: 'fa fa-picture-o',
                tooltiptext: '请选择图片',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ImageSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-image" src="' + getMediaUrl(0, o.id) + '" width="100%" height="300px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true)
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-image'],
                    action: angular.noop
                }
            });

            function getMediaUrl(tp, id) {
                var absUrl = $location.absUrl();
                var url  = $location.url();
                 console.log(absUrl.substr(0, absUrl.length - url.length) + '/media/' + tp + '/' + id);
                return absUrl.substr(0, absUrl.length - url.length) + '/media/' + tp + '/' + id;
            }

            taRegisterTool('appInsertVideo', {
                iconclass: 'fa fa-file-video-o',
                tooltiptext: taTranslations.insertVideo.tooltip,
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log((selection.container?selection.container.tagName:'undefined'));
                    videoSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if ((typeof o)== 'string') {
                            var embed = o;
                        }else{
                            var embed = '<iframe class="ta-app-media ta-insert-video" src="' + getMediaUrl(1, o.id) + '" width="100%" height="300px" frameborder="0"><iframe>';
                        }
                        console.log(embed);
                        that.$editor().wrapSelection('insertHTML', embed, true)

                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-video'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertLive', {
                iconclass: 'fa  fa-paper-plane',
                tooltiptext: '请选择连线',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    LiveSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-live" src="' + getMediaUrl(8, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-live'],
                    action: angular.noop
                }
            });
            taRegisterTool('appInsertArticle', {
                iconclass: 'fa   fa-file-text-o',
                tooltiptext: '请选择文章',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ArticleSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-article" src="' + getMediaUrl(6, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-article'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertActivity', {
                iconclass: 'fa  fa-gavel',
                tooltiptext: '请选择活动',
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    ActivitySingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-activity" src="' + getMediaUrl(7, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-activity'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertAudio', {
                iconclass: 'fa fa-file-audio-o',
                tooltiptext: "请选择音乐",
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    audioSelectService.open().then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-audio" src="' + getMediaUrl(3, o.id) + '" width="100%" height="100px" frameborder="0"><iframe>';
                            console.log(embed);
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-audio'],
                    action: angular.noop
                }
            });

            taRegisterTool('appInsertGoods', {
                iconclass: 'fa fa-book',
                tooltiptext: "请选择物件",
                action: function(){
                    var that = this;
                    var selection = _selection;//taSelection.getSelection();
                    $log.log(selection.container?selection.container.tagName:'undefined');
                    GoodsSingleSelectService.open('').then(function (o) {
                        selection.container.focus();
                        taSelection.setSelection(selection.container, selection.start, selection.end);
                        if (o) {
                            var embed = '<iframe class="ta-app-media ta-insert-goods" src="' + getMediaUrl(4, o.id) + '" width="100%" height="60px" frameborder="0"><iframe>';
                             console.log(embed);
                            that.$editor().wrapSelection('insertHTML', embed, true);
                        }
                    });
                },
                onElementSelect: {
                    element: 'iframe',
                    onlyWithAttrs: ['ta-insert-audio'],
                    action: angular.noop
                }
            });

            taRegisterTool('fontColor', {
                display: "<button colorpicker type='button' class='btn btn-default ng-scope'  title='Font Color'  colorpicker-close-on-select colorpicker-position='bottom' ng-model='fontColor' style='color: {{fontColor}}'><i class='fa fa-font '></i></button>",
                iconclass: "fa fa-font ",
                tooltiptext: "字体颜色",
                action: function (deferred) {
                    var self = this;
                    if (typeof self.listener == 'undefined') {
                        self.listener = self.$watch('fontColor', function (newValue) {
                            self.$editor().wrapSelection('foreColor', newValue);
                        });
                    }
                    self.$on('colorpicker-selected', function () {
                        deferred.resolve();
                    });
                    self.$on('colorpicker-closed', function () {
                        deferred.resolve();
                    });
                    return false;

                        // this.$editor().wrapSelection('forecolor', 'red');
                }
            });

            taRegisterTool('appListItem', {
                iconclass: 'fa fa-bars',
                tooltiptext: "设置为列表项",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<p>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('p'); }
            });

            taRegisterTool('appMediaDesc', {
                iconclass: 'fa fa-comment-o',
                tooltiptext: "设置为图说（图说必须在图片，视频或音频的底部)",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<h6>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('h6'); }
            });
            //备注
            taRegisterTool('appMediaNote', {
                iconclass: 'fa  fa-file-o',
                tooltiptext: "备注",
                action: function(){
                    return this.$editor().wrapSelection("formatBlock", "<h5>");
                },
                activeState: function(){ return this.$editor().queryFormatBlockState('h5'); }
            });
        }]);
