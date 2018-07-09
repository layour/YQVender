/**
 * Created by Administrator on 2018/4/29.
 */
;$(function () {
    $(".saoma").on("click", function () {
        getAPPMethod(function () {
            if (window.gasstation) {
                window.gasstation.zxingClick();
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.zxingClick.postMessage(null);
            }
        })
    })
})