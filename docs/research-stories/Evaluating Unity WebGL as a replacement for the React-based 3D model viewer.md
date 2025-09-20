# Evaluating Unity WebGL as a replacement for the React-based 3D model viewer.

## Context
### Problem
Currently, the HoloLens-application is built in the Unity game engine, while the accompanying webapplication uses a React-based solution (using Three.js, a JavaScript 3D rendering library) to render the scenes and 3D models that are viewed in a browser window.

When in use for a consult, the two 3D viewers (Unity-based and React-based) need to be able to view and manipulate the same scene/model synchronously in real-time, as such both viewers need to support the exact same features. This means that each new feature or piece of functionality that is added to one of the apps needs to be exactly duplicated in the other app too, which leads to higher development times and a larger risk of introducing inconsistencies and desynchronisation between both viewers during development.

### Proposed Solution
The proposed solution to this problem is to replace the React-based web viewer with a Unity WebGL viewer embedded within the rest of the React app. We can add a simple toggle between the configurations for the web viewer and the HoloLens viewer inside of the Unity project.

In this way, each time a new build of the HoloLens viewer is created we can almost automatically achieve parity in the web viewer (we just need to add web-based controls for the feature). The project team can focus on adding new features inside of a single development project (the Unity project), using a single programming language (C#), speeding up the implementation rate of new features and minimizing the risk of desynchronisation between the HoloLens- and web-apps.

One thing to consider is that a Unity WebGL build might be more resource-intensive to run than a React-based approach, requiring longer loading times and offering worse performance. We will need to research if the performance of a WebGL build is acceptable or not.

## Research Question
Would replacing the current React-based 3D viewer with a Unity WebGL viewer be beneficial in terms of reducing duplicated development effort, maintaining consistent features across the HoloLens 2 and web platforms, and ensuring long-term scalability?

## Hypothesis
- Using Unity WebGL for the 3D viewer in the webapp will eliminate duplicated development work and ensure complete feature parity between the HoloLens and web viewer.
- The performance and usability of Unity WebGL builds in a browser view will be acceptable for surgeons guiding HoloLens users, on the computer systems utilized by the UMC Utrecht.

## Methodology
- Literature review on Unity WebGL performance, build sizes, and optimisation techniques.
- Comparative analysis against Three.js on loading, runtime performance, and optimisation capabilities.
- Practical loading tests on representative devices and networks.
- File format and compression experiment for typical medical models.

## Expected Deliverables
- Evaluation report with quantified observations (loading times, sizes, pros/cons).
- Decision rationale with risks, mitigations, and recommended path forward.
- References and reproducible steps for performed tests.

## Definition of Ready (DoR)
- Scope defined (replace web viewer vs keep Three.js).
- Research question and hypothesis documented.
- Methodology and expected deliverables outlined.
- Test devices and example models available.

## Acceptance Criteria
- Clear comparison of Unity WebGL and Three.js across key criteria.
- Findings are actionable and answer the research question.
- Risks and trade-offs documented with mitigations.
- Sources cited for claims and measurements.

## Definition of Done (DoD)
- All acceptance criteria met and reviewed by stakeholders.
- Document checked into repository and shared with the team.
- Related backlog items updated based on recommendation.

## Study on Unity WebGL vs Three.js
### Purpose 
The purpose of this study is to compare the expected performance of a Unity WebGL 3D model viewer with a Three.js 3D model viewer within a webpage. By comparing important metrics we can then make an informed choice between the two options.

### Scope
This study will focus on the following areas:
- Loading time
- Rendering performance
- Browser and device support
- Ease of adding additional features

### Loading Time
#### Engine Downloading Time
Out-of-the-box, Three.js will generally always download faster than a Unity WebGL build, as only the Three.js JavaScript code will be downloaded, along with the models/textures that are to be displayed in the viewer. A Unity WebGL build, however, is always shipped with a Unity engine runtime alongside generated WebAssembly modules. 

When looking at building a bare-bones scene (not loading any detailed 3D models or textures yet), an unmodified Unity WebGL build is generally around 8 MB in size. However, there are a couple of optimisations which can be made to bring down the size of a Unity WebGL build [^source1]. When applying all possible build setting optimalisations, it is possible to bring down the build size to around 3 MB [^source2]. Assuming the median download speed in the Netherlands of 162.39 Mbps on mobile internet and 210.09 Mbps on fixed broadband connections [^source3], a bare-bones Unity WebGL build will take about 0.15-0.4 seconds to download, which is an acceptable time.

#### Engine Loading Time
When comparing the loading time of the viewers after downloading, the Three.js solution will generally take less time to load than a Unity WebGL build, for the same reasons why the download size is smaller. Three.js natively runs within the React webpage, while the Unity build contains an engine runtime which needs to be started before it can render anything.

#### Unity WebGL Downloading + Loading Speed Tests
When testing loading times using a Unity 6000.2.0f1 URP (Universal Rendering Pipeline) WebGL2 build [^source4] on a couple of devices with differing specifications we get the following results:
- Desktop PC (Ryzen 5 7600X, 32 GB RAM at 4800 MHz, Radeon RX 7600, 19.8 Mbps):  
    - Awake: 3.26s
    - Start: 3.28s
- Acer Nitro V 15 ANV15-41 Laptop (Ryzen 5 7535HS, 16 GB RAM at 4800 MHz, Radeon 660M, 124.6 Mbps):
    - Awake: 1.14s
    - Start: 1.18s
- HP Pavilion 15-cc581nd Laptop (i5-7200U, 8 GB RAM at 2133 MHz, HD Graphics 620, 46.6 Mbps):
    - Awake: 3.26s
    - Start: 3.70s
- Xiaomi Mi 9T Smartphone (Snapdragon 730, 6 GB RAM at , Adreno 618, 146.8 Mbps):
    - Awake: 2.57s
    - Start: 2.88s

From these tests we can see that, while the specifications of the tested devices seem to have a level of impact on the total loading time, the loading times are influenced the most by the speed of the internet connection of the device.

Looking at the test results it is clear that, as long as a decent internet connection is established (which can be expected in the operating environment within the UMC Utrecht and other Dutch hospitals), even a Xiaomi Mi 9T smartphone, which is a budget model first released in June 2019, has no problems loading a Unity WebGL build inside of a webpage within an acceptable timeframe. 

Seeing as the hardware the application and web-app will be running on within the UMC will be more potent than the Mi 9T and HP Pavilion 15-cc581nd tested here, we deem the performance of Unity WebGL acceptable.

#### Model Downloading Time
When working with actual 3D objects within the viewer inside of the webapp, the most important factor impacting loading speed is the file size of the 3D models that are to be loaded. It is important to choose the right file format and compression method so that 3D models can be downloaded as quickly as possible.

We have the choice between a couple of file format options:
- .obj:
    - Widely used, but outdated format.
    - Natively supported in both Three.js and Unity.
    - Relatively large file size, not suitable for web transfer without applying compression.
- .fbx:
    - Industry standard for game creation.
    - Natively supported in Three.js, preferred format in Unity.
    - Medium file size, still not suitable for web transfer without further compression.
- .gltf
    - Newer format, designed for web transfer.
    - Recommended by the Three.js developers [^source5], not natively supported in Unity, but there are packages (glTFast [^source6] and UnityGLTF [^source7]) that allow gltf files to be used.
    - Medium-Small file size, which can be further compressed using Draco [^source8]. The most suitable option for web transfer.

All three of these file formats can be compressed using Gzip or the newer Brotli compression format [^source9], which are both natively supported by Unity.

To better compare these file formats (and to take into account compressability of each file type), we have taken the [demo skull 3D model](./images/skull.png) that is included in the Unity project, which is a large and detailed model consisting of 869.992 triangles and 6 objects, and saved it using each combination of file format and (applicable) compression method.

[The resulting file sizes, listed from largest to smallest](./images/file-sizes.png):
- **.obj:** 69.642 kB
- **.fbx:** 32.182 kB
- **.fbx (Brotli compression):** 29.867 kB
- **.gltf:** 27.144 kB
- **.obj (Brotli compression):** 14.000 kB
- **.gltf (Brotli compression):** 12.927 kB
- **.gltf (Lossless Draco compression):** 12.215 kB
- **.gltf (Lossless Draco compression, Brotli compression):** 4.541 kB
- **.gltf (Lossy Draco compression):** 1.691 kB
- **.gltf (Lossy Draco compression, Brotli compression):** 1.263 kB

While .obj is the largest file format, it compresses relatively well using Brotli, so depending on the model complexity it could be (barely) usable in a web context.

The .fbx file is already half the size of the .obj file without compression, but doesn't compress well, making it a bad choice in a web context.

The .gltf file is most promising, being both the smallest without compression and the most compressable format.

Seeing as all three model formats, Brotli compression and Draco compression are usable within both Three.js and Unity, the choice of pipeline can primarily focus on team familiarity and tooling support. However, glTF with Draco (optionally combined with Brotli at the transport layer) remains the most efficient option for web delivery.

### Rendering Performance
As both Unity web builds and Three.js render using WebGL, the performance of similar setups (same model, texture, lighting etc.) is generally comparable, with Unity having some more engine overhead. Without building the same exact test scenes in both Unity and Three.js and extensively testing them it is hard to say if any of the two options will be the better choice. Therefore we will compare Unity and Three.js support for some popular performance optimisation techniques, to see which choice allows for easier optimisation if/when performance issues arise in the future.

| Technique             | Description                                                                       | Unity Support                                                                                                                                                                                                   | Three.js Support                                                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Static Batching       | Combine static (unmovable) meshes to reduce draw calls.                           | **Automatic:** Unity automatically handles batching for objects that are marked as static [^source11].                                                                                                          | **Manual:** It is possible to manually batch static objects using the BufferGeometryUtils add-on [^source12].                     |
| GPU Instancing        | Use a single draw call to render multiple instances of the same mesh.             | **Automatic:** Unity automatically handles GPU Instancing for any object with a material with 'Enable GPU Instancing' enabled [^source13].                                                                      | **Manual:** GPU Instancing is supported via the InstancedMesh class [^source14].                                                  |
| Frustum Culling       | Don't render objects if they are not within the camera view.                      | **Automatic:** Frustum Culling is enabled by default on every camera [^source15].                                                                                                                               | **Automatic:** Frustum Culling is automatically enabled on every 3D object [^source16].                                           |
| Occlusion Culling     | Don't render objects if they are completely hidden behind other objects.          | **Not Supported:** Occlusion Culling is not supported in Unity WebGL specifically.                                                                                                                              | **Not Supported:** Three.js has no support for Occlusion culling.                                                                 |
| Level of Detail (LOD) | Swap out complex meshes for less complex versions when at a distance.             | **Automatic:** LOD's can be easily set up using LOD groups, Unity will automatically switch between different LOD's at set distances [^source17].                                                               | **Automatic:** LOD's need a little more setup, but generally function similarly when using the THREE.LOD-object [^source18].      |
| Light Baking          | Bake lighting and shadows into textures once, instead of calculating every frame. | **Automatic:** Unity supports both baked lighting and a hybrid baking mode combining baked and real-time lighting features [^source19].                                                                         | **Not Supported:** Three.js doesn't provide built-in support for light baking, lightmaps need to be created in external tools.    |
| Asset Streaming       | Load in assets only when they are needed instead of preloading every asset.       | **Automatic:** Unity supports asset streaming using Asset Bundles [^source20], these can be downloaded from an external server at runtime [^source21].                                                          | **Manual:** Three.js can use add-ons like GLTFLoader [^source22] to manually load assets asynchronously.                          |
| Adaptive Quality      | Automatically lower graphics settings when performance is below a set threshold.  | **Manual:** Unity's QualitySettings allow for graphics settings switching during runtime [^source23]. Checking for current performance and updating the QualitySettings accordingly needs manual implementation.| **Not Supported:** Three.js has no default support for Adaptive Quality.                                                          |

Unity supports more optimisation techniques out-of-the-box, with a lot of features requiring little to no coding to enable and/or configure. This significantly speeds up the optimisation process. Three.js, on the other hand, generally requires a more hands-on approach with more manual setup. Some optimisation features will need to be implemented from scratch if needed.

### Ease of Adding Additional Features
#### Current Setup
The current setup uses a Unity-based viewer for the HoloLens 2 application, connected to a Three.js-based viewer in the website. Because both viewers need to support the exact same feature set, each new feature or changed feature needs to be implemented twice. This approach carries some large risks:
- Slower / less efficient development:
    - Each new feature or change needs to be implemented in both the Three.js viewer and the Unity viewer.
    - This effectively doubles the work needed for each new feature or change to the viewers.
    - Two seperate development (sub)teams might be needed, or a single team must be fluent in Three.js/React/JavaScript as well as Unity/C#.
    - Any used Unity engine features that don't exist in Three.js will need to be created from scratch in the webviewer.
- Higher chance of inconsistencies and desynchonisation:
    - Even a slightly different implementation of a feature inside one of the viewers might lead to inconsistent behaviour, bugs and desynchronisation between both viewers.
    - Networking between both implementations needs to take into account differences between both implementations (e.g. different coordinate conventions and data structures).
    - Very tight QA is needed to ensure feature parity between both implementations.

#### Unity WebGL Setup
If the Three.js viewer is swapped out for a (slightly modified) WebGL build of the existing Unity viewer, this will have the following effects:
- All scene logic (rendering settings, shader implementations, interaction logic, physics etc.) will be the exact same between both viewers. This will achieve the following effects:
    - No more duplicated implementation and QA needed, the only logic that changes between both builds is the control scheme (gesture controls vs mouse + keyboard controls).
    - Viewer developers only need an understanding of Unity/C#.
    - No more feature disparity between the two viewers.
    - Easier networking between both viewers.

### Analysis
Based on the research data and comparisons in the chapters above, we can summarize the pros and cons of the current setup versus a Unity-only setup.

#### Current Solution (Unity for HoloLens + Three.js for website)
**Pros:**
- Faster loading: smaller download and initialization times due to being a JavaScript library without engine overhead.
- Easier iterations: developers can use web tools like hot reload for fast iteration and deployment.
- Optimized models out-of-the-box: natively supports .gltf files with Draco compression for smaller 3D model file sizes.

**Cons:**
- Feature duplication: every new feature or change needs to be implemented twice, doubling development and QA work.
- Risk of inconsistency: differences between Unity and Three.js implementations can lead to bugs, inconsistent behavior and synchronization issues.
- Higher networking complexity: requires translating between Unity an Three.js data structures. This makes synchronization logic more fragile and harder to maintain.
- Limited out-of-the-box features: performance optimizations and advanced features require more manual coding and external tools compared to Unity’s built-in solutions.

#### Proposed Solution (Unity for both HoloLens and website)
**Pros:**
- Feature parity: all rendering, interaction, and other logic is shared between the HoloLens 2 and the web viewer builds, eliminating duplicated development and resulting issues.
- Single tech stack: developers working on the viewers only need to be proficient in Unity/C#.
- Engine features: Unity offers a lot of out-of-the-box support for advanced rendering features and performance optimisation techniques. Most of these features can be used in both builds with minimal effort.
- Lower networking complexity: both viewers use the same data structures, coordinate system etc., making synchronisation between multiple machines easier.

**Cons:**
- Slower loading: Unity WebGL builds take longer to download and load in because of engine overhead, although this can be optimized build sizes will be larger than in Three.js.
- Less performant out-of-the-box: the Unity engine overhead slightly impacts runtime performance.
- Slower deployment: whenever changes are made, a new build has to be created before they can be tested.

### Conclusion
#### Validation of Hypothesis
- Using Unity WebGL for the 3D viewer in the webapp will eliminate duplicated development work and ensure complete feature parity between the HoloLens and web viewer.
    - **This hypothesis is confirmed.** Since both viewers share the same Unity codebase, any feature developed for one viewer is automatically available in the other viewer too.
- The performance and usability of Unity WebGL builds in a browser view will be acceptable for surgeons guiding HoloLens users, on the computer systems utilized by the UMC Utrecht.
    - **This hypothesis is partially confirmed.** It is hard to confirm this hypothesis without extensively testing custom-made benchmark scenes on the exact hardware that will be used by the UMC Utrecht. The limited testing and literature studies done for this research evaluation indicate that Unity WebGL will most likely perform well on any relatively modern system, and can be optimised further to improve performance if needed.

#### Research Question
The research question (Would replacing the current React-based 3D viewer with a Unity WebGL viewer be beneficial in terms of reducing duplicated development effort, maintaining consistent features across the HoloLens 2 and web platforms, and ensuring long-term scalability?) can be answered as follows:

Yes, replacing the React-based 3D viewer with a Unity WebGL viewer would be beneficial overall, although some trade-offs will have to be managed.
The Unity WebGL solution removes the need to implement new features or changes twice, reducing development time.
A (mostly) shared Unity codebase ensures that all logic is the same on both platforms, massively reducing the risk of desynchronisation between both viewers.
Maintaining a single Unity project for both viewers is more sustainable than maintaining two parallel implementations in both the short- and long term. In the long term, both viewers can leverage the same new features introduced in future Unity updates, without any need for custom implementations on the web side.
The main trade-offs: larger build sizes and the Unity engine performance overhead, can be mitigated by carefully optimising build sizes and implementing performance boosting techniques.

#### Recommendation
Based on the data and analysis presented in this research evaluation, the recommended approach going forward with development is to replace the currently used Three.js viewer with a Unity WebGL viewer. This will ensure easier and quicker development, reduce the complexity and fragility of the created solution, guarantee feature parity between both viewers, and allow both viewers to leverage the full suite of functionalities and performance optimalisations built into the Unity engine.

### Sources
[^source1]: [Unity WebGL Loading Tests](https://deml.io/experiments/unity-webgl/)
[^source2]: [Unity WebGL build optimisation](https://discussions.unity.com/t/webgl-builds-for-mobile/711925/87)
[^source3]: [Speedtest.net Netherlands Median Country Speeds](https://www.speedtest.net/global-index/netherlands)
[^source4]: [Unity WebGL Loading Tests](https://deml.io/experiments/unity-webgl/6000.2.0f1-urp-webgl2/)
[^source5]: [Three.js Manual - Loading 3D Models](https://threejs.org/manual/#en/loading-3d-models)
[^source6]: [glTFast ](https://github.com/atteneder/glTFast)
[^source7]: [UnityGLTF ](https://github.com/KhronosGroup/UnityGLTF)
[^source8]: [Draco ](https://github.com/google/draco)
[^source9]: [Brotli ](https://github.com/google/brotli)
[^source10]: [Unity Documentation - Web performance considerations](https://docs.unity3d.com/6000.3/Documentation/Manual/webgl-performance.html)
[^source11]: [Unity Documentation - Introduction to batching meshes](https://docs.unity3d.com/6000.2/Documentation/Manual/DrawCallBatching.html)
[^source12]: [Three.js Documentation - BufferGeometryUtils.mergeGeometries](https://threejs.org/docs/index.html#examples/en/utils/BufferGeometryUtils.mergeGeometries)
[^source13]: [Unity Documentation - Introduction to GPU instancing](https://docs.unity3d.com/6000.2/Documentation/Manual/GPUInstancing.html)
[^source14]: [Three.js Documentation - InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh)
[^source15]: [Unity Documentation - Occlusion culling](https://docs.unity3d.com/6000.2/Documentation/Manual/OcclusionCulling.html)
[^source16]: [Three.js Documentation - Object3D.frustumCulled](https://threejs.org/docs/#api/en/core/Object3D.frustumCulled)
[^source17]: [Unity Learn - Working with LODs](https://learn.unity.com/tutorial/working-with-lods-2019-3)
[^source18]: [Three.js Documentation - LOD](https://threejs.org/docs/#api/en/objects/LOD)
[^source19]: [Unity Documentation - Light Modes](https://docs.unity3d.com/6000.2/Documentation/Manual/LightModes-introduction.html)
[^source20]: [Unity Documentation - Introduction to AssetBundles](https://docs.unity3d.com/6000.2/Documentation/Manual/AssetBundlesIntro.html)
[^source21]: [Unity Documentation - Downloading AssetBundles](https://docs.unity3d.com/6000.2/Documentation/Manual/AssetBundles-Integrity.html)
[^source22]: [Three.js Documentation - GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
[^source23]: [Unity Documentation - QualitySettings](https://docs.unity3d.com/6000.2/Documentation/ScriptReference/QualitySettings.html)