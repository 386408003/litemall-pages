// about.js
var app = getApp()
var util = require("../../utils/util.js");
var api = require("../../config/api.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    load_statue: true,
    shopInfo: {
      name: '天瑜瑜珈工作室',
      desc: '天瑜瑜珈工作室',
      address: '郑州市经开区九大街航海路交叉口南500米',
      latitude: 34.718656,
      longitude: 113.769854,
      scale: 14,
      linkPhone: '15617927721',
      qqNumber: '386408003',
      version: '1.0.0'
    },
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.loadShopInfo();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  loadShopInfo: function () {
    let that = this;
    util.request(api.AboutList).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          shopInfo: {
            name: res.data.tianyu_wx_about_name,
            desc: res.data.tianyu_wx_about_desc,
            address: res.data.tianyu_wx_about_address,
            latitude: res.data.tianyu_wx_about_latitude,
            longitude: res.data.tianyu_wx_about_longitude,
            scale: res.data.tianyu_wx_about_scale,
            linkPhone: res.data.tianyu_wx_about_linkPhone,
            qqNumber: res.data.tianyu_wx_about_qqNumber,
            version: res.data.tianyu_wx_about_version
          }
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadShopInfo();
  },

  showLocation: function (e) {
    var that = this
    wx.openLocation({
      latitude: parseFloat(that.data.shopInfo.latitude),
      longitude: parseFloat(that.data.shopInfo.longitude),
      name: that.data.shopInfo.name,
      address: that.data.shopInfo.address,
      scale: parseInt(that.data.shopInfo.scale)
    })
  },
  callPhone: function (e) {
    var that = this
    wx.makePhoneCall({
      phoneNumber: that.data.shopInfo.linkPhone,
    })
  },
  reLoad: function (e) {
    this.loadShopInfo();
  }
})