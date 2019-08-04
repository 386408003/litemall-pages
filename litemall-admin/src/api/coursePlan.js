import request from '@/utils/request'

export function listCoursePlan(query) {
  return request({
    url: '/coursePlan/list',
    method: 'get',
    params: query
  })
}

export function createCoursePlan(data) {
  return request({
    url: '/coursePlan/create',
    method: 'post',
    data
  })
}

export function readCoursePlan(data) {
  return request({
    url: '/coursePlan/read',
    method: 'get',
    data
  })
}

export function updateCoursePlan(data) {
  return request({
    url: '/coursePlan/update',
    method: 'post',
    data
  })
}

export function deleteCoursePlan(data) {
  return request({
    url: '/coursePlan/delete',
    method: 'post',
    data
  })
}

export function createCoursePlanBat(query) {
  return request({
    url: '/coursePlan/createBat',
    method: 'get',
    params: query
  })
}
