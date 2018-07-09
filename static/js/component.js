Vue.component('find-item',{
    props:['item'],
    template:'<li>\n' +
'                                <div class="item-content">\n' +
'                                    <div class="item-media"><img src="http://gqianniu.alicdn.com/bao/uploaded/i4//tfscom/i3/TB10LfcHFXXXXXKXpXXXXXXXXXX_!!0-item_pic.jpg_250x250q60.jpg" width="44"></div>\n' +
'                                    <div class="item-inner">\n' +
'                                        <div class="item-title-row">\n' +
'                                            <div class="item-title">\n' +
'                                                <div class="flex-box">\n' +
'                                                    <div class="">起始地：{{ item.start }}</div>\n' +
'                                                    <div class="">目的地{{item.end}}</div>\n' +
'                                                </div>\n' +
'                                                <div class="flex-box">\n' +
'                                                    <div class="">车型：{{item.cartType}}</div>\n' +
'                                                    <div class="">货物：{{item.goods}}</div>\n' +
'                                                </div>\n' +
'                                                <div>联系方式：{{item.phone}}</div>\n' +
'                                            </div>\n' +
'                                        </div>\n' +
'                                        <div class="item-subtitle">子标题</div>\n' +
'                                    </div>\n' +
'                                </div>\n' +
'                            </li>'
})