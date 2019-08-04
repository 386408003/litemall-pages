<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-date-picker v-model="listQuery.startDate" class="filter-item" type="date" placeholder="选择起始日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 200px;"/>
      <el-date-picker v-model="listQuery.endDate" class="filter-item" type="date" placeholder="选择终止日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 200px;"/>
      <el-button v-permission="['GET /admin/coursePlan/list']" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button v-permission="['POST /admin/coursePlan/create']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
      <el-button v-permission="['POST /admin/coursePlan/createBat']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreateBat">批量添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column align="center" label="课程名称" prop="courseId">
        <template slot-scope="scope">
          <el-tag type="primary" style="margin-right: 20px;"> {{ formatCourse(scope.row.courseId).label }} </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="上课日期" prop="cDate" sortable/>

      <el-table-column align="center" label="上课时间" prop="startTime" sortable/>

      <el-table-column align="center" label="下课时间" prop="endTime"/>

      <el-table-column align="center" label="每节人数" prop="peopleNum">
        <template slot-scope="scope">
          <span>{{ formatCourse(scope.row.courseId).peopleNum }}</span>
        </template>

      </el-table-column>

      <el-table-column align="center" label="可预约人数" prop="peopleLeft"/>

      <el-table-column align="center" label="操作" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/coursePlan/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/coursePlan/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="margin-left:50px;">
        <el-form-item label="课程名称" prop="courseId">
          <el-select v-model="dataForm.courseId" placeholder="请选择" style="width: 300px;" @change="timePickerNotDisabled(dataForm.courseId)">
            <el-option
              v-for="item in courseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="每节人数" prop="peopleNum">
          <el-input v-model="dataForm.peopleNum" style="width: 300px;" disabled/>
        </el-form-item>
        <el-form-item label="可预约人数" prop="peopleLeft">
          <el-input v-model="dataForm.peopleLeft" style="width: 300px;"/>
        </el-form-item>
        <el-form-item label="上课日期" prop="cDate">
          <el-date-picker v-model="dataForm.cDate" type="date" placeholder="选择日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 300px;"/>
        </el-form-item>
        <el-form-item label="上课时间" prop="startTime">
          <el-time-select
            :disabled="disabledTimePicker"
            v-model="dataForm.startTime"
            :picker-options="{
              start: '08:00',
              step: '01:00',
              end: '20:00'
            }"
            style="width: 300px;"
            placeholder="上课时间"
            @change="calcEndTime(dataForm.startTime)"/>
        </el-form-item>
        <el-form-item label="下课时间" prop="endTime">
          <el-time-select
            v-model="dataForm.endTime"
            :picker-options="{
              start: '08:00',
              step: '01:00',
              end: '20:00',
              minTime: dataForm.startTime
            }"
            style="width: 300px;"
            disabled
            placeholder="下课时间"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

    <!-- 批量添加对话框 -->
    <el-dialog :visible.sync="batFormVisible" title="批量添加">
      <el-form ref="dataFormBat" :rules="rulesBat" :model="dataFormBat" status-icon label-position="left" label-width="100px" style="margin-left:50px;">
        <el-form-item label="上课日期" prop="addDate">
          <el-date-picker v-model="dataFormBat.addDate" type="date" placeholder="选择日期" format="yyyy-MM-dd" value-format="yyyy-MM-dd" style="width: 300px;"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createDataBat">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCoursePlan, createCoursePlan, updateCoursePlan, deleteCoursePlan, createCoursePlanBat } from '@/api/coursePlan'
import { courseOptions } from '@/api/course'
import { formatDate } from '@/utils/dateTime'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'CoursePlan',
  components: { Pagination },
  filters: {},
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        startDate: undefined,
        endDate: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        courseId: undefined,
        peopleNum: undefined,
        peopleLeft: undefined,
        cDate: undefined,
        startTime: undefined,
        endTime: undefined
      },
      dataFormBat: {
        addDate: undefined
      },
      courseOptions: [],
      curCourse: {},
      dialogFormVisible: false,
      batFormVisible: false,
      disabledTimePicker: true,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        courseId: [
          { required: true, message: '请选择课程', trigger: 'blur' }
        ],
        peopleLeft: [
          { required: true, message: '可预约人数不能为空', trigger: 'blur' },
          { validator: this.compareToPeopleNum, trigger: 'blur' }
        ],
        cDate: [
          { required: true, message: '课程日期不能为空', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '上课时间不能为空', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '下课时间不能为空', trigger: 'blur' }
        ]
      },
      rulesBat: {
        addDate: [
          { required: true, message: '日期不能为空', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()

    courseOptions()
      .then(response => {
        this.courseOptions = response.data.data.list
      })
  },

  methods: {
    formatCourse(courseId) {
      for (let i = 0; i < this.courseOptions.length; i++) {
        if (courseId === this.courseOptions[i].value) {
          return this.courseOptions[i]
        }
      }
      return ''
    },
    getList() {
      this.listLoading = true
      listCoursePlan(this.listQuery)
        .then(response => {
          this.list = response.data.data.list
          this.total = response.data.data.total
          this.listLoading = false
        })
        .catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        courseId: undefined,
        peopleNum: undefined,
        peopleLeft: undefined,
        cDate: undefined,
        startTime: undefined,
        endTime: undefined
      }
      this.curCourse = {}
      this.disabledTimePicker = true
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createCoursePlan(this.dataForm)
            .then(response => {
              this.list.unshift(response.data.data)
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '添加成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleCreateBat() {
      this.dataFormBat = {
        addDate: undefined
      }
      this.batFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataFormBat'].clearValidate()
      })
    },
    createDataBat() {
      this.$refs['dataFormBat'].validate(valid => {
        if (valid) {
          createCoursePlanBat(this.dataFormBat)
            .then(response => {
              for (const v of response.data.data.list) {
                this.list.unshift(v)
              }
              this.batFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '批量添加成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)

      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })

      this.curCourse = this.formatCourse(row.courseId)
      this.dataForm.peopleNum = this.curCourse.peopleNum
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateCoursePlan(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(index, 1, this.dataForm)
                  break
                }
              }
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '修改成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    handleDelete(row) {
      deleteCoursePlan(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          const index = this.list.indexOf(row)
          this.list.splice(index, 1)
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
    },
    timePickerNotDisabled(courseId) {
      this.disabledTimePicker = false

      this.curCourse = this.formatCourse(courseId)
      var peopleNum = this.curCourse.peopleNum
      this.dataForm.peopleNum = peopleNum

      // 修改课程时，再次计算结束时间
      if (this.dataForm.startTime) {
        this.calcEndTime()
      }
    },
    calcEndTime() {
      // 选择上课时间时，计算结束时间
      if (this.dataForm.startTime && this.curCourse.totalTime) {
        var date = new Date(formatDate(undefined, 'yyyy-MM-dd ') + this.dataForm.startTime + ':00')
        var date2 = new Date(date.getTime() + this.curCourse.totalTime * 60 * 1000)
        this.dataForm.endTime = formatDate(date2, 'HH:mm')
      }
    },
    compareToPeopleNum(rule, value, callback) {
      if (value > this.dataForm.peopleNum) {
        callback(new Error('可预约人数不能大于课程总人数!'))
      } else {
        callback()
      }
    }
  }
}
</script>
