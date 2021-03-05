const config = require('../../utils/config.js')
const util = require('../../utils/util.js')
const api = require('../../utils/api.js');
const regeneratorRuntime = require('../../utils/runtime.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    starCount: 0,
    ColorList: app.globalData.ColorList,
    color: 'red',
    forksCount: 0,
    width_: '',
    width_no: '',
    year:'',
    visitTotal: 0,
    visitTotal_real: 0,
    userInfo: {},
    showLogin: false,
    isAuthor: false,
    isVip: false,
    vipDesc: '申请VIP',
    showRedDot: '',
    signedDays: 0, //连续签到天数
    signed: 0,
    signedRightCount: 0,
    applyStatus: 0,
    showVIPModal: false,
    signBtnTxt: "每日打卡",
    iconList: [{
      icon: 'favorfill',
      color: 'yellow',
      badge: 0,
      name: '我的收藏',
      bindtap: "bindCollect"
    }, {
      icon: 'appreciatefill',
      color: 'red',
      badge: 0,
      name: '我的点赞',
      bindtap: "bindZan"
    }, {
      icon: 'noticefill',
      color: 'orange',
      badge: 0,
      name: '我的消息',
      bindtap: "bindNotice"
    }
    // , {
    //   icon: 'goodsfavor',
    //   color: 'green',
    //   badge: 0,
    //   name: '我的积分',
    //   bindtap: "bindPoint"
    // }
  ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this;
    let showRedDot = wx.getStorageSync('showRedDot');
    let d = new Date()
    var y = d.getFullYear()
    let old = new Date(y + '-01-01 00:00').getTime();
    let now = new Date().getTime();
    let change = ((now - old) / 1000 / 31536000 * 100).toFixed(2);
    setTimeout(function () {
      that.setData({
        width_: change + '%',
        width_no: 100 - parseFloat(change) + '%',
        year: y
      })
    }, 500)
    that.setData({
      showRedDot: showRedDot
    });
    await that.checkAuthor()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let that = this
    await that.getMemberInfo()
    await that.getViewNum()
    // await api.addViewNum()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 返回
   */
  navigateBack: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },

  /**
   * 获取用户头像
   * @param {} e 
   */
  getUserInfo: function (e) {
    let that = this
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        showLogin: !that.data.showLogin,
        userInfo: e.detail.userInfo
      });
    } else {
      wx.switchTab({
        url: '../index/index'
      })
    }
  },
  /**
   * 展示打赏二维码
   * @param {} e 
   */
  showQrcode: async function (e) {
    wx.previewImage({
      urls: [config.moneyUrl],
      current: config.moneyUrl
    })
  },
  /**
   * 展示微信二维码
   * @param {*} e 
   */
  showWechatCode: async function (e) {
    wx.previewImage({
      urls: [config.wechatUrl],
      current: config.wechatUrl
    })
  },
  /**
   * 跳转我的收藏
   * @param {*} e 
   */
  bindCollect: async function (e) {
    wx.navigateTo({
      url: '../mine/collection/collection?type=1'
    })
  },
  /**
   * 跳转我的点赞 
   * @param {*} e 
   */
  bindZan: async function (e) {
    wx.navigateTo({
      url: '../mine/collection/collection?type=2'
    })
  },

  /**
   * 后台设置
   * @param {} e 
   */
  showAdmin: async function (e) {
    wx.navigateTo({
      url: '../admin/index'
    })
  },

  /**
   * 历史版本
   * @param {} e 
   */
  showRelease: async function (e) {
    wx.navigateTo({
      url: '../mine/release/release'
    })
  },

  /**
   * 关于
   * @param {} e 
   */
  showAbout: async function (e) {
    wx.navigateTo({
      url: '../mine/about/about'
    })
  },

  /**
   * 我的消息
   * @param {*} e 
   */
  bindNotice: async function (e) {
    wx.navigateTo({
      url: '../mine/notice/notice'
    })
  },

  /**
   * 签到列表
   * @param {*} e 
   */
  btnSigned: async function (e) {
    wx.navigateTo({
      url: '../mine/sign/sign?signedDays=' + this.data.signedDays + '&signed=' + this.data.signed + '&signedRightCount=' + this.data.signedRightCount
    })
  },

  /**
   * 我的积分
   * @param {} e 
   */
  bindPoint: async function (e) {
    wx.navigateTo({
      url: '../mine/point/point'
    })
  },

  /**
   * @param {} visitTotal
   */
  getViewNum: async function () {
    let that = this;
    let res = await api.getViewNum();
    that.setData({
      visitTotal: res.data[0].visitTotal
    })
    // 然后每隔一秒执行一次倒计时函数(局部刷新)
  },

  /**
   * 验证是否是管理员
   */
  checkAuthor: async function (e) {
    let that = this;
    const value = wx.getStorageSync('isAuthor')
    if (value) {
      console.info(value)
      that.setData({
        isAuthor: value
      })
    } else {
      let res = await api.checkAuthor();
      console.info(res)
      wx.setStorageSync('isAuthor', res.result)
      that.setData({
        isAuthor: res.result
      })
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
   * VIP申请
   * @param {*} e 
   */
  clickVip: async function (e) {
    let that = this
    if (that.data.isVip) {
      return;
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

    console.info(that.data.applyStatus)
    if (that.data.applyStatus == 1) {
      wx.showToast({
        title: "已经申请，等待审核",
        icon: "none",
        duration: 3000
      });
      return;
    }

    that.setData({
      showVIPModal: true
    })
  },

  /**
   * 返回
   */
  navigateBack: function (e) {
    let that = this
    that.setData({
      showLogin: false
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
   * 正式提交
   */
  submitApplyVip: async function (accept, templateId, that) {
    try {

      wx.showLoading({
        title: '提交中...',
      })
      console.info(app.globalData.userInfo)
      let info = {
        nickName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl,
        accept: accept,
        templateId: templateId
      }
      let res = await api.applyVip(info)
      console.info(res)
      if (res.result) {
        wx.showToast({
          title: "申请成功，等待审批",
          icon: "none",
          duration: 3000
        });
        this.setData({
          showVIPModal: false,
          applyStatus: 1
        })
      } else {
        wx.showToast({
          title: "程序出错啦",
          icon: "none",
          duration: 3000
        });
      }

      wx.hideLoading()
    } catch (err) {
      wx.showToast({
        title: '程序有一点点小异常，操作失败啦',
        icon: 'none',
        duration: 1500
      })
      console.info(err)
      wx.hideLoading()
    }
  },


  /**
   * 申请VIP
   * @param {*} e 
   */
  applyVip: async function (e) {
    let that = this
    let tempalteId = 'mAgYBfTZFWh3x1ARZQ_i3P_eIiGNixZScBlpINgdBhw'
    wx.requestSubscribeMessage({
      tmplIds: [tempalteId],
      success(res) {
        console.info(res)
        that.submitApplyVip(res[tempalteId], tempalteId, that).then((res) => {
          console.info(res)
        })
      },
      fail(res) {
        console.info(res)
        wx.showToast({
          title: '程序有一点点小异常，操作失败啦',
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  /**
   * 获取用户信息
   * @param {} e 
   */
  getMemberInfo: async function (e) {

    let that = this
    try {
      let res = await api.getMemberInfo(app.globalData.openid)
      console.info(res)
      if (res.data.length > 0) {
        let memberInfo = res.data[0]
        that.data.applyStatus = memberInfo.applyStatus
        that.vipDesc = Number(memberInfo.level) > 1 ? "VIP" : "申请VIP"
        that.sighRightCount = memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
        that.setData({
          signedDays: new Date(util.formatTime(new Date())).getTime() - new Date(memberInfo.lastSignedDate).getTime() <= 86400000 ? memberInfo.continueSignedCount : 0,
          signed: util.formatTime(new Date()) == memberInfo.lastSignedDate ? 1 : 0,
          signBtnTxt: util.formatTime(new Date()) == memberInfo.lastSignedDate ? "今日已打卡" : "每日打卡",
          // vipDesc: Number(memberInfo.level) > 1 ? "VIP" : "申请VIP",
          // isVip: Number(memberInfo.level) > 1,
          // applyStatus: memberInfo.applyStatus,
          // signedRightCount: memberInfo.sighRightCount == undefined ? 0 : memberInfo.sighRightCount
        })
      }
    } catch (e) {
      console.info(e)
    }
  },
  hideModal(e) {
    this.setData({
      showVIPModal: false
    })
  },
})