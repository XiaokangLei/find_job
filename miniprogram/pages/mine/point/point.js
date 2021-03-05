const config = require('../../../utils/config.js')
const api = require('../../../utils/api.js');
const util = require('../../../utils/util.js');
const regeneratorRuntime = require('../../../utils/runtime.js');
const app = getApp();
let rewardedVideoAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalPoints: 0,
    showBanner: false,
    showBannerId: "",
    signBtnTxt: "马上签到",
    signed: 0,
    signedRightCount: 0,
    signedDays: 0,
    showVIPModal: false,
    isVip: false,
    applyStatus: 0,
    showLogin: false,
    showPointDescModal: false, //积分说明弹窗
    highLighted: false,
    highLightBtnTxt: "立即兑换",
    member_id: "",
    shareList: [{
      nickName: "待邀请",
      bgUrl: "bg-gary",
      icon: "cuIcon-friendadd",
      style: ""
    }, {
      nickName: "待邀请",
      bgUrl: "bg-gary",
      icon: "cuIcon-friendadd"
    }, {
      nickName: "待邀请",
      bgUrl: "bg-gary",
      icon: "cuIcon-friendadd"
    }, {
      nickName: "待邀请",
      bgUrl: "bg-gary",
      icon: "cuIcon-friendadd"
    }, {
      nickName: "待邀请",
      bgUrl: "bg-gary",
      icon: "cuIcon-friendadd"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {

    let that = this
    let advert = app.globalData.advert
    if (advert.pointsStatus) {
      that.setData({
        showBanner: true,
        showBannerId: advert.pointsId
      })
    }

    app.checkUserInfo(function (userInfo, isLogin) {
      if (!isLogin) {
        that.setData({
          showLogin: true
        })
      } else {
        that.setData({
          userInfo: userInfo
        });
      }
    });

    let res = await api.getMemberInfo(app.globalData.openid)
    if (res.data.length > 0) {
      let memberInfo = res.data[0]
      that.data.applyStatus = memberInfo.applyStatus
      that.data.member_id = memberInfo._id
      that.sighRightCount = memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
      that.setData({
        signedDays: memberInfo.continueSignedCount,
        totalPoints: memberInfo.totalPoints,
        signed: util.formatTime(new Date()) == memberInfo.lastSignedDate ? 1 : 0,
        signBtnTxt: util.formatTime(new Date()) == memberInfo.lastSignedDate ? "已经完成" : "马上签到",
        // isVip: Number(memberInfo.level) > 1,
        // applyStatus: memberInfo.applyStatus,
        // signedRightCount: memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
        // member_id: memberInfo._id
      })
    }

    // if (advert.taskVideoStatus) {
    //   that.loadInterstitialAd(advert.taskVideoId);
    // }

    let shareList = await api.getShareDetailList(app.globalData.openid, util.formatTime(new Date()))
    let defaultShareList = that.data.shareList
    console.info(shareList)
    if (shareList.data.length > 0) {
      let i = 0
      shareList.data.forEach(item => {
        defaultShareList[i].nickName = item.nickName
        defaultShareList[i].bgUrl = ""
        defaultShareList[i].icon = ""
        defaultShareList[i].style = "background-image:url(" + item.avatarUrl + ");"
        i++
      });
      that.setData({
        shareList: defaultShareList
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let that = this
    let res = await api.getMemberInfo(app.globalData.openid)
    if (res.data.length > 0) {
      let memberInfo = res.data[0]
      that.data.applyStatus = memberInfo.applyStatus
      that.data.member_id = memberInfo._id
      that.sighRightCount = memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
      that.setData({
        signedDays: memberInfo.continueSignedCount,
        totalPoints: memberInfo.totalPoints,
        signed: util.formatTime(new Date()) == memberInfo.lastSignedDate ? 1 : 0,
        signBtnTxt: util.formatTime(new Date()) == memberInfo.lastSignedDate ? "已经完成" : "马上签到",
        // isVip: Number(memberInfo.level) > 1,
        // signedRightCount: memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
      })
    }
    await api.addViewNum()
  },

  clickHighLight: function () {

    let that = this
    if (that.data.totalPoints < 10000) {
      wx.showToast({
        title: "很抱歉，您的积分不够",
        icon: "none",
        duration: 2000
      });
      return;
    }
    if (that.data.isVip) {
      wx.showToast({
        title: "您已经是VIP啦",
        icon: "none",
        duration: 2000
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '是否确认兑换?',
      success(res) {
        if (res.confirm) {
          let info = {
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl,
          }

          api.addPoints("highNicknameRight", info).then((res) => {
            console.info(res)
            if (res.result) {
              that.setData({
                totalPoints: Number(that.data.totalPoints) - 10000
              })
              api.approveApplyVip(that.data.member_id, "pass", app.globalData.openid)
              wx.showToast({
                title: "兑换成功",
                icon: "none",
                duration: 2000
              });
            } else {
              wx.showToast({
                title: "程序有些小异常",
                icon: "none",
                duration: 2000
              });
            }
            wx.hideLoading()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 
   */
  onUnload: function () {
    if (rewardedVideoAd && rewardedVideoAd.destroy) {
      rewardedVideoAd.destroy()
    }
  },

  /**
   * 签到列表
   * @param {*} e 
   */
  clickSigned: async function (e) {
    wx.navigateTo({
      url: '../sign/sign?signedDays=' + this.data.signedDays + '&signed=' + this.data.signed + '&signedRightCount=' + this.data.signedRightCount
    })
  },

  /**
   * 展示积分使用明细
   * @param {} e 
   */
  showUsingDetail: async function (e) {
    wx.navigateTo({
      url: '../point/pointDetail'
    })
  },

  /**
   * 阅读文章
   * @param {*} e 
   */
  clickVip: async function (e) {
    let that = this
    if (that.data.isVip) {
      return;
    }
    console.info(that.data.applyStatus)
    if (that.data.applyStatus == 1) {
      wx.showToast({
        title: "已经申请，等待审核",
        icon: "none",
        duration: 2000
      });
      return;
    }

    that.setData({
      showVIPModal: true
    })
  },

  /**
   * 隐藏
   * @param {}} e 
   */
  hideModal: async function (e) {
    this.setData({
      showVIPModal: false
    })
  },

  /**
   * 展示积分说明
   * @param {} e 
   */
  showPointDesc: function (e) {
    this.setData({
      showPointDescModal: true
    })
  },

  /**
   * 隐藏积分说明
   * @param {*} e 
   */
  hidePointDesc: function (e) {
    this.setData({
      showPointDescModal: false
    })
  },


  /**
   * 分享邀请
   */
  onShareAppMessage: function () {
    return {
      title: '计算机学术会议日程助手',
      imageUrl: 'https://6669-final-40h4o-1301493105.tcb.qcloud.la/1jisuanjiguojihuiyi.jpg?sign=15ad5c948fd35dc8daae6b6b049d80c4&t=1588210743',
      path: '/pages/index/index?openid=' + app.globalData.openid
    }
  },

  /**
   * 展示打赏二维码
   * @param {} e 
   */
  showMoneryUrl: async function (e) {
    wx.previewImage({
      urls: [config.moneyUrl],
      current: config.moneyUrl
    })
  },

  /**
   * 返回
   */
  navigateBack: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 兑换漏签权益
   * @param {*} e 
   */
  clickForgetRight: function (e) {
    let that = this
    if (that.data.totalPoints < 200) {
      wx.showToast({
        title: "很抱歉，您的积分不够",
        icon: "none",
        duration: 2000
      });
      return;
    }

    if (that.data.signed) {
      wx.showToast({
        title: "您已经签到啦",
        icon: "none",
        duration: 2000
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '是否确认兑换?',
      success(res) {
        if (res.confirm) {
          // wx.showLoading({
          //   title: '处理中...',
          // })
          let info = {
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl,
          }
          api.addPoints("forgetSignRight", info).then((res) => {
            console.info(res)
            if (res.result) {
              that.setData({
                totalPoints: Number(that.data.totalPoints) - 200
              })
              wx.showToast({
                title: "兑换成功",
                icon: "none",
                duration: 2000
              });
            } else {
              wx.showToast({
                title: "程序有些小异常",
                icon: "none",
                duration: 2000
              });
            }
            wx.hideLoading()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})