"""
Stable Diffusion 1.5 + ControlNet(Depth) + LoRA 파이프라인
GTX 1080 Ti (11GB) 최적화 버전
"""
import torch
from diffusers import (
    StableDiffusionControlNetImg2ImgPipeline,
    ControlNetModel,
    UniPCMultistepScheduler
)
from diffusers.utils import load_image
from PIL import Image
import numpy as np
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class SDPipeline:
    """
    Stable Diffusion 1.5 기반 img2img 파이프라인
    ControlNet Depth와 LoRA를 지원
    """
    
    def __init__(self):
        """파이프라인 초기화 (지연 로딩)"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipe = None
        self.controlnet = None
        self.models_loaded = False
        
        # 로컬 모델 경로 설정
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        
        # LoRA 경로 설정 (환경변수 또는 기본 경로)
        self.lora_path = os.getenv("LORA_PATH", None)
        if not self.lora_path:
            # 기본 LoRA 경로 확인
            default_lora_path = os.path.join(base_dir, "templates", "apple", "eddiemauroLora2.safetensors")
            if os.path.exists(default_lora_path):
                self.lora_path = default_lora_path
                print(f"   Found LoRA at default path: {self.lora_path}")
        
        self.lora_weight = float(os.getenv("LORA_WEIGHT", "0.6"))
        self.sd_model_path = os.getenv("SD_MODEL_PATH", None)
        self.controlnet_model_path = os.getenv("CONTROLNET_MODEL_PATH", None)
        
        # 환경변수가 없으면 기본 로컬 경로 확인
        if not self.sd_model_path:
            default_sd_path = os.path.join(base_dir, "models", "stable-diffusion-v1-5")
            if os.path.exists(default_sd_path):
                self.sd_model_path = default_sd_path
        
        if not self.controlnet_model_path:
            default_cn_path = os.path.join(base_dir, "models", "controlnet-depth")
            if os.path.exists(default_cn_path):
                self.controlnet_model_path = default_cn_path
        
        # 지연 로딩: 첫 사용 시 모델 로드
        print(f"SD Pipeline initialized (device: {self.device})")
        print(f"   Models will be loaded on first use")
    
    def _load_models(self):
        """
        모델 로딩 (지연 로딩 방식으로 메모리 최적화)
        로컬 모델이 있으면 우선 사용, 없으면 Hugging Face에서 다운로드
        """
        try:
            print("Loading Stable Diffusion models...")
            
            # ControlNet Depth 모델 로드
            if self.controlnet_model_path and os.path.exists(self.controlnet_model_path):
                # config.json이 있는지 확인 (Hugging Face 형식)
                config_path = os.path.join(self.controlnet_model_path, "config.json")
                if os.path.exists(config_path):
                    print(f"Loading ControlNet from local path: {self.controlnet_model_path}")
                    self.controlnet = ControlNetModel.from_pretrained(
                        self.controlnet_model_path,
                        torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                    )
                else:
                    print(f"⚠️ Local ControlNet path exists but missing config.json")
                    print("   Falling back to Hugging Face...")
                    self.controlnet = ControlNetModel.from_pretrained(
                        "lllyasviel/control_v11f1p_sd15_depth",
                        torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                    )
            else:
                print("Loading ControlNet from Hugging Face...")
                self.controlnet = ControlNetModel.from_pretrained(
                    "lllyasviel/control_v11f1p_sd15_depth",
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
            
            # Stable Diffusion 1.5 + ControlNet Img2Img 파이프라인
            # 로컬 모델이 Hugging Face 형식인지 확인 (필수 파일 체크)
            use_local_sd = False
            if self.sd_model_path and os.path.exists(self.sd_model_path):
                model_index_path = os.path.join(self.sd_model_path, "model_index.json")
                scheduler_dir = os.path.join(self.sd_model_path, "scheduler")
                scheduler_config_path = os.path.join(scheduler_dir, "scheduler_config.json")
                
                # 필수 파일들이 모두 있는지 확인
                if os.path.exists(model_index_path) and os.path.exists(scheduler_config_path):
                    use_local_sd = True
                    print(f"Loading SD model from local path: {self.sd_model_path}")
                else:
                    print(f"⚠️ Local SD model path exists but missing required files")
                    print(f"   model_index.json: {os.path.exists(model_index_path)}")
                    print(f"   scheduler_config.json: {os.path.exists(scheduler_config_path)}")
                    print("   Falling back to Hugging Face...")
            
            if use_local_sd:
                try:
                    self.pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
                        self.sd_model_path,
                        controlnet=self.controlnet,
                        torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                        safety_checker=None,  # 성능 최적화
                        requires_safety_checker=False
                    )
                except Exception as e:
                    print(f"⚠️ Local SD model loading failed: {e}")
                    print("   Falling back to Hugging Face...")
                    use_local_sd = False
            
            if not use_local_sd:
                print("Loading SD model from Hugging Face...")
                self.pipe = StableDiffusionControlNetImg2ImgPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    controlnet=self.controlnet,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,  # 성능 최적화
                    requires_safety_checker=False
                )
            
            # 스케줄러 설정 (DPM++ SDE Karras)
            self.pipe.scheduler = UniPCMultistepScheduler.from_config(
                self.pipe.scheduler.config
            )
            
            # GPU 최적화
            if self.device == "cuda":
                self.pipe = self.pipe.to(self.device)
                # 메모리 최적화
                self.pipe.enable_attention_slicing()
                self.pipe.enable_vae_slicing()
                self.pipe.enable_model_cpu_offload()
            
            # LoRA 로드 (환경변수에 설정된 경우)
            if self.lora_path and os.path.exists(self.lora_path):
                self._load_lora(self.lora_path, self.lora_weight)
            
            self.models_loaded = True
            print("✅ Models loaded successfully!")
            
        except Exception as e:
            import traceback
            print(f"❌ Error loading models: {e}")
            print("   Traceback:")
            traceback.print_exc()
            print("   Falling back: SD processing will be skipped")
            self.pipe = None
            self.models_loaded = False
    
    def _load_lora(self, lora_path: Optional[str] = None, weight: float = 0.6):
        """
        LoRA 모델 로드 (선택사항)
        
        Args:
            lora_path: LoRA 모델 경로 (None이면 스킵)
            weight: LoRA 가중치 (0.0 ~ 1.0)
        """
        if self.pipe is None:
            print("   ⚠️ Pipe not loaded, cannot load LoRA")
            return
        
        if lora_path is None:
            print("   ℹ️ No LoRA path specified")
            return
        
        # 경로 확인
        if not os.path.exists(lora_path):
            print(f"   ⚠️ LoRA file not found: {lora_path}")
            return
        
        try:
            print(f"   Loading LoRA: {lora_path} (weight: {weight})")
            
            # diffusers의 load_lora_weights 사용
            if hasattr(self.pipe, 'load_lora_weights'):
                self.pipe.load_lora_weights(lora_path, weight=weight)
                print(f"   ✅ LoRA loaded successfully!")
            else:
                # 대체 방법: PEFT 사용
                try:
                    from peft import LoraConfig, get_peft_model
                    print("   Trying PEFT method...")
                    # PEFT 방식은 복잡하므로 일단 경고만
                    print("   ⚠️ load_lora_weights not available, LoRA may not work")
                except ImportError:
                    print("   ⚠️ PEFT not available")
                    
        except Exception as e:
            import traceback
            print(f"   ❌ LoRA loading failed: {e}")
            print("   Traceback:")
            traceback.print_exc()
    
    def _create_depth_map(self, image: Image.Image) -> Image.Image:
        """
        ControlNet Depth를 위한 깊이 맵 생성
        
        Args:
            image: 입력 이미지
            
        Returns:
            깊이 맵 이미지
        """
        try:
            # controlnet-aux를 사용한 depth estimation (권장)
            from controlnet_aux import MidasDetector
            
            if not hasattr(self, '_midas'):
                self._midas = MidasDetector.from_pretrained("lllyasviel/Annotators")
            
            depth_map = self._midas(image)
            return depth_map
        except ImportError:
            # controlnet-aux가 없으면 간단한 grayscale depth map 생성
            print("Warning: controlnet-aux not installed, using simple depth map")
            img_array = np.array(image.convert("RGB"))
            gray = np.dot(img_array[...,:3], [0.299, 0.587, 0.114])
            depth_map = Image.fromarray(gray.astype(np.uint8)).convert("RGB")
            return depth_map
        except Exception as e:
            print(f"Depth map generation error: {e}, using simple method")
            # 에러 발생 시 간단한 방법 사용
            img_array = np.array(image.convert("RGB"))
            gray = np.dot(img_array[...,:3], [0.299, 0.587, 0.114])
            depth_map = Image.fromarray(gray.astype(np.uint8)).convert("RGB")
            return depth_map
    
    async def process(
        self,
        input_image: Image.Image,
        prompt: str = "professional product photography, studio lighting, minimalist, high quality, 4k",
        negative_prompt: str = "blurry, low quality, distorted, bad lighting",
        denoise_strength: float = 0.30,
        cfg_scale: float = 5.0,
        num_inference_steps: int = 24,
        controlnet_conditioning_scale: float = 0.75
    ) -> Image.Image:
        """
        Stable Diffusion img2img 처리
        
        Args:
            input_image: 입력 이미지 (PIL Image)
            prompt: 생성 프롬프트
            negative_prompt: 네거티브 프롬프트
            denoise_strength: 노이즈 제거 강도 (0.0 ~ 1.0)
            cfg_scale: CFG 스케일
            num_inference_steps: 추론 스텝 수
            controlnet_conditioning_scale: ControlNet 강도
            lora_path: LoRA 모델 경로 (선택)
            lora_weight: LoRA 가중치
            
        Returns:
            처리된 이미지 (PIL Image)
        """
        # 지연 로딩: 첫 사용 시 모델 로드
        if not self.models_loaded:
            print("   Loading SD models (first use)...")
            self._load_models()
        
        if self.pipe is None:
            print("⚠️ SD Pipeline not loaded, returning original image")
            print("   Check if models are loaded correctly")
            return input_image
        
        try:
            print(f"   Processing image with SD...")
            print(f"   Prompt: {prompt[:50]}...")
            print(f"   Device: {self.device}")
            
            # 입력 이미지 리사이즈 (768x768)
            input_image = input_image.resize((768, 768), Image.Resampling.LANCZOS)
            print(f"   Input image resized to 768x768")
            
            # Depth map 생성
            print(f"   Creating depth map...")
            depth_map = self._create_depth_map(input_image)
            print(f"   Depth map created")
            
            # Stable Diffusion 처리 (LoRA는 이미 초기화 시 로드됨)
            print(f"   Running Stable Diffusion inference...")
            result = self.pipe(
                prompt=prompt,
                image=input_image,
                control_image=depth_map,
                negative_prompt=negative_prompt,
                strength=denoise_strength,
                guidance_scale=cfg_scale,
                num_inference_steps=num_inference_steps,
                controlnet_conditioning_scale=controlnet_conditioning_scale,
                height=1024,  # 출력 높이
                width=768,    # 출력 너비
            ).images[0]
            
            print(f"   SD processing completed")
            
            # 출력 크기 조정 (768x1024)
            result = result.resize((768, 1024), Image.Resampling.LANCZOS)
            
            return result
            
        except Exception as e:
            import traceback
            print(f"❌ SD processing error: {e}")
            print(f"   Traceback:")
            traceback.print_exc()
            # 에러 발생 시 원본 이미지 반환
            print(f"   Returning original image")
            return input_image
    
    def unload(self):
        """메모리 해제"""
        if self.pipe:
            del self.pipe
            del self.controlnet
            torch.cuda.empty_cache() if torch.cuda.is_available() else None

