import { createVuetify } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    // テーマ色のクラス（bg-primary など）も CSS レイヤーに出力する
    layers: true,
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920, xxl: 2560 },
  },
})
