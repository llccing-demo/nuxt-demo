export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-demo',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/element-ui'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  serverMiddleware: ["~/serverMiddleware/socket-io-server.js"],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    [
      '@nuxtjs/firebase',
      {
        config: {
          apiKey: "AIzaSyBKPdKmdgyLIMcPX8sBOkFr3ftlQzQMAm8",
          authDomain: "uplifted-water-324821.firebaseapp.com",
          projectId: "uplifted-water-324821",
          storageBucket: "uplifted-water-324821.appspot.com",
          messagingSenderId: "1025865059660",
          appId: "1:1025865059660:web:08a3d6348cfc9016d4d3e9",
          measurementId: "G-EDBSER8283"
        },
        services: {
          auth: true,
          firestore: true,
          functions: true,
          storage: true,
          realtimeDb: true
        }
      }
    ],
    '@nuxtjs/dayjs',
    'nuxt-socket-io',
  ],

  // socket.io configuration
  io: {
    // we could have multiple sockets that we identify with names
    // one of these sockets may have set "default" to true
    sockets: [{
      default: true, // make this the default socket
      name: 'main', // give it a name that we can later use to choose this socket in the .vue file
      url: 'http://localhost:3001' // URL wherever your socket IO server runs
    }]
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
  }
}
