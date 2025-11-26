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
Resolution: Extremely high-quality, poster-worthy resolution (e.g., 1500x1500 pixels or higher) with professional photography quality.
Aspect Ratio: Square (1:1 ratio) for universal display, optimized for poster-style presentation."""

SERIAL_ENHANCEMENT_PROMPT = """[Instruction]
You are an expert digital photo editor specializing in enhancing specific details for product authentication in secondhand marketplaces. Your task is to apply targeted, subtle enhancements only to the indicated region (serial number, model name, certification marks area) to improve legibility, while preserving the integrity and original appearance of the rest of the image.

[Target Area Enhancement - CRUCIAL]
Objective: The primary goal is to make any text within the target area highly legible.
Enhancements:
- Sharpening: Apply a subtle sharpening filter to increase the clarity of text and fine lines.
- Contrast/Brightness: Slightly increase local contrast and brightness to improve readability.
- Noise Reduction: Gently reduce noise or pixelation to clean up the text.
- Color Correction: If necessary, slightly adjust colors to improve text visibility.

[Integrity Preservation]
CRITICAL: Do NOT modify, alter, or enhance any part of the image outside the text/serial number area.
Preserve the original background, lighting, color, texture, and any existing wear on the product.

[Output Specification]
Resolution: Maintain the original resolution.
Format: Output the enhanced image preserving original quality.

[Exclusions - Mandatory]
No background alteration, replacement, or blurring.
No addition of text, graphics, logos, or watermarks.
No global filters or stylistic changes to the overall image."""

DEFECT_HIGHLIGHT_PROMPT = """[Instruction]
You are an expert digital photo editor specializing in honest product presentation for secondhand marketplaces. Your task is to clearly but aesthetically highlight the defect/damage area in the product image to build trust with potential buyers.

[Defect Highlighting - CRUCIAL]
Objective: Make the defect area clearly visible while maintaining the overall aesthetic quality.
Approach:
- Create a subtle visual indicator around the defect area (thin circle, arrow, or soft highlight)
- Use a non-intrusive color (soft blue or subtle orange) that doesn't look aggressive
- The highlight should draw attention without making the product look worse than it is
- Ensure the actual condition of the defect is clearly visible

[Style Guidelines]
Visual Style: Clean, professional, trustworthy
Indicator Style: Minimalist, elegant marking
Color: Use colors that suggest transparency and honesty (soft blue, muted orange)

[Output Specification]
Resolution: Maintain the original resolution.
The defect should be clearly identifiable but the overall image should still look professional.

[Exclusions - Mandatory]
Do not exaggerate or minimize the defect
No dramatic effects that make the image look unprofessional
No text labels unless specifically requested"""


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

