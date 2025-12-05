"""프롬프트 템플릿"""

# 미니멀 스타일 (기존 POSTER_THUMBNAIL_PROMPT)
MINIMAL_STYLE_PROMPT = """Transform the provided product image into a dramatic, poster-style product photograph with bold visual impact.

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

# 빈티지 스타일
VINTAGE_STYLE_PROMPT = """Transform the provided product image into a warm, vintage-inspired minimal aesthetic photograph.

**ABSOLUTELY CRITICAL — PRODUCT PRESERVATION**
- The product must remain exactly as shown: do not modify its form, finish, wear, or material.
- Only environment, light, and mood can change — the product itself must stay untouched.

[Vintage Minimal Aesthetic]
Visual Feel: Quiet, nostalgic, understated design photography — reminiscent of vintage interiors or editorial film stills.
Lighting: Use natural sunlight with a warm tone, as if late-afternoon sun is entering through a window.
- Long, soft shadows cast across the floor or wall.
- Gentle directional highlights, not harsh studio lighting.

Background:
- A spacious, simple environment — empty wall or matte surface.
- Neutral warm tones such as beige, sand, or faded ivory.
- Avoid busy backgrounds; keep it uncluttered and minimal.

Texture & Tone:
- Slightly muted color palette with soft contrast.
- Subtle film-like warmth and organic imperfection.
- Preserve the product's authentic material character (wood grain, patina, texture, etc.).

[Subject Handling]
- Keep the product isolated and visually dominant.
- Compose with significant negative space and simplicity.
- Use a natural, unposed placement — as if casually sitting in an empty room.

[Mood & Presence]
- Calm, nostalgic, intimate atmosphere.
- Quiet elegance, warmth, and timeworn emotional depth.
- Image should evoke handcrafted quality and understated beauty.

[Exclusions]
- No text, props, styling items, decorative elements, or studio graphics.
- Do not retouch or beautify the product beyond lighting mood — show honest character and texture.

[Output Specification]
- Minimum resolution 2048×2048 (preferably 3072×3072 or 4096×4096).
- Square 1:1 aspect ratio.
- Zero compression — full clarity with natural softness in light and tone."""

# 카탈로그 스타일 (모던 대체)
CATALOGUE_STYLE_PROMPT = """Transform the provided product image into a premium showroom-style catalogue photograph.

**ABSOLUTELY CRITICAL — PRODUCT PRESERVATION**
- The product must remain EXACTLY as shown in the reference image.
- Do not modify shape, structure, dimensions, materials, components, or finish.
- Do not recolor, retouch, or stylize the product itself.
- Only lighting, clarity, presentation and background style may change.

[Showroom / Catalogue Aesthetic]
Visual Intent: Produce a clean, high-fidelity commercial product shot suitable for a retail listing or engineering showcase.
Lighting: Use soft, balanced studio lighting that evenly highlights surfaces, mechanically precise lines, materials and fine details.
Background: Use a clean white or very light neutral backdrop that isolates the product without visual distractions.
The background should feel like a photography studio sweep — minimal, bright, and unobtrusive.
Clarity: Ensure every component and texture is clearly visible, with sharp edges and well-defined outlines.

[Subject Handling]
- Maintain the product's orientation and proportional accuracy.
- Make the product razor sharp against a minimal, bright field.
- Preserve shadows but keep them soft, tight, and controlled, as seen in commercial studio lighting.
- Avoid dramatic lighting — prioritize clarity, accuracy and presentation.

[Mood and Presence]
- Convey precision, craftsmanship, quality engineering, and premium design.
- The image should look like a professional showroom display or a performance product catalog entry.

[Exclusions — Mandatory]
- No text overlays, branding, props, hands, or additional objects.
- No filters, stylized colors, vignette effects, or mood overlays.
- Do not beautify or artistically reinterpret the product — show it truthfully.

[Output Specification]
- Minimum resolution 2048×2048 (preferably 3072×3072 or 4096×4096).
- Square 1:1 aspect ratio.
- 100% clarity, no compression or downscaling, maximum sharpness and detail."""

# 톤온톤 스타일 (따뜻한 대체)
TONE_ON_TONE_STYLE_PROMPT = """Transform the provided product image into a dramatic, poster-style product photograph with bold visual impact.

**ABSOLUTELY CRITICAL - PRODUCT PRESERVATION:**
- The product itself MUST remain EXACTLY as shown in the provided reference.
- Preserve all details: shape, size, proportions, surface, texture, finish, and natural color tone.
- Do NOT modify, enhance, recolor, or alter the product in any way.
- Only the environment, lighting, and presentation style may change — the product remains untouched.

[Poster-Style Aesthetic]
Visual Impact: Create a clean, minimal, high-end poster composition with immediate visual presence.
Dramatic Lighting: Use soft but directional lighting, creating sculpted highlight edges and subtle shadows to emphasize form.
Background: Apply a tone-on-tone approach — use a background color derived from the product's primary color but with lower saturation and slightly higher brightness.
This creates harmonious contrast: the product displays in its natural color, and the background is a soft, desaturated version of it.
Shadows: Generate gentle but intentional editorial shadows that deepen depth without hiding product details.

[Subject Handling - CRUCIAL]
Product Preservation: The product must appear exactly as captured — same angle, position, and visual integrity.
Focus: Keep the product razor-sharp and isolated against the softer background tone.
Composition: Maintain modern minimalism — generous negative space, balanced alignment, and simplicity while ensuring the product visually dominates.
Color & Contrast: Maintain the original product color exactly. Increase overall lighting contrast subtly so the product stands out against its lower-saturation background without altering its actual tone.

[Poster-Style Elements]
Mood: Reflect quiet luxury, calm sophistication, and gallery-grade simplicity.
Depth: Create dimensionality through tonal separation — natural product color versus muted pastel background.
Visual Weight: The product should feel intentional, sculptural, and visually significant.

[Exclusions - Mandatory]
No text overlays, branding, props, external objects, or design elements.
Do not stylize, retouch, recolor, or modify the product itself — only design the environment and lighting.

[Output Specification]
Resolution: Minimum 2048×2048 — ideally 3072×3072 or 4096×4096.
Aspect Ratio: Square 1:1 poster composition.
Image Quality: 100% quality output with zero downscaling or compression — preserve clarity and detail."""

# Dream 스타일
DREAM_STYLE_PROMPT = """Transform the provided product image into a whimsical miniature-world art photograph — where tiny figurines interact with the real product as if it were part of their universe.

**ABSOLUTELY CRITICAL — PRODUCT PRESERVATION**
- Do NOT modify the product itself — its color, proportions, texture, details and realism must remain untouched.
- The fantasy exists around the product, not inside it.

[Miniature Surrealism Aesthetic]
Visual Intent:
- Create a playful, imaginative scene in which small figurines live, work, or play using the real product as architecture, landscape, or props.

Characters:
- Add miniature people, workers, athletes, animals, or tiny cartoon-like figures engaged in humorous or unexpected activity.
- Their scale should be much smaller than the real product, emphasizing contrast.

Environment:
- Construct a believable "micro world" using everyday objects repurposed into structures — tools as buildings, stationery as stadiums, pasta as material, clouds made of cotton, etc.
- Scene layout should feel handcrafted but polished and editorial.

Lighting:
- Bright, soft studio lighting with clean shadows.
- Keep everything crisp and toy-like with slightly cinematic direction.

[Subject Handling]
- Place the product as the hero center — a bridge, stage, playground, or machinery in the miniature world.
- The figurines must interact *with* the product but never alter or damage it.
- The composition should feel like a still frame from a tiny universe.

[Mood & Narrative]
- Playful, imaginative, charmingly absurd, and delightfully clever.
- Feels like a premium artistic ad campaign that tells a visual story without text.

[Art Direction]
- Overhead or studio-style viewpoint to emphasize scale difference.
- Use pastel, clean, or simple backgrounds to keep focus on interaction.
- Subtle toy photography realism: shadows, depth of field, and clean color palette.

[Exclusions]
- No distortion or redesign of the product.
- No actual brands or text integrations.
- Figurines must not obscure or overwrite product details — only surround or interact.

[Output Specification]
- Square resolution 1:1.
- Minimum 2048×2048 (preferably 4096×4096).
- Ultra-sharp product and figurines with playful set staging.
- Clean, editorial, imaginative execution."""

# 기존 호환성을 위한 alias
POSTER_THUMBNAIL_PROMPT = MINIMAL_STYLE_PROMPT

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

