<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="排序" prop="sortOrder">
        <el-input
          v-model="queryParams.sortOrder"
          placeholder="请输入排序"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['organization:routeLine:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['organization:routeLine:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['organization:routeLine:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['organization:routeLine:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="routeLineList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工艺路线行ID" align="center" prop="routeLineId" />
      <el-table-column label="工艺路线头ID" align="center" prop="routeHeadId" />
      <el-table-column label="工序ID" align="center" prop="processId" />
      <el-table-column label="排序  " align="center" prop="sortOrder" />
      <el-table-column label="最后更新人" align="center" prop="updatedBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['organization:routeLine:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['organization:routeLine:remove']">删除</el-button>
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

    <!-- 添加或修改工艺路线行对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="routeLineRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入排序  " />
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

<script setup name="RouteLine">
import { listRouteLine, getRouteLine, delRouteLine, addRouteLine, updateRouteLine } from "@/api/organization/routeLine"

const { proxy } = getCurrentInstance()

const routeLineList = ref([])
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
    sortOrder: null,
    updatedBy: null,
  },
  rules: {

    sortOrder: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询工艺路线行列表 */
function getList() {
  loading.value = true
  listRouteLine(queryParams.value).then(response => {
    routeLineList.value = response.rows
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
    routeLineId: null,
    routeHeadId: null,
    processId: null,
    sortOrder: null,
    createBy: null,
    createTime: null,
    updatedBy: null,
    updateTime: null,
    lastUpdateFlag: null
  }
  proxy.resetForm("routeLineRef")
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
  ids.value = selection.map(item => item.routeLineId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加工艺路线行"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _routeLineId = row.routeLineId || ids.value
  getRouteLine(_routeLineId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改工艺路线行"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["routeLineRef"].validate(valid => {
    if (valid) {
      if (form.value.routeLineId != null) {
        updateRouteLine(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRouteLine(form.value).then(response => {
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
  const _routeLineIds = row.routeLineId || ids.value
  proxy.$modal.confirm('是否确认删除工艺路线行编号为"' + _routeLineIds + '"的数据项？').then(function() {
    return delRouteLine(_routeLineIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('organization/routeLine/export', {
    ...queryParams.value
  }, `routeLine_${new Date().getTime()}.xlsx`)
}

getList()
</script>
