import request from '@/utils/request'

// 查询工艺路线头列表
export function listHead(query) {
  return request({
    url: '/organization/head/list',
    method: 'get',
    params: query
  })
}

// 查询工艺路线头详细
export function getHead(routeHeadId) {
  return request({
    url: '/organization/head/' + routeHeadId,
    method: 'get'
  })
}

// 新增工艺路线头
export function addHead(data) {
  return request({
    url: '/organization/head',
    method: 'post',
    data: data
  })
}

// 修改工艺路线头
export function updateHead(data) {
  return request({
    url: '/organization/head',
    method: 'put',
    data: data
  })
}

// 删除工艺路线头
export function delHead(routeHeadId) {
  return request({
    url: '/organization/head/' + routeHeadId,
    method: 'delete'
  })
}
