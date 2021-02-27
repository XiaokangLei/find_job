/**
 * 打赏二维码
 */
var moneyUrl ="https://7465-test-we0f3-1301386292.tcb.qcloud.la/img/zanshangma.png?sign=6f42bca422e3658c65c19a18fda67e7b&t=1595731597"

/**
 * 公众号二维码
 */
var wechatUrl ="https://6669-final-40h4o-1301493105.tcb.qcloud.la/wechat.jpg?sign=903085f029ad057673f5a5d602d28452&t=1587978479"

/**
 * 云开发环境
 */
var env ="test-we0f3"
//var env ="test-91f3af"
/**
 * 个人文章操作枚举
 */
var postRelatedType = {
    COLLECTION: 1,
    ZAN: 2,
    properties: {
        1: {
            desc: "收藏"
        },
        2: {
            desc: "点赞"
        }
    }
};

var subcributeTemplateId="SIRYR9e5ZeGykIDESk3n2siOEYurx5DsQZdFYSr2BmI"

module.exports = {
    postRelatedType: postRelatedType,
    moneyUrl:moneyUrl,
    wechatUrl:wechatUrl,
    env:env,
    subcributeTemplateId:subcributeTemplateId
}