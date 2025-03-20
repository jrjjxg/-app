import { request } from './request';

// 获取帖子列表
export const getPostList = (params) => {
  return request({
    url: '/api/community/post/list',
    method: 'POST',
    data: params
  });
};

// 获取帖子详情
export const getPostDetail = (postId) => {
  return request({
    url: `/api/community/post/detail/${postId}`,
    method: 'GET'
  });
};

// 创建帖子
export const createPost = (data) => {
  return request({
    url: '/api/community/post/create',
    method: 'POST',
    data: {
      title: data.title,
      content: data.content,
      tags: data.tags,
      isAnonymous: data.isAnonymous,
      images: data.images
    }
  });
};

// 删除帖子
export const deletePost = (postId) => {
  return request({
    url: `/api/community/post/${postId}`,
    method: 'DELETE'
  });
};

// 获取用户发布的帖子
export const getUserPosts = (userId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/post/user/${userId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 获取用户点赞的帖子
export const getUserLikedPosts = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/community/post/liked',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 从情绪记录创建帖子
export const createPostFromMood = (moodRecordId, content, isAnonymous) => {
  return request({
    url: '/api/community/post/create-from-mood',
    method: 'POST',
    data: {
      moodRecordId,
      content,
      isAnonymous
    }
  });
};

// 从测试结果创建帖子
export const createPostFromTest = (testResultId, content, isAnonymous) => {
  return request({
    url: '/api/community/post/create-from-test',
    method: 'POST',
    data: {
      testResultId,
      content,
      isAnonymous
    }
  });
}; 