<script lang="ts">
  import SavedFilesList from './SavedFilesList.svelte';

  import WidgetColumnBar from './WidgetColumnBar.svelte';
  import WidgetColumnBarItem from './WidgetColumnBarItem.svelte';

  import AppObjectList from '../appobj/AppObjectList.svelte';
  import * as closedTabAppObject from '../appobj/ClosedTabAppObject.svelte';
  import * as favoriteFileAppObject from '../appobj/FavoriteFileAppObject.svelte';
  import { openedTabs } from '../stores';

  import hasPermission from '../utility/hasPermission';
  import { useFavorites } from '../utility/metadataLoaders';

  import WidgetsInnerContainer from './WidgetsInnerContainer.svelte';

  $: favorites = useFavorites();

</script>

<WidgetColumnBar>
  {#if hasPermission('files/favorites/read')}
    <WidgetColumnBarItem title="Favorites" name="favorites" height="20%" storageName="favoritesWidget">
      <WidgetsInnerContainer>
        <AppObjectList list={$favorites || []} module={favoriteFileAppObject} />
      </WidgetsInnerContainer>
    </WidgetColumnBarItem>
  {/if}

  <WidgetColumnBarItem title="Saved files" name="files" storageName="savedFilesWidget">
    <SavedFilesList />
  </WidgetColumnBarItem>
</WidgetColumnBar>
