//logs.js
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");
Page({
  data: {
    allGoods:{},
    sumPrice:0,
    isChecked:false
  },
  onLoad: function () {
  
  },
  onShow:function (){
    sta();
    this.showAllGoods();
  },
  settlement:function (){
    wx.navigateTo({url: '/pages/settlement/index'})
  },
  jia:function (e){
    this.jiaj(e,true);
  },
  jian:function (e){
    this.jiaj(e,false);
  },
  showAllGoods:function (){
    var allGoods =  wx.getStorageSync('shoppingcar');
    var sumPrice = 0;
    for(var i=0;i< allGoods.length;i++){
      if(allGoods[i].isChecked == true){
        var price = allGoods[i].price;
        var count =  allGoods[i].buycount;
        price = util.accMul(price,count);
        sumPrice = util.accAdd(sumPrice,price);
      }
    }

    this.setData({
      allGoods:allGoods,
      sumPrice:sumPrice
    });
  },
  toDetail:function(e){
      var id = e.currentTarget.dataset.id;
        wx.redirectTo({
          url: '../detail/index?id='+id}
        )
  },
  jiaj:function (e,boo){
    var id = e.currentTarget.dataset.id;
    var s = 0;
    var allGoods = this.data.allGoods;
    for(var i=0;i<allGoods.length;i++){
        if(allGoods[i].id==id){
            if(boo){
                s = allGoods[i].buycount+1;
            }else{
                s = allGoods[i].buycount-1;
            }
            //最低值不得低于1
            if(1>s){
                allGoods.splice(i, 1);
            }else{
                allGoods[i].buycount = s;
            }
            break;
          }
    }
    wx.setStorageSync('shoppingcar', allGoods);
    this.setData({
      allGoods:allGoods
    });
    this.showAllGoods();
  },
  // 购物车checked
  checked:function(e){
    var index = e.currentTarget.dataset.index;
    var allGoods = wx.getStorageSync('shoppingcar');
    if (allGoods[index].isChecked == true)
    {
      //不选择
      allGoods[index].isChecked = false;
    } else {
      //选择
      allGoods[index].isChecked = true;
    }
    wx.setStorageSync('shoppingcar', allGoods);
    this.setData({
      allGoods: allGoods
    });
    this.showAllGoods();

  }
})
