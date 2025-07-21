import request from '@/utils/request'

// 查询BOM行列表
export function listBomLine(query) {
  return request({
    url: '/organization/bomLine/list',
    method: 'get',
    params: query
  })
}

// 查询BOM行详细
export function getBomLine(bomLineId) {
  return request({
    url: '/organization/bomLine/' + bomLineId,
    method: 'get'
  })
}

// 新增BOM行
export function addBomLine(data) {
  return request({
    url: '/organization/bomLine',
    method: 'post',
    data: data
  })
}

// 修改BOM行
export function updateBomLine(data) {
  return request({
    url: '/organization/bomLine',
    method: 'put',
    data: data
  })
}

// 删除BOM行
export function delBomLine(bomLineId) {
  return request({
    url: '/organization/bomLine/' + bomLineId,
    method: 'delete'
  })
}
