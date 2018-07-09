/**
 * Created by Administrator on 2018/3/25.
 */

$(function () {
    $.showPreloader();
    /*获取司机个人信息*/
    function getDriverInfo() {
        ajaxRequests('/driverInfo/info','get','',function (response) {
            if (response.retCode === '0') {
                if(response.data.regStep=="1"){
                    pageGo("register-added");
                    $.hidePreloader();
                }else{
                    var userName = response.data.userName;
                    $(".user-name").html(userName);
                    $(".avator-box img").attr("src",'/app'+response.data.headImgPath);
                    // $(".avator-box img").attr("src","http://m.zhongxinnengyuan.cn/app/upload/head_img_path/20180609124910242.jpg");
                    // $(".driver-name").html(response.data.userName);
                    // $(".mobile").html(response.data.mobile);
                    $("#rechageAccount").html(response.data.ownAmount);
                    $("#transferAmount").html(response.data.turnIntoAmount);
                    $(".amount-box").css("display","block");
                    $.hidePreloader();
                }
            } else {
                $.toast(response.retMsg || '获取用户信息失败，请重新登录', 2000, 'custom-toast');
            }
        })
    }
    $(".scan").on("click",function () {
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
    getDriverInfo();
    $.init();
})