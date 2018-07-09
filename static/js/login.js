/**
 * Created by zhujinyu on 2018/3/6.
 */
$(function () {
    'use strict';
    var $registerBtn = $("#register");//注册按钮
    var $mobile = $("#mobile");//手机号
    var $userName = $("#userName");//用户姓名
    var $numberPlate = $("#numberPlate");//车牌号
    var $password = $("#password");//密码
    var $repassword = $("#repassword");//确认密码
    var $msmcode = $("#code");//短信验证码
    var $getcode = $(".getcode");//发送短信验证码
    var $isAgree = $(".isAgree");//是否同意协议
    var $fastRegister = $("#fastRegister");//快速注册按钮
    var $modify_password = $("#modify_password");//快速注册按钮
    var $cardId = $("#cardId");//快速注册按钮
    var $carType = $("#carType");//汽车类型
    var $fastRegister_add = $("#fastRegister_add");//快速注册补充
    var $login = $("#login");//登录按钮
    var $uploadForm = $("#uploadForm");//上传form
    var $upload = $("#upload");//上传form按钮
    var $headImgPath = $("#headImgPath");//上传form按钮
    var $logo = $("#logo");//上传form按钮


    /**验证手机号是否存在*/
    function isMobileExist() {
        var mobile = $mobile.val();
        var _li = $mobile.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
        if (reg.test(mobile) && mobile.length === 11) {
            var params = {
                url: '/driver/checkMobile/' + mobile,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                    } else {
                        $error_tip.html(response.retMsg||"手机号已存在");
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

    /**验证身份证号是否存在*/
    function isIdCardExist() {
        var cardId = $cardId.val();
        var _li = $cardId.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法;
        if (reg.test(cardId)) {
            var params = {
                url: '/driver/checkIdCard/' + cardId,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                    } else {
                        $error_tip.html("身份证号不存在");
                        $check_icon.css("display", "none");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("身份证号不存在");
            $check_icon.css("display", "none");
        }
    }

    /**校验两次密码输入是否一致*/
    function isPassWordIsSame(obj) {
        var isTrue = false;
        var $error_tip = obj.siblings(".error-tip");
        var $check_icon = obj.siblings(".check-icon");
        if ($password.val() === $repassword.val()) {
            if ($password.val() === "") {
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

    /**判断是否为空*/
    function isNUll(param) {
        if (param == "" || typeof(param) == "undefined") {
            return true;
        } else {
            return false;
        }
    }

    /**检验参数是否为空*/
    function checkParams(params) {
        var isTrue = true;
        for (var i in params) {
            if (isNUll(params[i])) {
                isTrue = false;
                switch (i) {
                    case 'mobile':
                        $.alert('手机号不能为空', 1000, 'custom-toast');
                        break;
                    case 'validateCode':
                        $.alert('手机验证码不能为空', 1000, 'custom-toast');
                        break;
                    case 'idCard':
                        $.alert('身份证号不能为空', 1000, 'custom-toast');
                        break;
                    case 'loginPwd':
                        $.alert('密码不能为空', 1000, 'custom-toast');
                        break;
                    case 'rePwd':
                        $.alert('确认密码不能为空', 1000, 'custom-toast');
                        break;
                    case 'userName':
                        $.alert('用户名不能为空', 1000, 'custom-toast');
                        break;
                    case 'carNum':
                        $.alert('车牌号不能为空', 1000, 'custom-toast');
                        break;
                    case 'carType':
                        $.alert('请选择汽车类型', 1000, 'custom-toast');
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
                            $.alert('手机号输入格式不正确', 1000, 'custom-toast');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'validateCode':
                        if (params[i].length === 6) {
                            isTrue = true;
                        } else {
                            $.alert('手机验证码输入格式不正确', 1000, 'custom-toast');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'idCard':
                        var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法
                        if (reg.test(params[i])) {
                            isTrue = true;
                        } else {
                            $.alert('身份证输入不合法', 1000, 'custom-toast');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'loginPwd':
                    case 'rePwd':
                        if (params[i].length === 6) {
                            isTrue = true;
                        } else {
                            $.alert('请输入6位密码', 1000, 'custom-toast');
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

    $mobile.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isMobileExist();
        }
    })
    $repassword.blur(function () {
        var _this = $(this);
        isPassWordIsSame(_this);
    })
    $cardId.blur(function () {
		if ($(this).attr("data-check") !== "no") {
			isIdCardExist();
		}
    })
    $carType.on('change', function () {
        console.log(12);
        $.alert("该选项一经选择无法修改，请如实选择", 2000);
    })
    /**发送验证码*/
    $getcode.on("click", function () {
        var _this = $(this);
        var type = $(this).attr("data-type");
        if (_this.attr("data-end") === "1") {
            //判断倒计时是否结束
            var times = _this.attr("data-timeout");
            _this.attr("data-end", 1);
            _this.css("background", "#999");
            var data = {
                mobile: $mobile.val()
            };
            if (checkParams(data)) {
                var params = {
                    url: '/common/sms/sendValidateCode/'+type+'/'+data.mobile,
                    type: 'get',
                    callback: function (response) {
                        if (response.retCode === '0') {
                            Time($getcode, times);
                        }else{
                            $.alert(response.retMsg || '验证码发送失败', 500, 'custom-toast');
                        }
                    }
                }
                ajaxRequest(params);
            }
        }
    })
    /**注册*/
    $registerBtn.on("click", function () {
        if ($isAgree.attr("checked")) {
            var mobile = $mobile.val();
            var userName = $userName.val();
            var carNum = $numberPlate.val();
            var password = $password.val();
            var repassword = $repassword.val();
            var msmcode = $msmcode.val();
            var carType = $carType.val();
            var idCard = $cardId.val();
            var headImgPath = $headImgPath.val();
            var data = {
                mobile: mobile,
                validateCode: msmcode,
                userName: userName,
                idCard: idCard,
                carNum: carNum,
                carType: carType,
                loginPwd: password,
                rePwd: repassword
            }
            console.log(headImgPath);
            if (checkParams(data)) {
                var params = {
                    url: '/driver/register',
                    type: 'post',
                    data: {
                        "body": data
                    },
                    callback: function (response) {
                        if (response.retCode === '0') {
                            $.alert('注册成功', 2000, 'custom-toast');
                            location.href = "./login.html"
                        }else{
                            $.alert(response.retMsg || '注册失败', 2000, 'custom-toast');
                        }
                    }
                }
                ajaxRequest(params);
            }
        } else {
            $.alert("同意平台协议，才可进行下一步操作", 1000, 'custom-toast');
        }

    })
    /**快速注册*/
    $fastRegister.on("click", function () {
        if ($isAgree.attr("checked")) {
            var mobile = $mobile.val();
            var password = $password.val();
            var repassword = $repassword.val();
            var msmcode = $msmcode.val();
            var carType = $carType.val();
            var headImgPath = $headImgPath.val();
            var data = {
                mobile: mobile,
                loginPwd: password,
                rePwd: repassword,
                carType: carType,
                validateCode: msmcode,
                regStep: 1,
                headImgPath: headImgPath||'http://118.190.152.119/app/static/img/logo.png'
            }
            if (checkParams(data)) {
                var params = {
                    url: '/driver/fastRegister',
                    type: 'post',
                    data: {
                        "body": data
                    },
                    callback: function (response) {
                        if (response.retCode === '0') {
                            location.href = "./login.html"
                        }else{
                            $.alert(response.retMsg || '注册失败', 2000, 'custom-toast');
                        }
                    }
                }
                ajaxRequest(params);
            }else {
                $.alert('未校验通过');
            }
        } else {
            $.alert("同意平台协议，才可进行下一步操作", 1000, 'custom-toast');
        }
    })
    /**忘记密码*/
    $modify_password.on("click", function () {
        var mobile = $mobile.val();
        var msmcode = $msmcode.val();
        var cardId = $cardId.val();
        var password = $password.val();
        var repassword = $repassword.val();
        var data = {
            mobile: mobile,
            validateCode: msmcode,
            idCard: cardId,
            loginPwd: password,
            rePwd: repassword
        }
        if (checkParams(data)) {
            var params = {
                url: '/driver/resetPwd',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        $.alert('修改成功', 2000, 'custom-toast');
                        location.href = "./login.html"
                    }else{
                        $.alert(response.retMsg || '操作失败', 2000, 'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /**快速注册补充*/
    $fastRegister_add.on("click", function () {
        var userName = $userName.val();
        var carNum = $numberPlate.val();
        var idCard = $cardId.val();
        var data = {
            userName: userName,
            idCard: idCard,
            carNum: carNum,
            regStep: 2,
            id: getCookie("id")
        }
        if (checkParams(data)) {
            var params = {
                url: '/driver/addRegister',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        $.alert('注册成功', 2000, 'custom-toast');
                        location.href = "./login.html"
                    }else{
                        $.alert(response.retMsg || '操作失败', 2000, 'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /**登录*/
    $login.on("click", function () {
        var mobile = $mobile.val();
        var password = $password.val();
        var data = {
            loginName: mobile,
            loginPwd: password
        }
        if (checkParams(data)) {
            var params = {
                url: '/driver/login',
                type: 'post',
                data: {
                    "body": data
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        setCookie("loginName",loginName);
                        setCookie("loginPwd",loginPwd);
                        getAPPMethod(function () {
                            if(window.gasstation){
                                window.gasstation && window.gasstation.saveCookie(messageStr);
                            }else{
                                automaticLogin(loginName,loginPwd);
                            }
                        })

                        setCookie("id",response.data.id);
                        setCookie("token",response.data.token);
                        $.alert('登录成功', 2000, 'custom-toast');
                        location.href = "./index.html"
                    }else{
                        $.alert(response.retMsg||'登录失败',2000,'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }
    })
    /**上传*/
    $upload.on('change',function () {
        var params = {
            url: '/common/upload/uploadFile',
            callback: function (response) {
                if (response.retCode === '0') {
                    $logo.attr("src",BASE_URL+response.data);
                    $.alert('上传成功', 2000, 'custom-toast');
                    $headImgPath.val(response.data);
                }else {
                    $.alert(response.retMsg||'上传失败',2000,'custom-toast');
                }
            }
        }
        fromImgRequest(params)
    })
    $.init();

});