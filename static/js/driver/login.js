/**
 * Created by zhujinyu on 2018/3/6.
 */
;$(function () {
    'use strict';
    var $registerBtn = $("#register");//注册按钮
    var $mobile = $("#mobile");//手机号
    var $userName = $("#userName");//用户姓名
    var $numberPlate = $("#numberPlate");//车牌号
    var $password = $("#password");//密码
    var $repassword = $("#repassword");//确认密码
    var $msmcode = $("#code");//短信验证码
    var $isAgree = $(".isAgree");//是否同意协议
    var $fastRegister = $("#fastRegister");//快速注册按钮
    var $modifyPassword = $("#modifyPassword");//快速注册按钮
    var $cardId = $("#cardId");//快速注册按钮
    var $carType = $("#carType");//汽车类型
    var $fastRegisterAdd = $("#fastRegisterAdd");//快速注册补充
    var $login = $("#login");//登录按钮
    var $oldPayPwd = $("#oldPayPwd");//旧密码
    var $setPayPassword = $("#setPayPassword");//支付密码按钮

    /**验证手机号是否存在*/
    function isMobileExist() {
        var mobile = $mobile.val();
        var _li = $mobile.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
        if (reg.test(mobile) && mobile.length === 11) {
            ajaxRequests('/driver/checkMobile/' + mobile,'get','',function (response) {
                if (response.retCode === '0') {
                    $error_tip.html("");
                    $check_icon.css("display", "block");
                    $mobile.attr("data-checkMobile","1");
                } else {
                    $error_tip.html(response.retMsg||"手机号已存在");
                    $check_icon.css("display", "none");
                    $mobile.attr("data-checkMobile","0");
                }
            })
        } else {
            $error_tip.html("手机号格式不正确");
            $check_icon.css("display", "none");
            $mobile.attr("data-checkMobile","0");
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
            ajaxRequests('/driver/checkIdCard/' + cardId,'get',{},function (response) {
                if (response.retCode === '0') {
                    $error_tip.html("");
                    $check_icon.css("display", "block");
                } else {
                    $error_tip.html(response.retMsg);
                    $check_icon.css("display", "none");
                }
            })
        } else {
            $error_tip.html("请重新输入身份证号");
            $check_icon.css("display", "none");
        }
    }
    /**验证车牌号是否存在*/
    function isCardNumberExist() {
        var numberPlate = $numberPlate.val();
        var res = /(^[\u4E00-\u9FA5]{1}[A-Z0-9]{6}$)|(^[A-Z]{2}[A-Z0-9]{2}[A-Z0-9\u4E00-\u9FA5]{1}[A-Z0-9]{4}$)|(^[\u4E00-\u9FA5]{1}[A-Z0-9]{5}[挂学警军港澳]{1}$)|(^[A-Z]{2}[0-9]{5}$)|(^(08|38){1}[A-Z0-9]{4}[A-Z0-9挂学警军港澳]{1}$)/;
        var _li = $numberPlate.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        if (res.test(numberPlate)) {
            $error_tip.html("");
            $check_icon.css("display", "block");
        } else {
            $error_tip.html("车牌号不存在");
            $check_icon.css("display", "none");
        }
    }
    /*密码是否正确*/
    function isPassword() {
        var password = $password.val().trim();
        var _li = $password.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /[a-z0-9]{6,18}/;
        if (!reg.test(password)) {
            $error_tip.html("密码请输入6-18位的数字或字符");
            $check_icon.css("display", "none");
        } else {
            $error_tip.html("");
            $check_icon.css("display", "block");
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
                        $.alert('手机号不能为空');
                        break;
                    case 'validateCode':
                        $.alert('手机验证码不能为空');
                        break;
                    case 'idCard':
                        $.alert('身份证号不能为空');
                        break;
                    case 'loginPwd':
                        $.alert('密码不能为空');
                        break;
                    case 'rePwd':
                        $.alert('确认密码不能为空');
                        break;
                    case 'userName':
                        $.alert('用户名不能为空');
                        break;
                    case 'carNum':
                        $.alert('车牌号不能为空');
                        break;
                    case 'carType':
                        $.alert('请选择汽车类型');
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
                            $.alert('身份证输入不合法');
                            isTrue = false;
                            return false;
                        }
                        break;
                    case 'loginPwd':
                    case 'rePwd':
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
    $numberPlate.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isCardNumberExist();
        }
    })
    $password.blur(function () {
        if ($(this).attr("data-check") !== "no") {
            isPassword();
        }
    })
    $carType.on('change', function () {
        $.alert("该选项一经选择无法修改，请如实选择");
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
            if (checkParams(data)) {
                ajaxRequests('/driver/register','post',{
                    body:data
                },function (response) {
                    if (response.retCode === '0') {
                        setCookie("mobile",mobile);
                        setCookie("loginPwd",password);
                        $.alert('注册成功','',function () {
                            pageGo("login");
                        });
                    }else{
                        $.alert(response.retMsg || '注册失败');
                    }
                })
            }
        } else {
            $.alert("同意平台协议，才可进行下一步操作");
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
            var data = {
                mobile: mobile,
                loginPwd: password,
                rePwd: repassword,
                carType: carType,
                validateCode: msmcode,
                regStep: 1
            }
            if (checkParams(data)) {
                ajaxRequests('/driver/fastRegister','post',{
                    "body": data
                },function (response) {
                    if (response.retCode === '0') {
                        setCookie("mobile", mobile);
                        setCookie("loginPwd", password);
                        $.alert('注册成功', '', function () {
                            pageGo("login");
                        });
                    }else{
                        $.alert(response.retMsg || '注册失败');
                    }
                })
            }
        } else {
            $.alert("同意平台协议，才可进行下一步操作");
        }
    })
    /**忘记密码*/
    $modifyPassword.on("click", function () {
        var mobile = $mobile.val();
        var msmcode = $msmcode.val();
        // var cardId = $cardId.val();
        var password = $password.val();
        var repassword = $repassword.val();
        var data = {
            mobile: mobile,
            validateCode: msmcode,
            loginPwd: password,
            rePwd: repassword
        }
        if (checkParams(data)) {
            if (password == repassword) {
                ajaxRequests('/driver/resetPwd','post',{
                    "body": data
                },function (response) {
                    if (response.retCode === '0') {
                        $.alert('修改成功','',function () {
                            pageGo("login");
                        });
                    }else{
                        $.alert(response.retMsg || '操作失败');
                    }
                })
            }else{
                $.alert("两次输入的密码不一致");
            }

        }
    })
    /**快速注册补充*/
    $fastRegisterAdd.on("click", function () {
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
            ajaxRequests('/driver/addRegister','post',{
                "body": data
            },function (response) {
                if (response.retCode === '0') {
                    $.alert(response.retMsg||'注册补充成功','',function () {
                        pageBack();
                    });
                }else{
                    $.alert(response.retMsg || '操作失败', "");
                }
            })
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
                    	var id = response.data.id;
                    	var token = response.data.token;
                    	var carType = response.data.carType;
                        setCookie("loginName",mobile);
                        setCookie("loginPwd",password);
                        setCookie("carType",carType);
                        setCookie("id",id);
                        setCookie("token",token);
                        var message = {
                            "loginName": mobile,
                            'loginPwd': password,
                            'carType': carType,
                            "token": token,
                            "id": id
                        }
                        var messageStr = JSON.stringify(message);
                        getAPPMethod(function () {
                            if(window.gasstation){
                                window.gasstation.saveCookie(messageStr);
                            }
                        },function () {
                            if(window.webkit){
                                window.webkit.messageHandlers.saveCookie.postMessage(messageStr);
                            }
                        });
                        pageGo("index");
                    }else{
                        $.toast(response.retMsg||'登录失败', 3000);
                    }
                }
            }
            ajaxRequest(params);
        }
    });
    //注释自动登录
    // if(window.location.pathname=="/app/html/driver/login.html"){
    //     getAPPMethod(function () {
    //         var loginName = getCookie("loginName")
    //         var loginPwd = getCookie("loginPwd")
    //         if (loginName && loginPwd) {
    //             automaticLogin(loginName,loginPwd);
    //         }
    //     },function () {
    //
    //     },function () {
    //         var loginName = getCookie("loginName")
    //         var loginPwd = getCookie("loginPwd")
    //         if (loginName && loginPwd) {
    //         automaticLogin(loginName,loginPwd);
    //         }
    //     })
    // }
    $.init();
});