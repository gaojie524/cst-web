import request from '@/utils/request'

// 查询单位列表
export function listUnit(query) {
  return request({
    url: '/documenter/unit/list',
    method: 'get',
    params: query
  })
}

// 查询单位详细
export function getUnit(unitId) {
  return request({
    url: '/documenter/unit/' + unitId,
    method: 'get'
  })
}

// 新增单位
export function addUnit(data) {
  return request({
    url: '/documenter/unit',
    method: 'post',
    data: data
  })
}

// 修改单位
export function updateUnit(data) {
  return request({
    url: '/documenter/unit',
    method: 'put',
    data: data
  })
}

// 删除单位
export function delUnit(unitId) {
  return request({
    url: '/documenter/unit/' + unitId,
    method: 'delete'
  })
}
