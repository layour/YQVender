/**
 * Created by zhujinyu on 2018/2/6.
 */
var config = {
    // 路由功能开关过滤器，返回 false 表示当前点击链接不使用路由
    routerFilter: function($link) {
        // 某个区域的 a 链接不想使用路由功能
        if ($link.is('.disable-router a')) {
            return false;
        }

        return true;
    },
    pageSize:5,
	defaultCompanyTpe:1,
    indexBanner:[
        {
            img_url:'../../static/img/b1.jpg',
        },
        {
            img_url:'../../static/img/b2.jpg',
        },
        {
            img_url:'../../static/img/b3.jpg',
        },
        {
            img_url:'../../static/img/b4.jpg',
        }
    ],
    indexNav:[{
        id:'1',
        href:'#tab1',
        className:'active',
        companyTpe:'1',
        imgUrl:'../../static/img/oil.svg',
        name:'加油站'
    },{
        id:'2',
        href:'#tab2',
        className:'',
        companyTpe:'2',
        imgUrl:'../../static/img/Gas.svg',
        name:'加气站'
    },{
        id:'3',
        href:'map.html',
        className:'',
        companyTpe:'',
        imgUrl:'../../static/img/service.svg',
        name:'维修站'
    }],
    findBanner: [
        {
            img_url: '../../static/img/b5.jpg',
            url: 'javascript:;',
        },
        {
            img_url: '../../static/img/b6.jpg',
            url: 'javascript:;'
        },
        {
            img_url: '../../static/img/b7.jpg',
            url: 'javascript:;'
        },
        {
            img_url: '../../static/img/b8.jpg',
            url: 'javascript:;'
        }
    ],
    driver_findOutLink:[
        {
            img_url: '../../static/img/jd.jpg',
            url: 'javascript:;',
            title:'京东'
        },
        {
            img_url: '../../static/img/tuhu.jpg',
            url: 'javascript:;',
            title:'途虎养车'
        },
        {
            img_url: '../../static/img/park.jpg',
            url: 'javascript:;',
            title:'违章查询'
        },
        {
            img_url: '../../static/img/find4.jpg',
            url: 'javascript:;',
            title:'智慧停车'
        }
    ],
    findInfo:{
        car: [{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }, {
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }, {
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }, {
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }, {
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }, {
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            start: '北京',
            end: '天津',
            type: '卡车',
            goods: '汽油',
            mobile: '13285073256'
        }],
        promotions:[{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            type: '加油站',
            sm: '消费满100元,优惠10元'
        }],
        others:[{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        },{
            imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg',
            message: '从北京到上海，A类货车一辆，价格面议',
            mobile: '13285963206'
        }]
    },
    findFilter: {
        car: {
            typeFirst: [
                {
                    isFirst:true,
                    name:'车型',
                    type:'carType'
                },
                {
                    notFirstLast:true,
                    name:'起始地',
                    type:'start'
                },
                {
                    isLast:true,
                    name:'目的地',
                    type:'end'
                },
                {
                    isLast:true,
                    name:'货物',
                    type:'goodsType'
                }
            ],
            list:[
                {
                    content:[{type:'1',value:'加油车'},{type:'2',value: '加气车'}]
                },
                {
                    content:[{type:'1',value:'北京'},{type:'2',value: '上海'}],
                },
                {
                    content:[{type:'1',value:'深圳'},{type:'2',value: '上海'}],
                }
            ],
            carType: {
                content:[{type:'1',value:'加油车'},{type:'2',value: '加气车'}]
            },
            start: {
                content:[{type:'1',value:'北京'},{type:'2',value: '上海'}],
            },
            end: {
                content:[{type:'1',value:'深圳'},{type:'2',value: '上海'}],
            },
            goodsType: {
                content:[{type:'1',value:'汽油'},{type:'2',value: '柴油'},{type:'3',value: '天然气'},{type:'4',value: '液化气'}],
            }
        },
        promotions: {
            typeFirst:[{
                isFirst:true,
                name:'商家类型',
                type:'venderType'
            }],
            list:[{
                content:[{type:'1',value:'加油站'},{type:'2',value: '加气站'}]
            }],
            venderType:{
                content:[{type:'1',value:'加油站'},{type:'2',value: '加气站'}]
            }

        },
        goods:{
            typeFirst:[{
                isFirst:true,
                name:'货物类型',
                type:'goodType'
            }],
            list:[{
                content:[{type:'1',value:'汽油'},{type:'2',value: '柴油'},{type:'3',value: '天然气'},{type:'4',value: '液化气'}]
            }],
            goodType:{
                content:[{type:'1',value:'汽油'},{type:'2',value: '柴油'},{type:'3',value: '天然气'},{type:'4',value: '液化气'}]
            }
        }
    },
    findDetail:{
        orders:[{
            name:'订单日期',
            describe:'2017-12-31 12:00:30',
            isNeedImg:false,
            imgUrl:''
        },
            {
                name:'起始地',
                describe:'北京',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'目的地',
                describe:'上海',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'联系人手机',
                describe:'13296589658',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'订单价格',
                describe:'200元',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'车牌号',
                describe:'G200A',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'出发时间',
                describe:'2017-12-31 12:00:30',
                isNeedImg:false,
                imgUrl:''
            },{
                name:'车辆照片',
                describe:'',
                isNeedImg:true,
                imgUrl:'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3736371700,3316776550&fm=27&gp=0.jpg'
            },{
                name:'订单描述',
                describe:'从北京到上海，大货车',
                isNeedImg:false,
                imgUrl:''
            }
        ]
    },
    receiveInfo:{
        list:[{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        },{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        },{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        },{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        },{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        },{
            title:'信息日期',
            date:'2017-3-26 12:30:30',
            describe:'我发布的消息'
        }]
    }
};