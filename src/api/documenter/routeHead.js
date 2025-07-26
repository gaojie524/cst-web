import request from '@/utils/request.js'

// 查询工艺路线头列表
export function listHead(query) {
  return request({
    url: '/documenter/routeHead/list',
    method: 'get',
    params: query
  })
}

// 查询工艺路线头详细
export function getHead(routeHeadId) {
  return request({
    url: '/documenter/routeHead/' + routeHeadId,
    method: 'get'
  })
}

// 新增工艺路线头
export function addHead(data) {
  return request({
    url: '/documenter/routeHead',
    method: 'post',
    data: data
  })
}

// 修改工艺路线头
export function updateHead(data) {
  return request({
    url: '/documenter/routeHead',
    method: 'put',
    data: data
  })
}

// 删除工艺路线头
export function delHead(routeHeadId) {
  return request({
    url: '/documenter/routeHead/' + routeHeadId,
    method: 'delete'
  })
}

// 用户状态修改
export function changeUserStatus(routeHeadId, status,routeSmallVersion) {
  const data = {
    routeHeadId,
    status,
    routeSmallVersion
  }
  return request({
    url: '/documenter/routeHead/changeStatus',
    method: 'put',
    data: data
  })
}


