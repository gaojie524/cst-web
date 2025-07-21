import request from '@/utils/request'

// 查询bomHead头表列表
export function listBomHead(query) {
  return request({
    url: '/organization/bomHead/list',
    method: 'get',
    params: query
  })
}

// 查询bomHead头表详细
export function getBomHead(bomHeadHeadId) {
  return request({
    url: '/organization/bomHead/' + bomHeadHeadId,
    method: 'get'
  })
}

// 新增bomHead头表
export function addBomHead(data) {
  return request({
    url: '/organization/bomHead',
    method: 'post',
    data: data
  })
}

// 修改bomHead头表
export function updateBomHead(data) {
  return request({
    url: '/organization/bomHead',
    method: 'put',
    data: data
  })
}

// 删除bomHead头表
export function delBomHead(bomHeadHeadId) {
  return request({
    url: '/organization/bomHead/' + bomHeadHeadId,
    method: 'delete'
  })
}
// 查询BOM下拉树结构
export function bomTreeSelect() {
  return request({
    url: '/organization/bomHead/bomTree',
    method: 'get'
  })
}