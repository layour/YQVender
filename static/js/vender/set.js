/**
 * Created by Administrator on 2018/4/9.
 */
;//$(function () {
summerready = function(){
    $.init();
    $(document).on('click', "#outLogin", function () {
        ajaxRequests('/venderInfo/loginOut', 'get', {
        }, function (response) {
            if (response.retCode === '0') {
                $.alert(response.retMsg, '', function () {
                    delCookie("token");
                    delCookie("id");
                    delCookie("companyType");
                 /*   getAPPMethod(function () {
                        if(window.gasstation){
                            window.gasstation.delete();
                        }
                    },function () {
                        if(window.webkit){
                            window.webkit.messageHandlers.delete.postMessage(null);
                        }
                    });*/
                    pageGo('login');
                });
            } else {
                $.alert(response.retMsg);
            }
        })
    })
    }

//})