//logs.js
var config = require('../../config.js')
var http = require('../..//utils/httpHelper.js')
var util = require('../../utils/util.js')
var sta = require("../../utils/statistics.js");
//获取应用实例
var app = getApp()
Page({
  data: {
    allGoods:{},
    sumPrice:0,
    address:''
  },
  onLoad: function () {
        var that = this;
        app.getUserInfo(function (userInfo){
            that.setData({
                  userInfo:userInfo
              });
        })
  },
  onShow:function (){
   sta();
    var allGoods =  wx.getStorageSync('shoppingcar');
    var checkedGoods = [];
    var sumPrice = 0;
    for(var i=0;i< allGoods.length;i++){
      if(allGoods[i].isChecked == true){
        var price = allGoods[i].price;
        var count =  allGoods[i].buycount;
        price = util.accMul(price,count);
        allGoods[i].pay = price;
        sumPrice = util.accAdd(sumPrice,price);
        checkedGoods.push(allGoods[i]);
      }
    }
    this.setData({ allGoods: checkedGoods, sumPrice:sumPrice });
    this.getDefaultAddress();
  },
  getDefaultAddress:function(){
        //获取地址
        var that = this;
        var data = {appid:config.APPID,userid:this.data.userInfo.id,act:'ajax_address'};
        http.httpPost("/user.php" ,data,function(res){
            if(res.code == 1 && res.msg == 'success'){
                var allAddress = res.data;
                var address = '';
                for(var i=0;i<allAddress.length;i++){
                    if( allAddress[i].isfirst == 1){
                        address = allAddress[i];
                        break;
                    }
                }
                if(address == '' && allAddress.length > 0){
                    address = allAddress[0];
                }
                that.setData({address:address});
            }
        });
  },
  creatOrder:function(amount,discount,payamount,gid,number,addressid,callback){
        var data ={appid:config.APPID,userid:this.data.userInfo.id,
                        amount:amount,
                        discount:discount,
                        payamount:payamount,
                        gid:gid,
                        status:0,
                        addressid:addressid,
                        number:number,
                        act:'ajax_createOrder'
                    };
        http.httpPost("/order.php" ,data,function(res){
            if(res.code == 1 && res.msg == 'success'){
                //订单创建成功
                 typeof callback == "function" && callback(res.data)
            }else{
                //订单创建失败
                 typeof callback == "function" && callback('')
            }  
        })
  },
  payOrderSuccess:function(orderid,status,callback){
        var data = {appid:config.APPID,userid:this.data.userInfo.id,
                        id:orderid,
                        status:status
                    };
        http.httpGet("?c=order&a=updateOrder" ,data,function(res){
            if(res.code == '200' && res.msg == 'success'){
                //订单支付成功
                 typeof callback == "function" && callback(res.data)
            }else{
                //订单支付失败
                 typeof callback == "function" && callback('')
            }  
        })
  },
  toAddress:function(){
      wx.navigateTo({url: '/pages/address/index'})
  },
  settlement:function (){
    var that = this;
    //检查地址是否为空
    if(this.data.address == ""){
        wx.showModal({
            title: '提示',
            content: '请您先添加邮寄地址！',
            success: function(res) {
              if (res.confirm) {
                  that.toAddress();
              }
              return;
            }
        })
    }
    //继续生成订单
    var addressid = this.data.address.id;
    var allGoods = this.data.allGoods;
    var gid = '',  number ='';
    allGoods.forEach(function(goods){
         if(gid == ''){
             gid = goods.id;
             number = goods.buycount;
         }else{
             gid = gid+','+goods.id;
             number = number+','+goods.buycount;
         }
    })
    /*wx.showToast({
            title: '正在下单...',
            icon: 'loading',
            duration: 1000
            });*/
    this.creatOrder(this.data.sumPrice/*amount*/,this.data.sumPrice/*discount*/,0/*payamount*/,gid,number,addressid,
        function(orderid){
           if(orderid != ''){
                try{
                  var allGoods = wx.getStorageSync('shoppingcar');
                  var noCheckedGoods = [];
                  var sumPrice = 0;
                  for (var i=0;i<allGoods.length;i++){
                    if (allGoods[i].isChecked == false) {
                      noCheckedGoods.push(allGoods[i]);
                      var price = allGoods[i].price;
                      var count = allGoods[i].buycount;
                      price = util.accMul(price, count);
                      sumPrice = util.accAdd(sumPrice, price);
                    }
                  }
                  wx.setStorageSync('shoppingcar', noCheckedGoods);
                  this.setData({
                    allGoods: noCheckedGoods,
                    sumPrice: sumPrice
                  });
                }catch(e){
                    console.log('清空购物车失败');
                }
                //创建订单成功，然后立刻拉起支付，支付成功跳转订单详情。不支付或者支付失败也跳转订单详情。
                console.log('下单成功，订单号为'+orderid)
                wx.redirectTo({url: '/pages/order/index'})
               
                /*wx.showToast({
                    title: '下单成功',
                    icon: 'success',
                    duration: 1000
                });*/
                //此处写支付
               
           }
    });
  }
})