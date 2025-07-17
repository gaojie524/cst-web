import request from '@/utils/request'

// 查询工艺路线行列表
export function listRouteLine(query) {
  return request({
    url: '/organization/routeLine/list',
    method: 'get',
    params: query
  })
}

// 查询工艺路线行详细
export function getRouteLine(routeLineId) {
  return request({
    url: '/organization/routeLine/' + routeLineId,
    method: 'get'
  })
}

// 新增工艺路线行
export function addRouteLine(data) {
  return request({
    url: '/organization/routeLine',
    method: 'post',
    data: data
  })
}

// 修改工艺路线行
export function updateRouteLine(data) {
  return request({
    url: '/organization/routeLine',
    method: 'put',
    data: data
  })
}

// 删除工艺路线行
export function delRouteLine(routeLineId) {
  return request({
    url: '/organization/routeLine/' + routeLineId,
    method: 'delete'
  })
}
