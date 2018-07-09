/**
 * Created by Administrator on 2018/3/25.
 */
/*获取司机个人信息*/
;$(function () {
    var companyType = getCookie("companyType");
    var status = Number(getCookie("status"));
    var $statusDemoNo = $(".status-no");
    $.showPreloader();
    ajaxRequests('/venderInfo/info/','get','',function (response) {
        if (response.retCode === '0') {
            if(response.data){
                var userName = response.data.userName;
                var mobile = response.data.mobile;
                var id = response.data.id;
                $(".vender-name").html(userName);
                $(".mobile").html(mobile);
                $(".vender-photo").attr("src","/app"+response.data.sitePicPath||"../../static/img/siteImg.jpg");
                if (companyType == 3 || companyType == 4) {
                    $(".site").remove();
                }
                if (status != 2) {
                    $statusDemoNo.css("display", "block");
                }
                $(".content").removeClass("dis-n");
                $.hidePreloader();
            }else{
                location.href="login.html";
            }
        } else {
            location.href="login.html";
        }
    });
    $.init();
})