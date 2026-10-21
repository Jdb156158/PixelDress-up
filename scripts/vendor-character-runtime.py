from pathlib import Path
import urllib.request,tarfile,io
packages=[('three','0.180.0',{'build/three.module.js':'three/three.module.js','build/three.core.js':'three/three.core.js','examples/jsm/controls/OrbitControls.js':'three/addons/controls/OrbitControls.js','examples/jsm/loaders/GLTFLoader.js':'three/addons/loaders/GLTFLoader.js','examples/jsm/utils/BufferGeometryUtils.js':'three/addons/utils/BufferGeometryUtils.js','LICENSE':'three/LICENSE'}),('@pixiv/three-vrm','3.5.5',{'lib/three-vrm.module.min.js':'three-vrm/three-vrm.module.min.js','LICENSE':'three-vrm/LICENSE'})]
for name,version,files in packages:
 filename=name.rsplit('/',1)[-1]
 url=f'https://registry.npmjs.org/{name}/-/{filename}-{version}.tgz'
 data=urllib.request.urlopen(url,timeout=60).read()
 with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tar:
  for src,dst in files.items():
   target=Path('dist/vendor')/dst;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(tar.extractfile('package/'+src).read())
 print(name,version,'vendored')
