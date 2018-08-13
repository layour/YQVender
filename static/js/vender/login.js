/**
 * Created by zhujinyu on 2018/3/6.
 */
;//$(function () {
summerready = function(){
    'use strict';
    
       //自动登录
    var token = getCookie("token");
    var cUrl = window.location.pathname; // register-added.html页面也加载了login.js
	if(token && (cUrl.indexOf("login.html") != -1)){
	   	pageGo("index");
	} else {
	    //关闭启动图
		setTimeout(function() {
			summer.hideLaunch();
		}, 200);
	}
    var $loginName = $("#loginName");//登录名
    var $loginBtn = $("#login");//登录按钮
    var $userName = $("#userName");//商家名称
    var $idCard = $("#idCard");//身份证号
    var $companyType = $("#companyType");//商家类型
    var $loginPwd = $("#loginPwd");//登录密码
    var $reLoginPwd = $("#reLoginPwd");//重复密码
    var $mobile = $("#mobile");//手机号
    var $next = $("#next");//登录名
    var $registerBtn = $("#register");//登录名
    var $isAgree = $(".isAgree");//是否同意协议
    var $businessLicensePath = $("#businessLicensePath");//营业执照
    var $gasLicensePath = $("#gasLicensePath");//燃气经营许可证
    var $dangerLicensePath = $("#dangerLicensePath");//危化品经营许可证
    var $oilLicensePath = $("#oilLicensePath");//成品油经营许可证
    var $invoicePath = $("#invoicePath");//发票信息图片
    var $sitePicPath = $("#sitePicPath");//油气站图片
    var $validateCode = $("#validateCode");//验证码
    var $modifyPasswordBtn = $("#modifyPassword");//确认密码修改
    var lng,lat;
    $.init();
    /*判断是否为空*/
    function isNUll(param) {
        if (param == "" || typeof(param) == "undefined") {
            return true;
        } else {
            return false;
        }
    }

    /*检验参数是否为空*/
    function checkParams(params) {
        var isTrue = true;
        for (var i in params) {
            if (isNUll(params[i])) {
                isTrue = false;
                switch (i) {
                    case 'loginName':
                        $.alert('登录账号不能为空');
                        break;
                    case 'userName':
                        $.alert('商家名称不能为空');
                        break;
                    case 'loginPwd':
                        $.alert('登录密码不能为空');
                        break;
                    case 'reLoginPwd':
                        $.alert('确认密码不能为空');
                        break;
                    case 'companyType':
                        $.alert('商家类型不能为空');
                        break;
                    case 'mobile':
                        $.alert('手机号不能为空');
                        break;
                    case 'idCard':
                        $.alert('身份证号不能为空');
                        break;
                    case 'validateCode':
                        $.alert('验证码不能为空');
                        break;
                }
                return false;
            } else {
                switch (i) {
                    case 'mobile':
                        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
                        if (reg.test(params[i]) && params[i].length === 11) {
                            isTrue = true;
                        } else {
                            $.alert('手机号输入格式不正确');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'validateCode':
                        if (params[i].length === 6) {
                            isTrue = true;
                        } else {
                            $.alert('手机验证码输入格式不正确');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'idCard':
                        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法
                        if (reg.test(params[i])) {
                            isTrue = true;
                        } else {
                            $.alert('请输入正确的身份证号');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'loginPwd':
                    case 'reLoginPwd':
                        var reg = /[a-z0-9]{6,18}/;
                        if (reg.test(params[i])) {
                            isTrue = true;
                        } else {
                            $.alert('密码请输入6-18位的数字或字符');
                            isTrue = false;
                            return false;
                        }
                        break;

                }
                isTrue = true;
            }
        }
        return isTrue;
    }

    /*验证身份证号是否存在*/
    function isIdCardExist() {
        var idCard = $idCard.val();
        var _li = $idCard.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法;
        if (reg.test(idCard)) {
            $error_tip.html("");
            $check_icon.css("display", "block");
        } else {
            $error_tip.html("请输入正确的身份证号");
            $check_icon.css("display", "none");
        }
    }

    /*密码是否正确*/
    function isPassword() {
        var loginPwd = $loginPwd.val().trim();
        var _li = $loginPwd.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /[a-z0-9]{6,18}/;
        if (!reg.test(loginPwd)) {
            $error_tip.html("密码请输入6-18位的数字或字符");
            $check_icon.css("display", "none");
        } else {
            $error_tip.html("");
            $check_icon.css("display", "block");
        }
    }

    /*校验两次密码输入是否一致*/
    function isPassWordIsSame(obj) {
        var isTrue = false;
        var $error_tip = obj.siblings(".error-tip");
        var $check_icon = obj.siblings(".check-icon");
        if ($loginPwd.val() === $reLoginPwd.val()) {
            if ($loginPwd.val() === "") {
                $error_tip.html("密码不可为空");
                $check_icon.css("display", "none");
                isTrue = false;
            } else {
                $error_tip.html("");
                $check_icon.css("display", "block");
                isTrue = true;
            }
        } else {
            $error_tip.html("两次输入的密码不一致");
            $check_icon.css("display", "none");
            isTrue = false;
        }
        return isTrue;
    }

    /*验证手机号是否存在*/
    function isMobileExist() {
        var mobile = $mobile.val();
        var _li = $mobile.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var $getcode = $(".getcode");
        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
        $getcode.attr("data-end", 2);
        $getcode.css("background", "#ccc");
        if (reg.test(mobile) && mobile.length === 11) {
            var params = {
                url: '/vender/checkMobile/' + mobile,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                        $getcode.attr("data-end", 1);
                        $getcode.css("background", "#f00");
                        $mobile.attr("data-checkMobile","1");
                    } else {
                        $error_tip.html(response.retMsg || "手机号已存在");
                        $check_icon.css("display", "none");
                        $mobile.attr("data-checkMobile","0");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("手机号格式不正确");
            $check_icon.css("display", "none");
            $mobile.attr("data-checkMobile","0");
        }
    }

    /*验证登录名是否存在*/
    function isloginNameExist() {
        var loginName = $loginName.val();
        var _li = $loginName.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        if (loginName) {
            var params = {
                url: '/vender/checkLoginName/' + loginName,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                    } else {
                        $error_tip.html(response.retMsg || "登录名已存在");
                        $check_icon.css("display", "none");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("手机号格式不正确");
            $check_icon.css("display", "none");
        }
    }

    /*注册第一步*/
    $registerBtn.on("click", function () {
        var loginName = $loginName.val();
        var userName = $userName.val();
        var loginPwd = $loginPwd.val();
        var reLoginPwd = $reLoginPwd.val();
        var companyType = $companyType.val();
        var mobile = $mobile.val();
        var idCard = $idCard.val();
        var businessLicensePath = $businessLicensePath.val();
        var gasLicensePath = $gasLicensePath.val();
        var dangerLicensePath = $dangerLicensePath.val();
        var oilLicensePath = $oilLicensePath.val();
        var invoicePath = $invoicePath.val();
        var sitePicPath = $sitePicPath.val();
        var validateCode = $validateCode.val();
        var data = {
            loginName: loginName,
            userName: userName,
            loginPwd: loginPwd,
            reLoginPwd: reLoginPwd,
            companyType: companyType,
            mobile: mobile,
            idCard: idCard,
            validateCode: validateCode
        }
        if (checkParams(data)) {
            data.businessLicensePath = businessLicensePath;
            data.gasLicensePath = gasLicensePath;
            data.dangerLicensePath = dangerLicensePath;
            data.oilLicensePath = oilLicensePath;
            data.invoicePath = invoicePath;
            data.sitePicPath = sitePicPath;
            if (lng && lat) {
                data.lng = lng;
                data.lat = lat;
            }
            var params = {
                url: '/vender/register',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        setCookie("loginName", loginName);
                        setCookie("loginPwd", loginPwd);
                        $.alert('注册成功', '', function () {
                            location.href = "./login.html";
                        });
                    } else {
                        $.alert(response.retMsg || '注册失败');
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /*返回关闭*/
    // $(".register-close-popup").on("click",function () {
    //     $mobile.val("");
    //     $validateCode.val("");
    //     $.closeModal(".registerPageTwo");
    // })
    /*验证身份证号是否存在*/
    $idCard.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isIdCardExist();
        }
    })
    /*验证密码是否否存在*/
    $loginPwd.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isPassword();
        }
    })
    /*验证两次输入密码是否一样*/
    $reLoginPwd.blur(function () {
        var _this = $(this);
        isPassWordIsSame(_this);
    })
    /*验证登录名是否存在是否一样*/
    $loginName.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isloginNameExist();
        }
    })
    /*验证手机号是否存在*/
    $mobile.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isMobileExist();
        }
    })
    $next.on("click", function () {
        var loginName = $loginName.val();
        var userName = $userName.val();
        var loginPwd = $loginPwd.val();
        var reLoginPwd = $reLoginPwd.val();
        var companyType = $companyType.val();
        var idCard = $idCard.val();

        var data = {
            loginName: loginName,
            userName: userName,
            loginPwd: loginPwd,
            reLoginPwd: reLoginPwd,
            companyType: companyType,
            idCard: idCard,
        }
        if(checkParams(data)){
            var type = parseInt($companyType.val());
            switch (type) {
                case 1:
                    $(".gasLicensePath").remove();
                    //$(".sitePicPath").remove();
                    break;
                case 2:
                    $(".oilLicensePath").remove();
                    //$(".sitePicPath").remove();
                    break;
                case 3:
                    $(".gasLicensePath").remove();
                    $(".dangerLicensePath").remove();
                    $(".oilLicensePath").remove();
                    //$(".sitePicPath").remove();
                    break;
            }
            if (!isNaN(type)) {
                if (loginPwd == reLoginPwd) {
                    if ($isAgree.attr("checked")) {
                        $.popup(".registerPageTwo");
                    } else {
                        $.alert("同意平台协议，才可进行下一步操作");
                    }
                }else{
                    $.alert('两次输入的密码不一致');
                    return;
                }
            }else{
                $.alert("请先选择类型");
            }
        }
    })
    $companyType.on('change', function () {
        $.alert("该类型注册后不允许修改");
    })
    /*登录*/
    $loginBtn.on("click", function () {
        var loginName = $loginName.val();
        var loginPwd = $loginPwd.val();
        var data = {
            loginName: loginName,
            loginPwd: loginPwd
        }
        if (checkParams(data)) {
            var params = {
                url: '/vender/login',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        setCookie("companyType",response.data.companyType);
                        setCookie("id",response.data.id);
                        setCookie("token",response.data.token);
                        setCookie("status",response.data.status);
                        var message = {
                            "loginName": loginName,
                            'loginPwd': loginPwd,
                            "token": response.data.token,
                            "id": response.data.id,
                            "status": response.data.status,
                            "companyType": response.data.companyType
                        }
                        var messageStr = JSON.stringify(message);
                        setCookie("messageStr",messageStr);
                       /* getAPPMethod(function () {
                            if(window.gasstation){
                                window.gasstation.saveCookie(messageStr);
                            }
                        },function () {
                            if(window.webkit){
                                window.webkit.messageHandlers.saveCookie.postMessage(messageStr);
                            }
                        });*/
                        pageGo("index");
                    }else{
                        $.alert(response.retMsg||'登录失败');
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /*修改密码*/
    $modifyPasswordBtn.on("click", function () {
        var mobile = $mobile.val();
        var validateCode = $validateCode.val();
        var idCard = $idCard.val();
        var loginPwd = $loginPwd.val();
        var reLoginPwd = $reLoginPwd.val();
        var data = {
            mobile: mobile,
            validateCode: validateCode,
            idCard: idCard,
            loginPwd: loginPwd,
            reLoginPwd: reLoginPwd
        }
        if (checkParams(data)) {
            var params = {
                url: '/vender/resetPwd',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        $.alert('修改成功','',function () {
                            pageGo("login");
                        });
                    } else {
                        $.alert(response.retMsg);
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /*上传*/
    $(document).on('click', '.upload', function () {
        $(this).parent(".item-box").addClass("active").siblings(".item-box").removeClass("active");
        var type  = $(this).attr("data-type");
        var $this = $(this);
        /* getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto(type);
            }else{
                $.alert("暂不支持图片上传");
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage(type);
            }else{
                $.alert("暂不支持图片上传");
            }
        }) */
        UM.actionsheet({
            title : '',
            items : ['拍照', '从相册中选择'],
            callbacks : [camera, openPhotoAlbum]
        });
        function camera() {
            summer.openCamera({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        function openPhotoAlbum() {
            summer.openPhotoAlbum({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        // 把图片流上传用户中心
        function upload(path) {
            summer.showProgress();
            var fileArray = [];
            var item = {
                fileURL : path,
                type : "image/jpeg",
                name : "file" 
            };
            fileArray.push(item);
            summer.multiUpload({
                fileArray : fileArray,
                params : {},
                SERVER : BASE_URL + "/common/upload/uploadFile"
            }, function(ret) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "上传成功"
                });
                var photoPath = ret.data;
                $this.parent().css({
                    'background-image': 'url('+ BASE_URL + photoPath +')',
                    'background-position': 'center',
                    'background-size': '100% 100%'
                });
                $("#"+ type).val(photoPath);
            }, function(err) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "上传失败"
                });
            });
        }
    })
    var reg = /register/;
    if(reg.test(window.location.pathname)){
        //获取经纬度
    	 getLngLat(function (data) {
             lng = data[0];
             lat = data[1];
             setCookie("lng",lng);
             setCookie("lat",lat);
         },function () {
             lng = '116.40717';
             lat='39.90469';
             setCookie("lng",lng);
             setCookie("lat",lat);
             })
    }
  }
//});
function setImage(path,type) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        var itemBox = $("." + type);
        var url = path;
        var img = '<img src="/app' + url + '" class="photo"/>';
        itemBox.find(".imgBox").val(url);
        if(itemBox.find(".photo")){
        	itemBox.find(".photo").remove();	
        }
        itemBox.find(".item").append(img);
    }
}