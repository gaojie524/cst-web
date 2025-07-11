import request from '@/utils/request'

// 查询物料历史列表
export function listItemHistory(query) {
  return request({
    url: '/documenter/itemHistory/list',
    method: 'get',
    params: query
  })
}

// 查询物料历史详细
export function getItemHistory(eventId) {
  return request({
    url: '/documenter/itemHistory/' + eventId,
    method: 'get'
  })
}

// 新增物料历史

export function addItemHistory(data) {
  return request({
    url: '/documenter/itemHistory',
    method: 'post',
    data: data
  })
}

// 修改物料历史

export function updateItemHistory(data) {
  return request({
    url: '/documenter/itemHistory',
    method: 'put',
    data: data
  })
}

// 删除物料历史

export function delItemHistory(eventId) {
  return request({
    url: '/documenter/itemHistory/' + eventId,
    method: 'delete'
  })
}
