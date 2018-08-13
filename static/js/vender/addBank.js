/**
 * Created by zhujinyu on 2018/5/11.
 */
;//$(function () {
summerready = function(){
    var BankTypeData = config.bank_type;
    var bankTypeTmpl = '';
    BankTypeData.forEach(function (v) {
        bankTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
    })
    $("#bankType").html(bankTypeTmpl);
    $("#submit").on("click", function () {
        var bankType = $("#bankType").val();
        var bankNo = $("#bankNo").val();
        var bankName = $("#bankName").val();
        var openBankAddress = $("#openBankAddress").val();
        var bankCardNo = $("#bankCardNo").val();
        var bankCardUname = $("#bankCardUname").val();
        var bankFlag = $("input[name='bankFlag']:checked").val();
        var areaFlag = $("input[name='areaFlag']:checked").val();
        var statusComment = $("#statusComment").val();
        if (bankType == "") {
            $.toast('银行卡类型不能为空', 2000, 'custom-toast');
            return;
        }else if (bankNo == "") {
            $.toast('开户行行号不能为空', 2000, 'custom-toast');
            return;
        } else if (bankName == "") {
            $.toast('支行名称不能为空', 2000, 'custom-toast');
            return;
        }else if (!checkBankNO(bankCardNo)) {
            $.toast('请输入正确的银行卡号', 2000, 'custom-toast');
            return;
        } else if (bankCardUname == "") {
            $.toast('银行账户名不能为空', 2000, 'custom-toast');
            return;
        }else if (openBankAddress == "") {
            $.toast('开户行地址不能为空', 2000, 'custom-toast');
            return;
        } else if (bankFlag == "") {
            $.toast('请选择是否是否兰州银行', 2000, 'custom-toast');
            return;
        }else if (areaFlag == "") {
            $.toast('请选择是否是否是否是兰州市银行', 2000, 'custom-toast');
            return;
        }  else {
            ajaxRequests("/venderBankCard/oilGasBankCardAdd", 'post', {
                body: {
                    bankType: bankType,
                    bankNo: bankNo,
                    bankName: bankName,
                    bankCardNo: bankCardNo,
                    bankCardUname: bankCardUname,
                    openBankAddress: openBankAddress,
                    bankFlag:bankFlag,
                    areaFlag:areaFlag,
                    statusComment:statusComment
                }
            }, function (response) {
                if (response.retCode === '0') {
                    $.alert(response.retMsg || "添加成功", '', function () {
                        pageBack();
                    })
                } else {
                    $.alert(response.retMsg || "添加失败")
                }
            })
        }

    })
    }
//})