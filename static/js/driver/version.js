/**
 * Created by zhujinyu on 2018/6/1.
 */
/**
 * Created by Administrator on 2018/4/9.
 */
;//$(function () {
summerready = function(){
    /* getAPPMethod(function () {
        if(window.gasstation){
            var version = window.gasstation.getVersion();
            $(".content").removeClass("dis-n");
            $(".new-version").html(version);
            $(".current-version").html(version);
        }
    },function () {
        if(window.webkit){
            version = window.webkit.messageHandlers.getVersion.postMessage(null);
        }
    }) */
    // 版本升级
    function update () {
        var appVersion = JSON.parse(summer.getAppVersion()).versionCode;
        var appVersionName = JSON.parse(summer.getAppVersion()).versionName;
        var params = {
            url:'/static/app/driver.json',
            type: 'get',
            callback:function (res) {
                var NEW_VERSION = String(res.version);
                if (NEW_VERSION > appVersion) {
                    $.confirm('检测到新版本，是否升级？',
                        function () {
                            summer.upgradeApp({
                                url: res.updateUrl
                            },function (ret) {
                                if (ret.state == 1 || ret == "OK") {
                                    summer.toast({
                                        msg : '升级成功'
                                    });
                                    $('.current-version').text(NEW_VERSION);
                                    $('.new-version').text(NEW_VERSION);
                                    $('#dis').removeClass('dis-n');
                                }
                            },function (err) {
                                summer.toast({
                                    msg : '升级失败'
                                });
                                $('.current-version').text(appVersionName);
                                $('.new-version').text(NEW_VERSION);
                                $('#dis').removeClass('dis-n');
                            })
                        },
                        function () {
                            $('.current-version').text(appVersionName);
                            $('.new-version').text(NEW_VERSION);
                            $('#dis').removeClass('dis-n');
                        }
                    );
                } else {
                    $.toast("当前应用已是最新版本", 3000);
                    $('.current-version').text(appVersionName);
                    $('.new-version').text(NEW_VERSION);
                    $('#dis').removeClass('dis-n');
                }
            }
        }
        ajaxRequest(params);
    };
    update();
    function  setVersion(str){
        $(".content").removeClass("dis-n");
        $(".new-version").html(str);
        $(".current-version").html(str);
    }
    $.init();
   }
//})