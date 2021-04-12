<template>
  <v-container>
    <v-row justify="space-around">
      <v-date-picker v-model="picker" color="green lighten-1"></v-date-picker>
      <v-date-picker
        v-model="picker2"
        color="green lighten-1"
        header-color="primary"
      ></v-date-picker>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      picker: new Date().toISOString().substr(0, 10),
      picker2: new Date().toISOString().substr(0, 10),
    }
  },
}
</script>
<style scoped>
.pane {
  position: relative;
  overflow: hidden;
  flex: 1 1 auto;
  height: 100%;
  width: 100%;
  flex-direction: column;
  pointer-events: none;

  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.pane > .header {
  height: 40px;
  padding: 10px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: initial;

  text-transform: uppercase;
  background: #eee;
  color: #444;
}

.pane > .content {
  position: absolute;
  top: 40px;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  pointer-events: initial;

  background: #f6f6f6;
  padding: 10px;
}
</style>
