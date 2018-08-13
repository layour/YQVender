/**
 * Created by Administrator on 2018/3/25.
 */
;//$(function () {
summerready = function(){
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
    var receiveUserId;
   $(document).on("click","#submit",function () {
       var sourceUserAmountType = selectedDOM("#sourceUserAmountType").val();
       var amount = $("#amount").val();
       var userName = $("#userName").val();
       var mobile = $("#mobile").val();
       var sm = $("#sm").val();
       if(isNUll(amount)){
           $.toast('转账金额不可为空', 2000, 'custom-toast');
           return;
       }else if(isNUll(userName)){
           $.toast('请输入对方姓名', 2000, 'custom-toast');
           return;
       }else if(isNUll(mobile)||mobile.length!=11){
           $.toast('请输入对方手机号', 2000, 'custom-toast');
           return;
       }else{
           if (sourceUserAmountType == 2) {
               ajaxRequests('/driverInfo/getInfo/'+mobile,"get","",function (response) {
                   if (response.retCode === '0') {
                       if (userName != response.data.userName) {
                           $.alert("您输入的手机号与姓名不匹配");
                       }else{
                           receiveUserId = response.data.id;
                           if(transferPre.carType){
                               var newAmount = amount/getTransfer(transferPre.carType, response.data.carType,transferPre);
                               $.confirm('你的支付金额为'+newAmount,
                                   function () {
                                       ajaxRequests('/driverTransfer/transfer','post',{
                                           "body": {
                                               receiveUserId:receiveUserId,
                                               sourceUserAmountType:sourceUserAmountType,
                                               amount:amount,
                                               userName:userName,
                                               mobile:mobile
                                           }
                                       },function (response) {
                                           if (response.retCode === '0') {
                                               $.alert("转账成功",function () {
                                                   pageBack();
                                               });
                                           }else {
                                               $.toast(response.retMsg||'转账失败',2000,'custom-toast');
                                           }
                                       });
                                   },
                                   function () {
                                       
                                   }
                               );
                           }else{
                               return;
                           }
                       }
                   }else {
                       $.alert(response.retMsg);
                   }
               })
           }else{
               ajaxRequests('/driverInfo/getInfo/' + mobile, "get", "", function (response) {
                   if (response.retCode === '0') {
                       if (userName != response.data.userName) {
                           $.alert("您输入的手机号与姓名不匹配");
                       } else {
                           receiveUserId = response.data.id;
                           ajaxRequests('/driverTransfer/transfer','post',{
                               "body": {
                                   receiveUserId:receiveUserId,
                                   sourceUserAmountType:sourceUserAmountType,
                                   amount:amount,
                                   userName:userName,
                                   mobile:mobile
                               }
                           },function (result) {
                               if (result.retCode === '0') {
                                   $.alert("转账成功",function () {
                                       pageBack();
                                   });
                               }else {
                                   $.toast(result.retMsg||'转账失败',2000,'custom-toast');
                               }
                           });
                       }
                   }else {
                       $.alert(response.retMsg);
                   }
               })
           }

       }
   })
    $.init();
   }
//})