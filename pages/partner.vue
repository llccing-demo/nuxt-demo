<template>
  <div>
    <h3>合伙人预约见面时间</h3>
    <div class="user-info">
      当前登录人:
      <span v-if="user && user.email">{{ user.email }}</span>
      <el-button @click="toLogin">重新登录</el-button>
    </div>

    <div>
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="选择日期"
        align="right"
        @change="getMeetings"
      ></el-date-picker>
    </div>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="timeRange" label="时间段" width="180">
      </el-table-column>
      <el-table-column prop="status" label="状态" width="180">
      </el-table-column>
      <el-table-column prop="enterpriser" label="创业者"> </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            v-if="scope.row.status === '未预约'"
            @click="order(scope.row)"
            >预约</el-button
          >
          <el-button type="warning" v-else @click="cancel(scope.row)"
            >取消</el-button
          >
        </template></el-table-column
      ></el-table
    >
  </div>
</template>
<script>
export default {
  data() {
    return {
      user: {
        email: "",
      },
      date: this.$dayjs(),
      config: {
        startTime: "",
        endTime: "",
      },
      tableData: [],
      latestTickId: 0,
      messageRxd: "",
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.getUserInfo();
      await this.getConfig();
      await this.getMeetings();
      this.initSocketIO();
    },
    async getUserInfo() {
      //   const user = await this.$fire.auth.currentUser;
      const user = JSON.parse(localStorage.getItem("user"));
      this.user = user;
    },
    async toLogin() {
      this.$fire.auth.signOut();
      this.$router.push("/");
    },
    // 获取配置
    async getConfig() {
      const configRef = await this.$fire.firestore.collection("config").get();
      const config = configRef.docs[0].data();
      this.config = config;
    },
    // 获取已经当前人已经预约的时间表
    async getMeetings() {
      const meetingsRef = await this.$fire.firestore
        .collection("meetings")
        .where("partner", "==", this.user.email)
        .where("date", "==", this.$dayjs(this.date).format("YYYY/MM/DD"))
        .get();
      const meetings = meetingsRef.docs.map((doc) => doc.data());
      console.log("获取会议数据", meetings);
      this.initTable(meetings);
    },
    // 生成预约数据
    initTable(meetings = []) {
      const { startTime, endTime } = this.config;
      const tableData = [];
      for (let i = startTime; i < endTime; i++) {
        const timeRange = `${i}:00-${i + 1}:00`;
        const isOrder = meetings.some((item) => item.timeRange === timeRange);
        tableData.push({
          timeRange,
          status: isOrder ? "已预约" : "未预约",
          enterpriser: "",
        });
      }
      this.tableData = tableData;
    },
    order(row) {
      if (!this.date) {
        this.$message.error("请选择日期");
        return;
      }

      this.$confirm("确认预约该时间段吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "success",
      }).then(() => {
        // 提交数据到firebase 预约表
        const date = this.$dayjs(this.date).format("YYYY/MM/DD");
        const data = {
          date,
          timeRange: row.timeRange,
          partner: this.user.email,
        };
        this.$fire.firestore
          .collection("meetings")
          .add(data)
          .then((res) => {
            console.log(res);
            this.sendMsg("partner-order", data);
            this.$message({
              type: "success",
              message: "预约成功",
            });
            this.getMeetings();
          })
          .catch((e) => {
            console.log(e);
            this.$message({
              type: "error",
              message: "预约失败",
            });
          });
      });
    },
    // 取消预约
    cancel(row) {
      // 删除预约数据
      this.$confirm("确认取消预约该时间段吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const data = {
          date: this.$dayjs(this.date).format("YYYY/MM/DD"),
          timeRange: row.timeRange,
          partner: this.user.email,
        };
        // this.$fire.firestore
        //   .collection("meetings")
        //   .where("partner", "==", data.partner)
        //   .where("date", "==", data.date)
        //   .where("timeRange", "==", data.timeRange)
        //   .get()
        //   .then((res) => {
        //     res.docs.forEach((doc) => {
        //       doc.ref.delete();
        //       this.sendMsg("partner-cancel-order", data);
        //       this.getMeetings();
        //     });

        //     this.$message({
        //       type: "success",
        //       message: "取消成功",
        //     });
        //   });

        const refs = await this.$fire.firestore
          .collection("meetings")
          .where("partner", "==", data.partner)
          .where("date", "==", data.date)
          .where("timeRange", "==", data.timeRange)
          .get();

        await Promise.all(
          refs.docs.map(async (doc) => {
            await doc.ref.delete();
          })
        );

        this.sendMsg("partner-cancel-order", data);
        this.getMeetings();

        this.$message({
          type: "success",
          message: "取消成功",
        });
      });
    },
    // 连接socket.io
    initSocketIO() {
      // use "main" socket defined in nuxt.config.js
      this.socket = this.$nuxtSocket({
        name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
      });

      this.socket.on("partner-order", (data) => {
        console.log("partner-order", data);
        const { partner } = data;
        if (partner === this.user.email) {
          this.getMeetings();
        }
      });

      this.socket.on("partner-cancel-order", (data) => {
        console.log("partner-cancel-order", data);
        const { partner } = data;
        if (partner === this.user.email) {
          console.log(99);
          this.getMeetings();
        }
      });
    },

    sendMsg(eventName, data) {
      this.socket.emit(eventName, data);
    },
  },
};
</script>