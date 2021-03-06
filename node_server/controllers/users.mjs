/***********************
 * @name users
 * @author veaBa
 * @date 2018/6/3
 * @desc users
 ***********************/
import {_dbError, _dbSuccess} from '../functions/function.mjs'
const _user = {
    getUser: async (req, res, next) => {
        // 如果session 存在则判断用户在登录状态
        if (req.session && req.session.isAuth) {
            return _dbSuccess(res, null, req.session.userInfo)
        } else {
            _dbError(res, '你尚未登录，无权限获取用户信息', null, 2403)
        }
    }
}
export default _user
