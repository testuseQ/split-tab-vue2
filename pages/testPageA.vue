<template>
  <dir class="test-page-a__panel">
    <dir class="test-page-a__text">
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
.test-page-a__panel {
  height: 500px;
  width: 500px;
  background: linear-gradient(-135deg, #e4a972, #9941d8);
}
.test-page-a__text {
  color: #000000;
}
</style>
