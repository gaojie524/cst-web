<template>
  <div class="app-container">
    <div class="head">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="125px">
        <el-form-item label="工艺路线编号" prop="routeCode">
          <el-input
              v-model="queryParams.routeCode"
              placeholder="请输入工艺路线编号"
              clearable
              @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="工艺路线大版本号" prop="routeVersion">
          <el-input
              v-model="queryParams.routeVersion"
              placeholder="请输入工艺路线大版本号"
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
        <el-form-item label="创建方式" prop="creationMethod" >
          <el-select v-model="queryParams.creationMethod" placeholder="请选择创建方式" clearable style="width: 180px">
            <el-option
                v-for="dict in creation_method"
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
<!--        <el-col :span="1.5">-->
<!--          <el-button-->
<!--              type="danger"-->
<!--              plain-->
<!--              icon="Delete"-->
<!--              :disabled="multiple"-->
<!--              @click="handleDelete"-->
<!--              v-hasPermi="['documenter:routeHead:remove']"-->
<!--          >删除</el-button>-->
<!--        </el-col>-->
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

      <el-table v-loading="loading" :data="headList" @selection-change="handleSelectionChange"  @row-click="handleRowClick">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="工艺路线编号" align="center" prop="routeCode"  width="150"/>
        <el-table-column label="工艺路线大版本号" align="center" prop="routeVersion" width="150" />
        <el-table-column label="工艺路线小版本号" align="center" prop="routeSmallVersion" width="150" />
        <el-table-column label="工艺路线描述" align="center" prop="routeDesc" width="150" />
        <el-table-column label="工艺路线状态" align="center" key="status" width="150">
          <template #default="scope">
            <el-switch
                v-model="scope.row.routeStatus"
                active-value="Y"
                inactive-value="N"
                @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
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
        <el-table-column label="最后更新人" align="center" prop="updateBy" width="150"/>
        <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
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
      <el-dialog :title="title" v-model="open" width="650px" append-to-body>
        <el-form ref="routeHeadRef" :model="form" :rules="rules" label-width="135px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="工艺路线编号" prop="routeCode">
                <el-input v-model="form.routeCode" placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺路线大版本号" prop="routeVersion">
                <el-input-number
                    v-model="form.routeVersion"
                    placeholder="请输入版本号"
                    :min="0"
                    style="width: 100%;"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
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
    <div class="main">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAddRouteLine"
              v-hasPermi="['documenter:routeLine:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="singleRouteLine"
              @click="handleUpdateRouteLine"
              v-hasPermi="['documenter:routeLine:edit']"
          >修改</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multipleRouteLine"
              @click="handleDeleteRouteLine"
              v-hasPermi="['documenter:routeLine:remove']"
          >删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="warning"
              plain
              icon="Download"
              @click="handleExportRouteLine"
              v-hasPermi="['documenter:routeLine:export']"
          >导出</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loadingRouteLine" :data="routeLineList" @selection-change="handleSelectionChangeRouteLine">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="工序名称" align="center" prop="processName" />
        <el-table-column label="排序" align="center" prop="sortOrder" />
        <el-table-column label="一级标准时间(H)" align="center" prop="oneLevelStandardTime" width="150"/>
        <el-table-column label="一级责任人" align="center" prop="oneLevelPersonChargeName" width="150"/>
        <el-table-column label="二级标准时间(H)" align="center" prop="twoLevelStandardTime" width="150"/>
        <el-table-column label="二级责任人" align="center" prop="twoLevelPersonChargeName" width="150"/>
        <el-table-column label="三级标准时间(H)" align="center" prop="threeLevelStandardTime" width="150"/>
        <el-table-column label="三级责任人" align="center" prop="threeLevelPersonChargeName" width="150"/>
        <el-table-column label="创建人" align="center" prop="createBy" width="150"/>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最后更新人" align="center" prop="updatedBy" width="150"/>
        <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="handleUpdateRouteLine(scope.row)" v-hasPermi="['documenter:routeLine:edit']">修改</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDeleteRouteLine(scope.row)" v-hasPermi="['documenter:routeLine:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="totalRouteLine>0"
          :total="totalRouteLine"
          v-model:page="routeLineData.queryParams.pageNum"
          v-model:limit="routeLineData.queryParams.pageSize"
          @pagination="getRouteLineList"
      />

      <!-- 添加或修改工艺路线行对话框 -->
      <el-dialog :title="titleRouteLine" v-model="openRouteLine" width="650px" append-to-body>
        <el-form ref="routeLineRef" :model="routeLineData.form" :rules="routeLineData.rules" label-width="120px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="工序" prop="processName">
                <el-input v-model="routeLineData.form.processName" placeholder="请选择" @click="handleFormItemClick" :readonly="true" />
                <zc-el-table ref="zcElTables" :columns="itemData.columns" :list="itemData.tableData" :title="itemData.title" @sendData="handleItemDataRouteLine" :total="itemTotal" @getListPage="getListPage"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序" prop="sortOrder">
                <el-input-number
                    v-model="routeLineData.form.sortOrder"
                    placeholder="请输入排序"
                    :min="1"
                    style="width: 100%;"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="一级标准时间" prop="oneLevelStandardTime">
                <el-input-number
                    v-model="routeLineData.form.oneLevelStandardTime"
                    placeholder="请输入(小时)"
                    :min="1"
                    style="width: 100%;"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="一级责任人" prop="oneLevelPersonChargeName">
                <el-input v-model="routeLineData.form.oneLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClick" :readonly="true"/>
                <zc-user-select ref="zcUserSelectOneRef" @sendData="zcUserSelectOne"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="二级标准时间" prop="twoLevelStandardTime">
                <el-input-number
                    v-model="routeLineData.form.twoLevelStandardTime"
                    placeholder="请输入(小时)"
                    :min="1"
                    style="width: 100%;"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="二级责任人" prop="twoLevelPersonChargeName">
                <el-input v-model="routeLineData.form.twoLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClickTow" :readonly="true"/>
                <zc-user-select ref="zcUserSelectTwoRef" @sendData="zcUserSelectTwo"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="三级标准时间" prop="threeLevelStandardTime">
                <el-input-number
                    v-model="routeLineData.form.threeLevelStandardTime"
                    placeholder="请输入(小时)"
                    :min="1"
                    style="width: 100%;"
                >
                </el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="三级责任人" prop="threeLevelPersonChargeName">
                <el-input v-model="routeLineData.form.threeLevelPersonChargeName" placeholder="请选择" @click="handleFormUserClickThree" :readonly="true"/>
                <zc-user-select ref="zcUserSelectThreeRef" @sendData="zcUserSelectThree"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitFormRouteLine">确 定</el-button>
            <el-button @click="cancelRouteLineRouteLine">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </div>

  </div>
</template>

<script setup name="route">
import {listHead, getHead, delHead, addHead, updateHead, changeUserStatus} from "@/api/documenter/routeHead"

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
/** 行点击 */
function handleRowClick(row, column, event) {
  routeLineData.queryParams.routeHeadId = row.routeHeadId;
  getRouteLineList();
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
/** 工艺路线状态修改  */
function handleStatusChange(row) {
  let text = row.routeStatus == "Y" ? "生效" : "失效"
  proxy.$modal.confirm('确认要"' + text + '' + row.routeCode + '"编号吗?').then(function () {
    row.routeSmallVersion = row.routeSmallVersion+1
    return changeUserStatus(row.routeHeadId, row.routeStatus,row.routeSmallVersion)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.routeStatus = row.routeStatus == "Y" ? "N" : "Y"
  })
}

//行表内容

import { listRouteLine, getRouteLine, delRouteLine, addRouteLine, updateRouteLine } from "@/api/documenter/routeLine";
import zcElTable from "@/components/zc/zcElTable.vue";
import {reactive, ref} from "vue";
import { listProcess } from "@/api/documenter/process"
import zcUserSelect from "@/components/zc/zcUserSelect.vue";
const zcElTables = ref(null);


const routeLineList = ref([])
const openRouteLine = ref(false)
const loadingRouteLine = ref(false)
const showSearchRouteLine = ref(true)
const idsRouteLine = ref([])
const singleRouteLine = ref(true)
const multipleRouteLine = ref(true)
const totalRouteLine = ref(0)
const titleRouteLine = ref("")

const itemTotal = ref(0)
const zcUserSelectOneRef = ref(null);
const zcUserSelectTwoRef = ref(null);
const zcUserSelectThreeRef = ref(null);
const itemData = reactive({
  loading: false,  // 加载状态
  tableData: [],
  columns: [
    { label: '工序编号', prop: 'processCode', align: 'center', width: 150 },
    { label: '工序名称', prop: 'processName', align: 'center' },
    { label: '工序描述', prop: 'processDesc', align: 'center' },
    { label: '一级标准时间(H)', prop: 'oneLevelStandardTime', align: 'center', width: 180 },
    { label: '一级责任人', prop: 'oneLevelPersonChargeName', align: 'center', width: 150 },
    { label: '二级标准时间(H)', prop: 'twoLevelStandardTime', align: 'center', width: 180 },
    { label: '二级责任人', prop: 'twoLevelPersonChargeName', align: 'center', width: 150 },
    { label: '三级标准时间(H)', prop: 'threeLevelStandardTime', align: 'center', width: 180 },
    { label: '三级责任人', prop: 'threeLevelPersonChargeName', align: 'center', width: 150 },
  ],
  open: false,
  title:'工序列表',
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    searchValue:'',
    processStatus:'Y', //只查有效的数据
  },
});

const routeLineData = reactive({
  form: {
    routeLineId:null,
    routeHeadId:null,
    processId:null,
    processName:null,
    oneLevelStandardTime:null,
    oneLevelPersonCharge:null,
    oneLevelPersonChargeName:null,
    twoLevelStandardTime:null,
    twoLevelPersonCharge:null,
    twoLevelPersonChargeName:null,
    threeLevelStandardTime:null,
    threeLevelPersonCharge:null,
    threeLevelPersonChargeName:null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    routeHeadId:null,
  },
  rules: {
    processName: [
      { required: true, message: "工序不能为空", trigger: "change" }
    ],
    sortOrder: [
      { required: true, message: "排序不能为空", trigger: "blur" }
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



/** 查询工艺路线行列表 */
function getRouteLineList() {
  loadingRouteLine.value = true
  listRouteLine(queryParams.value).then(response => {
    routeLineList.value = response.rows
    totalRouteLine.value = response.total
    loadingRouteLine.value = false
  })
}

// 取消按钮
function cancelRouteLineRouteLine() {
  openRouteLine.value = false
  reset()
}

// 表单重置
function resetRouteLine() {
  form.value = {
    routeLineId: null,
    routeHeadId: null,
    processId: null,
    processName: null,
    sortOrder: null,
    createBy: null,
    createTime: null,
    updatedBy: null,
    updateTime: null,
    lastUpdateFlag: null,
    oneLevelStandardTime: null,
    oneLevelPersonCharge: null,
    oneLevelPersonChargeName: null,
    twoLevelStandardTime: null,
    twoLevelPersonCharge: null,
    twoLevelPersonChargeName: null,
    threeLevelStandardTime: null,
    threeLevelPersonCharge: null,
    threeLevelPersonChargeName: null,
}
  proxy.resetForm("routeLineRef")
}




// 多选框选中数据
function handleSelectionChangeRouteLine(selection) {
  idsRouteLine.value = selection.map(item => item.routeLineId)
  singleRouteLine.value = selection.length != 1
  multipleRouteLine.value = !selection.length
}

/** 新增按钮操作 */
function handleAddRouteLine() {
  resetRouteLine()
  if(!routeLineData.queryParams.routeHeadId){
    proxy.$modal.msgWarning("请先选择上级工艺路线")
    return
  }
  openRouteLine.value = true
  titleRouteLine.value = "添加工艺路线行"
}

/** 修改按钮操作 */
function handleUpdateRouteLine(row) {
  resetRouteLine()
  const _routeLineId = row.routeLineId || idsRouteLine.value
  getRouteLine(_routeLineId).then(response => {
    routeLineData.form = response.data
    openRouteLine.value = true
    titleRouteLine.value = "修改工艺路线行"
  })
}

/** 提交按钮 */
function submitFormRouteLine() {
  proxy.$refs["routeLineRef"].validate(valid => {
    if (valid) {
      if (routeLineData.form.routeLineId != null) {
        updateRouteLine( routeLineData.form).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          openRouteLine.value = false
          getRouteLineList()
        })
      } else {
        routeLineData.form.routeHeadId = routeLineData.queryParams.routeHeadId;
        addRouteLine(routeLineData.form).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          openRouteLine.value = false
          getRouteLineList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDeleteRouteLine(row) {
  const _routeLineIds = row.routeLineId || ids.value
  proxy.$modal.confirm('是否确认删除工艺路线行编号为"' + _routeLineIds + '"的数据项？').then(function() {
    return delRouteLine(_routeLineIds)
  }).then(() => {
    getRouteLineList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 打开子组件 */
function handleFormItemClick() {
  getItemList();
  zcElTables.value.updateOpenStatus();
}

/** 行表监听子组件事件，接收数据 */
const handleItemDataRouteLine = (data) => {
  routeLineData.form.processId = data.processId;
  routeLineData.form.processName = data.processName;
  routeLineData.form.oneLevelStandardTime = data.oneLevelStandardTime;
  routeLineData.form.oneLevelPersonCharge = data.oneLevelPersonCharge;
  routeLineData.form.oneLevelPersonChargeName = data.oneLevelPersonChargeName;
  routeLineData.form.twoLevelStandardTime = data.twoLevelStandardTime;
  routeLineData.form.twoLevelPersonCharge = data.twoLevelPersonCharge;
  routeLineData.form.twoLevelPersonChargeName = data.twoLevelPersonChargeName;
  routeLineData.form.threeLevelStandardTime = data.threeLevelStandardTime;
  routeLineData.form.threeLevelPersonCharge = data.threeLevelPersonCharge;
  routeLineData.form.threeLevelPersonChargeName = data.threeLevelPersonChargeName;
  console.log('data',data)
  console.log(routeLineData,'r')
};

/** 查询工序列表 */
function getItemList() {
  zcElTables.value.updateLoading(true);
  listProcess(itemData.queryParams).then(response => {
    itemData.tableData = response.rows;
    itemTotal.value = response.total
    zcElTables.value.updateQueryParams(itemData.queryParams);
    zcElTables.value.updateLoading(false);
  })
}
/** 子组件 搜索 分页查询 */
const getListPage = (data) => {
  itemData.queryParams = data;
  getItemList();
}
/** 导出按钮操作 */
function handleExportRouteLine() {
  proxy.download('documenter/routeLine/export', {
    ...queryParams.value
  }, `routeLine_${new Date().getTime()}.xlsx`)
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
  routeLineData.form.oneLevelPersonCharge = data.userId;
  routeLineData.form.oneLevelPersonChargeName = data.userName;
}

const zcUserSelectTwo = (data) => {
  routeLineData.form.twoLevelPersonCharge = data.userId;
  routeLineData.form.twoLevelPersonChargeName = data.userName;
}

const zcUserSelectThree = (data) => {
  routeLineData.form.threeLevelPersonCharge = data.userId;
  routeLineData.form.threeLevelPersonChargeName = data.userName;
}

getList();
</script>
