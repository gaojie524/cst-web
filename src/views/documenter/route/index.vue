<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="120px">
      <el-form-item label="工艺路线编号" prop="routeCode">
        <el-input
          v-model="queryParams.routeCode"
          placeholder="请输入工艺路线编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工艺路线版本号" prop="routeVersion">
        <el-input
          v-model="queryParams.routeVersion"
          placeholder="请输入工艺路线版本号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工艺路线状态" prop="routeStatus" >
        <el-select v-model="queryParams.routeStatus" placeholder="请选择工艺路线状态" clearable style="width: 180px">
          <el-option
            v-for="dict in route_status"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['documenter:routeHead:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['documenter:routeHead:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['documenter:routeHead:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['documenter:routeHead:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="headList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工艺路线编号" align="center" prop="routeCode"  width="150"/>
      <el-table-column label="工艺路线版本号" align="center" prop="routeVersion"width="150" />
      <el-table-column label="工艺路线描述" align="center" prop="routeDesc" width="150" />
      <el-table-column label="工艺路线状态" align="center" prop="routeStatus" width="150">
        <template #default="scope">
          <dict-tag :options="route_status" :value="scope.row.routeStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建方式" align="center" prop="creationMethod">
        <template #default="scope">
          <dict-tag :options="creation_method" :value="scope.row.creationMethod"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新人" align="center" prop="updateBy" width="150"/>
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['documenter:routeHead:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['documenter:routeHead:remove']">删除</el-button>
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

    <!-- 添加或修改工艺路线头对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="routeHeadRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
            <el-col :span="24">
              <el-form-item label="工艺路线描述" prop="routeDesc">
                <el-input v-model="form.routeDesc" type="textarea" placeholder="请输入内容" />
              </el-form-item>
            </el-col>
          </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="工艺路线状态" prop="routeStatus">
              <el-select v-model="form.routeStatus" placeholder="请选择工艺路线状态">
                <el-option
                    v-for="dict in route_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                ></el-option>
              </el-select>
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
            <el-form-item label="备注2" prop="remark2">
              <el-input v-model="form.remark2" placeholder="请输入备注2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注3" prop="remark3">
              <el-input v-model="form.remark3" placeholder="请输入备注3" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="备注4" prop="remark4">
              <el-input v-model="form.remark4" placeholder="请输入备注4" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注5" prop="remark5">
              <el-input v-model="form.remark5" placeholder="请输入备注5" />
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

<script setup name="route">
import { listHead, getHead, delHead, addHead, updateHead } from "@/api/documenter/routeHead"

const { proxy } = getCurrentInstance()
const { route_status, creation_method } = proxy.useDict('route_status', 'creation_method')

const headList = ref([])
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
    routeCode: null,
    routeVersion: null,
    routeDesc: null,
    routeStatus: null,
    creationMethod: null,
    remark1: null,
    remark2: null,
    remark3: null,
    remark4: null,
    remark5: null,
  },
  rules: {
    routeCode: [
      { required: true, message: "工艺路线编号不能为空", trigger: "blur" }
    ],
    routeVersion: [
      { required: true, message: "工艺路线版本号不能为空", trigger: "blur" }
    ],
    routeStatus: [
      { required: true, message: "工艺路线状态不能为空", trigger: "change" }
    ],
    creationMethod: [
      { required: true, message: "创建方式不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "最后更新时间不能为空", trigger: "blur" }
    ],

  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询工艺路线头列表 */
function getList() {
  loading.value = true
  listHead(queryParams.value).then(response => {
    headList.value = response.rows
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
    routeHeadId: null,
    routeCode: null,
    routeVersion: null,
    routeDesc: null,
    routeStatus: null,
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
    deleteId: null
  }
  proxy.resetForm("headRef")
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
  ids.value = selection.map(item => item.routeHeadId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加工艺路线头"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _routeHeadId = row.routeHeadId || ids.value
  getHead(_routeHeadId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改工艺路线头"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["routeHeadRef"].validate(valid => {
    if (valid) {
      if (form.value.routeHeadId != null) {
        updateHead(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        form.value.creationMethod = "0";
        addHead(form.value).then(response => {
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
  const _routeHeadIds = row.routeHeadId || ids.value
  proxy.$modal.confirm('是否确认删除工艺路线头编号为"' + _routeHeadIds + '"的数据项？').then(function() {
    return delHead(_routeHeadIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('documenter/head/export', {
    ...queryParams.value
  }, `head_${new Date().getTime()}.xlsx`)
}

getList()
</script>
