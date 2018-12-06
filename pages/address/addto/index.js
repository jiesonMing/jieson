var config = require('../../../config.js')
var http = require('../../../utils/httpHelper.js')
//index.js
//获取应用实例
var app = getApp()
var sta = require("../../../utils/statistics.js");
Page({
  data: {
      address:''
  },
  //事件处理函数
  onLoad: function (options) {
    var that = this;
    app.getUserInfo(function (userInfo){
        that.setData({userInfo:userInfo});
    })
    //添加地址
    var id = options.id;
    //var openid = this.data.userInfo.openid;
    if(id != ''){
         var data = {appid:config.APPID,userid:this.data.userInfo.id,id:id,act:'ajax_address'};
         http.httpPost("/user.php" ,data,function(res){
            if(res.code == 1 && res.msg == 'success'){
                var address = res.data;
                that.setData({address:{id:id,name:address.username,address:address.address,tel:address.mobile}})
            }
         });
    }
  },
  onShow:function (){
      sta();
  },
  formSubmit: function (e){
      //提交表单
      
      var val = e.detail.value;
      if(this.data.address != ''){
          var data = {appid:config.APPID,userid:this.data.userInfo.id,id:this.data.address.id,username:val.name, mobile:val.tel,address:val.address,act:'ajax_editAddress'}
          http.httpPost("/user.php" ,data,function(res){
                 if(res.code == 1 && res.msg == 'success'){
                        wx.navigateBack();
                   wx.showToast({
                     title: '成功',
                     icon: 'success',
                     duration: 1000
                   });
                 }else{
                      //wx.navigateBack();
                 }
          });
      }else{
          var data = {appid:config.APPID,userid:this.data.userInfo.id,username:val.name, mobile:val.tel,address:val.address,act:'ajax_addAddress'};
          http.httpPost("/user.php" ,data,function(res){
                 if(res.code == 1 && res.msg == 'success'){
                        wx.navigateBack();
                    wx.showToast({
                      title: '成功',
                      icon: 'success',
                      duration: 1000
                    });
                 }else{
                        //wx.navigateBack();
                 }
          });
      }
  },
  deleteAddress:function(){
     
      if((this.data.address!='')&& (this.data.address.id!='')){
            var id = this.data.address.id;
            var data = {appid:config.APPID,userid:this.data.userInfo.id,id:id,  
                        act:'ajax_deleteAddress'};
            http.httpPost("/user.php" ,data,function(res){
                    if(res.code == 1 && res.msg == 'success'){
                            wx.showToast({
                                title: '删除地址成功！',
                                icon: 'success',
                                duration: 500
                            })
                            wx.navigateBack();
                    }else{
                            //wx.navigateBack();
                    }
            });
      }else{
          console.log("删除地址失败");
      }
  }
})
