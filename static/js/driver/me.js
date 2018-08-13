/**
 * Created by Administrator on 2018/3/25.
 */

;//$(function () {
summerready = function(){
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
 		var params = {zxing : false};
			ZBar.scan(params, function(args){
                if(args.indexOf('https')!=-1){
                	 window.location.href=args.slice(args.lastIndexOf('/')+1,args.length); 
                }else{
	                 summer.toast({
				         msg: "请扫描支付码",
				         //duration:"long"
	                });
                }
               
			}, function(args){
			    summer.toast({
			        msg: args,
			         duration:"long"
			    });
			});
       /* getAPPMethod(function () {
            if (window.gasstation) {
                window.gasstation.zxingClick();
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.zxingClick.postMessage(null);
            }
        })*/
    })
    getDriverInfo();
    $.init();
    }
//})