import * as esbuild from 'esbuild';

const result = await esbuild.build({
  bundle: true,
  entryPoints: ['src/home-new.js'],
  outdir: 'dist',
  minify: true,
  target: 'es2020',
  metafile: true,
  write: false,
});

console.log(await esbuild.analyzeMetafile(result.metafile, { verbose: true }));
