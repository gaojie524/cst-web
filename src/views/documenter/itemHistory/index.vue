<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="物料名称" prop="itemName" >
        <el-input
          v-model="queryParams.itemName"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物料单位" prop="unitId" >
        <el-select v-model="queryParams.unitId" placeholder="请选择物料单位" clearable style="width: 150px">
          <el-option
            v-for="dict in item_unit"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物料类别" prop="itemCategory" >
        <el-select v-model="queryParams.itemCategory" placeholder="请选择物料类别" clearable style="width: 150px">
          <el-option
            v-for="dict in item_category"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物料状态" prop="itemStatus" >
        <el-select v-model="queryParams.itemStatus" placeholder="请选择物料状态" clearable style="width: 150px">
          <el-option
            v-for="dict in item_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="Plus"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['documenter:itemHistory:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="Edit"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['documenter:itemHistory:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="Delete"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['documenter:itemHistory:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['documenter:itemHistory:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="itemHistoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="物料编号" align="center" prop="itemCode" width="150px"/>
      <el-table-column label="操作标识" align="center" prop="operation">
        <template #default="scope">
          <dict-tag :options="operation" :value="scope.row.operation"/>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" align="center" prop="itemName" />
      <el-table-column label="物料单位" align="center" prop="unitId">
        <template #default="scope">
          <dict-tag :options="item_unit" :value="scope.row.unitId"/>
        </template>
      </el-table-column>
      <el-table-column label="物料类别" align="center" prop="itemCategory">
        <template #default="scope">
          <dict-tag :options="item_category" :value="scope.row.itemCategory"/>
        </template>
      </el-table-column>
      <el-table-column label="物料状态" align="center" prop="itemStatus">
        <template #default="scope">
          <dict-tag :options="item_status" :value="scope.row.itemStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建方式" align="center" prop="creationMethod">
        <template #default="scope">
          <dict-tag :options="creation_method" :value="scope.row.creationMethod"/>
        </template>
      </el-table-column>
      <el-table-column label="备注1" align="center" prop="remark1" />
      <el-table-column label="备注2" align="center" prop="remark2" />
      <el-table-column label="备注3" align="center" prop="remark3" />
      <el-table-column label="备注4" align="center" prop="remark4" />
      <el-table-column label="备注5" align="center" prop="remark5" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新人" align="center" prop="updateBy"  width="120"/>
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新标识" align="center" prop="lastUpdateFlag" width="180"/>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['documenter:itemHistory:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['documenter:itemHistory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改物料历史对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="itemHistoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="物料编号" prop="itemCode">
          <el-input v-model="form.itemCode" placeholder="请输入物料编号" />
        </el-form-item>
        <el-form-item label="物料名称" prop="itemName">
          <el-input v-model="form.itemName" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="物料单位" prop="unitId">
          <el-select v-model="form.unitId" placeholder="请选择物料单位">
            <el-option
              v-for="dict in item_unit"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物料类别" prop="itemCategory">
          <el-select v-model="form.itemCategory" placeholder="请选择物料类别">
            <el-option
              v-for="dict in item_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物料状态" prop="itemStatus">
          <el-select v-model="form.itemStatus" placeholder="请选择物料状态">
            <el-option
              v-for="dict in item_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建方式" prop="creationMethod">
          <el-select v-model="form.creationMethod" placeholder="请选择创建方式">
            <el-option
              v-for="dict in creation_method"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注1" prop="remark1">
          <el-input v-model="form.remark1" placeholder="请输入备注1" />
        </el-form-item>
        <el-form-item label="备注2" prop="remark2">
          <el-input v-model="form.remark2" placeholder="请输入备注2" />
        </el-form-item>
        <el-form-item label="备注3" prop="remark3">
          <el-input v-model="form.remark3" placeholder="请输入备注3" />
        </el-form-item>
        <el-form-item label="备注4" prop="remark4">
          <el-input v-model="form.remark4" placeholder="请输入备注4" />
        </el-form-item>
        <el-form-item label="备注5" prop="remark5">
          <el-input v-model="form.remark5" placeholder="请输入备注5" />
        </el-form-item>
        <el-form-item label="最后更新标识" prop="lastUpdateFlag">
          <el-input v-model="form.lastUpdateFlag" placeholder="请输入最后更新标识" />
        </el-form-item>
        <el-form-item label="操作标识" prop="operation">
          <el-select v-model="form.operation" placeholder="请选择操作标识">
            <el-option
              v-for="dict in operation"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ItemHistory">
import { listItemHistory, getItemHistory, delItemHistory, addItemHistory, updateItemHistory } from "@/api/documenter/itemHistory"

const { proxy } = getCurrentInstance()
const { operation, item_category, item_unit, creation_method, item_status } = proxy.useDict('operation', 'item_category', 'item_unit', 'creation_method', 'item_status')

const itemHistoryList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    itemCode: null,
    itemName: null,
    unitId: null,
    itemCategory: null,
    itemStatus: null,
    creationMethod: null,
  },
  rules: {
    itemCode: [
      { required: true, message: "物料编号不能为空", trigger: "blur" }
    ],
    itemName: [
      { required: true, message: "物料名称不能为空", trigger: "blur" }
    ],
    unitId: [
      { required: true, message: "物料单位不能为空", trigger: "change" }
    ],
    itemCategory: [
      { required: true, message: "物料类别不能为空", trigger: "change" }
    ],
    itemStatus: [
      { required: true, message: "物料状态不能为空", trigger: "change" }
    ],
    creationMethod: [
      { required: true, message: "创建方式不能为空", trigger: "change" }
    ],
    createBy: [
      { required: true, message: "创建人不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateBy: [
      { required: true, message: "最后更新人不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "最后更新时间不能为空", trigger: "blur" }
    ],
    lastUpdateFlag: [
      { required: true, message: "最后更新标识不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询物料历史
列表 */
function getList() {
  loading.value = true
  listItemHistory(queryParams.value).then(response => {
    itemHistoryList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    eventId: null,
    itemId: null,
    itemCode: null,
    itemName: null,
    unitId: null,
    itemCategory: null,
    itemStatus: null,
    creationMethod: null,
    remark1: null,
    remark2: null,
    remark3: null,
    remark4: null,
    remark5: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    lastUpdateFlag: null,
    operation: null
  }
  proxy.resetForm("itemHistoryRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.eventId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加物料历史"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _eventId = row.eventId || ids.value
  getItemHistory(_eventId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改物料历史"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["itemHistoryRef"].validate(valid => {
    if (valid) {
      if (form.value.eventId != null) {
        updateItemHistory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addItemHistory(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _eventIds = row.eventId || ids.value
  proxy.$modal.confirm('是否确认删除物料历史编号为"' + _eventIds + '"的数据项？').then(function() {
    return delItemHistory(_eventIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('documenter/itemHistory/export', {
    ...queryParams.value
  }, `itemHistory_${new Date().getTime()}.xlsx`)
}

getList()
</script>
