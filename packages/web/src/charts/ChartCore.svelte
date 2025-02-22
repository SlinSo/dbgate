<script lang="ts" context="module">
  import Chart from 'chart.js/auto';
  import 'chartjs-adapter-moment';
  import zoomPlugin from 'chartjs-plugin-zoom';

  const getCurrentEditor = () => getActiveComponent('ChartCore');

  registerCommand({
    id: 'chart.export',
    category: 'Chart',
    toolbarName: 'Export',
    name: 'Export chart',
    icon: 'icon report',
    toolbar: true,
    isRelatedToTab: true,
    onClick: () => getCurrentEditor().exportChart(),
    testEnabled: () => getCurrentEditor() != null,
  });

  Chart.register(zoomPlugin);
</script>

<script lang="ts">
  import { onMount, afterUpdate, onDestroy } from 'svelte';
  import _ from 'lodash';
  import registerCommand from '../commands/registerCommand';
  import { apiCall } from '../utility/api';

  import contextMenu, { getContextMenu, registerMenu } from '../utility/contextMenu';
  import createActivator, { getActiveComponent } from '../utility/createActivator';
  import { saveFileToDisk } from '../utility/exportElectronFile';

  export let data;
  export let title;
  export let type = 'line';
  export let options = {};
  // export let plugins = {};
  // export let menu;

  export const activator = createActivator('ChartCore', true);

  let chart = null;
  let domChart;

  onMount(() => {
    chart = new Chart(domChart, {
      type,
      data: data,
      // options must be cloned, because chartjs modifies options object, without cloning fails passing options to electron invoke
      options: _.cloneDeep(options), 
    });
  });

  afterUpdate(() => {
    if (!chart) return;
    chart.data = data;
    chart.type = type;
    chart.options = _.cloneDeep(options);
    // chart.plugins = plugins;
    chart.update();
  });

  onDestroy(() => {
    chart = null;
  });

  export async function exportChart() {
    saveFileToDisk(async filePath => {
      await apiCall('files/export-chart', {
        title,
        filePath,
        config: {
          type,
          data,
          options,
        },
        image: domChart.toDataURL(),
      });
    });
  }

  registerMenu({ command: 'chart.export', tag: 'export' });

  const menu = getContextMenu();
</script>

<canvas bind:this={domChart} {...$$restProps} use:contextMenu={menu} />
