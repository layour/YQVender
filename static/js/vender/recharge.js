/**
 * Created by Administrator on 2018/4/5.
 */
$(function () {
    'use strict';
    ajaxRequests("/venderRecharge/oilGasRechargePre", "get", '', function (response) {
        if (response.retCode === '0') {
            if (response.data) {
                var $amountSourceAccount = $("#amountSourceAccount");
                var $bankType = $("#bankType");
                var $amountSourceUsername = $("#amountSourceUsername");
                $amountSourceAccount.val(response.data.bankCardNo);
                $bankType.val(filterBankName(response.data.bankType));
                $amountSourceUsername.val(response.data.bankCardUname);
                $amountSourceAccount.attr("readonly","readonly");
                $bankType.attr("readonly","readonly");
                $amountSourceUsername.attr("readonly","readonly");
            }else{
                $.alert("您还未添加银行卡",'请先添加银行卡再操作',function () {
                    setCookie("bank_laiyuan","1");
                   pageGo("BankCard");
                });
            }
        }else{
            $.toast(response.retMsg || '网路异常', 2000, 'custom-toast');
        }
    })
    $("#submit").on("click", function () {
        var amountSourceUsername = $("#amountSourceUsername").val();
        var amountSourceAccount = $("#amountSourceAccount").val();
        var rechargeAmount = $("#rechargeAmount").val();
        var rechargeTime = $("#rechargeTime").val();
        if (amountSourceUsername == "") {
            $.toast("充值者公司名不可为空", 3000);
            return;
        } else if (!checkBankNO(amountSourceAccount)) {
            $.toast('请输入正确的银行卡号', 2000, 'custom-toast');
            return;
        }else if (rechargeAmount == "" || rechargeAmount <= 0) {
            $.toast("请输入大于0的转账金额", 3000);
            return;
        } else{
            ajaxRequests('/venderRecharge/oilGasRecharge', 'post', {
                "body": {
                    amountSourceUsername: amountSourceUsername,
                    amountSourceAccount: amountSourceAccount,
                    rechargeAmount: rechargeAmount,
                    rechargeTime: rechargeTime+":00",
                }
            }, function (response) {
                if (response.retCode === '0') {
                    $.alert(response.retMsg || '充值成功','',function () {
                        pageBack();
                    });
                } else {
                    $.alert(response.retMsg || '充值失败');
                }
            })
        }
    })
    $("#rechargeTime").datetimePicker({
        value: getCurrentTime()
    });
    $.init();
});

