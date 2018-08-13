/**
 * Created by Administrator on 2018/4/1.
 */;
 //$(function () {
summerready = function(){
    var type;
    var $password = $("#password");
    var $repassword = $("#repassword");
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
    $("#modifyPassword").on("click", function () {
        var mobile = $("#mobile").val();
        var validateCode = $("#code").val();
        var cardId = $("#cardId").val();
        var password = $repassword.val();
        var data = {
            mobile: mobile,
            validateCode: validateCode,
            loginPwd: password,
            idCard: idCard
        }
        if (checkParam(data)) {
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
                        pageGo("set");
                    });
                } else {
                    $.alert(response.retMsg || '操作失败','',function () {
                        pageGo("set");
                    });
                }
            })
        }
    })
    $.init();
    }
//})
