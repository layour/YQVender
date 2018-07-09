/**
 * Created by Administrator on 2018/4/1.
 */
$(function () {
    $.init();
    //判断支付密码是否存在
    var type;
    var oldPayPwd;
    var param1 = {
        url:'/driverInfo/checkPayPwdExist',
        type:'get',
        callback:function (response) {
            if (response.retCode === '0') {
               type = 2;
            }else{
                type = 1;
                $("#oldPayPwd").remove();
            }
        }
    }
    ajaxRequest(param1);
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
    $("#repassword").blur(function () {
        var _this = $(this);
        isPassWordIsSame(_this);
    })
    $("#submit").on("click", function () {
        var mobile = $("#submit").val();
        var msmcode = $("#code").val();
        var oldPayPwd = $("#oldPayPwd").val();
        var password = $("#password").val();
        var repassword = $("#repassword").val();
        var data = {
            mobile: mobile,
            validateCode: msmcode,
            oldPayPwd: oldPayPwd,
            payPwd: payPwd
        }
        if (checkParams(data)) {
            var params = {
                url: '/driverInfo/setOrUpdatePayPwd',
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
})
/**/
