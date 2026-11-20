# Limitations & Future Scope | Style AI Explainable AI Fashion Advisor

## 1. Honest System Limitations

Transparency is a fundamental tenet of Style AI. We state our operational limitations clearly:

1. **2D Projection vs 3D Volumetric Depth**:
   - Single-view frontal photographs capture 2D silhouette projections. While height calibration provides accurate width ratios, true volumetric body depth (e.g. chest depth or posture curvature) is estimated rather than laser-scanned.
2. **Camera Sensor Variations & Illuminant Metamerism**:
   - Consumer smartphone cameras apply proprietary auto-exposure, tone-mapping, and white balance curves. While Gray-World white balance normalizes ambient casts, extreme low-light or saturated colored lighting can introduce slight shifts in measured skin tone.
3. **Retail Inventory Volatility**:
   - Rather than simulating fake inventory or caching outdated catalog prices, Style AI redirects users to live search queries on Myntra, AJIO, Meesho, Flipkart, and Amazon India. Stock availability depends on live merchant listings.
4. **Clothing Baggy/Oversized Fit Interference**:
   - If an uploaded user photo features extremely baggy outerwear (e.g. thick winter puffer jackets), skeletal landmarks remain accurate via joint extrapolation, but outer fabric boundaries require form-fitting or semi-fitted garments for maximum silhouette precision.

---

## 2. Future Scope & Roadmap

1. **3D Mesh Reconstruction (SMPL/SMPL-X Integration)**:
   - Transition from 2D skeletal joints to dense 3D human body mesh estimation, enabling millimeter-level circumferential measurements (chest circumference, waist girth, hip curve).
2. **Virtual 3D Clothes Try-On (VTON)**:
   - Integrate diffusion-based virtual try-on pipelines (e.g. CatVTON or IDM-VTON) allowing users to see recommended outfits rendered photorealistically onto their actual posture.
3. **Multi-Angle Synchronous Fusion**:
   - Combine simultaneous frontal, 45-degree, and lateral profile snapshots to construct a unified 3D anthropometric digital twin.
4. **Local Hardware Acceleration**:
   - Compile computer vision models into ONNX Runtime / WebAssembly for direct in-browser client-side inference, reducing latency to zero.
