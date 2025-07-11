import request from '@/utils/request'

// 查询物料列表
export function listItem(query) {
  return request({
    url: '/documenter/item/list',
    method: 'get',
    params: query
  })
}

// 查询物料详细
export function getItem(itemId) {
  return request({
    url: '/documenter/item/' + itemId,
    method: 'get'
  })
}

// 新增物料
export function addItem(data) {
  return request({
    url: '/documenter/item',
    method: 'post',
    data: data
  })
}

// 修改物料
export function updateItem(data) {
  return request({
    url: '/documenter/item',
    method: 'put',
    data: data
  })
}

// 删除物料
export function delItem(itemId) {
  return request({
    url: '/documenter/item/' + itemId,
    method: 'delete'
  })
}
