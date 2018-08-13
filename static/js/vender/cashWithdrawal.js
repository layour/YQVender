/**
 * Created by Administrator on 2018/4/7.
 */
;//$(function () {
summerready = function(){
    'use strict';
    $.init();
    var id = getCookie("id");
    var cash_withdrawal_amount = 0;
    ajaxRequests('/venderWithdrawLog/withdrawalsApplyPre', 'get', {}, function (response) {
        if (response.retCode === '0') {
            var venderData = response.data.vender;
            var balance = venderData.collectAmount + venderData.rechargeAmount;
            $(".balance").html(balance);
            $(".cash-withdrawal-amount").html(venderData.collectAmount);
            cash_withdrawal_amount = venderData.collectAmount;
            $(".content").removeClass("dis-n");
            var venderBankCardList = response.data.venderBankCardList;
            var tmpl = '';

            if (venderData.collectAmount <= 0) {
                $.alert("提现金额不足", '',function () {
                    pageBack();
                });
            }else if(venderBankCardList.length<=0){
                $.alert('请您先添加银行卡，并联系平台客服，银行卡信息审核通过后才可进行提现操作','', function () {
                    pageGo('addBnak');
                });
            }else{
                $(".cash-form-box").removeClass("dis-n");
            }

            for (var i = 0; i < venderBankCardList.length; i++) {
                var bankInfo = venderBankCardList[i];
                var bankData = bankType(bankInfo.bankType);
                tmpl += '<option value="' + bankInfo.id + '" data-type="' + bankData.type + '">' + bankData.name +' '+ bankInfo.bankCardNo+ '</option>';
            }
            $("#venderBankCardId").append(tmpl);
        }
    })
    $("#submit").on("click", function () {
        var money = $("#money").val();
        var venderBankCardId = $("#venderBankCardId").val();
        var statusComment = $("#statusComment").val();
        if (money == "" || money <= 0) {
            $.toast("请输入提现金额", 2000, 'custom-toast');
            return;
        } else if (venderBankCardId == "") {
            $.toast("请选择要提现的账户", 2000, 'custom-toast');
            return;
        }else{
            if (cash_withdrawal_amount < money) {
                $.alert("您的提现金额大于可提现金额，请重新输入");
            }else{
                ajaxRequests('/venderWithdrawLog/withdrawalsApply', 'post', {
                    "body": {
                        money: money,
                        venderBankCardId: venderBankCardId,
                        statusComment: statusComment
                    },
                }, function (response) {
                    if (response.retCode === '0') {
                        $.alert("提现申请成功，请您稍后查看您的账户", "", function () {
                            window.history.back();
                        });
                    } else {
                        $.alert(response.retMsg || '收款失败');
                    }
                })
            }

        }
    })
    }
//});