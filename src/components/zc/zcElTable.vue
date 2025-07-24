<template>

  <el-dialog :title="title" :model-value="open" width="800px" append-to-body>
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="查询条件" prop="itemName" >
        <el-input
            v-model="queryParams.searchValue"
            placeholder="请输入"
            clearable
            @keyup.enter="handleQuery"
            style="width: 150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      </el-form>
    <el-table
        ref="renewalTable"
        v-loading="loading"
        :data="list"
        @selection-change="handleSelectionChange"
        :highlight-current-row="true"
        style="width: 100%"
        :header-cell-class-name="hideAllCheckbox"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :label="column.label"
          :prop="column.prop"
          :width="column.width"
          :align="column.align"
      >
      </el-table-column>
    </el-table>
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getListPage"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="single || multiple">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>

export default {
  name: 'zcElTable',
  props: {
    list: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    title:{
      type: String,
      default: '',
    },
    total:{
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      value: '',
      ids: null,
      single:true,
      multiple:true,
      rowData:null,
      open:false,
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        search:'',
      },
      showSearch:true,
    };
  },

  methods: {
    handleSelectionChange(selectedRows) {
      if (selectedRows.length > 1) {
        // 只保留最新选择的项
        this.$refs.renewalTable.clearSelection();
        this.$refs.renewalTable.toggleRowSelection(selectedRows[selectedRows.length - 1]);
      } else {
        this.rowData = selectedRows.length ? selectedRows[0] : null;
        this.single = selectedRows.length != 1
        this.multiple = !selectedRows.length
      }

    },
    submitForm(){
      this.$emit('sendData', this.rowData);
      this.open = false;
    },
    cancel(){
     this.open = false;
    },
    hideAllCheckbox({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) return "setDisable";
    },
    updateOpenStatus() {
      this.open = true;
    },
    updateQueryParams(queryParams){
      this.queryParams = queryParams;
    },
    getListPage(){
      this.$emit('getListPage', this.queryParams);
    },
    updateLoading(bol){
      this.loading = bol;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.$emit('getListPage', this.queryParams);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.searchValue = "";
      this.handleQuery()
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.setDisable) {
  .cell {
    display: none;
  }
}
</style>
