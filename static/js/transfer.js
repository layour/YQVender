/**
 * Created by Administrator on 2018/3/25.
 */
$(function () {
    var transferPre;
    var param = {
        url: '/driverTransfer/transferPre',
        type: 'get',
        callback: function (response) {
            if (response.retCode === '0') {
               console.log(response);
                transferPre = response.data;
            } else {
                $.toast(response.retMsg || '登录失败', 2000, 'custom-toast');
            }
        }
    };
    ajaxRequest(param);
    $("#mobile").blur(function () {
        var mobile = $(this).val();
        if((!isNUll(mobile)) && mobile.length == 11){
            var id = '';
            var params ={
                url:'/driverInfo/getInfo/'+mobile,
                type:'get',
                callback:function (response) {
                    if (response.retCode === '0') {
                        id = response.data.id;
                        $(this).attr("data-id");
                    }else {
                        $.toast(response.retMsg||'上传失败',2000,'custom-toast');
                    }
                }
            }
            ajaxRequest(params);
        }else{
            $.toast("手机号输入有误");
        }
    })
   $(document).on("click","#submit",function () {
       var sourceUserAmountType = selectedDOM("#sourceUserAmountType").val();
       var amount = $("#amount").val();
       var userName = $("#userName").val();
       var mobile = $("#mobile").val();
       var sm = $("#sm").val();
       var $carType = $("#carType");
       var $total = $("#total");
       var params = {
           url: '/driverTransfer/transfer',
           type:'post',
           data: {
               "body": {
                   receiveUserId:2,
                   sourceUserAmountType:sourceUserAmountType,
                   amount:amount,
                   userName:userName,
                   mobile:mobile
               }
           },
           callback: function (response) {
               if (response.retCode === '0') {
                   $.toast("转账成功");
                   window.location.back();
               }else {
                   $.toast(response.retMsg||'上传失败',2000,'custom-toast');
               }
           }
       }
       ajaxRequest(params);
   })
    $.init();
})