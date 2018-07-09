$(function () {
    var id = getQueryString("id");
    var type = getQueryString("type");
    var infoId = '';
    var params = {
        url: '/driverInformationRelease/getInformationRelease/' + id,
        type: 'get',
        callback: function (response) {
            if (response.retCode === '0') {
                /*加载模板数据*/
                for (var i in response.data) {
                    if (i === "updateTime") {
                        response.data.updateTimes = timestampToTime(response.data.updateTime / 1000);
                    }
                }
                infoId = response.data.id;
                addItem("#list", response.data, ".list-block ul");
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        }
    }
    ajaxRequest(params);
    $(document).on("click","#submit",function () {
        var submitparams = {
            url: '/driverNoticeInfo/noticeInfo',
            type: 'post',
            data: {
                body: {
                    informationId: infoId
                }
            },
            callback: function (response) {
                if (response.retCode === '0') {
                    /*加载模板数据*/
                    $.alert("提交成功");
                    location.href="./message.html?type=1";
                } else {
                    $.alert(response.retMsg || '操作失败', "", 'custom-toast');
                }
            }
        }
        ajaxRequest(submitparams);
    });
    $.init();
})