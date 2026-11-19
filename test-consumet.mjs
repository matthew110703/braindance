import { MOVIES } from '@consumet/extensions';

async function test() {
  for (const name of ['Goku', 'SFlix', 'HiMovies']) {
    console.log(`Testing ${name}...`);
    try {
      const provider = new MOVIES[name]();
      const search = await provider.search('Avatar');
      console.log(`${name} found:`, search.results?.length);
      if (search.results?.length > 0) {
        const first = search.results[0];
        console.log(`${name} first:`, first.title, first.id);
        const info = await provider.fetchMediaInfo(first.id);
        const epId = info.episodes?.[0]?.id;
        if (epId) {
          const sources = await provider.fetchEpisodeSources(first.id, epId);
          console.log(`${name} SUCCESS sources:`, sources.sources?.length, sources.sources?.[0]?.url);
          return;
        }
      }
    } catch (e) {
      console.log(`${name} error:`, e.message);
    }
  }
}

test();
