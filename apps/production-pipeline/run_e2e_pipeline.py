import asyncio
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Import application components
from server.core.database import SessionLocal, init_db
from server.models.database import Project, PipelineRun, RunStatus
from server.services.pipeline_runner import PipelineRunner
from server.core.config import settings

async def run_e2e_benchmark():
    print("==================================================")
    print("🎬 MARIONETTE STUDIO E2E PIPELINE BENCHMARK 🎬")
    print("==================================================")
    
    # 1. Initialize local test DB safely
    init_db()
    db: Session = SessionLocal()
    
    # Mock Notification Broadcast to prevent errors
    async def _mock_broadcast(message: dict):
        action = message.get("type", "unknown")
        step = message.get("step", "")
        print(f"[WS BROADCAST] {action} | {step}")

    try:
        # 2. Inject Test Idea
        test_idea = "A lonely android detective in rainy Neo-Seoul tracking down a rogue AI serial killer."
        print(f"\n💡 IDEA INJECTED: '{test_idea}'")
        print(">> Generating Mock Project and Run Session...")

        # Create Mock Project
        project = Project(
            title="E2E_Test_NeoSeoul",
            idea=test_idea,
            status="in_production"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # Full Pipeline Steps (Scripter to Mastering Forge)
        steps = [
            "scripter", 
            "concept_artist", 
            "previsualizer", 
            "generalist", 
            "colorist"
        ]

        # Create Pipeline Run with Economy & Test mode strictly enforced
        run = PipelineRun(
            project_id=project.id,
            steps=steps,
            status=RunStatus.RUNNING.value,
            is_economy_mode=1, # Free API limits
            is_test_run=1      # Minimal scene counts
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        # 3. Instantiate Runner and Orchestrate
        print(f"\n🚀 IGNITING PIPELINE RUNNER (Run ID: {run.id})")
        print(f"📦 Selected Agents: {', '.join(steps)}\n")
        
        runner = PipelineRunner(broadcast_fn=_mock_broadcast)
        
        # This will organically pass the output JSON path between agents
        await runner.run_pipeline(run, project, db, idea=test_idea)
        
        # 4. Result Verification Loop
        db.refresh(run)
        print("\n==================================================")
        print("✅ E2E PIPELINE EXECUTION FINISHED")
        print(f"📊 Final Progress: {run.progress}%")
        print(f"📈 Status: {run.status}")
        
        step_results = run.step_results or {}
        print("\n[STEP-BY-STEP ORGANIC AUDIT]")
        for step_name in steps:
            res = step_results.get(step_name, {})
            status = res.get('status', 'MISSING')
            path = res.get('output_path', 'NULL')
            print(f"- {step_name.upper():<15} | Status: {status:<10} | Asset: {path}")

        print("==================================================")
        
    except Exception as e:
        print(f"❌ PIPELINE ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    # Apply standard environment variable for the local test scope inside python
    # Ensure Gemini Key is picked up from .env
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "server", ".env"))
    
    asyncio.run(run_e2e_benchmark())
