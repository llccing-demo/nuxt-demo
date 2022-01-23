<template>
  <div class="container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="姓名">
        <el-select v-model="form.email" placeholder="请选择登录人">
          <el-option
            v-for="item of users"
            :key="item.username"
            :label="`${item.username}-${item.email}`"
            :value="item.email"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="css" scoped>
.container {
  height: 200px;
  margin: 0 auto;
  margin-top: 100px;
  display: flex;
}
</style>

<script>
export default {
  name: "IndexPage",
  data() {
    return {
      form: {
        email: "",
      },
      users: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getUserList();
    },
    async getUserList() {
      const usersRef = await this.$fire.firestore.collection("users").get();
      const users = usersRef.docs.map((doc) => doc.data());
      console.log(users);
      this.users = users;
    },
    login() {
      this.$fire.auth
        .signInWithEmailAndPassword(this.form.email, "Asdf.1234")
        .then(async (res) => {
          localStorage.setItem("user", JSON.stringify(res.user));
          const user = await this.getUserInfo();
          if (user.role === 0) {
            this.$router.push("/enterpriser");
          } else {
            this.$router.push("/partner");
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getUserInfo() {
      const userRef = await this.$fire.firestore.collection("users").get();
      const user = userRef.docs.filter((doc) => {
        const data = doc.data();
        return data.email === this.form.email;
      });
      const userArr = user.map((doc) => doc.data());
      return userArr[0];
    },
  },
};
</script>
