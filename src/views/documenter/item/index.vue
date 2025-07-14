<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="物料名称" prop="itemName" >
        <el-input
            v-model="queryParams.itemName"
            placeholder="请输入物料名称"
            clearable
            @keyup.enter="handleQuery"
            style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="物料单位" prop="itemUnit">
        <el-select v-model="queryParams.itemUnit" placeholder="请选择物料单位" clearable style="width: 150px">
          <el-option
              v-for="dict in item_unit"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物料类别" prop="itemCategory">
        <el-select v-model="queryParams.itemnpmCategory" placeholder="请选择物料类别" clearable style="width: 150px">
          <el-option
              v-for="dict in item_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="物料状态" prop="itemStatus">
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
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['documenter:item:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['documenter:item:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['documenter:item:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['documenter:item:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="itemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="物料编号" align="center" prop="itemCode" width="200"/>
      <el-table-column label="物料名称" align="center" prop="itemName" />
      <el-table-column label="物料单位" align="center" prop="itemUnit">
        <template #default="scope">
          <dict-tag :options="item_unit" :value="scope.row.itemUnit"/>
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
      <el-table-column label="创建方式" align="center" prop="itemStatus">
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
      <el-table-column label="最后更新人" align="center" prop="updateBy" width="150" />
      <el-table-column label="最后更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后更新标识" align="center" prop="lastUpdateFlag" width="150"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['documenter:item:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['documenter:item:remove']">删除</el-button>
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

    <!-- 添加或修改物料对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="itemRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="物料单位" prop="itemUnit">
              <el-select v-model="form.itemUnit" placeholder="请选择物料单位">
                <el-option
                    v-for="dict in item_unit"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
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
          </el-col>

          <el-col :span="12">
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
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注1" prop="remark1">
              <el-input v-model="form.remark1" placeholder="请输入备注1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注2" prop="remark2">
              <el-input v-model="form.remark2" placeholder="请输入备注2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="备注3" prop="remark3">
              <el-input v-model="form.remark3" placeholder="请输入备注3" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注4" prop="remark4">
              <el-input v-model="form.remark4" placeholder="请输入备注4" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
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

<script setup name="Item">
import { listItem, getItem, delItem, addItem, updateItem } from "@/api/documenter/item"

const { proxy } = getCurrentInstance()
const { item_category, item_unit, item_status,creation_method } = proxy.useDict('item_category', 'item_unit', 'item_status','creation_method')

const itemList = ref([])
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
    itemName: null,
    itemUnit: null,
    itemCategory: null,
    itemStatus: null,
    creationMethod:null,
  },
  rules: {
    itemName: [
      { required: true, message: "物料名称不能为空", trigger: "blur" }
    ],
    itemUnit: [
      { required: true, message: "物料单位不能为空", trigger: "change" }
    ],
    itemCategory: [
      { required: true, message: "物料类别不能为空", trigger: "change" }
    ],
    itemStatus: [
      { required: true, message: "物料状态不能为空", trigger: "change" }
    ],
    creationMethod: [
      { required: true, message: "创建方式 不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询物料列表 */
function getList() {
  loading.value = true
  listItem(queryParams.value).then(response => {
    itemList.value = response.rows
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
    itemId: null,
    itemCode: null,
    itemName: null,
    itemUnit: null,
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
    lastUpdateFlag: null
  }
  proxy.resetForm("itemRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
  console.log('creation_method',creation_method);
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.itemId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加物料"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _itemId = row.itemId || ids.value
  getItem(_itemId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改物料"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["itemRef"].validate(valid => {
    if (valid) {
      if (form.value.itemId != null) {
        updateItem(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        //需要获取数据字典的值
        form.value.creationMethod = "0";
        console.log('form',form);
        addItem(form.value).then(response => {
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
  const _itemIds = row.itemId || ids.value
  proxy.$modal.confirm('是否确认删除物料编号为"' + _itemIds + '"的数据项？').then(function() {
    return delItem(_itemIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('documenter/item/export', {
    ...queryParams.value
  }, `item_${new Date().getTime()}.xlsx`)
}

getList()
</script>
