/**
 * Created by Administrator on 2018/3/25.
 */
/*获取司机个人信息*/
function getDriverInfo() {
    var params = {
        url: '/driverInfo/info',
        type: 'get',
        callback: function (response) {
            if (response.retCode === '0') {
                var userName = response.data.userName;
                $(".user-name").html(userName);
                $(".driver-photo").attr("src",response.data.headImgPath);
                $(".driver-name").html(response.data.userName);
                $(".mobile").html(response.data.mobile);
                setCookie("own_amount", response.data.ownAmount);
                setCookie("turn_into_amount", response.data.turnIntoAmount);
                setCookie("score", response.data.score);
            } else {
                $.toast(response.retMsg || '登录失败', 2000, 'custom-toast');
            }
        }
    };
    ajaxRequest(params);
}
$(function () {
    $.init();
    getDriverInfo();
    var own_amount = parseFloat(getCookie("own_amount")).toFixed(2);
    var turn_into_amount = parseFloat(getCookie("turn_into_amount")).toFixed(2);
    var total = parseFloat(own_amount) + parseFloat(turn_into_amount);
    $("#total").html(parseFloat(total).toFixed(2));
    $("#own_amount").html(own_amount);
    $("#turn_into_amount").html(turn_into_amount);
    $(document).on("click",".save",function () {
        var img = document.getElementById("qrcode");
        // 将图片的src属性作为URL地址
        var url = img.src
        var a = document.createElement('a')
        var event = new MouseEvent('click')

        a.download = name || '下载图片名称'
        a.href = url

        a.dispatchEvent(event)
    })

})