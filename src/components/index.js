import zcElTable from './zc/zcElTable.vue' // 引入组件
import zcUserSelect from './zc/zcUserSelect.vue' // 引入组件

export default {
    install: (app) => {
        app.component("zcElTable", zcElTable);
        app.component("zcUserSelect", zcUserSelect);
    }
}