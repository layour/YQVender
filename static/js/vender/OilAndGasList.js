/**
 * Created by Administrator on 2018/4/6.
 */
;//$(function () {
summerready = function(){
    $.init();
    var id = getQueryString("id");

    //获取信息列表
    function getDataList() {
        ajaxRequests('/venderResource/venderResourceOilGasList','post',{
            "body": {
                pageNum: 1,
                pageSize: config.pageSize
            }
        },function (response) {
            if (response.retCode === '0') {
                var listData = response.data.list;
                if(listData){
                    for (var i = 0; i < listData.length; i++) {
                        listData[i].resourceType = filterOilAndGasType(listData[i].resourceGrade);
                        listData[i].isShowAuditStatus = listData[i].usedUnitFee <= 0 ? true : false;
                        listData[i].auditStatus = filterAuditStatus(listData[i].auditStatus);
                    }
                    addItem("#list",response.data,".list-box");
                }
                $(".content").removeClass("dis-n");
            }
        });
    }
    getDataList();
    $(document).on("click",'.del',function () {
        var id = $(this).attr("data-id");
        var _this = this;
        ajaxRequests('/venderResource/venderResourceOilGasDelete/'+id,'get',{

        },function (response) {
            if (response.retCode === '0') {
                $(_this).parents(".item").remove();
            } else {
                setNoDataContent();
            }
        });
    })
   }
//})

