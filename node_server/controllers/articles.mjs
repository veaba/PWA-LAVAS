/***********************
 * @name articles
 * @author veaBa
 * @date 2018/6/3
 * @desc articles
 ***********************/
import { ArticleModel } from '../models/model'
import {_flipPage, _isAuth, _dbError, _dbSuccess} from '../functions/function'
import tracer from 'tracer'
import mongoose from 'mongoose' // mongoose 库
const logger = tracer.console(); // console追踪库
const _article={
    /**
     * @desc 拉取文章列表函数
     * @desc page 与 skip的关系 1->0、2->10、3->20 page*10-10
     * @TODO 增加模糊查询
     * */
    getArticleList:async (req,res,next)=>{
        const session = (req.session && req.session.isAuth) ? req.session.isAuth : false;
        await _isAuth(res, session);
        let data = req.query.name ? ({name: req.query.title}) : {};
        let page = req.query.page ? req.query.page : 1;
        let finArticleAll = await ArticleModel.find(data).count();// 总长度 sort() -1，倒叙,1默认升序
        let articleArr = await ArticleModel.find(data).limit(10).skip(page * 10 - 10).sort({_id: -1}).exec();
        let findArticle = [];
        for (let item of articleArr) {
            item.post_content = item.post_content.slice(0, 200);
            let ob = JSON.parse(JSON.stringify(item));
            findArticle.push(ob)
        }

        if (findArticle.length === 0) {
            _dbError(res, '查询为空数据', 4004)
        } else {
            let pages = Math.ceil((finArticleAll / 10));
            await _flipPage(res, findArticle, 0, null, {totals: finArticleAll, pages: pages, pageCurrent: page})
        }
    },
    /**
     * @desc  发表新的文章 ＋编辑文章 //todo 没有login 时候，无法发表，或无返回
     * */
    publishArticle: async (req, res, next) => {
        let data = req.body;
        if (data._id) {
            logger.error('编辑 文章');
            let objectId = mongoose.Types.ObjectId(data._id);
            data.post_modified = (new Date()).valueOf();
            data.editor_number = (data.editor_number || 0) + 1;
            ArticleModel.findByIdAndUpdate({_id: objectId}, data, {upsert: true}, function (err, db1) {
                if (err) {
                    logger.error('编辑文章 失败');
                    return _dbError(res, err)
                } else {
                    logger.error('编辑文章 成功');
                    return _dbSuccess(res)
                }
            })
        } else {
            // 首次新增的文章,补充新字段
            data.comments_status = 'open'; // 评论开放 * 后期
            data.post_modified = ''; // 修改时间 * 后期
            data.post_author = req.session.userInfo.id;
            data.editor_number = 0;

            // 摘要处理
            if (!data.post_abstract) {
                data.post_abstract = (data.post_content || '').slice(0, 50) || ''
            }
            let saveArticle = new ArticleModel(data); // 创建构造函数，此时 增加_id
            saveArticle.save()
                .then(function (resDb) {
                    logger.error('新增 文章');
                    let id = mongoose.Types.ObjectId(resDb._id); // 构造id
                    let postDate = (new Date(id.getTimestamp())).valueOf();
                    ArticleModel.findByIdAndUpdate(resDb, {post_date: postDate}, {upsert: true}, function (err, db1) {
                        if (err) {
                            logger.error('新增文章 失败');
                            _dbError(res, err)
                        } else {
                            logger.error('新增文章 成功');
                            _dbSuccess(res)
                        }
                    })
                })
        }
    },

    /**
     * @desc 拉取单篇文章
     * */
    getArticle: async (req, res, next) => {
        let id = req.query.id;
        if (!id) {
            _dbError(res);
            return false
        } else {
            let objectId = mongoose.Types.ObjectId(id);
            ArticleModel.findOne({_id: objectId})
                .then(function (resDb) {
                    return _dbSuccess(res, '获取成功', resDb)
                })
                .catch(function (err) {
                    return _dbError(res, err)
                })
        }
    },
    /**
     * @desc 删除单篇文章
     * */
    deleteArticle: async (req, res, next) => {
        let data = req.bdoy;
        return _dbSuccess(res, data)
    }
};

export default  _article
