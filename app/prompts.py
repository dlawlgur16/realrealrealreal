"""프롬프트 템플릿 - 6가지 스타일"""

# 1. 드라마틱 포스터 (Dramatic)
DRAMATIC_STYLE_PROMPT = """Transform the provided product image into a dramatic, poster-style product photograph with bold visual impact.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Poster Style Aesthetic:
Create bold visual presence and magazine-cover-level impact.
Use dramatic directional lighting with high contrast — key light from one side, rim light for separation, sculpted shadows.
Background must be bright, clean, and high-contrast — light gray, white, pastel, or a vibrant complementary tone (never dark or muddy).
Shadows must be stylized but must not obscure product detail.

Subject Handling:
The product must remain at the same angle and integrity — only placement, framing, and lighting can shift.
Razor-sharp focus, strong clarity, dramatic definition.
Use visual hierarchy and negative space for poster composition.

Exclusions:
No text, typography, logos, or overlays.
No props, hands, or external objects.

Output:
Square (1:1) composition.
Minimum 2048×2048 resolution — ideally 3072–4096px.
Maximum quality output with no compression."""

# 2. 톤온톤 (Tone-on-Tone)
TONE_ON_TONE_STYLE_PROMPT = """Transform the provided product image into an elegant tone-on-tone poster-style visual with refined monochromatic harmony.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Tone-on-Tone Aesthetic:
Use one harmonized color family to build atmosphere (background, lighting temperature, shadow intensity).
The product's original colors remain unchanged — the environment harmonizes around it.
Lighting should be soft, directional, non-harsh, with gradient falloff and gentle depth.

Background:
Smooth tonal gradient surfaces, softly brushed monochrome, or subdued pastel harmony.

Shadows:
Soft diffused shadows, natural length, enhancing depth without dominating.

Subject Handling:
Sharp focus, preserved detail, premium spacing, rule-of-thirds placement.

Mood:
Quiet luxury, sophistication, calm premium refinement.

Exclusions:
No text or props.

Output:
Square 1:1 aspect.
Minimum 2048–4096px, zero compression."""

# 3. 모던 프리미엄 (Modern)
MODERN_STYLE_PROMPT = """Transform the provided product image into a modern premium commercial advertisement-style poster visual.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Modern Luxury Aesthetic:
Think Apple, Dior, Lexus, Tesla, or high-end editorial campaigns.
Use precision lighting, clean highlight edges, balanced contrast.
Controlled reflections and premium studio environment.

Background:
Clean, architectural gradients, smooth studio atmosphere, subtle geometry.

Shadows:
Soft but confident shadows reinforcing object authority.

Composition:
Centered balance, golden ratio alignment, refined negative space, visual clarity.

Mood:
Sharp professionalism, contemporary prestige, premium luxury.

Output & Exclusions:
No text, overlays, or props.
Square 1:1.
Minimum 2048–4096px, maximum clarity."""

# 4. 아티스틱 에디토리얼 (Artistic)
ARTISTIC_STYLE_PROMPT = """Transform the provided product image into an art-driven editorial advertisement poster with emotive storytelling impact.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Artistic Aesthetic:
Inspired by perfume ads, cinematic fashion visuals, poetic luxury branding.
Soft diffused light or spotlight + gentle haze.
Atmospheric depth, analog dreamy vibe, but with clarity on the product.

Background:
Abstract artistic gradients or painterly textures — subtle, ethereal, non-distracting.

Shadows:
Expressive, emotional contouring while preserving visibility.

Composition:
Narrative framing, tension lines, breathing room, light cinematic structure.

Mood:
Romantic, poetic, emotional, elegant, cinematic.

Output & Exclusions:
Square 1:1.
High resolution 2048–4096px.
No text, no props."""

# 5. 히어로 프로덕트 (Hero)
HERO_STYLE_PROMPT = """Transform the provided product image into a hyper-real hero-object poster where the product appears iconic and monumental.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Hero Product Aesthetic:
Treat the object as a centerpiece of a major product launch.
Use cinematic rim lighting, controlled edge glow, volumetric presence.
Create the illusion of object importance without altering its form.

Background:
Clean premium gradient or subtle atmospheric haze — photographic, not fantasy.

Shadows:
Crisp grounding shadow with strong depth, sculptural edge definition.

Composition:
Centered, monolithic visual presence.
Slight illusion of low-angle emphasis achieved only through lighting and composition (not modifying product geometry).

Mood:
Prestige, power, premium aura, hero presence.

Output & Exclusions:
No text or graphics.
Square 1:1.
Minimum 2048–4096px, maximum clarity."""

# 6. 뮤지엄 전시 (Museum)
MUSEUM_STYLE_PROMPT = """Transform the provided product image into a museum-exhibition style fine art poster where the product is treated as a curated collectible.

ABSOLUTELY CRITICAL – PRODUCT PRESERVATION:
The product itself MUST remain EXACTLY as shown in the original image.
Do NOT modify, redesign, enhance, simplify, distort, or recreate ANY part of the product.
Preserve all physical details: proportions, edges, textures, colors, wear marks, reflections, patina, damage, or imperfections.
Do NOT alter labels, contents, material properties, or surface appearance.
Only lighting, background, and composition may change — the product must remain visually identical.

Exhibition Aesthetic:
Gallery-grade simplicity, quiet reverence, curator presentation.
Lighting resembles calm museum spotlighting — diffused, controlled top illumination.

Background:
Neutral matte museum-wall tones (ivory, stone, chalk).
Light texture allowed but must not distract.

Shadows:
Natural soft grounding shadows, subtle falloff as if displayed on a pedestal.

Composition:
Centered or slightly elevated artifact placement.
Generous negative space, timeless presentation.

Mood:
Cultural value, sophistication, collector energy.

Output & Exclusions:
Square 1:1.
Minimum 2048–4096px.
Zero compression, no text, no props."""

# 기존 호환성을 위한 alias
POSTER_THUMBNAIL_PROMPT = DRAMATIC_STYLE_PROMPT
MINIMAL_STYLE_PROMPT = DRAMATIC_STYLE_PROMPT  # 기존 코드 호환
VINTAGE_STYLE_PROMPT = TONE_ON_TONE_STYLE_PROMPT  # 기존 코드 호환
CATALOGUE_STYLE_PROMPT = MODERN_STYLE_PROMPT  # 기존 코드 호환
DREAM_STYLE_PROMPT = ARTISTIC_STYLE_PROMPT  # 기존 코드 호환

# Privacy Blur (시리얼 번호 등 민감 정보 제거)
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

# Defect Highlight (하자 감지 및 강조)
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
