<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="itemCode" placeholder="请输入物料编号" clearable prefix-icon="Search" style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="bomOptions" :props="{ label: 'label', children: 'children',bomHeadId:'parentId' }" :expand-on-click-node="false" :filter-node-method="filterNode" ref="bomTreeRef" node-key="id" highlight-current default-expand-all @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane>
        <!--头表数据-->
        <pane size="84">
          <div class="head">
            <el-col>
              <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="110px">
                <el-form-item label="BOM头表编码" prop="bomCode">
                  <el-input
                      v-model="queryParams.bomCode"
                      placeholder="请输入BOM头编码"
                      clearable
                      @keyup.enter="handleQuery"
                      style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="BOM版本号" prop="bomVersion">
                  <el-input
                      v-model="queryParams.bomVersion"
                      placeholder="请输入BOM版本号"
                      clearable
                      @keyup.enter="handleQuery"
                      style="width: 150px"
                  />
                </el-form-item>
                <el-form-item label="BOM状态" prop="bomStatus">
                  <el-select v-model="queryParams.bomStatus" placeholder="请选择BOM状态" clearable style="width: 120px">
                    <el-option
                        v-for="dict in bom_status"
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
                      v-hasPermi="['organization:bom:add']"
                  >新增</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                      type="success"
                      plain
                      icon="Edit"
                      :disabled="single"
                      @click="handleUpdate"
                      v-hasPermi="['organization:bom:edit']"
                  >修改</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                      type="danger"
                      plain
                      icon="Delete"
                      :disabled="multiple"
                      @click="handleDelete"
                      v-hasPermi="['organization:bom:remove']"
                  >删除</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                      type="warning"
                      plain
                      icon="Download"
                      @click="handleExport"
                      v-hasPermi="['organization:bom:export']"
                  >导出</el-button>
                </el-col>
                <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
              </el-row>
              <el-table v-loading="loading" :data="bomList" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column label="BOM头表编码" align="center" prop="bomCode" />
                <el-table-column label="BOM版本号" align="center" prop="bomVersion" />
                <el-table-column label="物料编码" align="center" prop="itemCode" />
                <el-table-column label="物料名称" align="center" prop="itemName" />
                <el-table-column label="BOM状态" align="center" prop="bomStatus">
                  <template #default="scope">
                    <dict-tag :options="bom_status" :value="scope.row.bomStatus"/>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  width="180">
                  <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['organization:bom:edit']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['organization:bom:remove']">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

            </el-col>
          </div>
          <div class="main">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAddBomLine"
                    v-hasPermi="['organization:bomLine:add']"
                >新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="singleBomLine"
                    @click="handleUpdateBomLine"
                    v-hasPermi="['organization:bomLine:edit']"
                >修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                    type="danger"
                    plain
                    icon="Delete"
                    :disabled="multipleBomLine"
                    @click="handleDeleteBomLine"
                    v-hasPermi="['organization:bomLine:remove']"
                >删除</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExportBomLine"
                    v-hasPermi="['organization:bomLine:export']"
                >导出</el-button>
              </el-col>
            </el-row>

            <el-table v-loading="loadingBomLine" :data="bomLineList" @selection-change="handleSelectionChangeBomLine">
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="物料编码" align="center" prop="itemCode" />
              <el-table-column label="物料名称" align="center" prop="itemName" />
              <el-table-column label="排序" align="center" prop="sortOrder" />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button link type="primary" icon="Edit" @click="handleUpdateBomLine(scope.row)" v-hasPermi="['organization:bomLine:edit']">修改</el-button>
                  <el-button link type="primary" icon="Delete" @click="handleDeleteBomLine(scope.row)" v-hasPermi="['organization:bomLine:remove']">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination
                v-show="totalBomLine>0"
                :total="totalBomLine"
                v-model:page="bomLineData.queryParams.pageNum"
                v-model:limit="bomLineData.queryParams.pageSize"
                @pagination="getBomLineList"
            />
            
          </div>
        </pane>
      </splitpanes>
    </el-row>

    <!-- 添加或修改BOM管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="bomRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="上位物料ID" prop="parentItemId">
          <el-input v-model="form.parentItemId" placeholder="请选择" @click="handleFormItemClick" :readonly="true"/>
          <zc-el-table ref="zcElTables" :columns="itemData.columns" :list="itemData.tableData" :title="itemData.title" @sendData="handleItemData" :total="itemTotal" @getListPage="getListPage"/>
        </el-form-item>
        <el-form-item label="BOM头编号" prop="bomCode">
          <el-input v-model="form.bomCode" placeholder="请输入BOM头编号" />
        </el-form-item>
        <el-form-item label="BOM版本号" prop="bomVersion">
          <el-input v-model="form.bomVersion" placeholder="请输入BOM版本号" />
        </el-form-item>
        <el-form-item label="BOM状态" prop="bomStatus">
          <el-select v-model="form.bomStatus" placeholder="请选择BOM状态">
            <el-option
              v-for="dict in bom_status"
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

    <!-- 添加或修改BOM行表行对话框 -->
    <el-dialog :title="titleBomLine" v-model="openBomLine" width="500px" append-to-body>
      <el-form ref="bomLineRef" :model="bomLineData.form" :rules="bomLineData.rulesBomLine" label-width="120px">
        <el-form-item label="下位物料ID" prop="childItemId">
          <el-input v-model="bomLineData.form.childItemId" placeholder="请选择" @click="handleFormItemClick" :readonly="true"/>
          <zc-el-table ref="zcElTables" :columns="itemData.columns" :list="itemData.tableData" :title="itemData.title" @sendData="handleItemDataBomLine" :total="itemTotal" @getListPage="getListPage"/>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="bomLineData.form.sortOrder" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormBomLine">确 定</el-button>
          <el-button @click="cancelBomLine">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="bom">
import { listBomHead, getBomHead, delBomHead, addBomHead, updateBomHead,bomTreeSelect } from "@/api/organization/bomHead"
import { listBomLine, getBomLine, delBomLine, addBomLine, updateBomLine } from "@/api/organization/bomLine"
import { Splitpanes, Pane } from "splitpanes"
import {ref,reactive} from "vue";
import { listItem } from "@/api/documenter/item"
import useAppStore from '@/store/modules/app'
import "splitpanes/dist/splitpanes.css"
import zcElTable from "@/components/zc/zcElTable.vue";

const { proxy } = getCurrentInstance()
const { bom_status,creation_method } = proxy.useDict('bom_status','creation_method')
const appStore = useAppStore()
const bomList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const itemName = ref("")
const zcElTables = ref(null);
const itemTotal = ref(0)
const bomOptions = ref(undefined)
const itemCode = ref("")
//行表
const bomLineList = ref([])
const openBomLine = ref(false)
const loadingBomLine = ref(false)

const idsBomLine = ref([])
const singleBomLine = ref(true)
const multipleBomLine = ref(true)
const totalBomLine = ref(0)
const titleBomLine = ref("")

const data = reactive({
  form: {
    parentItemId:null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    bomCode: null,
    bomVersion: null,
    bomStatus: null,
    parentItemId:null,
    bomHeadId:null,
  },
  rules: {
    parentItemId: [
      { required: true, message: "上位物料ID", trigger: "change" }
    ],
    bomCode: [
      { required: true, message: "BOM头编号号不能为空", trigger: "blur" }
    ],
    bomVersion: [
      { required: true, message: "BOM版本号不能为空", trigger: "blur" }
    ],
    bomStatus: [
      { required: true, message: "BOM状态不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)


const itemData = reactive({
  loading: false,  // 加载状态
  tableData: [],
  columns: [
    { label: '物料编号', prop: 'itemCode',  align: 'center' },
    { label: '物料名称', prop: 'itemName',  align: 'center' },
  ],
  open: false,
  title:'上位物料',
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    searchValue:'',
    itemStatus:'Y', //只查有效的数据
  },
});
const bomLineData = reactive({
  form: {
    childItemId:null,
    bomLineId:null,
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    bomHeadId: null,
    bomLineId:null,
  },
  rulesBomLine: {

  }
})
/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label).indexOf(String(value)) !== -1;
}

/** 根据编号筛选bom */
watch(itemCode, val => {
  proxy.$refs["bomTreeRef"].filter(val)
})


/** 节点单击事件 */
function handleNodeClick(data) {
  resetBomLine();
  if (!data.parentId){
    queryParams.value.bomHeadId = data.id
    bomLineData.queryParams.bomHeadId = data.id

  }else {
    queryParams.value.bomHeadId = data.parentId
    bomLineData.queryParams.bomLineId = data.id
  }
  handleQuery()
  handleQueryBomLine();
}
/**重置 行表参数**/
function  resetBomLine(){
  bomLineData.queryParams.bomLineId = null;
  bomLineData.queryParams.bomHeadId = null;
}
/** 查询BOM管理列表 */
function getList() {
  loading.value = true
  listBomHead(queryParams.value).then(response => {
    bomList.value = response.rows
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
    bomHeadId: null,
    bomCode: null,
    parentItemId: null,
    bomVersion: null,
    bomStatus: null,
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
  proxy.resetForm("bomRef")
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
}``

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.bomHeadId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加BOM管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _bomHeadId = row.bomHeadId || ids.value
  getBomHead(_bomHeadId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改BOM管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bomRef"].validate(valid => {
    if (valid) {
      if (form.value.bomHeadId != null) {
        updateBomHead(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        form.value.creationMethod = "0";
        addBomHead(form.value).then(response => {
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
  const _bomHeadIds = row.bomHeadId || ids.value
  proxy.$modal.confirm('是否确认删除BOM管理编号为"' + _bomHeadIds + '"的数据项？').then(function() {
    return delBomHead(_bomHeadIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('organization/bom/export', {
    ...queryParams.value
  }, `bom_${new Date().getTime()}.xlsx`)
}
/** 打开子组件 */
function handleFormItemClick() {
  getItemList();
  zcElTables.value.updateOpenStatus();
}
/** 头表监听子组件事件，接收数据 */
const handleItemData = (data) => {
  form.value.parentItemId = data.itemId;

};
/** 行表监听子组件事件，接收数据 */
const handleItemDataBomLine = (data) => {
  bomLineData.form.childItemId = data.itemId;
};

/** 查询物料列表 */
function getItemList() {
  zcElTables.value.updateLoading(true);
  listItem(itemData.queryParams).then(response => {
    itemData.tableData = response.rows;
    itemTotal.value = response.total
    zcElTables.value.updateQueryParams(itemData.queryParams);
    zcElTables.value.updateLoading(false);
  })
}
/** 子组件 搜索 分页查询 */
const getListPage = (data) => {
  itemData.queryParams = data;
  console.log('data', data);
  getItemList();
};

/** 查询bom下拉树结构 */
function getBomTree() {
  bomTreeSelect().then(response => {
    bomOptions.value = response.data
  })
}
//行表
/** 查询BOM行列表 */
function getBomLineList() {
  loadingBomLine.value = true
  listBomLine(bomLineData.queryParams).then(response => {
    bomLineList.value = response.rows
    totalBomLine.value = response.total
    loadingBomLine.value = false
  })
}
// 取消按钮
function cancelBomLine() {
  openBomLine.value = false
  reset()
}
/** 搜索按钮操作 */
function handleQueryBomLine() {
  bomLineData.queryParams.pageNum = 1
  getBomLineList()
}

/** 重置按钮操作 */
function resetQueryBomLine() {
  proxy.resetForm("queryRef")
  handleQuery()
}


// 多选框选中数据
function handleSelectionChangeBomLine(selection) {
  idsBomLine.value = selection.map(item => item.bomLineId)
  singleBomLine.value = selection.length != 1
  multipleBomLine.value = !selection.length
}

/** 新增按钮操作 */
function handleAddBomLine() {
  if(!queryParams.value.bomHeadId){
    proxy.$modal.msgWarning("请先选择上级BOM节点")
    return
  }
  bomLineData.form.bomHeadId = queryParams.value.bomHeadId
  openBomLine.value = true
  titleBomLine.value = "添加BOM行"
}

/** 修改按钮操作 */
function handleUpdateBomLine(row) {
  const _bomLineId = row.bomLineId || idsBomLine.value
  getBomLine(_bomLineId).then(response => {
    bomLineData.form = response.data
    openBomLine.value = true
    titleBomLine.value = "修改BOM行"
  })
}

/** 提交按钮 */
function submitFormBomLine() {
  proxy.$refs["bomLineRef"].validate(valid => {
    if (valid) {
      if (bomLineData.form.bomLineId != null) {
        updateBomLine(bomLineData.form).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          openBomLine.value = false
          getBomLineList()
        })
      } else {
        addBomLine(bomLineData.form).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          openBomLine.value = false
          getBomLineList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDeleteBomLine(row) {
  const _bomLineIds = row.bomLineId || idsBomLine.value
  proxy.$modal.confirm('是否确认删除BOM行编号为"' + _bomLineIds + '"的数据项？').then(function() {
    return delBomLine(_bomLineIds)
  }).then(() => {
    getBomLineList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExportBomLine() {
  proxy.download('organization/bomLine/export', {
    ...queryParams.value
  }, `bomLine_${new Date().getTime()}.xlsx`)
}


onMounted(() => {
  getBomTree()
  getList()
})
</script>
<style lang="scss" scoped>
.main{
  margin-top: 5%;
}
</style>
