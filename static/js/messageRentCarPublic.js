/**
 * Created by Administrator on 2018/4/1.
 */
$(function () {
    $.init();
    ProvinceCityDistrict(".address1 ");//地址三级联动
    ProvinceCityDistrict(".address2 ");//地址三级联动

    function getData() {
        var params = {
            url: '/driverInformationRelease/getAllInformationFeeTemplate',
            type: 'get',
            callback: function (response) {
                if (response.retCode === '0') {
                  console.log(response);
                } else {
                    $.toast(response.retMsg || '加载失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    }
    getData();
    $(document).on('click', '#infoPicPathUrl', function () {
        var src = window.gasstation.getPhoto();
        $(this).attr("src",src);
        $("#infoPicPath").val(src);
    })
    $(document).on("click","#next",function () {

        var params = {
            url: '/driverBillDetail/driverInvoiceApply',
            type: 'post',
            data: {
                body: {
                    infoType:1,
                    beginProvinceId:selectedDOM("#beginProvince").val(),
                    beginProvinceName:selectedDOM("#beginProvince").text(),
                    beginCityId:selectedDOM("#beginCity").val(),
                    beginCityName:selectedDOM("#beginCity").val(),
                    beginCountyId:selectedDOM("#beginCounty").val(),
                    beginCountyName:selectedDOM("#beginCounty").val(),
                    beginAddress:$("#beginAddress").val(),
                    endProvinceId:selectedDOM("#endProvince").val(),
                    endProvinceName:selectedDOM("#endProvince").text(),
                    endCityId:selectedDOM("#endCity").val(),
                    endCityName:selectedDOM("#endCity").val(),
                    endCountyId:selectedDOM("#endCounty").val(),
                    endCountyName:selectedDOM("#endCounty").val(),
                    endAddress:$("#endAddress").val(),
                    leaveTime:$("#leaveTime").val(),
                    infoDetail:$("#infoDetail").val(),
                    costTemplateId:1,
                    carType:selectedDOM("#carType"),
                    carTypeDesc:$("#carTypeDesc").val(),
                    infoPicPath:infoPicPath,
                    goodsType:selectedDOM("#goodsType").val()
                }
            },
            callback: function (response) {
                if (response.retCode === '0') {
                    $.toast(response.retMsg);
                    location.href="payInfo.html?type=5&id="+response.data.id;
                } else {
                    $.toast(response.retMsg || '申请失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    })

})