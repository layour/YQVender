/**
 * Created by Administrator on 2018/4/5.
 */
$(function () {
    'use strict';
    ajaxRequests('/venderTransfer/oilGasTransferPre', 'get', {}, function (response) {
        if (response.retCode === '0') {
            console.log(response);
        }
    });
    $("#next").on("click",function () {
        var receiveUserName = $("#receiveUserName").val();
        var receiveUserMobile = $("#receiveUserMobile").val();
        var amount = $("#amount").val();
        var comm = $("#comm").val();
        var data = {
            receiveUserName:receiveUserName,
            receiveUserMobile:receiveUserMobile,
            amount:amount
        }
        if(checkParam(data)){
            $(".receiveUserName").html(receiveUserName);
            $(".receiveUserMobile").html(receiveUserMobile);
            $(".amount").html(amount);
            $(".comm").html(comm);
            $(this).addClass("open-popup");
        }
    })
    $("#submit").on("click", function () {
        var receiveUserName = $("#receiveUserName").val();
        var receiveUserMobile = $("#receiveUserMobile").val();
        var amount = $("#amount").val();
        var comm = $("#comm").val();
        ajaxRequests('/venderTransfer/oilGasTransfer', 'post', {
            "body": {
                receiveUserName: receiveUserName,
                receiveUserMobile: receiveUserMobile,
                amount: amount,
                comm: comm
            }
        }, function (response) {
            if (response.retCode === '0') {
                $.alert(response.retMsg || '转账成功','',function () {
                   pageBack();
                });
            } else {
                $.alert(response.retMsg || '转账失败');
            }
        })
    })
    $.init();
});

