import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from src.engines.factory import EngineFactory
from src.agents.script_writer import ScriptWriterAgent
from src.agents.concept_artist import ConceptArtistAgent
from src.agents.previsualizer import PrevisualizerAgent

def test_uei_initialization():
    print("🚀 UEI Initialization Test Start...")
    
    # Check Engines
    text_engine = EngineFactory.get_text_engine()
    print(f"✅ Text Engine: {text_engine.__class__.__name__}")
    
    video_engine = EngineFactory.get_video_engine()
    print(f"✅ Video Engine: {video_engine.__class__.__name__}")
    
    vision_engine = EngineFactory.get_vision_engine()
    print(f"✅ Vision Engine: {vision_engine.__class__.__name__}")
    
    # Check Claude support
    try:
        claude_engine = EngineFactory.get_text_engine(engine_id="claude-3-5-sonnet")
        print(f"✅ Claude Engine Support: {claude_engine.__class__.__name__}")
    except Exception as e:
        print(f"❌ Claude Engine Initial Error: {e}")

    # Check Agents
    try:
        writer = ScriptWriterAgent()
        print("✅ ScriptWriterAgent instantiated")
        
        artist = ConceptArtistAgent()
        print("✅ ConceptArtistAgent instantiated")
        
        previs = PrevisualizerAgent()
        print("✅ PrevisualizerAgent instantiated")
        
    except Exception as e:
        print(f"❌ Agent instantiation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_uei_initialization()
