<script setup lang="ts">
import Database from "./components/Database.vue";
import {NConfigProvider} from 'naive-ui'
const theme = {
    "common": {
        "baseColor": "#FFF",
        "primaryColor": "#292929FF",
        "primaryColorHover": "#525252FF",
        "infoColor": "#A3A3A3FF",
        "primaryColorPressed": "#292929FF",
        "primaryColorSuppl": "#292929FF",
        "infoColorHover": "#CCCCCCFF",
        "infoColorPressed": "#A3A3A3FF",
        "infoColorSuppl": "#A3A3A3FF",
        "placeholderColor": "rgba(147, 147, 147, 1)",
        "successColor": "#00E86DFF",
        "successColorHover": "#47FF9DFF",
        "successColorPressed": "#00E86DFF",
        "successColorSuppl": "#00E86DFF",
        "warningColor": "#FFBC51FF",
        "warningColorHover": "#FFD797FF",
        "warningColorPressed": "#FFBC51FF",
        "warningColorSuppl": "#FFBC51FF",
        "errorColor": "#FF484BFF",
        "errorColorHover": "#FF9193FF",
        "errorColorPressed": "#FF484BFF",
        "errorColorSuppl": "#FF484BFF",
        "fontSize": "12px",
        "fontSizeSmall": "12px",
        "fontSizeMini": "8px",
        "fontSizeTiny": "10px"
    },
    "Tooltip": {
        "padding": "2px 4px"
    },
    "Spin": {
        "sizeTiny": "12px",
        "sizeSmall": "14px",
        "sizeMedium": "16px",
        "sizeLarge": "20px"
    },
    "Input": {
        "border": "1px solid #525252",
        "placeholderColor": "rgba(197, 197, 197, 1)"
    }
}

</script>
<template>
    <n-config-provider :theme-overrides="theme">
        <Database></Database>
    </n-config-provider>
</template>

<style scoped>
</style>
