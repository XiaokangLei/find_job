const api = require('../../utils/api.js');
const regeneratorRuntime = require('../../utils/runtime.js');
const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    ishot:1000000,
    isFirst: true,
    floorstatus: false,
    isSearch: 0,
    posts: [],
    timer: '',
    page: 1,
    filter: "",
    nodata: false,
    nomore: false,
    defaultSearchValue: "",
    navItems: [{
      name: '最新校招',
      index: 1
    }, {
      name: '热门企业',
      index: 2
    }, {
      name: '即将截止',
      index: 3
    }],
    tabCur: 1,
    scrollLeft: 0,
    showHot: false,
    showLabels: false,
    hotItems: ["浏览最多", "评论最多", "点赞最多", "收藏最多"],
    hotCur: 0,
    labelList: [],
    labelCur: "全部",
    whereItem: ['', 'data_1', ''], //下拉查询条件
    showLogin: false,
    swiperList: [],
    cardCur: 0
  },

  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let that = this
    this.towerSwiper('swiperList')
    // 初始化towerSwiper 传已有的数组名即可
    //有openid跳授权计算积分
    if (options.openid) {
      let shareOpenId = options.openid
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

      if (that.data.userInfo) {
        let info = {
          shareOpenId: shareOpenId,
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl
        }
        await api.addShareDetail(info)
      }
    }
    await that.getSwiper()
    await that.getPostsList('', 'data_1')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    let that = this
    await api.addViewNum()
    await that.getThreshodNum()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  cancelSearch: function () {
    let that = this;
    let page = 1
    that.setData({
      isSearch: 0,
      page: page,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: "",
      whereItem: ['', 'data_1', '']
    })
    that.getPostsList('', 'data_1')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    let that = this;
    let page = 1
    that.setData({
      isSearch: 0,
      page: page,
      posts: [],
      filter: "",
      nomore: false,
      nodata: false,
      defaultSearchValue: ""
    })
    await this.getPostsList("")
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    let that = this
    // console.log('============',that.data.page)
    if (that.data.page) {
      let whereItem = this.data.whereItem
      let filter = this.data.filter
      await this.getPostsList(whereItem[0], whereItem[1], whereItem[2])
    } else {
      that.setData({
        nomore: true
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{title:"最新名企校招、内推信息",imageUrl:'https://7465-test-we0f3-1301386292.tcb.qcloud.la/img/shareindex.jpg?sign=e30144421a4f6801b8294585d836c36f&t=1595777772'}
  },
  /**
   * 点击文章明细
   */
  bindPostDetail: function (e) {
    let blogId = e.currentTarget.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + blogId
    })
  },
  /**
   * 搜索功能
   * @param {} e 
   */
  bindconfirm: async function (e) {
    let that = this;
    console.log('e.detail.value', e.detail.value)
    let page = 1
    that.setData({
      isSearch: 1,
      page: page,
      posts: [],
      filter: e.detail.value,
      nomore: false,
      nodata: false,
      whereItem: [e.detail.value, 'data_1', '']
    })
    await this.getPostsList(e.detail.value, 'data_1')
  },

  /**
   * tab切换
   * @param {} e 
   */
  tabSelect: async function (e) {
    let that = this;
    let tabCur = e.currentTarget.dataset.id

    switch (tabCur) {
      case 1: {
        that.setData({
          tabCur: e.currentTarget.dataset.id,
          scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
          nomore: false,
          nodata: false,
          posts: [],
          page: 1,
          showHot:false,
          whereItem: ['', 'data_1', '']
        })
        await that.getPostsList("", 'data_1')
        break
      }
      case 2: {
        that.data.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
        that.data.page= 1
        that.data.whereItem = ['', 'totalVisits', '']
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          nomore: false,
          nodata: false,
          showHot:true
        })
        await that.getPostsList("", "totalVisits")
        break
      }
      case 3: {
        that.data.page = 1
        that.data.scrollLeft = (e.currentTarget.dataset.id - 1) * 60
        that.setData({
          posts: [],
          tabCur: e.currentTarget.dataset.id,
          nomore: false,
          nodata: false,
          showHot:false,
          whereItem: ['', 'data_2', 'true']
        })
        let task = that.getPostsList("", 'data_2','true')
        await task
        break
      }
    }
  },

  /**
   * 热门按钮切换
   * @param {*} e 
   */
  hotSelect: async function (e) {
    let that = this
    let hotCur = e.currentTarget.dataset.id
    let orderBy = "totalVisits"
    switch (hotCur) {
      //浏览最多
      case 0: {
        orderBy = "totalVisits"
        break
      }
      //评论最多
      case 1: {
        orderBy = "totalComments"
        break
      }
      //点赞最多
      case 2: {
        orderBy = "totalZans"
        break
      }
      //收藏最多
      case 3: {
        orderBy = "totalCollection"
        break
      }
    }
    that.data.page = 1
    that.data.whereItem = ['', orderBy, '']
    that.setData({
      posts: [],
      hotCur: hotCur,
      defaultSearchValue: "",
      // page: 1,
      nomore: false,
      nodata: false,
      // whereItem: ['', orderBy, '']
    })
    await that.getPostsList("", orderBy)
  },

  /**
   * 标签按钮切换
   * @param {*} e 
   */
  labelSelect: async function (e) {
    let that = this
    let labelCur = e.currentTarget.dataset.id
    that.setData({
      posts: [],
      labelCur: labelCur,
      defaultSearchValue: "",
      page: 1,
      nomore: false,
      nodata: false,
      whereItem: ['', 'data_1', labelCur == "全部" ? "" : labelCur]
    })
    await that.getPostsList("", "data_1", labelCur == "全部" ? "" : labelCur)
  },

  /**
   * 返回
   */
  navigateBack: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },

  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },

  getSwiper:async function(){
    let that = this
    let result = await api.getSwiper()
    that.setData({
      swiperList: that.data.posts.concat(result.data),
    })
  },

    /**
   * @param {} visitTotal
   */
  getThreshodNum: async function () {
    let that = this;
    let res = await api.getViewNum();
    that.setData({
      ishot: res.data[0].ishot
    })
    // 然后每隔一秒执行一次倒计时函数(局部刷新)
  },

  /**
   * 获取文章列表
   */
  getPostsList: async function (filter, orderBy, label) {
    wx.showLoading({
      title: '加载中...',
    })
    let that = this

    let page = that.data.page
    if (that.data.nomore) {
      wx.hideLoading()
      return
    }
    console.log("page-1：",that.data.page)
    let result = await api.getPostsList(page, filter, 1, orderBy, label)
    console.log('result:', result)
    if (result.data.length === 0) {
      that.setData({
        nomore: true
      })
      if (page === 1) {
        that.setData({
          nodata: true,
          nomore: false
        })
      }
    } else {
      if (page === 1) {
        that.setData({
          posts: []
        })
      }
      that.data.page =  that.data.page + 1,
      console.log("page-2：",that.data.page)
      result.data.forEach(o => {
        if(new Date(o.data_2) < new Date(Date.now())){
          o.isnow = false
        }
      })
      that.setData({
        posts: that.data.posts.concat(result.data),
      })
    }
    wx.hideLoading()
  }
})