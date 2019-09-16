import request from '@/utils/request'
import Qs from 'qs'

export function listOrder(query) {
  return request({
    url: '/orderCourse/list',
    method: 'get',
    params: query,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'repeat' })
    }
  })
}

export function detailOrder(id) {
  return request({
    url: '/orderCourse/detail',
    method: 'get',
    params: { id }
  })
}

export function replyComment(data) {
  return request({
    url: '/orderCourse/reply',
    method: 'post',
    data
  })
}
