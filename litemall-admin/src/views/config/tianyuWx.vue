<template>
  <div class="app-container">
    <el-form
      ref="dataForm"
      :rules="rules"
      :model="dataForm"
      status-icon
      label-width="300px"

    >
      <el-tabs tab-position="left" >
        <el-tab-pane label="首页配置">
          <el-form-item label="小程序首页标题" prop="tianyu_wx_home_title">
            <el-input v-model="dataForm.tianyu_wx_home_title"/>
          </el-form-item>
          <el-form-item label="小程序首页内容" prop="tianyu_wx_home_info">
            <el-input v-model="dataForm.tianyu_wx_home_info"/>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="关于页面配置">
          <el-form-item label="项目名称" prop="tianyu_wx_about_name">
            <el-input v-model="dataForm.tianyu_wx_about_name" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="项目描述" prop="tianyu_wx_about_desc">
            <el-input v-model="dataForm.tianyu_wx_about_desc" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="项目地址" prop="tianyu_wx_about_address">
            <el-input v-model="dataForm.tianyu_wx_about_address" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="电话号码" prop="tianyu_wx_about_phone">
            <el-input v-model="dataForm.tianyu_wx_about_phone" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="QQ交流群" prop="tianyu_wx_about_qqnumber">
            <el-input v-model="dataForm.tianyu_wx_about_qqnumber" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="地理位置座标" prop="tianyu_wx_about_latitude">
            <el-input v-model="dataForm.tianyu_wx_about_latitude" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="地理位置座标" prop="tianyu_wx_about_longitude">
            <el-input v-model="dataForm.tianyu_wx_about_longitude" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="地理位置座标" prop="tianyu_wx_about_scale">
            <el-input v-model="dataForm.tianyu_wx_about_scale" style="width: 500px;"/>
          </el-form-item>
          <el-form-item label="当前版本" prop="tianyu_wx_about_version">
            <el-input v-model="dataForm.tianyu_wx_about_version" style="width: 500px;"/>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import { listTianyuWx, updateTianyuWx } from '@/api/config'

export default {
  name: 'ConfigTianyuWx',
  data() {
    return {
      dataForm: { }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init: function() {
      listTianyuWx().then(response => {
        this.dataForm = response.data.data
      })
    },
    cancel() {
      this.init()
    },
    update() {
      updateTianyuWx(this.dataForm)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '小程序配置成功'
          })
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    }
  }
}
</script>
