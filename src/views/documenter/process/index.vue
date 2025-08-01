<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工序名称" prop="processName">
        <el-input
          v-model="queryParams.processName"
          placeholder="请输入工序名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="工序状态" prop="processStatus">
        <el-select v-model="queryParams.processStatus" placeholder="请选择工序状态" clearable style="width: 150px">
          <el-option
            v-for="dict in process_status"
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
          v-hasPermi="['documenter:process:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['documenter:process:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['documenter:process:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Upload" @click="handleImport" v-hasPermi="['documenter:process:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['documenter:process:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="processList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="工序编号" align="center" prop="processCode" width="150"/>
      <el-table-column label="工序名称" align="center" prop="processName" />
      <el-table-column label="工序描述" align="center" prop="processDesc" />
      <el-table-column label="工序状态" align="center" prop="processStatus">
        <template #default="scope">
          <dict-tag :options="process_status" :value="scope.row.processStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="一级标准时间(H)" align="center" prop="oneLevelStandardTime" width="180"/>
      <el-table-column label="一级责任人" align="center" prop="oneLevelPersonChargeName" width="150"/>
      <el-table-column label="二级标准时间(H)" align="center" prop="twoLevelStandardTime" width="180"/>
      <el-table-column label="二级责任人" align="center" prop="twoLevelPersonChargeName" width="150"/>
      <el-table-column label="三级标准时间(H)" align="center" prop="threeLevelStandardTime" width="180"/>
      <el-table-column label="三级责任人" align="center" prop="threeLevelPersonChargeName" width="150"/>
      <el-table-column label="创建方式" align="center" prop="creationMethod">
        <template #default="scope">
          <dict-tag :options="creation_method" :value="scope.row.creationMethod"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新人" align="center" prop="updateBy" width="120" />
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['documenter:process:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['documenter:process:remove']">删除</el-button>
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

    <!-- 添加或修改工序对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="processRef" :model="form" :rules="rules" label-width="110px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="工序编号" prop="processCode">
              <el-input v-model="form.processCode" placeholder="请输入工序名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序名称" prop="processName">
              <el-input v-model="form.processName" placeholder="请输入工序名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="工序状态" prop="processStatus">
              <el-select v-model="form.processStatus" placeholder="请选择工序状态">
                <el-option
                    v-for="dict in process_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序描述" prop="processDesc">
              <el-input v-model="form.processDesc"  placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="一级标准时间" prop="oneLevelStandardTime">
              <el-input-number
                  v-model="form.oneLevelStandardTime"
                  placeholder="请输入(小时)"
                  :min="1"
                  style="width: 100%;"
                  >
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="一级责任人" prop="oneLevelPersonChargeName">
              <el-input v-model="form.oneLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClick" :readonly="true"/>
              <zc-user-select ref="zcUserSelectOneRef" @sendData="zcUserSelectOne"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="二级标准时间" prop="twoLevelStandardTime">
              <el-input-number
                  v-model="form.twoLevelStandardTime"
                  placeholder="请输入(小时)"
                  :min="1"
                  style="width: 100%;"
              >
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="二级责任人" prop="twoLevelPersonChargeName">
              <el-input v-model="form.twoLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClickTow" :readonly="true"/>
              <zc-user-select ref="zcUserSelectTwoRef" @sendData="zcUserSelectTwo"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="三级标准时间" prop="threeLevelStandardTime">
              <el-input-number
                  v-model="form.threeLevelStandardTime"
                  placeholder="请输入(小时)"
                  :min="1"
                  style="width: 100%;"
              >
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="三级责任人" prop="threeLevelPersonChargeName">
              <el-input v-model="form.threeLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClickThree" :readonly="true"/>
              <zc-user-select ref="zcUserSelectThreeRef" @sendData="zcUserSelectThree"/>
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
    <!-- 工序导入对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
      <el-upload ref="uploadRef" :limit="1" accept=".xlsx, .xls" :headers="upload.headers" :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的工序数据
            </div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Process">
import { listProcess, getProcess, delProcess, addProcess, updateProcess } from "@/api/documenter/process"
import { getToken } from "@/utils/auth"
import zcUserSelect from "@/components/zc/zcUserSelect.vue";
const { proxy } = getCurrentInstance()
const { process_status, creation_method } = proxy.useDict('process_status', 'creation_method')

const processList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const zcUserSelectOneRef = ref(null);
const zcUserSelectTwoRef = ref(null);
const zcUserSelectThreeRef = ref(null);

/*** 工序导入参数 */
const upload = reactive({
  // 是否显示弹出层（工序导入）
  open: false,
  // 弹出层标题（工序导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的工序数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/documenter/process/importData"
})
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    // processName: null,
    // processDesc: null,
    // processStatus: null,
    // oneLevelStandardTime:null,
    // oneLevelPersonCharge:null,
    // oneLevelPersonChargeName:null,
    // twoLevelStandardTime:null,
    // twoLevelPersonCharge:null,
    // twoLevelPersonChargeName:null,
    // threeLevelStandardTime:null,
    // threeLevelPersonCharge:null,
    // threeLevelPersonChargeName:null,
  },
  rules: {
    processCode: [
      { required: true, message: "工序编号不能为空", trigger: "change" }
    ],
    processStatus: [
      { required: true, message: "工序状态不能为空", trigger: "change" }
    ],
    oneLevelStandardTime: [
      { required: true, message: "一级标准时间不能为空", trigger: "change" }
    ],
    oneLevelPersonChargeName: [
      { required: true, message: "一级责任人不能为空", trigger: "change" }
    ],
    twoLevelStandardTime: [
      { required: true, message: "二级标准时间不能为空", trigger: "change" }
    ],
    twoLevelPersonChargeName: [
      { required: true, message: "二级责任人不能为空", trigger: "change" }
    ],
   threeLevelStandardTime: [
      { required: true, message: "三级标准时间不能为空", trigger: "change" }
    ],
    threeLevelPersonChargeName: [
      { required: true, message: "三级责任人不能为空", trigger: "change" }
    ],

  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询工序列表 */
function getList() {
  loading.value = true
  listProcess(queryParams.value).then(response => {
    processList.value = response.rows
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
    processId: null,
    processCode: null,
    processName: null,
    processDesc: null,
    processStatus: null,
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
    lastUpdateFlag: null
  }
  proxy.resetForm("processRef")
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
  ids.value = selection.map(item => item.processId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加工序"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _processId = row.processId || ids.value
  getProcess(_processId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改工序"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["processRef"].validate(valid => {
    if (valid) {
      if (form.value.processId != null) {
        updateProcess(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        //需要获取数据字典的值
        form.value.creationMethod = "0";
        addProcess(form.value).then(response => {
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
  const _processIds = row.processId || ids.value
  proxy.$modal.confirm('是否确认删除工序编号为"' + _processIds + '"的数据项？').then(function() {
    return delProcess(_processIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('documenter/process/export', {
    ...queryParams.value
  }, `process_${new Date().getTime()}.xlsx`)
}
/** 导入按钮操作 */
function handleImport() {
  upload.title = "工序导入"
  upload.open = true
}
/** 下载模板操作 */
function importTemplate() {
  proxy.download("documenter/process/importTemplate", {
  }, `process_template_${new Date().getTime()}.xlsx`)
}

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false
  upload.isUploading = false
  proxy.$refs["uploadRef"].handleRemove(file)
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true })
  getList()
}

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit()
}
/** 打开用户选择组件 */
function  handleFormUserClick(){
  zcUserSelectOneRef.value.showDialog();
}

function  handleFormUserClickTow(){
  zcUserSelectTwoRef.value.showDialog();
}
function  handleFormUserClickThree(){
  zcUserSelectThreeRef.value.showDialog();
}


const zcUserSelectOne = (data) => {
  form.value.oneLevelPersonCharge = data.userId;
  form.value.oneLevelPersonChargeName = data.userName;
}

const zcUserSelectTwo = (data) => {
  form.value.twoLevelPersonCharge = data.userId;
  form.value.twoLevelPersonChargeName = data.userName;
}

const zcUserSelectThree = (data) => {
  form.value.threeLevelPersonCharge = data.userId;
  form.value.threeLevelPersonChargeName = data.userName;
}
getList()
</script>
