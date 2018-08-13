;//$(function () {
summerready = function(){
    var id = getQueryString("id");
    var type = getQueryString("type");
    var $submit = $("#submit");
    var infoId = '';
    $.showPreloader();
    ajaxRequests('/driverInformationRelease/getInformationRelease/' + id,'get','',function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            response.data.updateTimes = response.data.updateTime?timestampToTime(response.data.updateTime / 1000):timestampToTime(response.data.createTime / 1000);
            response.data.leaveTime = timestampToTime(response.data.leaveTime / 1000);
            response.data.beginAddress = (response.data.beginProvinceName || "") + (response.data.beginCityName || "") +(response.data.beginCountyName || "") + (response.data.beginAddress || "");
            response.data.endAddress = (response.data.endProvinceName || "") + (response.data.endCityName || "") + (response.data.endCountyName || "") +(response.data.endAddress || "");

            infoId = response.data.id;
            // if (response.data.driverNoticeInfoCount >= 1) {
            //     $submit.html("已关注");
            //     $submit.attr("data-Clickable",0);
            // }
            addItem("#list", response.data, ".list-block ul");
            // if (type != 3) {
            //     $(".content-block").removeClass("dis-n");
            // }
            $.hidePreloader();
        } else {
            $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
        }
    })
    $(document).on("click","#submit",function () {
        if ($submit.attr("data-Clickable") == 1) {
            ajaxRequests('/driverNoticeInfo/noticeInfo', 'post', {
                body: {
                    informationId: infoId
                }
            }, function (response) {
                if (response.retCode === '0') {
                    /*加载模板数据*/
                    $.alert("提交成功", '', function () {
                        location.href = "./message.html?type=1";
                    });
                } else {
                    $.alert(response.retMsg || '操作失败', "", function () {
                        pageBack();
                    });
                }
            })
        } else {
            $.toast("您已关注这条消息,可在我的信息里查看", 3000);
        }
    });
    $.init();
    }
//})