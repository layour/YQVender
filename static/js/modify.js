/**
 * Created by Administrator on 2018/3/29.
 */
$(function () {
    $.init();
    function getDriverInfo() {
        var params = {
            url: '/driverInfo/info',
            type: 'get',
            callback: function (response) {
                if (response.retCode === '0') {
                    var userName = response.data.userName;
                    $("#userName").val(userName);
                    $("#headImgPath").attr("src", response.data.headImgPath);
                    $("#sex").val(response.data.sex);
                    $("#mobile").val(response.data.mobile);
                    $("#carNum").val(response.data.carNum);
                    selectedDOM("#province").val(response.data.provinceId);
                    selectedDOM("#province").text(response.data.provinceName);
                    selectedDOM("#city").val(response.data.cityId);
                    selectedDOM("#city").text(response.data.cityName);
                    selectedDOM("#county").val(response.data.countyId);
                    selectedDOM("#county").text(response.data.countyName);
                } else {
                    $.toast(response.retMsg || '登录失败', 2000, 'custom-toast');
                }
            }
        };
        ajaxRequest(params);
    }

    getDriverInfo();

    ProvinceCityDistrict();
    $(document).on("click","#save",function () {
        var id = getCookie("id");
        var headImgPath = $("#headImgPath").attr("src");
        var userName = $("#userName").val();
        var sex = selectedDOM("#sex").val();
        var provinceId = selectedDOM("#province").val();
        var provinceName = selectedDOM("#province").text();
        var cityId = selectedDOM("#city").val();
        var cityName = selectedDOM("#city").text();
        var countyId = selectedDOM("#county").val();
        var countyName = selectedDOM("#county").text();
        var mobile = $("#mobile").val();
        var params = {
            url:'/driverInfo/updateDriverInfo',
            type: 'post',
            data:{
                body:{
                    id:id,
                    headImgPath:headImgPath,
                    userName:userName,
                    sex:sex,
                    provinceId:provinceId,
                    provinceName:provinceName,
                    cityId:cityId,
                    cityName:cityName,
                    countyId:countyId,
                    countyName:countyName,
                    mobile:mobile
                }
            },
            callback:function (response) {
                if (response.retCode === '0') {
                    $.toast(response.retMsg, 2000, 'custom-toast');
                }else{
                    $.toast(response.retMsg || '修改失败', 2000, 'custom-toast');
                }
            }
        }
        ajaxRequest(params);
    })
})