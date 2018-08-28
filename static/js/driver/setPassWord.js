/**
 * Created by Administrator on 2018/4/1.
 */
;//$(function () {
summerready = function(){
    var type;
    var $password = $("#password");
    var $repassword = $("#repassword");
    $.showPreloader();
    //判断支付密码是否存在
    ajaxRequests("/driverInfo/checkPayPwdExist", "get", {}, function (response) {
        if (response.retCode === '0') {
            type = 2;
            $(".oldPayPwd").removeClass("dis-n");
            $(".title").html("修改支付密码")
        } else {
            type = 1;
            $(".title").html("设置支付密码")
        }
        $.hidePreloader();
    })
    /*校验两次密码输入是否一致*/
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

    $("#repassword").blur(function () {
        var _this = $(this);
        isPassWordIsSame(_this);
    })
    $("#setPayPassword").on("click", function () {
        var mobile = $("#mobile").val();
        var validateCode = $("#code").val();
        var oldPayPwd = $("#oldPayPwd").val();
        var password = $password.val();
        var repassword = $repassword.val()
        var data = {
            mobile: mobile,
            validateCode: validateCode,
            payPwd: password,
            type: type
        }
        if (checkParam(data)) {
            if(password == repassword){
                if(type != 1){
                    data.oldPayPwd = oldPayPwd;
                    if (oldPayPwd.length != 6) {
                        $.toast("旧密码输入不正确", 2000, 'custom-toast');
                        return;
                    }
                }
                ajaxRequests("/driverInfo/setOrUpdatePayPwd", "post", {
                    "body": data
                }, function (response) {
                    if (response.retCode === '0') {
                        var str;
                        if (type == 1) {
                            str = "设置密码成功";
                        } else {
                            str = "修改密码成功";
                        }
                        $.alert(str, "", function () {
                            pageBack();
                        });
                    } else {
                        $.alert(response.retMsg || '操作失败');
                    }
                })
            }else{
                $.alert('两次输入的密码不一致');
            }
        }
    })
    $.init();
    }
//})
