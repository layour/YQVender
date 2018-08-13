;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    var ownAmount = 2500;//司机充值金额
    var turnIntoAmount = 300;//司机转账金额
    var price = 0;//单价
    var venderResourceId;//资源id
    var subtractPayment = 0;
    var payUseAmountType;
    var $venderResourceId = $("#resourceGrade");
    /*获取商家信息*/
    ajaxRequests('/driverVenderNoLogin/driverVenderInfo/' + id, "get", {}, function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            var dataList = response.data.vender;
            var venderResourceList = response.data.venderResourceList;
            var companyTpe = dataList.companyType;
            var siteInfo = getType(companyTpe);
            var data = $.extend(dataList, siteInfo);
            data.star = new Array();
            data.star.length = data.starNum;
            addItem("#detail_demo", data, "#detailList");
            getDriverInfo(data.mobile);
            var option = '';
            for (var i = 0; i < venderResourceList.length; i++) {
                var resourceGrade = venderResourceList[i].resourceGrade;
                option += '<option value="' + venderResourceList[i].id + '" data-unit="' + venderResourceList[i].usedUnitFee + '">' + filterOilAndGasType(resourceGrade) + '</option>';
            }
            $venderResourceId.html(option);
        } else {
            $.alert(response.retMsg || '操作失败');
        }
    })
    /*获取司机信息*/
    function getDriverInfo(driverMobile) {
        var params1 = {
            url: '/driverInfo/getInfo/' + driverMobile,
            type: 'get',
            callback: function (response) {
                if (response.retCode == "0") {
                    ownAmount = response.data.ownAmount || 0;
                    turnIntoAmount = response.data.turnIntoAmount || 0;
                }
            }
        }
        ajaxRequest(params1);
    }

    /*选择类型*/
    $(document).on("change", "#resource_type", function () {
        price = selectedDOM("#resource_type").attr("data-unit");
        price = setNumFixed2(price);
        venderResourceId = selectedDOM("#resource_type").attr("data-id");
        if (price > 0) {
            $(".price-box").css("display", "block");
            $(".price").html(price);
        } else {
            alert(0)
        }
    })
    /*选择支付方式*/
    $(document).on("change", "#pay_type", function () {
        var totalMoney = $("#consum_fee").val();
        var type = selectedDOM("#pay_type").val();
        var amountType = selectedDOM("#pay_type").attr("data-amount-type");
        payUseAmountType = selectedDOM("#pay_type").attr("data-type");
        type = parseInt(type);
        amountType = parseInt(amountType);
        console.log(turnIntoAmount);
        console.log(ownAmount);
        if (type == 1 && amountType == 1) {
            $(".left-amount").html(ownAmount);
            subtractPayment = ownAmount;
            $(".left-amount-box").css("display", "block");

        } else if (type == 1 && amountType == 2) {
            $(".left-amount").html(turnIntoAmount);
            subtractPayment = turnIntoAmount;
            $(".left-amount-box").css("display", "block");
        } else {
            subtractPayment = 0;
            $(".left-amount-box").css("display", "none");
            $(".amount-box").css("display", "none");
        }
        /*输入金额*/
        $(document).on("input", "#consum_fee", function () {
            var money = $(this).val();
            console.log(money)
            $(".amount").html(money);
        })
        /*提交支付*/
        $(document).on("click", "#submit", function () {
            /*密码校验*/
            $.prompt('请输入支付密码', function (value) {
                var parampayPwd = {
                    url: '/driverInfo/driverCheckPayPwd',
                    type: 'post',
                    data: {
                        body: {
                            'payPwd': value
                        }
                    },
                    callback: function (response) {
                        if (response.retCode === '0') {
                            submitPay();//提交支付
                        } else {
                            $.alert(response.retMsg || '操作失败');
                        }
                    }
                }
                ajaxRequest(parampayPwd);
            });


        })
        function submitPay() {
            var carNum = $carNum.val();
            var resourceOutDeviceNo = $("#resourceOutdeviceNo").val();
            var consumFee = $("#consumFee").val();
            var payType = $("#pay_type").val();
            var params2 = {
                url: '/driverPay/pay/' + id,
                type: 'post',
                data: {
                    body: {
                        venderId: id,
                        venderResourceId: venderResourceId,
                        carNum: carNum,
                        resourceOutDeviceNo: resourceOutDeviceNo,
                        consumFee: consumFee,
                        payType: payType,
                        payUseAmountType: payUseAmountType
                    }
                },
                callback: function (response) {
                    if (response.retCode === '0') {
                        $.alert("提交成功");
                        var result = {
                            billDetailId: response.data.billDetailId,
                            consumFeeRemainder: response.data.consumFeeRemainder,
                            consumFee: response.data.consumFee,
                            returnGiftAmount: response.data.returnGiftAmount,
                            payUseAmountType: response.data.payUseAmountType
                        }
                    } else {
                        alert(response.retMsg || '操作失败');
                    }
                }
            }
            ajaxRequest(params2);
        }

        $.init();
    })
    }
//});