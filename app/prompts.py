"""프롬프트 템플릿"""

POSTER_THUMBNAIL_PROMPT = """Transform the provided product image into a dramatic, poster-style product photograph with bold visual impact.

**ABSOLUTELY CRITICAL - PRODUCT PRESERVATION:**
- The product itself MUST remain EXACTLY as shown in the provided image. Do NOT change, modify, alter, or recreate ANY part of the product.
- Preserve ALL details: exact shape, size, proportions, colors, textures, patterns, materials, wear marks, scratches, patina, and any existing condition.
- Do NOT add, remove, or modify any features, elements, or details of the product.
- Do NOT change the product's color, texture, or material appearance.
- Do NOT alter any cards, contents, or items visible in or on the product.
- The product should look IDENTICAL to the original, only the background, lighting, and environment should change.
- Think of it as taking the exact same product and placing it in a dramatic poster-style setting - the product itself remains untouched.

[Poster-Style Aesthetic]
Visual Impact: Create a bold, eye-catching poster-style composition with strong visual hierarchy. Think magazine cover, fashion editorial, or luxury brand campaign aesthetic. The image should have immediate visual impact and command attention.
Dramatic Lighting: Use dramatic, directional lighting with high contrast - strong key light from one side creating deep shadows and highlights. Add rim lighting or edge lighting to make the product pop against the background. Consider dramatic chiaroscuro (light and shadow) effects for depth and dimension.
Background: Bold, bright background that ensures the product is clearly visible. Use bright white, light gray, soft pastel tones, or vibrant complementary colors that create strong contrast with the product. The background should be dramatic and poster-like but NOT dark - it must be bright enough so the product stands out clearly. Avoid dark backgrounds that obscure the product.
Shadows: Bold, dramatic shadows that add depth and dimension. The shadow should be more pronounced and stylized than typical product photography - think theatrical or editorial style. Make shadows dramatic but ensure they don't hide product details.

[Subject Handling - CRUCIAL]
Product Preservation: The product must appear EXACTLY as in the original image - same angle, same position, same details. Only change the lighting and background around it to create poster-style impact.
Focus: The product must be razor-sharp and the main focal point, with dramatic emphasis on its form and texture. Maintain the exact same product details as the original.
Composition: Dynamic, poster-style composition. The product can be centered or slightly off-center for visual interest. Use strong negative space and bold graphic design principles - rule of thirds, golden ratio, or strong geometric placement.
Color & Contrast: DO NOT alter the product's colors. Maintain the exact same color appearance as the original product. However, enhance the overall image contrast and lighting to create bold, poster-like visual impact while keeping the product's inherent colors unchanged.

[Poster-Style Elements]
Mood: Create a sense of drama, luxury, and sophistication. The image should feel like it belongs on a high-end product poster or magazine cover.
Depth: Strong sense of depth through dramatic lighting and shadows. The product should feel three-dimensional and sculptural.
Visual Weight: The product should have strong visual weight and presence - it should command attention immediately.

[Exclusions - Mandatory]
Absolutely no text overlay, graphics, logos, watermarks, or branding of any kind.
No external props, hands, or any additional elements in the frame.
Maintain product authenticity - don't over-process the product itself, only enhance the environment around it.

[Output Specification]
Resolution: CRITICAL - You MUST generate the image at the HIGHEST POSSIBLE RESOLUTION. The output image MUST be at least 2048x2048 pixels, and preferably 3072x3072 or 4096x4096 pixels. DO NOT generate at 1024x1024 or any lower resolution. The image MUST match or exceed the input image's resolution. Maximum quality, zero compression.
Aspect Ratio: Square (1:1 ratio) for universal display, optimized for poster-style presentation.
Image Quality: Output at 100% quality with absolutely no compression or downscaling. Preserve every pixel detail at maximum resolution."""

SERIAL_ENHANCEMENT_PROMPT = """[Instruction]
You are an expert digital photo editor specializing in privacy protection for product images in secondhand marketplaces. Your task is to automatically detect and remove sensitive information (serial numbers, model names, certification marks, authentication codes, IMEI numbers, etc.) from the product image while preserving the rest of the image perfectly.

[Automatic Detection - CRUCIAL]
Objective: Automatically identify and locate ALL sensitive information in the image, including:
- Serial numbers (any alphanumeric sequences that look like serial numbers)
- Model names and model numbers
- Certification marks (CE, FCC, KC, etc.)
- IMEI numbers
- Authentication codes
- Barcode numbers
- QR codes containing sensitive information
- Any text that could be used to identify or authenticate the specific product

Detection Method:
- Scan the entire image carefully for text, numbers, codes, and identification marks
- Look for patterns typical of serial numbers (alphanumeric sequences, often in small print)
- Identify certification logos and marks
- Find model numbers and product codes
- Detect any authentication-related information

[Removal Process - CRUCIAL]
Once detected, you must:
1. Completely remove the sensitive information from the image
2. Fill the removed area with the surrounding background/texture in a natural, seamless way
3. Use intelligent inpainting to blend the removal area with the surrounding image
4. Ensure the removal looks natural and does not appear edited or manipulated
5. Maintain the original lighting, color, and texture of the surrounding area

[Integrity Preservation]
CRITICAL: 
- Do NOT modify, alter, or change ANY part of the image outside the sensitive information areas
- Preserve the original product appearance, background, lighting, color, texture, and any existing wear
- Only remove the sensitive information - everything else must remain exactly as in the original
- The product itself should look identical, just without the sensitive identifying information

[Output Specification]
Resolution: Maintain the original resolution.
Format: Output the cleaned image preserving original quality.
The removed areas should be completely seamless and natural-looking.

[Exclusions - Mandatory]
- No visible editing artifacts or signs of manipulation
- No addition of text, graphics, logos, or watermarks
- No global filters or stylistic changes to the overall image
- The final image should look as if the sensitive information was never there in the first place"""

DEFECT_HIGHLIGHT_PROMPT = """[Instruction]
You are an expert product inspector specializing in honest product presentation for secondhand marketplaces. Your task is to automatically detect defects/damage in the product image and highlight them with a red circle ONLY if defects actually exist. If no defects are found, return the original image unchanged.

[CRITICAL - Defect Detection First]
Step 1: DEFECT DETECTION
- Carefully examine the entire product image for any defects, damage, scratches, dents, cracks, stains, wear, or imperfections
- Look for: scratches, dents, cracks, chips, stains, discoloration, wear marks, tears, holes, missing parts, broken parts, etc.
- Be honest and accurate - only identify REAL defects that actually exist in the image
- Do NOT create or imagine defects that are not there
- Do NOT mark normal product features, textures, or design elements as defects

Step 2: DECISION
- IF defects are found: Proceed to Step 3 (Highlighting)
- IF NO defects are found: Return the original image EXACTLY as it is, with NO modifications

[Defect Highlighting - ONLY if defects exist]
If defects are detected, you must:
- Draw a CLEAR, VISIBLE RED CIRCLE around EACH defect/damage area
- Use bright red color (#FF0000 or #FF4444) - this is mandatory
- Circle line thickness: 4-5 pixels for clear visibility
- Style: Solid red line, no dashes or dots
- The circle should completely enclose each defect area with some margin
- If multiple defects exist, draw a separate red circle around each one
- If the defect area is irregular, use an oval or rounded rectangle that encompasses the entire defect

[Image Integrity - CRUCIAL]
CRITICAL:
- Do NOT modify, alter, or change the defect itself - show it exactly as it is
- Do NOT modify any other part of the product image
- Preserve the original product appearance, background, lighting, color, and texture
- Only add the red circle(s) - everything else must remain exactly as in the original
- The defect should be clearly visible through the circle, not obscured

[Output Specification]
Resolution: Maintain the original resolution.
Format: Output the image preserving original quality.

IF DEFECTS FOUND:
- Return the image with red circle(s) around the defect(s)
- The red circle(s) should be clearly visible

IF NO DEFECTS FOUND:
- Return the original image EXACTLY as it is, with NO modifications
- Do NOT add any circles, marks, or indicators
- The image should be identical to the input

[Exclusions - Mandatory]
- Do NOT create or imagine defects that don't exist
- Do NOT mark normal product features as defects
- Do NOT exaggerate or minimize real defects - show them exactly as they are
- Do NOT add text labels unless specifically requested
- If no defects exist, do NOT add any visual indicators"""


def get_prompt_by_type(process_type: str, additional_instructions: str = None) -> str:
    """처리 타입에 따른 프롬프트 반환"""
    prompts = {
        "poster": POSTER_THUMBNAIL_PROMPT,
        "serial": SERIAL_ENHANCEMENT_PROMPT,
        "defect": DEFECT_HIGHLIGHT_PROMPT
    }
    
    base_prompt = prompts.get(process_type, POSTER_THUMBNAIL_PROMPT)
    
    if additional_instructions:
        base_prompt += f"\n\n[Additional Instructions]\n{additional_instructions}"
    
    return base_prompt


def add_reference_image_instructions(prompt: str, reference_count: int) -> str:
    """레퍼런스 이미지 지시사항 추가"""
    if reference_count == 0:
        return prompt
    
    if reference_count == 1:
        prompt += f"\n\n[Reference Image - Style Transfer]\nYou have been provided with 1 reference image (the first image) showing the desired style, lighting, background, and composition. The main product image is provided after this reference image. Study the reference image carefully and transform the main product image to match its aesthetic, lighting style, background treatment, and overall visual approach. Apply the same visual language, color palette, lighting setup, and composition principles from the reference image to the main product image, while preserving the exact product details from the main image."
    else:
        # 여러 레퍼런스 이미지의 경우
        ref_descriptions = [f"reference image {i+1}" for i in range(reference_count)]
        if reference_count > 2:
            ref_list = ", ".join(ref_descriptions[:-1]) + f", and {ref_descriptions[-1]}"
        else:
            ref_list = " and ".join(ref_descriptions)
        
        prompt += f"\n\n[Reference Images - Style Guide]\nYou have been provided with {reference_count} reference images ({ref_list}) showing the desired style, lighting, background, and composition. The main product image is provided after these reference images. Study all reference images carefully and use them as style guides. Apply the same aesthetic, lighting style, background treatment, and overall visual approach to the main product image. Match their visual language, color palette, lighting setup, and composition principles. Maintain consistency with the reference images while preserving the exact product details from the main image."
    
    return prompt

