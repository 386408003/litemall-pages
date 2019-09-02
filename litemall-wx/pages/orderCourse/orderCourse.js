const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

// 获取应用实例
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    calendar: [],
    scrollLeft: 0, //94一格
    scrollHeight: 0, //190一格
    currentIndex: 0,
    currentDate:'',
    hdflag:0
  },
  // 通过课程数量计算页面高度
  calcScrollHeight: function () {
    let courseLen = this.data.calendar[this.data.currentIndex].courseInfo.length;
    // console.log(courseLen);
    // 没有课程也可滑动
    if (courseLen < 5) {
      courseLen = 4.9;
    }
    return 190 * courseLen;
  },

  onQuery: function () {
    var that = this;
    // 获取所有课程信息
    util.request(api.CourseList).then(function (res) {
      if (res.errno === 0) {
        // 先赋值calendar
        that.setData({
          calendar: res.data.list
        });
        that.setData({
          scrollHeight: that.calcScrollHeight()
        });
      }
      // console.log(that.data.calendar);
    });
  },
  //获取所有某天课程信息
  onQueryCourse: function () {
    var that = this;
    util.request(api.CourseInfo, {
      cDate: that.data.currentDate
    }).then(function (res) {
      if (res.errno === 0) {
        // console.log(that.data.calendar[that.data.currentIndex].courseInfo);
        // console.log(res.data.list);
        let courseInfo = "calendar[" + that.data.currentIndex + "].courseInfo";
        that.setData({
          [courseInfo]: res.data.list
        })
      }
      // console.log(that.data.calendar);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    // 首次onLoad赋值今天
    var curDate = util.formatTime(new Date());
    console.log(curDate);
    if (!that.data.currentDate){
      that.setData({
        currentDate: curDate.substring(0, 10)
      })
    }
    that.onQuery();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.onQuery();
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },
  /*
  // 禁止手动滑动
  stopTouchMove: function () {
    return false;
  },*/
  // 选择日期
  selectDate: function (event) {
    // 为上半部分的点击事件
    // console.log(event.currentTarget.dataset.index);
    // console.log(event.currentTarget.dataset.date + "测试");
    this.setData({
      currentIndex: event.currentTarget.dataset.index,
      currentDate: event.currentTarget.dataset.date
    })
    this.setData({
      scrollLeft: 94 * (this.data.currentIndex - 2),
      scrollHeight: this.calcScrollHeight()
    })
    this.onQueryCourse();
  },
  // 预约课程
  orderCourse: function (event) {
    var that = this;
    if (app.globalData.hasLogin) {
      // 获取本地数据
      let userInfo = wx.getStorageSync('userInfo');
      var phoneNumber = userInfo.phoneNumber;
      // console.log(phoneNumber);
      if (!phoneNumber) {
        util.showErrorToast('您还未绑定手机号')
        return false;
      }
      //console.log(event.detail.formId);
      //console.log(event.detail.value.coursePlanId);
      util.request(api.UserFormIdCreate, {
        formId: event.detail.formId
      }).then(function (res) {
        if (res.errno === 0) {
          // 生成formId后开始预约
          util.request(api.OrderCourse, {
            coursePlanId: event.detail.value.coursePlanId
          }, 'POST').then(function (res) {
            if (res.errno === 0) {
              wx.showToast({
                title: '预约成功'
              })
              that.onQueryCourse();
            } else {
              util.showErrorToast(res.errmsg);
            }
          });
        }
      });
    } else {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    };
  },
  // 滑动事件
  handletouchmove: function (event) {
    let currentX = event.touches[0].pageX;
    let currentY = event.touches[0].pageY;
    let tx = currentX - this.data.lastX;
    let ty = currentY - this.data.lastY;
    let text = "";
    // 左右方向滑动
    if (Math.abs(tx) > Math.abs(ty)) {
      if (tx < 0) {
        text = "向左滑动";
        this.data.hdflag = 1;
      } else if (tx > 0) {
        text = "向右滑动";
        this.data.hdflag = 2;
      }
    // 上下方向滑动
    } else {
      if (ty < 0) {
        text = "向上滑动";
        this.data.hdflag = 3

      } else if (ty > 0) {
        text = "向下滑动";
        this.data.hdflag = 4
      }

    }
    // 将当前坐标进行保存以进行下一次计算
    this.data.lastX = currentX;
    this.data.lastY = currentY;
  },
  // 绑定事件---滑动完毕
  handletouchend: function (event) {
    let that = this;
    // console.log(that.data.hdflag);
    // 左滑
    if (that.data.hdflag == 1) {
      if (that.data.currentIndex >= that.data.calendar.length-1) {
        that.setData({
          currentIndex: that.data.calendar.length-1
        })
      } else {
        that.setData({
          currentIndex: that.data.currentIndex + 1
        })
      }
    // 右滑
    } else if (that.data.hdflag == 2) {
      if (that.data.currentIndex <= 0) {
        that.setData({
          currentIndex: 0
        })
      } else {
        that.setData({
          currentIndex: that.data.currentIndex - 1
        })
      }
    }
    that.setData({
      currentDate: that.data.calendar[that.data.currentIndex].date,
      scrollLeft: 94 * (that.data.currentIndex-2),
      scrollHeight: that.calcScrollHeight()
    })
    that.onQueryCourse();
  }
})