import os
import json
import re
from typing import Dict, Any, List, Optional
from pathlib import Path
from ..config import DRESS_KB_FILE, MAKEUP_KB_FILE, MONK_SCALE_FILE

class ChatEngine:
    def __init__(self):
        self.dress_kb = []
        self.makeup_kb = {}
        self.monk_scale = []
        self._load_knowledge()

    def _load_knowledge(self):
        try:
            if Path(DRESS_KB_FILE).exists():
                with open(DRESS_KB_FILE, 'r', encoding='utf-8') as f:
                    self.dress_kb = json.load(f)
            if Path(MAKEUP_KB_FILE).exists():
                with open(MAKEUP_KB_FILE, 'r', encoding='utf-8') as f:
                    self.makeup_kb = json.load(f)
            if Path(MONK_SCALE_FILE).exists():
                with open(MONK_SCALE_FILE, 'r', encoding='utf-8') as f:
                    self.monk_scale = json.load(f)
        except Exception as e:
            print(f"[ChatEngine] Warning loading KB: {e}")

    def generate_response(
        self,
        message: str,
        language: str = "en",
        gender: Optional[str] = "women",
        body_shape: Optional[str] = None,
        skin_tone: Optional[str] = None,
        undertone: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Processes a user query and returns a structured multilingual styling response.
        """
        raw_msg = message.strip()
        msg = raw_msg.lower()
        lang = self._normalize_language(language, msg)

        # 1. Check for Gemini API key if available
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                llm_res = self._try_gemini(raw_msg, lang, gender, body_shape, skin_tone, undertone, gemini_key)
                if llm_res:
                    return llm_res
            except Exception as e:
                print(f"[ChatEngine] Gemini LLM fallback: {e}")

        # 2. Native Multi-lingual Intelligent Reasoning Engine
        return self._generate_native_response(
            msg=msg,
            raw_msg=raw_msg,
            lang=lang,
            gender=gender or "women",
            body_shape=body_shape,
            skin_tone=skin_tone,
            undertone=undertone
        )

    def _normalize_language(self, lang: str, msg: str) -> str:
        lang = (lang or "en").lower().strip()
        if lang in ["auto", "detect", "auto-detect"]:
            # Basic unicode script range detection
            if re.search(r'[\u0900-\u097F]', msg):  # Devanagari (Hindi/Marathi)
                return "hi"
            if re.search(r'[\u0C80-\u0CFF]', msg):  # Kannada
                return "kn"
            if re.search(r'[\u0B80-\u0BFF]', msg):  # Tamil
                return "ta"
            if re.search(r'[\u0C00-\u0C7F]', msg):  # Telugu
                return "te"
            if re.search(r'[\u0980-\u09FF]', msg):  # Bengali
                return "bn"
            if re.search(r'[\u0600-\u06FF]', msg):  # Arabic
                return "ar"
            if re.search(r'[\u3040-\u30FF\u4E00-\u9FAF]', msg):  # Japanese
                return "ja"
            if re.search(r'[\uAC00-\uD7AF]', msg):  # Korean
                return "ko"
            if re.search(r'[\u0400-\u04FF]', msg):  # Cyrillic/Russian
                return "ru"
            # Spanish / French / German keyword hints
            if any(w in msg for w in ["hola", "vestido", "maquillaje", "forma", "cuerpo", "gracias"]):
                return "es"
            if any(w in msg for w in ["bonjour", "robe", "maquillage", "silhouette", "merci"]):
                return "fr"
            if any(w in msg for w in ["hallo", "kleid", "schminke", "körper", "danke"]):
                return "de"
            return "en"
        return lang

    def _generate_native_response(
        self,
        msg: str,
        raw_msg: str,
        lang: str,
        gender: str,
        body_shape: Optional[str],
        skin_tone: Optional[str],
        undertone: Optional[str]
    ) -> Dict[str, Any]:
        shape = body_shape or ("Hourglass" if gender.lower() == "women" else "Trapezoid")
        tone = skin_tone or "Monk Tone 04 (Wheat)"
        under = undertone or "Warm"
        is_men = gender.lower() == "men"

        # Determine Intent
        intent = self._classify_intent(msg)

        # Contextual relevant outfits from knowledge base
        matching_outfits = [
            item for item in self.dress_kb 
            if item.get("gender", "").lower() == gender.lower() 
            and shape in item.get("recommended_shapes", [])
        ][:2]

        outfit_names = [o.get("name") for o in matching_outfits] or (
            ["Italian Slim-Fit Double-Breasted Suit", "Mandarin Collar Raw Silk Kurta"] if is_men 
            else ["A-Line Wrap Midi Dress", "Tailored Belted Trench Coat"]
        )

        # Build response based on intent and language
        templates = self._get_language_templates(lang)
        fallback = templates.get(intent) or templates.get("general")

        reply_text = fallback["reply"].format(
            body_shape=shape,
            skin_tone=tone,
            undertone=under,
            gender=gender,
            outfit1=outfit_names[0] if len(outfit_names) > 0 else "Bespoke Silhouette",
            outfit2=outfit_names[1] if len(outfit_names) > 1 else "Classic Tailored Fit"
        )

        return {
            "reply": reply_text,
            "language": lang,
            "detected_intent": intent,
            "suggested_actions": fallback.get("actions", []),
            "quick_replies": fallback.get("quick_replies", [])
        }

    def _classify_intent(self, msg: str) -> str:
        # Greetings
        if any(w in msg for w in ["hello", "hi", "hey", "bonjour", "hola", "namaste", "नमस्ते", "ಹಲೋ", "வணக்கம்", "నమస్కారం", "హాయ్"]):
            return "greeting"

        # Body shape & clothing
        if any(w in msg for w in [
            "shape", "body", "dress", "outfit", "wear", "clothes", "silhouette", "figure", "size",
            "कपड़े", "ड्रेस", "शरीर", "शेप", "ಬಟ್ಟೆ", "ಆಕಾರ", "உடை", "வடிவம்", "దుస్తులు", "ఆకారం",
            "ropa", "vestido", "corps", "kleid", "figur"
        ]):
            return "body_fashion"

        # Makeup & Cosmetics
        if any(w in msg for w in [
            "makeup", "lipstick", "foundation", "blush", "eyeliner", "palette", "cosmetics",
            "मेकअप", "लिपस्टिक", "फाउंडेशन", "ಮೇಕಪ್", "மேக்கப்", "మేకప్", "maquillaje", "maquillage"
        ]):
            return "makeup"

        # Skin tone & Undertone & Color
        if any(w in msg for w in [
            "skin", "undertone", "color", "colour", "tone", "monk", "complexion",
            "रंग", "त्वचा", "अंडरटोन", "ಚರ್ಮ", "ಬಣ್ಣ", "தோல்", "நிறம்", "చర్మం", "రంగు", "piel", "teint", "haut"
        ]):
            return "skin_color"

        # Explainable AI & SHAP & Science
        if any(w in msg for w in [
            "explain", "xai", "shap", "why", "counterfactual", "algorithm", "feature",
            "क्यों", "समझाओ", "ವಿವರಿಸಿ", "விளக்கு", "వివరించు", "explicar", "expliquer", "erklären"
        ]):
            return "xai"

        # Shopping
        if any(w in msg for w in [
            "shop", "buy", "store", "myntra", "ajio", "amazon", "flipkart", "price", "cost",
            "खरीद", "दुकान", "ಖರೀದಿ", "ஷாப்பிங்", "షాపింగ్", "comprar", "acheter", "kaufen"
        ]):
            return "shopping"

        # Privacy
        if any(w in msg for w in [
            "privacy", "safe", "secure", "photo", "camera", "image", "save", "data", "gdpr",
            "सुरक्षा", "प्राइवेसी", "ಫೋಟೋ", "படம்", "ఫోటో", "seguridad", "sécurité", "sicherheit"
        ]):
            return "privacy"

        return "general"

    def _get_language_templates(self, lang: str) -> Dict[str, Any]:
        """
        Multilingual localized responses and suggestions.
        """
        # 1. Hindi (हिंदी)
        if lang in ["hi", "hindi"]:
            return {
                "greeting": {
                    "reply": "नमस्ते! मैं स्टाइल एआई (Style AI) का आपका व्यक्तिगत फैशन और ग्रूमिंग सलाहकार हूँ। ✨\n\nआपकी वर्तमान प्रोफाइल: **{body_shape}** बॉडी शेप और **{undertone}** अंडरटोन ({skin_tone})।\n\nमैं आज आपके कपड़ों के चुनाव, मेकअप, परफेक्ट रंगों या एआई सिफारिशों के पीछे के कारणों को समझाने में कैसे मदद करूँ?",
                    "actions": [{"label": "फैशन एडवाइजर खोलें", "tab": "fashion"}, {"label": "एआई स्टूडियो देखें", "tab": "studio"}],
                    "quick_replies": ["मेरे शरीर के अनुसार बेस्ट ड्रेस?", "वार्म/कूल स्किन के लिए लिपस्टिक?", "मेरी ड्रेस का SHAP कारण बताओ", "ऑनलाइन शॉपिंग लिंक दिखाओ"]
                },
                "body_fashion": {
                    "reply": "आपकी शारीरिक बनावट (**{body_shape}**) के लिए हमारी ज्यामितीय सिफारिशें:\n\n• **{outfit1}**: यह कट आपके कंधों, कमर और कूल्हों के प्राकृतिक अनुपात को संतुलित करता है।\n• **{outfit2}**: प्रीमियम फैब्रिक और संरचनात्मक कट आपके लुक को निखारते हैं।\n\n💡 *टिप*: अधिक विस्तृत SHAP फीचर महत्व जानने के लिए 'एक्सप्लेन माई रेकमेंडेशन' पर क्लिक करें।",
                    "actions": [{"label": "पूरी अलमारी देखें", "tab": "fashion"}, {"label": "1-फोटो स्टूडियो में जांचें", "tab": "studio"}],
                    "quick_replies": ["इसके साथ कौन से रंग पहनें?", "ऑफिस या शादी के कपड़े?", "मेरी सिफारिश का वैज्ञानिक कारण क्या है?"]
                },
                "makeup": {
                    "reply": "आपकी त्वचा के **{skin_tone}** और **{undertone}** अंडरटोन के लिए शीर्ष मेकअप सुझाव:\n\n• **लिपस्टिक**: {undertone} टोन के लिए टेराकोटा, पीच-न्यूड, वार्म प्लम या रिच बेरी शेड्स उत्तम हैं।\n• **फाउंडेशन**: मोंक स्केल {skin_tone} के अनुसार शून्य फ्लैशबैक फॉर्मूला।\n• **आईशैडो व ब्लश**: सॉफ्ट पीच, शैम्पेन और गोल्ड शिमर।",
                    "actions": [{"label": "मेकअप एडवाइजर खोलें", "tab": "makeup"}, {"label": "कलर पैलेट देखें", "tab": "palette"}],
                    "quick_replies": ["पार्टी लुक के लिए मेकअप?", "डेली वियर मेकअप?", "फाउंडेशन मैच कैसे जांचें?"]
                },
                "skin_color": {
                    "reply": "आपकी त्वचा का विश्लेषण:\n• **मोंक टोन**: {skin_tone}\n• **अंडरटोन**: {undertone}\n\n🎨 **अनुकूल रंग**: सोने, शैम्पेन, ऑलिव ग्रीन, गर्म मैरून, और मस्टर्ड येलो।\n⚠️ **सावधानी वाले रंग**: अत्यधिक ठंडे नीले व फीके मटमैले रंग आपकी त्वचा की चमक को कम कर सकते हैं।",
                    "actions": [{"label": "व्यक्तिगत पैलेट खोलें", "tab": "palette"}, {"label": "स्किन टोन विश्लेषण", "tab": "skin"}],
                    "quick_replies": ["ज्वेलरी कौन सी पहनें (Gold/Silver)?", "ट्रेडिशनल वियर के रंग?", "मेकअप एडवाइजर"]
                },
                "xai": {
                    "reply": "🔬 **Style AI की व्याख्यात्मक बुद्धिमत्ता (XAI)**:\n\nहम कभी 'ब्लैक-बॉक्स' अनुमान नहीं लगाते। हर सुझाव सरोगेट डिसीजन ट्री और **SHAP (Shapley Additive Explanations)** पर आधारित होता है। यह आपके शोल्डर-टू-हिप (SHR) और वेस्ट-टू-हिप (WHR) अनुपात का सटीक गणितीय विश्लेषण करता है।",
                    "actions": [{"label": "XAI लैब खोलें", "tab": "xai"}],
                    "quick_replies": ["काउंटरफैक्चुअल शिफ्ट क्या है?", "सरोगेट ट्री कैसे काम करता है?", "फैशन एडवाइजर खोलें"]
                },
                "shopping": {
                    "reply": "🛍️ **सत्यापित स्टोर शॉपिंग**:\n\nStyle AI कोई फर्जी दाम या स्टॉक नहीं दिखाता। आप मिंत्रा (Myntra), आजियो (AJIO), मीशो (Meesho), फ्लिपकार्ट (Flipkart) और अमेज़न (Amazon India) पर सीधे सही साइज और रंग के साथ सर्च कर सकते हैं।",
                    "actions": [{"label": "शॉपिंग हब खोलें", "tab": "shopping"}],
                    "quick_replies": ["मिंत्रा पर ड्रेस दिखाओ", "बजट कपड़े कैसे चुनें?", "फैशन एडवाइजर"]
                },
                "privacy": {
                    "reply": "🔒 **प्राइवेसी बाय डिज़ाइन गारंटी**:\n\nआपकी तस्वीरें कभी भी हार्ड डिस्क या डेटाबेस में सेव नहीं होतीं। इमेज केवल रैम (`io.BytesIO`) में प्रोसेस होकर तुरंत नष्ट कर दी जाती हैं। शून्य डिस्क प्रतिधारण!",
                    "actions": [{"label": "गोपनीयता नीति पढ़ें", "tab": "privacy"}],
                    "quick_replies": ["क्या मेरा डेटा सुरक्षित है?", "स्टूडियो में फोटो डालें"]
                },
                "general": {
                    "reply": "मैं आपकी व्यक्तिगत स्टाइलिंग सहायक हूँ। आपकी प्रोफाइल **{body_shape}** और **{skin_tone}** को ध्यान में रखते हुए, मैं किसी भी ड्रेस, मेकअप, शादी या कैजुअल लुक के लिए सलाह दे सकती हूँ। आप क्या जानना चाहते हैं?",
                    "actions": [{"label": "फैशन एडवाइजर", "tab": "fashion"}, {"label": "मेकअप एडवाइजर", "tab": "makeup"}],
                    "quick_replies": ["मेरी बेस्ट ड्रेस क्या है?", "लिपस्टिक शेड्स बताएं", "कलर पैलेट खोलें"]
                }
            }

        # 2. Kannada (ಕನ್ನಡ)
        if lang in ["kn", "kannada"]:
            return {
                "greeting": {
                    "reply": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಫ್ಯಾಷನ್ ಮತ್ತು ಸ್ಟೈಲ್ ಎಐ (Style AI) ಸಲಹೆಗಾರ. ✨\n\nನಿಮ್ಮ ಪ್ರೊಫೈಲ್: **{body_shape}** ಆಕಾರ ಮತ್ತು **{undertone}** ಅಂಡರ್‌ಟೋನ್ ({skin_tone}).\n\nಇಂದು ನಿಮ್ಮ ಡ್ರೆಸ್ಸಿಂಗ್, ಮೇಕಪ್ ಅಥವಾ ಕಣ್ಣಿನ ಬಣ್ಣಗಳ ಬಗ್ಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
                    "actions": [{"label": "ಫ್ಯಾಷನ್ ಸಲಹೆಗಾರ", "tab": "fashion"}, {"label": "ಸ್ಟುಡಿಯೋ ತೆರೆಯಿರಿ", "tab": "studio"}],
                    "quick_replies": ["ನನ್ನ ದೇಹಕ್ಕೆ ಸೂಕ್ತವಾದ ಉಡುಪು?", "ನನ್ನ ಚರ್ಮಕ್ಕೆ ಯಾವ ಮೇಕಪ್ ಸೂಕ್ತ?", "ಶಾಪಿಂಗ್ ಲಿಂಕ್‌ಗಳು"]
                },
                "body_fashion": {
                    "reply": "ನಿಮ್ಮ **{body_shape}** ದೇಹದ ಆಕಾರಕ್ಕೆ ಪ್ರಮುಖ ಶಿಫಾರಸುಗಳು:\n\n• **{outfit1}**: ನಿಮ್ಮ ಭುಜ ಮತ್ತು ಸೊಂಟದ ಅನುಪಾತವನ್ನು ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.\n• **{outfit2}**: ರಾಜಮನೆತನದ ಆಕರ್ಷಕ ನೋಟವನ್ನು ನೀಡುತ್ತದೆ.",
                    "actions": [{"label": "ಫ್ಯಾಷನ್ ವಾರ್ಡ್ರೋಬ್", "tab": "fashion"}],
                    "quick_replies": ["ಯಾವ ಬಣ್ಣಗಳು ಸರಿಹೊಂದುತ್ತವೆ?", "ಮೇಕಪ್ ಸಲಹೆಗಳು", "ವಿವರಣೆ ತೋರಿಸಿ"]
                },
                "general": {
                    "reply": "ಸ್ಟೈಲ್ ಎಐ (Style AI) ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸ್ಟೈಲಿಸ್ಟ್ ಆಗಿದೆ. ನಿಮ್ಮ **{body_shape}** ಆಕಾರಕ್ಕೆ ಸರಿಹೊಂದುವಂತೆ ಬಟ್ಟೆ ಮತ್ತು ಮೇಕಪ್ ಆಯ್ಕೆ ಮಾಡಲು ನನಗೆ ಕೇಳಿ!",
                    "actions": [{"label": "ಫ್ಯಾಷನ್ ಸಲಹೆ", "tab": "fashion"}, {"label": "ಮೇಕಪ್ ಸಲಹೆ", "tab": "makeup"}],
                    "quick_replies": ["ಸೂಕ್ತವಾದ ಡ್ರೆಸ್ ಯಾವುದು?", "ಕಲರ್ ಪ್ಯಾಲೆಟ್", "ಪ್ರೈವೆಸಿ ವಿವರಣೆ"]
                }
            }

        # 3. Tamil (தமிழ்)
        if lang in ["ta", "tamil"]:
            return {
                "greeting": {
                    "reply": "வணக்கம்! நான் உங்கள் பிரத்யேக Style AI பேஷன் மற்றும் ஸ்டைலிங் ஆலோசகர். ✨\n\nஉங்கள் சுயவிவரம்: **{body_shape}** உடலமைப்பு மற்றும் **{undertone}** நிறம் ({skin_tone}).\n\nஇன்று உங்கள் ஆடைகள், மேக்கப் அல்லது ஸ்டைலிங் பற்றி என்ன அறிய விரும்புகிறீர்கள்?",
                    "actions": [{"label": "ஆடை ஆலோசகர்", "tab": "fashion"}, {"label": "ஸ்டுடியோ பார்க்க", "tab": "studio"}],
                    "quick_replies": ["எனக்கு ஏற்ற உடை எது?", "எந்த லிப்ஸ்டிக் நிறம் சிறந்தது?", "ஷாப்பிங் இணைப்புகள்"]
                },
                "body_fashion": {
                    "reply": "உங்கள் **{body_shape}** உடலமைப்பிற்கு சிறந்த பரிந்துரைகள்:\n\n• **{outfit1}**: உடலின் சரியான சமநிலையை வெளிப்படுத்துகிறது.\n• **{outfit2}**: கம்பீரமான மற்றும் நேர்த்தியான தோற்றத்தை தரும்.",
                    "actions": [{"label": "ஆடைகளை காண்க", "tab": "fashion"}],
                    "quick_replies": ["நிறங்களின் தட்டு", "மேக்கப் பரிந்துரைகள்", "காரணத்தை விளக்குங்கள்"]
                },
                "general": {
                    "reply": "Style AI உங்களின் நவீன தனிப்பட்ட ஸ்டைலிஸ்ட். உடைகள், மேக்கப், நிறங்கள் மற்றும் ஷாப்பிங் பற்றிய அனைத்து கேள்விகளுக்கும் நான் பதிலளிக்கிறேன்!",
                    "actions": [{"label": "பேஷன் ஆலோசகர்", "tab": "fashion"}, {"label": "மேக்கப் ஆலோசகர்", "tab": "makeup"}],
                    "quick_replies": ["எனது சிறந்த உடை?", "நிறப் பரிந்துரைகள்", "பாதுகாப்பு விவரம்"]
                }
            }

        # 4. Telugu (తెలుగు)
        if lang in ["te", "telugu"]:
            return {
                "greeting": {
                    "reply": "నమస్కారం! నేను మీ వ్యక్తిగత Style AI ఫ్యాషన్ మరియు స్టైల్ అడ్వైజర్. ✨\n\nమీ ప్రొఫైల్: **{body_shape}** శరీర ఆకృతి & **{undertone}** అండర్‌టోన్ ({skin_tone}).\n\nనేడు దుస్తులు, మేకప్ లేదా షాపింగ్ విషయంలో మీకు ఎలా సహాయపడగలను?",
                    "actions": [{"label": "ఫ్యాషన్ అడ్వైజర్", "tab": "fashion"}, {"label": "AI స్టూడియో", "tab": "studio"}],
                    "quick_replies": ["నాకు సరిపోయే డ్రెస్సులు?", "నా స్కిన్ టోన్ కి బెస్ట్ లిప్‌స్టిక్?", "షాపింగ్ లింకులు"]
                },
                "body_fashion": {
                    "reply": "మీ **{body_shape}** శరీర ఆకృతికి మా సిఫార్సులు:\n\n• **{outfit1}**: మీ భుజాలు మరియు నడుము కొలతలను చక్కగా సమతుల్యం చేస్తుంది.\n• **{outfit2}**: ప్రత్యేకమైన మరియు విలాసవంతమైన రూపాన్ని అందిస్తుంది.",
                    "actions": [{"label": "దుస్తుల కేటలాగ్", "tab": "fashion"}],
                    "quick_replies": ["రంగుల ఎంపిక?", "మేకప్ సలహాలు", "సైంటిఫిక్ కారణం ఏంటి?"]
                },
                "general": {
                    "reply": "Style AI మీ వ్యక్తిగత స్టైలింగ్ సహాయకుడు. మీ **{body_shape}** ఆకృతికి తగిన దుస్తులు మరియు మేకప్ గురించి అడగండి!",
                    "actions": [{"label": "ఫ్యాషన్ అడ్వైజర్", "tab": "fashion"}, {"label": "మేకప్ అడ్వైజర్", "tab": "makeup"}],
                    "quick_replies": ["నాకు ఉత్తమమైన డ్రెస్?", "కలర్ ప్యాలెట్", "డేటా భద్రత"]
                }
            }

        # 5. Spanish (Español)
        if lang in ["es", "spanish"]:
            return {
                "greeting": {
                    "reply": "¡Hola! Soy tu asesor personal de moda e imagen en **Style AI**. ✨\n\nTu perfil actual: silueta **{body_shape}** y subtono **{undertone}** ({skin_tone}).\n\n¿En qué te puedo asesorar hoy? Ropa a medida, maquillaje, paleta de colores o explicaciones científicas con IA.",
                    "actions": [{"label": "Abrir Asesor de Moda", "tab": "fashion"}, {"label": "Estudio 1-Foto", "tab": "studio"}],
                    "quick_replies": ["¿Qué ropa favorece mi silueta?", "¿Qué labial combina con mi tono?", "¿Por qué me recomiendan esto (SHAP)?", "Ver tiendas online"]
                },
                "body_fashion": {
                    "reply": "Para tu estructura anatómica (**{body_shape}**), te recomendamos especialmente:\n\n• **{outfit1}**: equilibra la proporción entre hombros, cintura y caderas.\n• **{outfit2}**: corte entallado y estructurado con caída fluida.\n\n💡 *Tip*: Haz clic en 'Explain My Recommendation' para ver el impacto geométrico de tus proporciones.",
                    "actions": [{"label": "Ver Guardarropa", "tab": "fashion"}],
                    "quick_replies": ["¿Qué colores me favorecen?", "¿Ropa de fiesta o diaria?", "Ver explicaciones XAI"]
                },
                "makeup": {
                    "reply": "Guía de maquillaje para **{skin_tone}** con subtono **{undertone}**:\n\n• **Labiales**: Tonos terracota, nude cálido, frambuesa intenso o ciruela.\n• **Base**: Correspondencia exacta con la escala Monk sin efecto máscara.\n• **Iluminador y Rubor**: Champán dorado y melocotón satinado.",
                    "actions": [{"label": "Asesor de Maquillaje", "tab": "makeup"}, {"label": "Paleta de Color", "tab": "palette"}],
                    "quick_replies": ["Look de fiesta", "Maquillaje diario", "Joyas de oro o plata"]
                },
                "general": {
                    "reply": "En Style AI analizamos tu silueta **{body_shape}** y tono **{skin_tone}** con inteligencia artificial transparente. ¿Qué duda de estilo tienes?",
                    "actions": [{"label": "Asesor de Moda", "tab": "fashion"}, {"label": "Asesor de Maquillaje", "tab": "makeup"}],
                    "quick_replies": ["Mi mejor vestido", "Paleta de colores", "Tiendas disponibles"]
                }
            }

        # 6. French (Français)
        if lang in ["fr", "french"]:
            return {
                "greeting": {
                    "reply": "Bonjour ! Je suis votre styliste personnel intelligent sur **Style AI**. ✨\n\nVotre profil actuel : silhouette **{body_shape}** et sous-ton **{undertone}** ({skin_tone}).\n\nComment puis-je vous guider aujourd'hui dans vos choix de tenues, maquillage ou analyse colorimétrique ?",
                    "actions": [{"label": "Conseiller Mode", "tab": "fashion"}, {"label": "Studio 1-Photo", "tab": "studio"}],
                    "quick_replies": ["Quelle tenue pour ma silhouette ?", "Quel rouge à lèvres choisir ?", "Pourquoi cette recommandation (SHAP) ?", "Voir les boutiques"]
                },
                "body_fashion": {
                    "reply": "Pour votre morphologie (**{body_shape}**), voici nos suggestions clés :\n\n• **{outfit1}** : harmonise l'alignement des épaules et de la taille.\n• **{outfit2}** : coupe structurée en matières nobles.\n\n💡 *Note* : Consultez nos graphiques SHAP pour comprendre la géométrie exacte.",
                    "actions": [{"label": "Ouvrir le Dressing", "tab": "fashion"}],
                    "quick_replies": ["Couleurs idéales ?", "Tenue de soirée ou cocktail ?", "Explication IA"]
                },
                "general": {
                    "reply": "Style AI est votre styliste de haute précision. Adapté à votre morphologie **{body_shape}** et votre carnation **{skin_tone}**. Posez-moi toutes vos questions !",
                    "actions": [{"label": "Conseils Mode", "tab": "fashion"}, {"label": "Maquillage", "tab": "makeup"}],
                    "quick_replies": ["Meilleure robe", "Palette de couleurs", "Confidentialité"]
                }
            }

        # 7. German (Deutsch)
        if lang in ["de", "german"]:
            return {
                "greeting": {
                    "reply": "Guten Tag! Ich bin Ihr persönlicher KI-Stylist von **Style AI**. ✨\n\nIhr aktuelles Profil: Körperform **{body_shape}** und Unterton **{undertone}** ({skin_tone}).\n\nWie kann ich Sie heute bei Ihrer Garderobe, Kosmetik oder Farbberatung unterstützen?",
                    "actions": [{"label": "Modeberater", "tab": "fashion"}, {"label": "KI-Studio", "tab": "studio"}],
                    "quick_replies": ["Welches Outfit passt zu meiner Figur?", "Beste Lippenstiftfarben?", "Warum diese Empfehlung (SHAP)?", "Shopping-Links"]
                },
                "body_fashion": {
                    "reply": "Für Ihre Körperform (**{body_shape}**) empfehlen unsere Algorithmen:\n\n• **{outfit1}**: Schafft perfekte Harmonie zwischen Schulter- und Hüftverhältnis.\n• **{outfit2}**: Maßgeschneiderte Linienführung für einen eleganten Auftritt.",
                    "actions": [{"label": "Garderobe ansehen", "tab": "fashion"}],
                    "quick_replies": ["Passende Farben", "Business- oder Festmode?", "SHAP-Erklärung"]
                },
                "general": {
                    "reply": "Style AI analysiert Ihre Körperform **{body_shape}** und Hautton **{skin_tone}** wissenschaftlich transparent. Was möchten Sie wissen?",
                    "actions": [{"label": "Modeberatung", "tab": "fashion"}, {"label": "Make-up", "tab": "makeup"}],
                    "quick_replies": ["Bestes Outfit", "Farbpalette", "Datenschutz"]
                }
            }

        # 8. Arabic (العربية)
        if lang in ["ar", "arabic"]:
            return {
                "greeting": {
                    "reply": "أهلاً وسهلاً! أنا مستشارك الشخصي للأزياء والمكياج في **Style AI**. ✨\n\nملفك الحالي: قوام **{body_shape}** وبشرة بدرجة **{skin_tone}** ذات تدرج **{undertone}**.\n\nكيف يمكنني مساعدتك اليوم في اختيار أزياء متناسقة، مكياج جذاب، أو شرح أسباب التوصيات؟",
                    "actions": [{"label": "مستشار الأزياء", "tab": "fashion"}, {"label": "استوديو التصوير", "tab": "studio"}],
                    "quick_replies": ["ما هي الملابس المناسبة لقوامي؟", "أفضل ألوان أحمر الشفاه لي؟", "تفسيرات الذكاء الاصطناعي (SHAP)", "روابط التسوق المباشر"]
                },
                "body_fashion": {
                    "reply": "لتناسق جسمك من نوع (**{body_shape}**)، نوصي بالتصاميم التالية:\n\n• **{outfit1}**: توازن هندسي فائق بين قياسات الكتفين والخصر.\n• **{outfit2}**: قصة فاخرة وأنيقة تبرز أفضل معالم القوام.",
                    "actions": [{"label": "فتح خزانة الملابس", "tab": "fashion"}],
                    "quick_replies": ["الألوان المناسبة لبشرتي", "أزياء المناسبات الرسمية", "شرح علمي للتوصية"]
                },
                "general": {
                    "reply": "أهلاً بك في Style AI. نعتمد على دقة القياسات والشفافية التامة لنقدم لك أفضل استشارات الموضة والمكياج المتناغمة مع قوامك **{body_shape}**.",
                    "actions": [{"label": "مستشار الأزياء", "tab": "fashion"}, {"label": "مستشار المكياج", "tab": "makeup"}],
                    "quick_replies": ["أفضل فستان لي", "لوحة الألوان", "حماية الخصوصية"]
                }
            }

        # Default English
        return {
            "greeting": {
                "reply": "Welcome! I am your personal fashion & beauty intelligence stylist at **Style AI**. ✨\n\nYour active portfolio: **{body_shape}** silhouette with a **{undertone}** undertone ({skin_tone}).\n\nHow may I curate your aesthetic today? I can suggest tailored silhouettes, matching lipstick palettes, explain SHAP feature attributions, or curate live shopping links.",
                "actions": [{"label": "Explore Fashion", "tab": "fashion"}, {"label": "AI Stylist Studio", "tab": "studio"}],
                "quick_replies": ["Outfits for my body shape?", "Lipstick for my undertone?", "Explain SHAP logic", "Direct shopping links"]
            },
            "body_fashion": {
                "reply": "For your calibrated **{body_shape}** structure, our geometric algorithms recommend:\n\n• **{outfit1}**: Perfectly counterbalances the shoulder-to-waist-to-hip ratio, enhancing structural harmony.\n• **{outfit2}**: Tailored drape in premium fabrics that elongates vertical proportions.\n\n💡 *Pro-tip*: Every outfit in your Fashion Advisor features an **'Explain My Recommendation'** button with surrogate decision tree metrics.",
                "actions": [{"label": "Browse Full Wardrobe", "tab": "fashion"}, {"label": "1-Photo Studio", "tab": "studio"}],
                "quick_replies": ["What colors flatter me?", "Occasion & wedding wear?", "Why was this recommended?"]
            },
            "makeup": {
                "reply": "Curated cosmetics for your **{skin_tone}** with a **{undertone}** undertone:\n\n• **Lipsticks**: {undertone} undertones harmonize beautifully with warm terracotta, spiced peach, berry rose, or brick red.\n• **Foundation**: Exact Monk scale shade calibration for seamless, non-ashy finish.\n• **Eyes & Glow**: Champagne golds, bronze shimmer, and warm coral blush.",
                "actions": [{"label": "Open Makeup Advisor", "tab": "makeup"}, {"label": "View Color Swatches", "tab": "palette"}],
                "quick_replies": ["Wedding & party lookbook", "Daily minimal routine", "Gold vs Silver jewelry?"]
            },
            "skin_color": {
                "reply": "Color Analysis Summary:\n• **Monk Category**: {skin_tone}\n• **Undertone**: {undertone}\n\n🎨 **Complementary Palette**: Rich gold, warm olive, burgundy, terracotta, and soft champagne.\n⚠️ **Contrasting Tones**: Harsh icy blues or overly stark grays can wash out natural skin radiance.",
                "actions": [{"label": "Open Color Palette", "tab": "palette"}, {"label": "Skin Analysis Studio", "tab": "skin"}],
                "quick_replies": ["Best metallic tones?", "Traditional ethnic colors?", "Makeup recommendations"]
            },
            "xai": {
                "reply": "🔬 **Explainable AI (XAI) Intelligence**:\n\nStyle AI rejects opaque black-box styling. Every recommendation is traced through:\n1. **Rule-Based Tracing**: Direct anthropometric geometric rationale.\n2. **SHAP Feature Importance**: Shapley value attributions quantifying the exact contribution of each anatomical ratio.\n3. **Counterfactual Boundaries**: Mathematical shifts (e.g. 'If your shoulder ratio adjusted by +0.08, your silhouette shifts to Rectangle').",
                "actions": [{"label": "Open Explainable AI Lab", "tab": "xai"}],
                "quick_replies": ["How does surrogate tree work?", "What is counterfactual testing?", "Fashion Advisor"]
            },
            "shopping": {
                "reply": "🛍️ **Verified Multi-Store Direct Shopping**:\n\nWe never display fake phantom stock or static scraped prices. Every outfit card and lipstick shade generates direct deep-search queries to **Myntra, AJIO, Meesho, Flipkart, and Amazon India** tailored to your exact color and silhouette parameters.",
                "actions": [{"label": "Go to Shopping Hub", "tab": "shopping"}],
                "quick_replies": ["Shop on Myntra", "AJIO direct links", "Budget-friendly options"]
            },
            "privacy": {
                "reply": "🛡️ **Privacy-by-Design Guarantee**:\n\nYour biometric facial and body images are processed strictly in volatile RAM (`io.BytesIO`). They are analyzed for landmarks and immediately deallocated via garbage collection. **Zero photos are ever saved to disk or persistent databases**.",
                "actions": [{"label": "Read Privacy Policy", "tab": "privacy"}],
                "quick_replies": ["Is my photo stored?", "Delete my account data"]
            },
            "general": {
                "reply": "I am your personal AI stylist calibrated for your **{body_shape}** silhouette and **{skin_tone}**. Ask me anything about clothing fits, makeup shades, wedding styling, or how our AI generates scientific recommendations!",
                "actions": [{"label": "Fashion Advisor", "tab": "fashion"}, {"label": "Makeup Advisor", "tab": "makeup"}],
                "quick_replies": ["What dress suits me best?", "Recommend lipstick shade", "Explore color palette"]
            }
        }

    def _try_gemini(self, msg: str, lang: str, gender: str, body_shape: Optional[str], skin_tone: Optional[str], undertone: Optional[str], api_key: str):
        # Optional external LLM fallback if user has provided an API key
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            system_prompt = (
                f"You are Style AI's luxury personal stylist. User profile: Gender={gender}, "
                f"BodyShape={body_shape or 'Calibrated'}, SkinTone={skin_tone or 'Monk Scale'}, "
                f"Undertone={undertone or 'Neutral'}. Respond fluently in the requested language ({lang}). "
                f"Be elegant, helpful, and concise (under 120 words)."
            )
            response = model.generate_content(f"{system_prompt}\nUser: {msg}")
            if response and response.text:
                return {
                    "reply": response.text.strip(),
                    "language": lang,
                    "detected_intent": "llm_generated",
                    "suggested_actions": [{"label": "Fashion Advisor", "tab": "fashion"}, {"label": "Makeup Advisor", "tab": "makeup"}],
                    "quick_replies": ["Outfits for my body shape", "Makeup recommendations", "Color palette"]
                }
        except Exception:
            pass
        return None
