<template>
  <dir class="test-page-b__panel">
    <dir class="test-page-b__text">
      {{ rect.width + "," + rect.height }}
    </dir>
    <v-text-field label="input" v-model="value"></v-text-field>

    <v-btn @click="apply"> apply </v-btn>
  </dir>
</template>

<script>
export default {
  props: { rect: Object, default: () => ({ width: 200, height: 200 }) },
  data() {
    return {
      value: "",
    };
  },
  methods: {
    apply(e) {
      console.log("apply");
    },
  },
};
</script>
<style scoped>
.test-page-b__panel {
  height: 500px;
  width: 500px;
  background: linear-gradient(-135deg, #72e4b4, #1f8f10);
}
.test-page-b__text {
  color: #000000;
}
</style>