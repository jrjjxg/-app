import { request } from './request';

// 获取帖子评论列表
export const getPostComments = (postId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/comment/post/${postId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 获取评论的回复列表
export const getCommentReplies = (commentId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/comment/replies/${commentId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 创建评论
export const createComment = (data) => {
  return request({
    url: '/api/community/comment/create',
    method: 'POST',
    data
  });
};

// 删除评论
export const deleteComment = (commentId) => {
  return request({
    url: `/api/community/comment/${commentId}`,
    method: 'DELETE'
  });
}; 