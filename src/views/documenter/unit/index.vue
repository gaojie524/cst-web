<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="单位编号" prop="unitCode">
        <el-input
            v-model="queryParams.unitCode"
            placeholder="请输入单位编号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位名称" prop="unitName">
        <el-input
          v-model="queryParams.unitName"
          placeholder="请输入单位名称"
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
          v-hasPermi="['documenter:unit:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['documenter:unit:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['documenter:unit:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['documenter:unit:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="unitList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="单位编号" align="center" prop="unitCode" width="150"/>
      <el-table-column label="单位名称" align="center" prop="unitName" />
      <el-table-column label="单位描述" align="center" prop="unitDescription" />
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
      <el-table-column label="最后更新人" align="center" prop="updateBy" width="120"/>
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新标识" align="center" prop="lastUpdateFlag" width="120"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope" >
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['documenter:unit:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['documenter:unit:remove']">删除</el-button>
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

    <!-- 添加或修改单位对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="unitRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="单位编号" prop="unitCode">
              <el-input v-model="form.unitCode" placeholder="请输入单位编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位名称" prop="unitName">
              <el-input v-model="form.unitName" placeholder="请输入单位名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="单位描述" prop="unitDescription">
              <el-input v-model="form.unitDescription" placeholder="请输入单位描述" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注1" prop="remark1">
              <el-input v-model="form.remark1" placeholder="请输入备注1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="备注2" prop="remark3">
              <el-input v-model="form.remark2" placeholder="请输入备注3" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注3" prop="remark4">
              <el-input v-model="form.remark3" placeholder="请输入备注4" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注4" prop="remark5">
              <el-input v-model="form.remark4" placeholder="请输入备注5" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注5" prop="remark2">
              <el-input v-model="form.remark5" placeholder="请输入备注2" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Unit">
import { listUnit, getUnit, delUnit, addUnit, updateUnit } from "@/api/documenter/unit"

const { proxy } = getCurrentInstance()

const unitList = ref([])
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
    unitCode: null,
    unitName: null,
    unitDescription: null,
    remark1: null,
    remark2: null,
    remark3: null,
    remark4: null,
    remark5: null,
  },
  rules: {
    unitCode: [
      { required: true, message: "单位编号不能为空", trigger: "blur" }
    ],
    unitName: [
      { required: true, message: "单位名称不能为空", trigger: "blur" }
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
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询单位列表 */
function getList() {
  loading.value = true
  listUnit(queryParams.value).then(response => {
    unitList.value = response.rows
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
    unitId: null,
    unitCode: null,
    unitName: null,
    unitDescription: null,
    remark1: null,
    remark2: null,
    remark3: null,
    remark4: null,
    remark5: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    lastUpdateFlag: null
  }
  proxy.resetForm("unitRef")
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
  ids.value = selection.map(item => item.unitId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加单位"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _unitId = row.unitId || ids.value
  getUnit(_unitId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改单位"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["unitRef"].validate(valid => {
    if (valid) {
      if (form.value.unitId != null) {
        updateUnit(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addUnit(form.value).then(response => {
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
  const _unitIds = row.unitId || ids.value
  proxy.$modal.confirm('是否确认删除单位编号为"' + _unitIds + '"的数据项？').then(function() {
    return delUnit(_unitIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('documenter/unit/export', {
    ...queryParams.value
  }, `unit_${new Date().getTime()}.xlsx`)
}

getList()
</script>
