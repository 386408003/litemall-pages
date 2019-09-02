<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-width="300px">
      <el-form-item label="上班时间" prop="tianyu_admin_starttime">
        <el-time-select
          v-model="dataForm.tianyu_admin_starttime"
          :picker-options="{
            start: '08:00',
            step: '01:00',
            end: '20:00'
          }"
          style="width: 300px;"
          placeholder="上班时间" />
      </el-form-item>
      <el-form-item label="下班时间" prop="tianyu_admin_endtime">
        <el-time-select
          v-model="dataForm.tianyu_admin_endtime"
          :picker-options="{
            start: '08:00',
            step: '01:00',
            end: '20:00'
          }"
          style="width: 300px;"
          placeholder="下班时间" />
      </el-form-item>
      <el-form-item label="课程安排" prop="tianyu_admin_courseplan">
        <el-input v-model="dataForm.tianyu_admin_courseplan" style="width: 300px;"/>
        <span class="info" style="color: red">
          <br>
          上面课程安排代表含义：8点是1对1私教，9点是精品小班课，10点是精品小班课，11点是1对1私教。。。19点是1对1私教。
          <br>
          1 代表1对1私教，2 代表精品小班课。
          <br>
          课程计划由课程ID+英文逗号组成，比较关键配置错误会导致批量添加课程失效。
          <br>
          例如上课时间08:00，下课时间11:00，因课程时长都是1小时，所以8点到11点只能上三节课，所以形式是x,x,x。
          <br>
          课程计划1,2,1含义：8点的课是1对1私教，9点的课是精品小班课，10点的课是1对1私教。
          <br>
          课程计划2,1,1含义：8点的课是精品小班课，9点的课是1对1私教，10点的课是1对1私教。
        </span>
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </el-form-item>
  </el-form></div>
</template>

<script>
import { listTianyuCourse, updateTianyuCourse } from '@/api/config'

export default {
  name: 'ConfigTianyuCourse',
  data() {
    return {
      dataForm: {
        tianyu_admin_starttime: '08:00',
        tianyu_admin_endtime: '20:00',
        tianyu_admin_courseplan: '1,1,1,1,1,1,1,1,1,1,1,1'
      },
      rules: {
        tianyu_admin_starttime: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        tianyu_admin_endtime: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        tianyu_admin_courseplan: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init: function() {
      listTianyuCourse().then(response => {
        this.dataForm = response.data.data
      })
    },
    cancel() {
      this.init()
    },
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          return
        }
        updateTianyuCourse(this.dataForm).then(response => {
          this.$notify.success({
            title: '成功',
            message: '课程计划配置修改成功'
          })
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      })
    }
  }
}
</script>
