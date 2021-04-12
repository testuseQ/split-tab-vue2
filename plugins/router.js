import Vue from 'vue'


export default (context, inject) => {

    const $eventHub = new Vue()
    inject('eventHub', $eventHub)

    context.app.router.beforeEach((to, from, next) => {
        //console.warn("router beforeEach", to, from)
        if (to.path == '/' || to.path == '/inspire') {
            next();
            return;
        }
        if (from.path == '/demoLayout') {
            console.log("demoLayout")
            context.$eventHub.$emit('add-view', {
                page: to.path.replace("/", ""),
                key: to.name || to.path.replace("/", ""),
                title: to.name || to.path.replace("/", "")
            })
            return;
        }
        next()
    })
}