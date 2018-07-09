/**
 * Created by zhujinyu on 2018/6/1.
 */
/**
 * Created by Administrator on 2018/4/9.
 */
;$(function () {
    getAPPMethod(function () {
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
    })
    function  setVersion(str){
        $(".content").removeClass("dis-n");
        $(".new-version").html(str);
        $(".current-version").html(str);
    }
    $.init();
})