import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 plugins:[react()],
 base:process.env.PAGES_BASE||'/',
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 define:{__ROOM_API__:JSON.stringify(process.env.VITE_ROOM_API||'https://memory-noir-case-of-us.iphtaar.chatgpt.site/api/room')},
 build:{outDir:'dist-web',emptyOutDir:true}
});
